import { searchWebTool } from "./tavily.tool"

export const toolExecutor = async (name: string, args: { query: string }) => {
    if (name === "searchWeb") {
        return await searchWebTool(args.query)
    }
    else {
        throw new Error(`Unknown tool: ${name}`)
    }
}