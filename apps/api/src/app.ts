import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import env from "./config/env"
import apiRoutes from "./routes"
import { errorHandler } from "./middlewares/error.middleware"

const app = express()

const allowedOrigins = env.CORS_ORIGIN?.split(",") || []

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(cookieParser())

app.use("/api/v1", apiRoutes)

app.use(errorHandler)

export default app