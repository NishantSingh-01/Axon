import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/bullmq.connection.js";

export const DOCUMENT_QUEUE_NAME = "document-processing";

export const documentQueue = new Queue(DOCUMENT_QUEUE_NAME, {
    connection: createBullMQConnection(),

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 2000,
        },

        removeOnComplete: {
            count: 1000,
        },

        removeOnFail: {
            count: 5000,
        },
    },
});