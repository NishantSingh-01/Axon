import { qdrantClient } from "./qdrant.client"
import dotenv from "dotenv"
dotenv.config({
    path: "../../../../.env",
})
const collectionName = process.env.QDRANT_COLLECTION as string

export const createCollection = async () => {
    const response = await qdrantClient.createCollection(collectionName, {
        vectors: {
            text: {
                size: Number(process.env.EMBEDDING_DIMENSION),
                distance: "Cosine",
            },
        },
    })
    return response
}
