import { Queue } from 'bullmq'
import { createBullMQConnection } from '../connection'


const connection = createBullMQConnection()
export const processDocumentQueue = new Queue("process-document-queue", {
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
