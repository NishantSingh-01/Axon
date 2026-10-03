import { randomUUID } from "crypto";
import { qdrantClient } from "./qdrant.client";
import dotenv from "dotenv";
import { getEmbeddings } from "../embeddings/embedding.service";

dotenv.config({
    path: "../../../../.env",
})

const collectionName = process.env.QDRANT_COLLECTION as string

export const upsertDocument = async (text: string[]) => {
    const uuid = randomUUID()
    const vectors = await getEmbeddings(text)
    const points = vectors.map((vector, index) => ({
        id: randomUUID(),
        vector: {
            text: vector
        },
        payload: {
            text: text[index],
        },
    }))
    const response = await qdrantClient.upsert(collectionName, {
        wait: true,
        points,
    })
    console.log("Points upserted", response)
    return response
}

export const similaritySearch = async (query: string, limit = 3) => {
    const queryVector = (await getEmbeddings([query]))[0]
    if (!queryVector || queryVector.length === 0) {
        throw new Error("Failed to get query embeddings")
    }
    const response = await qdrantClient.query(collectionName, {
        query: queryVector,
        using: "text",
        limit,
        with_payload: true,
    })
    return response.points
}