import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config({
    path: "../../../../.env",
})


export const getEmbeddings = async (text: string[]) => {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "gemini-embedding-2",
            apiKey: process.env.GEMINI_API_KEY,
            outputDimensionality: 2048,
        })
        const embedding = await embeddings.embedDocuments(text)
        // console.log("Embeddings", embedding)
        return embedding
    } catch (error) {
        console.error("Error generating embeddings:", error)
        throw error
    }
}
