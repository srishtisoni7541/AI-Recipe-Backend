
const Redis = require("ioredis");

let redisInstance = null; // Singleton instance

function getRedisInstance() {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

    redisInstance.on("connect", () => {
      console.log(" Redis Connected");
    });

    redisInstance.on("error", (err) => {
      console.error(" Redis Error:", err);
    });
  }
  return redisInstance;
}

module.exports = getRedisInstance();