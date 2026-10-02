import { PDFParse } from "pdf-parse"

export const extractPdfText = async (pdfUrl: string) => {
  const parser = new PDFParse({
    url: pdfUrl,
  })

  try {
    const result = await parser.getText()

    const text = result.text.trim()
    console.log("Text extracted from PDF", text)

    if (!text) {
      throw new Error("No text could be extracted from the PDF")
    }

    return text
  } finally {
    await parser.destroy()
  }
}

