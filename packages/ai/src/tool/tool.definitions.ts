
export const toolDefinitions = [
    {
        type: "function",
        function: {
            name: "searchWeb",
            description:
                "Search the internet for current information when the answer is not available in the knowledge base.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to look up on the internet",
                    },
                },
                required: ["query"],
                additionalProperties: false,
            },
        },
    },

];
