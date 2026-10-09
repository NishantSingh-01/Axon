import Groq from "groq-sdk";
import dotenv from "dotenv";
import { toolDefinitions } from "../tools/tool.definitions";
import { toolExecutor } from "../tools/tool.executor";
import { RetrievalScope } from "../types/retrieval";

dotenv.config({
    path: "../../.env",
})

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.LLM_MODEL as string


export const groqClient = new Groq({
    apiKey
})
// const SYSTEM_PROMPT = `
// You are Axon, an AI assistant with access to tools.

// Rules:

// 1. For questions about recent news, current events, latest updates,
//    current prices, recent technology, weather, or other time-sensitive
//    information, use the searchWeb tool.

// 2. For questions that are not time-sensitive and may be answered from
//    the stored knowledge base, first use the knowledgeSearch tool.

// 3. After using knowledgeSearch:
//    - If the retrieved information is sufficient, answer using that information.
//    - If the knowledgeSearch result says that no relevant information was found
//      or the retrieved information is insufficient, use the searchWeb tool
//      to find external information.

// 4. When knowledgeSearch does not contain the answer and searchWeb is used,
//    clearly indicate that the information was not found in the stored
//    knowledge base and that the answer is based on web search results.

// 5. For general knowledge questions, you may answer directly when external
//    information is unnecessary.

// 6. Never fabricate information or pretend that a tool was used when it was not.

// 7. After receiving tool results, use the available information to answer
//    the user's question.

// 8. When searchWeb is used, provide useful source URLs when available.

// Examples:

// User: "What is the return policy?"
// Action: knowledgeSearch

// User: "What is the latest news about Apple?"
// Action: searchWeb

// User: "What is the capital of France?"
// Action: direct answer

// User: "Who developed this technology?"
// Action: knowledgeSearch first.
// If knowledgeSearch has no relevant information → searchWeb.

// User: "What is the return policy and what is the latest Apple news?"
// Action: knowledgeSearch + searchWeb
// `;
const SYSTEM_PROMPT = `
You are Axon, an AI assistant with access to tools.

Rules:

1. Use the knowledgeSearch tool when the user explicitly asks for
   information from their uploaded documents, stored knowledge,
   internal knowledge, or knowledge base.

2. Use the searchWeb tool for current, external, latest, or
   time-sensitive information such as recent news, weather,
   current prices, recent events, or live information.

3. For general stable knowledge questions, answer directly when
   no external or stored knowledge source is required.

4. The content or file type of a stored document does not determine
   which tool to use. The user's requested source determines the tool.

5. If knowledgeSearch is explicitly requested but returns no relevant
   information or insufficient information, use searchWeb only when
   external information can help answer the question.

6. When falling back from knowledgeSearch to searchWeb, clearly tell
   the user that the requested information was not found in the
   stored knowledge base and that the answer is based on web results.

7. Never fabricate information or pretend that a tool was used when it was not.

8. After receiving tool results, use those results to answer the user's question.

9. When searchWeb is used, provide useful source URLs when available.

Examples:

User: "What does my uploaded document say about the weather?"
Action: knowledgeSearch

User: "According to the uploaded document, what is the refund policy?"
Action: knowledgeSearch

User: "What is the weather in Delhi today?"
Action: searchWeb

User: "What is the latest news about Apple?"
Action: searchWeb

User: "What is the capital of France?"
Action: direct answer

User: "Who developed this technology according to my documents?"
Action: knowledgeSearch
If the knowledge base does not contain the answer → searchWeb

User: "What is the return policy and what is the latest Apple news?"
Action: knowledgeSearch + searchWeb
`;
export const generateResponse = async (prompt: string, scope: RetrievalScope) => {
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
    const MAX_ITERATIONS = 5;
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
            if (!toolcall || toolcall.length === 0) {
                console.log("No tool call>>LLM")
                return response.choices[0].message.content
            }
            messages.push(response.choices[0].message)
            for (const tool of toolcall) {
                let args: { query: string };
                const toolName = tool.function.name;
                try {
                    args = JSON.parse(tool.function.arguments);
                } catch (error) {
                    throw new Error(
                        `Invalid arguments for tool ${toolName}`
                    );
                }
                const result = await toolExecutor(toolName, args, scope)
                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    content: JSON.stringify(result),
                });
            }

        } catch (error) {
            console.error("Error generating response:", error);
            throw error;
        }
    }
}



// const SYSTEM_PROMPT = `
// You are Axon, an AI assistant with access to tools.

// Rules:

// 1. Use knowledgeSearch when the user explicitly asks about,
//    refers to, or wants an answer from uploaded documents,
//    PDFs, stored knowledge, internal documents, or the knowledge base.

// 2. The content of a document does not determine the tool.
//    The user's requested source determines the tool.

// 3. If the user asks about current or external information such as
//    weather, latest news, current prices, recent events, or live data,
//    use searchWeb unless the user explicitly asks you to answer
//    from an uploaded/stored document.

// 4. If the user explicitly asks to use an uploaded document,
//    do not replace that request with web search.

// 5. For normal general-knowledge questions, answer directly when
//    external information is unnecessary.

// 6. Never fabricate tool results.

// Examples:

// User: "What does the uploaded PDF say about the weather?"
// Action: knowledgeSearch

// User: "According to the document, what is tomorrow's temperature?"
// Action: knowledgeSearch

// User: "What is the weather in Delhi today?"
// Action: searchWeb

// User: "What is the latest news about Apple?"
// Action: searchWeb

// User: "What is the capital of France?"
// Action: direct answer
// `;