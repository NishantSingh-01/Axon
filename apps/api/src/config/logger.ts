import pino from "pino";
import { trace } from "@opentelemetry/api"

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    mixin() {
        const span = trace.getActiveSpan();

        if (!span) {
            return {};
        }
        const { traceId, spanId } = span.spanContext();
        return {
            trace_id: traceId,
            span_id: spanId,
        };
    },

    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
        }
    }
});

export default logger
