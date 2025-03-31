const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }] // ✅ Array of ObjectIds
});

// 🔹 Pre-Save Hook for Hashing Password & Generating Tokens
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // ✅ Access Token Generate
  this.accessToken = jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // ✅ Refresh Token Generate
  this.refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  next();
});

userSchema.methods.generateNewTokens = function () {
  this.accessToken = jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  this.refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  console.log(this.refreshToken);
  console.log(this.accessToken);

  return { accessToken: this.accessToken, refreshToken: this.refreshToken };
};

const User = mongoose.model("User", userSchema);
module.exports = User;
