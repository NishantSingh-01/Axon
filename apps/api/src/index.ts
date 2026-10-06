import dotenv from "dotenv"
import app from "./app"
import env from "./config/env"
import { connectDB } from "./config/db"
import { connectRedis } from "./config/redis"
dotenv.config({ path: "../../.env" })


app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is healthy' });
})

connectDB().then(() => {
    connectRedis()
    app.listen(env.PORT, () => {
        console.log("╔══════════════════════════════╗");
        console.log("║     〰️ SERVER RUNNING        ║");
        console.log("║     🚀 Port: 8000            ║");
        console.log("║     🌐 http://localhost:8000 ║");
        console.log("╚══════════════════════════════╝");
    })
3
}).catch(() => {
    console.log("Database connection failed")
    process.exit(1)
})