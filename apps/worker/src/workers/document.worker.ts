import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

import { Worker } from "bullmq";
import { createBullMQConnection, type ProcessDocumentJobData } from "@axon/queue";
import { prisma } from "../../../api/src/config/db";
import {
    extractPdfText,
    splitDocument,
    getEmbeddings,
    upsertDocument,
} from "@axon/ai";

const connection = createBullMQConnection(true);

const worker = new Worker<ProcessDocumentJobData>(
    "process-document-queue",
    async (job) => {
        console.log("Processing document:", job.id);
        const { documentId, userId } = job.data;

        try {
            // 1. Fetch document from PostgreSQL & mark PROCESSING
            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' },
            });

            // 2. Download file from Cloudinary (get source URL)
            const doc = await prisma.document.findUnique({
                where: {
                    id: documentId,
                },
            });

            const pdfUrl = doc?.sourceUrl;
            if (!pdfUrl) {
                throw new Error(`Document URL not found for document ID: ${documentId}`);
            }

            // 3. Extract text
            console.log(`Extracting text from: ${pdfUrl}`);
            const text = await extractPdfText(pdfUrl);

            // 4. Chunk text
            console.log(`Splitting document text into chunks...`);
            const chunks = await splitDocument(text);

            // 5. Generate embeddings
            console.log(`Generating embeddings for ${chunks.length} chunks...`);
            const vectors = await getEmbeddings(chunks);

            // 6. Store vectors in Qdrant
            console.log(`Storing vectors in Qdrant collection...`);
            await upsertDocument(
                chunks,
                {
                    tenantId: "default",
                    userId,
                    documentId,
                },
                
            );

            // 7. Update document status
            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'COMPLETED' },
            });

            console.log(`Document ${documentId} processed successfully.`);

            return {
                success: true,
                documentId,
            };
        } catch (error: any) {
            console.error(`Failed to process document ${documentId}:`, error);

            await prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'FAILED',
                    errorMessage: error?.message || 'Unknown processing error',
                },
            });

            throw error;
        }
    },
    {
        connection,
        concurrency: 3,
    }
);

worker.on('completed', (job, result) => {
    console.log(`Document job ${job.id} completed`, result);
});

worker.on('failed', (job, err) => {
    console.error(`Document job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
    console.error('Worker error:', err);
});
