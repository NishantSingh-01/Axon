import { knowledgeSearchTool } from "./knowledge.tool";
import { searchWebTool } from "./tavily.tool"
import { RetrievalScope } from "../types/retrieval";

export const toolExecutor = async (name: string, args: { query: string }, scope: RetrievalScope) => {
    if (name === "searchWeb") {
        console.log("Executing: searchWeb");
        return await searchWebTool(args.query)
    }
    else if (name === "knowledgeSearch") {
        console.log("Executing: knowledgeSearch");
        const chunks = await knowledgeSearchTool(args.query, scope)
        return JSON.stringify(chunks)
    }
    else {
        throw new Error(`Unknown tool: ${name}`)
    }
}