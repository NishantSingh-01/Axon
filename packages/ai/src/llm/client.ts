import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({
    path: "../../../../.env",
});

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.LLM_MODEL as string


export const groqClient = new Groq({
    apiKey
})

export const generateResponse = async (prompt: string): Promise<string> => {
    try {
        const response = await groqClient.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

        })
        const message = response.choices[0].message.content;
        if (!message) {
            throw new Error("No message returned from Groq API");
        }
        return message;
    } catch (error) {
        console.error("Error generating response:", error);
        throw error;
    }
}