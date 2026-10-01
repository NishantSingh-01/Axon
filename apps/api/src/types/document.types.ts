import type { DocumentStatus, DocumentSource } from "../generated/enums";

export interface DocumentResponse {
    id: string;
    userId: string;
    title: string;
    originalName: string | null;
    mimeType: string | null;
    size: number | null;
    source: DocumentSource;
    sourceUrl: string | null;
    status: DocumentStatus;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}
