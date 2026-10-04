import { generateResponse } from "../llm/client";

export const askAgent = async (question: string) => {
    if (!question.trim()) {
        throw new Error("Question cannot be empty");
    }
    try {
        const answer = await generateResponse(question);
        return answer
    } catch (error) {
        console.error("Agent error:", error);
        throw error;
    }
};