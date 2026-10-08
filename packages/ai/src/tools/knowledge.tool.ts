import {
    documentRetrieverForDocument,
    documentRetrieverForUser,
} from "../rag/retriever";

import type { RetrievalScope } from "../types/retrieval";

export const knowledgeSearchTool = async (
    query: string,
    scope: RetrievalScope
) => {
    let chunks
    if (scope.documentId) {         
        chunks = await documentRetrieverForDocument(
            query,
            scope,
            5
        )
    }
    else {
        chunks = await documentRetrieverForUser(
            query,
            scope,
            5
        )
    }

    if (chunks.length === 0) {
        return {
            found: false,
            results: [],
            message: "No relevant information was found in the knowledge base.",
        }
    }
    return {
        found: true,
        results: chunks,
    }
}