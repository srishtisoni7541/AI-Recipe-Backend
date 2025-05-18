
// const Redis = require("ioredis");

// let redisInstance = null;
// function getRedisInstance() {
//   if (!redisInstance) {
//     redisInstance = new Redis({
//       host: "redis-15457.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
//       port: 15457,
//       password:"kTuA2qSIBbh9AB3G5ZhZOt78uo0Qdlfv"
//     });

//     redisInstance.on("connect", () => {
//       console.log(" Redis Connected");
//     });

//     redisInstance.on("error", (err) => {
//       console.error(" Redis Error:", err);
//     });
//   }
//   return redisInstance;
// }

// module.exports = getRedisInstance();




const { Redis } = require("@upstash/redis");

let redisInstance = null;

function getRedisInstance() {
  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log("✅ Upstash Redis Initialized");
  }

  return redisInstance;
}

module.exports = getRedisInstance();
