
const redisClient = require("../config/redisClient");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = user.generateNewTokens();
    await user.save();

    await redisClient.set(`user:${user._id}`, JSON.stringify(user), "EX", 60 * 60 * 24); //! 24 ghante ka expiry

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
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Password comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = user.generateNewTokens();
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,  // HTTPS ke liye
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      })
      .header("Authorization", `Bearer ${accessToken}`)
      .json({ message: "Login successful", accessToken ,user});

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,  // Only if using HTTPS
      sameSite: "Strict",
    });

    // Optionally, remove user data from Redis cache if you want
    const userId = req.user._id;  // Ensure req.user exists (after login)
    await redisClient.del(`user:${userId}`);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
};




module.exports = { register, login,logout };
