import Redis from "ioredis";


// const redisUrl = process.env.REDIS_URL as string   // import dotenv 
const redisUrl = "redis://localhost:6379"  
export const createBullMQConnection = (isWorker = false) => {
    return new Redis(redisUrl, {
        maxRetriesPerRequest: isWorker ? null : 1,
    })
}
