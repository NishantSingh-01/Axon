import express from "express"
import cors from "cors"
import env from "./src/config/env"
const app = express()

const allowedOrigins =env.CORS_ORIGIN?.split(",") || []

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

export default app