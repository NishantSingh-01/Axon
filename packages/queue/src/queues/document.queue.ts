import { Queue } from 'bullmq'
import { createBullMQConnection } from '../connection'

export interface ProcessDocumentJobData {
    documentId: string;
    userId: string;
}

const connection = createBullMQConnection()

export const documentQueue = new Queue<ProcessDocumentJobData>("process-document-queue", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
})

export const processDocumentQueue = documentQueue

