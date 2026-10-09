
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = `
You are an expert AI assistant for Axon. 
Answer strictly based on the provided document context.

 RULES:
1. If the answer is present in the context, give a clear, direct answer.
2. If the answer is NOT in the context, respond with:
   "This information is not available in the provided documents."
3. Do NOT invent, assume, or infer anything beyond the context.
4. Be concise and professional.
5. Use bullistlet points when ing details.
Remember: Accuracy based on the context is your top priority.`

export const generateRagResponse = async (
    prompt: string
): Promise<string> => {
    if (!prompt.trim()) {
        throw new Error("Prompt cannot be empty");
    }

    const response = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
    });

    const answer = response.choices[0]?.message?.content;

    if (!answer) {
        throw new Error("LLM returned an empty response");
    }

    return answer;
}
