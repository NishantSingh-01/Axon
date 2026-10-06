import Redis from 'ioredis'
import env from './env'

export const redis = new Redis(
    env.REDIS_URL || 'redis://localhost:6479'
)

export async function connectRedis() {
    try {
        if (redis.status === "ready") {
            console.log("Redis is already running");
            return;
        }
        await new Promise<void>((resolve, reject) => {
            redis.once("ready", () => {
                resolve();
            });

            redis.once("error", reject);
        });
        console.log("Redis is running");
    } catch (err) {
        console.error("Error connecting to Redis:", err);
    }
}