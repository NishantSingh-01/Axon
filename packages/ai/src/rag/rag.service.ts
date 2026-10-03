import { buildPrompt } from "./promptBuilder";
import { documentRetriever, type RetrievedChunk } from "./retriever";

export interface RagResult {
    prompt: string;
    source: RetrievedChunk[];
}

export const askQuestion = async (question: string): Promise<RagResult> => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty");
    }
    try {
        const chunks = await documentRetriever(question, 5)

        const context = chunks
            .map((chunk) => chunk.content)
            .join("\n\n")
        const prompt = await buildPrompt(context, question)
        return {
            prompt,
            source: chunks
        }

    } catch (error) {
        console.error("Error asking question:", error)
        throw error
    }
}
