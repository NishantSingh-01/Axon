import Redis from "ioredis";


const redisUrl = process.env.REDIS_URL as string   // import dotenv 

export const createBullMQConnection = (isWorker = false) => {
    return new Redis(redisUrl, {
        maxRetriesPerRequest: isWorker ? null : 1,
    })
}
