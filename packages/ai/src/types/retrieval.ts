export interface RetrievalScope {
    tenantId: string;
    userId: string;
    documentId?: string;
}

export interface RetrievedChunk {
    id: string | number;
    score: number;
    content: string;
    documentId: string;
    chunkIndex: number;
}