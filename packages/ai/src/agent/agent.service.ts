import { generateResponse } from "../llm/client";
import { RetrievalScope } from "../types/retrieval";

export const askAgent = async (question: string, scope: RetrievalScope) => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty");
    }
    try {
        const answer = await generateResponse(question, scope);
        return answer
    } catch (error) {
        console.error("Agent error:", error);
        throw error;
    }
};