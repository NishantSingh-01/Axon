import dotenv from "dotenv"
dotenv.config()

const env ={
    PORT: process.env.PORT || 6000,
    NODE_ENV: process.env.NODE_ENV || "development",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:6000"
}
export default env