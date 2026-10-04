export const toolDefinitions = [
    {
        type: "function",
        function: {
            name: "searchWeb",
            description: "Search the web for current or time-sensitive information.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "knowledgeSearch",
            description: "Search uploaded company documents and internal knowledge.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string"
                    }
                },
                required: ["query"]
            }
        }
    }
];