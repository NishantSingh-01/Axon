import { similaritySearch } from "../vector/qdrant.service";

export interface RetrievedChunk {
    score: number;
    content: string;
}
export const documentRetriever = async (query: string, top_k: number): Promise<RetrievedChunk[]> => {
    if (!query.trim()) {
        throw new Error("Query cannot be empty");
    }
    try {
        const similarity = await similaritySearch(query, top_k)

        return similarity.map((point) => ({
            score: point.score!,
            content: String(point.payload?.text ?? ""),
        }))

    } catch (error) {
        console.error("Error retrieving document:", error)
        throw error
    }
}

