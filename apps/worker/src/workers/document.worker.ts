import { Worker } from "bullmq";
import { createBullMQConnection, type ProcessDocumentJobData } from "@axon/queue";


const connection = createBullMQConnection(true)

const worker = new Worker<ProcessDocumentJobData>(
    "process-document-queue",
    async (job) => {
        console.log("Processing document:", job.id)

        //todo
        // 1. Fetch document from PostgreSQL
        // 2. Download file from Cloudinary
        // 3. Extract text
        // 4. Chunk text
        // 5. Generate embeddings
        // 6. Store vectors in Qdrant
        // 7. Update document status

        return {
            success: true,
            // documentId
        }
    },
    {
        connection,
        concurrency: 3
    }
)
worker.on('completed', (job, result) => {
    console.log(`Document job ${job.id} completed`, result)
})

worker.on('failed', (job, err) => {
    console.error(`Document job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
    console.error('Worker error:', err)
})
