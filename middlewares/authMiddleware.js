const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized. Token missing!" });
    }

    try {
      // ✅ Access Token Verify
      req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // ⚡ Token Expired => Check Refresh Token in HTTP-Only Cookie
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(403).json({ message: "Session expired. Please log in again." });
        }

        try {
          const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
          const user = await User.findById(decoded.id);
          if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid Refresh Token. Please log in again." });
          }

          // ✅ Generate new tokens
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = user.generateNewTokens();
          await user.save(); // Save new tokens in DB

          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          req.user = decoded;
          return next();
        } catch (error) {
          return res.status(403).json({ message: "Invalid Refresh Token. Please log in again." });
        }
      } else {
        return res.status(401).json({ message: "Invalid Token. Please log in again." });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = isLoggedIn;
