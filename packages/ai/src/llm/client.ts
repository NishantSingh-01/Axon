import Groq from "groq-sdk";
import dotenv from "dotenv";
import { toolDefinitions } from "../tool/tool.definitions";
import { toolExecutor } from "../tool/tool.executor";

dotenv.config({
    path: "../../.env",
})

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.LLM_MODEL as string


export const groqClient = new Groq({
    apiKey
})
const SYSTEM_PROMPT = `
You are Axon, an AI assistant with access to web search tools.

Rules:
1. For questions about recent news, current events, latest updates,
   current prices, recent technology, or time-sensitive information,
   use the searchWeb tool.

2. For questions about uploaded documents or company knowledge,
   use the knowledge retrieval tool when available.

3. For general knowledge questions, answer directly without tools
   when external information is unnecessary.

4. Never fabricate search results or pretend you searched the web.

5. After receiving search results, summarize them clearly.

6. If search results are insufficient, tell the user.

7. Provide source URLs when using web search results.
`;

export const generateResponse = async (prompt: string) => {
    let messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
        {
            role: "user",
            content: prompt,
        },
    ]
    let iterations = 0;
    const MAX_ITERATIONS = 3;
    while (iterations < MAX_ITERATIONS) {
        iterations++;
        try {
            const response = await groqClient.chat.completions.create({
                model,
                tools: toolDefinitions,
                tool_choice: "auto",
                messages,
            })
            const toolcall = response.choices[0].message.tool_calls;
            if (!toolcall) {
                return response.choices[0].message.content
            }
            messages.push(response.choices[0].message)
            for (const tool of toolcall) {
                const toolName = tool.function.name;
                const args = JSON.parse(tool.function.arguments);
                if (toolName === "searchWeb") {
                    console.log("Executing:", toolName);
                    const result = await toolExecutor(toolName, args);
                    messages.push({
                        role: "tool",
                        tool_call_id: tool.id,
                        content: JSON.stringify(result),
                    })
                }
            }

        } catch (error) {
            console.error("Error generating response:", error);
            throw error;
        }
    }
}
