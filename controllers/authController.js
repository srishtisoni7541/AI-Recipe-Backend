
const User = require("../models/User.model");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = user.generateNewTokens();
    await user.save();

   
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true, 
        secure: true,  
        sameSite: "Strict", // CSRF prevention
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = user.generateNewTokens();
    await user.save();
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,    
        secure: true,      
        sameSite: "Strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .header("Authorization", `Bearer ${accessToken}`) 
      .json({ message: "Login successful", accessToken });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};


module.exports = { register, login };
