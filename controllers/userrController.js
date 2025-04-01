const redisClient = require("../config/redisClient");
const User = require("../models/User.model");

const getUserProfile = async (req, res,next) => {
  try {
    const userId = req.user.id;

    // Fetch the user profile from Redis Cache
    const cachedUser = await redisClient.get(`user:${userId}`);
    // console.log(cachedUser);

    if (cachedUser) {
      console.log(" User profile fetched from Redis Cache");
      return res.status(200).json(JSON.parse(cachedUser));
    }

    // Fetch user from Database if not found in Cache
    const user = await User.findById(userId).select("-password -refreshToken"); // Exclude password field for security
    // console.log("User fetched from DB:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store the user in Redis cache with expiry (1 hour)
    await redisClient.set(`user:${userId}`, JSON.stringify(user), "EX", 3600);

    // Return the user profile as response
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile };
