const redisClient = require("../config/redisClient");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = user.generateNewTokens();
    await user.save();

    await redisClient.set(
      `user:${user._id}`,
      JSON.stringify(user),
      "EX",
      60 * 60 * 24
    ); //! 24 ghante ka expiry

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .header("Authorization", `Bearer ${accessToken}`)
      .json({
        message: "User registered successfully",
        user,
        accessToken,
      });
  } catch (err) {
    // console.error(err);
    // res.status(400).json({ error: "Registration failed" });
    next(err)
  }
};

const login = async (req, res,next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid Credentials!" });
    }

    // Password comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = user.generateNewTokens();
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user.toObject();
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS ke liye
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .header("Authorization", `Bearer ${accessToken}`)
      .json({ message: "Login successful", accessToken, user:userWithoutSensitiveData });
  } catch (err) {
    // console.error("Login error:", err);
    // res.status(500).json({ error: "Login failed", details: err.message });
    next(err);
  }
};

const logout = async (req, res,next) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // Only if using HTTPS
      sameSite: "Strict",
    });

    // Optionally, remove user data from Redis cache if you want
    const userId = req.user._id; // Ensure req.user exists (after login)
    await redisClient.del(`user:${userId}`);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout };
