import dotenv from "dotenv"
import type { SignOptions } from "jsonwebtoken"
dotenv.config({ path: "../../.env" })

const env = {
    PORT: process.env.PORT || 6000,
    NODE_ENV: process.env.NODE_ENV || "development",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:6000",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    ACCESS_TOKEN_EXPIRES_IN: (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
    REFRESH_TOKEN_EXPIRES_IN: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
    ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME || "accessToken",
    REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || "refreshToken",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
}
export default env