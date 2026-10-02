import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"


export const splitDocument = async (text: string) => {
    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 150,
        separators: ["\n\n", "\n", ".", " "],
    })
    const chunks = await splitter.splitText(cleanedText)
    console.log("Chunks", chunks)
    return chunks
}