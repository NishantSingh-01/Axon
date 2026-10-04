import { documentRetriever } from "../rag/retriever";
import { knowledgeSearchTool } from "./knowledge.tool";
import { searchWebTool } from "./tavily.tool"

export const toolExecutor = async (name: string, args: { query: string }) => {
    if (name === "searchWeb") {
        console.log("Executing: searchWeb");
        return await searchWebTool(args.query)
    }
    else if (name === "knowledgeSearch") {
        console.log("Executing: knowledgeSearch");
        const chunks = await knowledgeSearchTool(args.query);
        return JSON.stringify(chunks)
    }
    else {
        throw new Error(`Unknown tool: ${name}`)
    }
}