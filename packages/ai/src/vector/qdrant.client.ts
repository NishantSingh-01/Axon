import { QdrantClient } from "@qdrant/js-client-rest"
import dotenv from "dotenv"
dotenv.config({
    path: "../../../../.env",
})


export const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL || "http://localhost:6333",
})