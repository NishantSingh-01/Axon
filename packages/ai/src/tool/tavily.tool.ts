import { tavily } from '@tavily/core'
import dotenv from 'dotenv'
dotenv.config({
    path: "../../../../.env",
})
export const tavilyTool = tavily({
    apiKey: process.env.TAVILY_API_KEY,
})

export const searchWebTool = async (query: string) => {
    const response = await tavilyTool.search(query, {
        max_results: 3,
    })
    return response.results.map(
        (result) => ({
            title: result.title,
            url: result.url,
            content: result.content,
        })
    )
}

