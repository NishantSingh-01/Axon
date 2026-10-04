import { documentRetriever } from "../rag/retriever";

export const knowledgeSearchTool = async (query: string) => {
    const chunks = await documentRetriever(query, 5)
    return chunks;

};