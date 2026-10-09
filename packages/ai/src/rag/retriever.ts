import {
    similaritySearchByDocument,
    similaritySearchByUser,
} from "../vector/qdrant.service";

import type { RetrievalScope } from "../types/retrieval";

export interface RetrievedChunk {
    score: number;
    content: string;
}

export const documentRetrieverForDocument = async (
    scope: RetrievalScope,
    query: string,
    topK: number = 3
): Promise<RetrievedChunk[]> => {

    if (!query.trim()) {
        throw new Error("Query cannot be empty")
    }
    if (!scope.documentId) {
        throw new Error("documentId is required")
    }
    try {
        const similarity = await similaritySearchByDocument(
            query,
            scope,
            topK
        )

        return similarity.map((point) => ({
            score: point.score ?? 0,
            content: String(point.payload?.text ?? ""),
        }))

    } catch (error) {
        console.error("Error retrieving document:", error)
        throw error;
    }
}
export const documentRetrieverForUser = async (
    query: string,
    scope: RetrievalScope,
    topK: number = 5
): Promise<RetrievedChunk[]> => {

    if (!query.trim()) {
        throw new Error("Query cannot be empty");
    }

    try {
        const similarity = await similaritySearchByUser(
            query,
            scope,
            topK
        )

        return similarity.map((point) => ({
            score: point.score ?? 0,
            content: String(point.payload?.text ?? ""),
        }))

    } catch (error) {
        console.error("Error retrieving user documents:", error)
        throw error;
    }
}