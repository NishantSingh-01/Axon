import { randomUUID } from "crypto";
import { qdrantClient } from "./qdrant.client";
import dotenv from "dotenv";
import { getEmbeddings } from "../embeddings/embedding.service";
import { RetrievalScope } from "../types/retrieval";

dotenv.config({
    path: "../../../../.env",
})

const collectionName = process.env.QDRANT_COLLECTION as string

export const upsertDocument = async (chunks: string[], scope: RetrievalScope) => {

    if (!scope.userId || !scope.documentId) {
        throw new Error("Invalid retrieval scope: userId and documentId are required");
    }

    const vectors = await getEmbeddings(chunks)
    const points = vectors.map((vector, index) => ({
        id: randomUUID(),
        vector: {
            text: vector
        },
        payload: {
            tenantId: scope.tenantId,
            userId: scope.userId,
            documentId: scope.documentId,
            chunkIndex: index,
            text: chunks[index],
        },
    }))
    const response = await qdrantClient.upsert(collectionName, {
        wait: true,
        points,
    })
    console.log("Points upserted", response)
    return response
}
export const similaritySearchByUser = async (
    query: string,
    scope: RetrievalScope,
    topK: number = 5
) => {
    const tenantId = scope.tenantId || "default";
    const queryVector = (await getEmbeddings([query]))[0];

    if (!queryVector || queryVector.length === 0) {
        throw new Error("Failed to get query embeddings");
    }

    const response = await qdrantClient.query(collectionName, {
        query: queryVector,
        using: "text",
        limit: topK,
        with_payload: true,
        filter: {
            must: [
                {
                    key: "tenantId",
                    match: {
                        value: tenantId,
                    },
                },
                {
                    key: "userId",
                    match: {
                        value: scope.userId,
                    },
                },
            ],
        },
    });

    return response.points;
}
export const similaritySearchByDocument = async (
    query: string,
    scope: RetrievalScope,
    topK: number = 3
) => {
    const tenantId = scope.tenantId || "default";
    const queryVector = (await getEmbeddings([query]))[0];

    if (!queryVector || queryVector.length === 0) {
        throw new Error("Failed to get query embeddings");
    }

    if (!scope.documentId) {
        throw new Error("documentId is required");
    }

    const response = await qdrantClient.query(collectionName, {
        query: queryVector,
        using: "text",
        limit: topK,
        with_payload: true,
        filter: {
            must: [
                {
                    key: "tenantId",
                    match: {
                        value: tenantId,
                    },
                },
                {
                    key: "userId",
                    match: {
                        value: scope.userId,
                    },
                },
                {
                    key: "documentId",
                    match: {
                        value: scope.documentId,
                    },
                },
            ],
        },
    });

    return response.points;
}