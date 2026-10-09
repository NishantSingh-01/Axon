import { generateResponse } from "../llm/client";
import { buildPrompt } from "./promptBuilder";
import { documentRetrieverForDocument, documentRetrieverForUser, type RetrievedChunk } from "../rag/retriever";
import type { RetrievalScope } from "../types/retrieval";
import { generateRagResponse } from "../llm/rag.client";
export interface RagResult {
    answer: string;
    source: RetrievedChunk[];
}


export const askQuesFromDocument = async (question: string, scope: RetrievalScope) => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty");
    }
    try {
        const chunks = await documentRetrieverForDocument(scope, question, 3)

        const context = chunks
            .map((chunk) => chunk.content)
            .join("\n\n")
        const prompt = await buildPrompt(context, question)

        const answer = await generateRagResponse(prompt)
        return {
            answer: answer as string,
            source: chunks
        }

    } catch (error) {
        console.error("Error asking question:", error)
        throw error
    }
}

export const askQuesFromUserAllDocument = async (question: string, scope: RetrievalScope) => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty");
    }
    try {
        const chunks = await documentRetrieverForUser(question, scope, 3)

        const context = chunks
            .map((chunk) => chunk.content)
            .join("\n\n")
        const prompt = await buildPrompt(context, question)

        const answer = await generateRagResponse(prompt)
        return {
            answer: answer as string,
            source: chunks
        }

    } catch (error) {
        console.error("Error asking question:", error)
        throw error
    }
}