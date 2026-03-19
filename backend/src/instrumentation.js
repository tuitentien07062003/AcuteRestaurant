// src/instrumentation.js
import dotenv from 'dotenv';
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";

dotenv.config();
const headers = {
  Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS,
};

const sdk = new NodeSDK({
  serviceName: "acute-restaurant-service",
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    headers: headers,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      headers: headers,
    }),
  }),
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
      headers: headers,
    })
  ),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log("🔭 OpenTelemetry đã sẵn sàng");