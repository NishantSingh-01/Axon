
import { NodeSDK } from "@opentelemetry/sdk-node";

import { getNodeAutoInstrumentations } from
  "@opentelemetry/auto-instrumentations-node";

import { ConsoleSpanExporter } from
  "@opentelemetry/sdk-trace";

import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";

// Configure OpenTelemetry SDK
const sdk = new NodeSDK({
  // Export distributed traces to terminal
  traceExporter: new ConsoleSpanExporter(),

  // Export metrics every 10 seconds
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 10000,
    }),
  ],

  // Automatically instrument supported libraries
  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});

// Start OpenTelemetry
sdk.start();

console.log("OpenTelemetry initialized successfully");

// Graceful shutdown
const shutdown = async () => {
  try {
    await sdk.shutdown();
    console.log("OpenTelemetry shut down successfully");
  } catch (error) {
    console.error("Error shutting down OpenTelemetry:", error);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
