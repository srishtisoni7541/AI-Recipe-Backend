const redisClient = require('../config/redisClient');
const User = require('../models/User.model'); // Apne User model ka sahi path use kar

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Token se aaya user ID

    // Check if user data is cached
    const cachedUser = await redisClient.get(`user:${userId}`);
    console.log(cachedUser);
    if (cachedUser) {
      console.log("✅ User profile fetched from Redis Cache");
      return res.status(200).json(JSON.parse(cachedUser));
    }

    // Fetch user from Database
    const user = await User.findById(userId).select("-password"); // Password hata diya for security
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store user in Redis cache with expiry
    await redisClient.set(`user:${userId}`, JSON.stringify(user), {
      EX: 3600, // Expiry in seconds (1 hour)
    });

    console.log("✅ User profile fetched from DB & cached in Redis");
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getUserProfile };
