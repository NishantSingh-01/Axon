import dotenv from "dotenv"
import app from "./app"
import env from "./src/config/env"
dotenv.config()


app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
})

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is healthy' });
})