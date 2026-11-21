import { PDFParse } from "pdf-parse"

export const extractPdfText = async (pdfUrl: string) => {
  const parser = new PDFParse({
    url: pdfUrl,
  })

  try {
    const result = await parser.getText()

    const text = result.text.trim()
    // console.log("Text extracted from PDF", text)

    if (!text) {
      throw new Error("No text could be extracted from the PDF")
    }

    return text
  } finally {
    await parser.destroy()
  }
}
// extractPdfText("https://res.cloudinary.com/dpcdncnka/raw/upload/v1795244969/nexusai/documents/8bb3c506-03bf-4985-b7fb-dff9677419c5")
