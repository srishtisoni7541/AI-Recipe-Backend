
const User = require("../models/User.model");
const bcrypt = require("bcrypt");

// ✅ REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ User Create
    const user = await User.create({ name, email, password });

    res
      .status(201)
      .header("Authorization", `Bearer ${user.accessToken}`) // Access token header me bhej rahe hain
      .json({
        message: "User registered successfully",
        user,
        accessToken: user.accessToken,
      });

  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Registration failed" });
  }
};

// ✅ LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ User Find Karo
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Tokens Generate Karo (Using Model Method)
    const { accessToken, refreshToken } = user.generateNewTokens();

    res
      .status(200)
      .header("Authorization", `Bearer ${accessToken}`) // Access token header me bhej rahe hain
      .json({
        message: "Login successful",
        accessToken,
      });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { register, login };
