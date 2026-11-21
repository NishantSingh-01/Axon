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
            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' },
            });
            const doc = await prisma.document.findUnique({
                where: {
                    id: documentId,
                },
            });
            const pdfUrl = doc?.sourceUrl;
            if (!pdfUrl) {
                throw new Error(`Document URL not found for document ID: ${documentId}`);
            }
            console.log(`Extracting text from: ${pdfUrl}`);
            const text = await extractPdfText(pdfUrl);

            console.log(`Splitting document text into chunks...`);
            const chunks = await splitDocument(text)
            const cleanChunks = chunks
                .map((chunk) => chunk.trim())
                .filter((chunk) => chunk.length > 0 && !/^--\s*\d+\s+of\s+\d+\s*--$/i.test(chunk))

            console.log(`Generating embeddings for ${cleanChunks.length} chunks...`);
            // const vectors = await getEmbeddings(cleanChunks); //already done in upsertDocument
            
            console.log(`Storing vectors in Qdrant collection...`);
            await upsertDocument(
                cleanChunks,
                {
                    tenantId: "default",  // will be changed later 
                    userId,
                    documentId,
                },

            )

            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'COMPLETED' },
            });
            console.log(`Document ${documentId} processed successfully.`);
            return {
                success: true,
                documentId,
            }
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
