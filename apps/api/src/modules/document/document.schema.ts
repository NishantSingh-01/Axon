import { z } from "zod"

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title is too long"),
})
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>