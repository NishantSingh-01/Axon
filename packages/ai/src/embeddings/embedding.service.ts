import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({
    path: "../../../../.env",
})


export const getEmbeddings = async (text: string[]) => {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: process.env.EMBEDDING_MODEL as string,
            apiKey: process.env.GEMINI_API_KEY,
            outputDimensionality: Number(process.env.EMBEDDING_DIMENSION),
        })
        const embedding = await embeddings.embedDocuments(text)
        return embedding
    } catch (error) {
        console.error("Error generating embeddings:", error)
        throw error
    }
}
