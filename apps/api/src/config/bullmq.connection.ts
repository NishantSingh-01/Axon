import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not defined");
}

export const createBullMQConnection = (isWorker = false) => {
    return new IORedis(redisUrl, {
        maxRetriesPerRequest: isWorker ? null : 1,
    });
};