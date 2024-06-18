const express = require("express");
const app = express();
const port = 8888;
const fluentLogger = require("fluent-logger");
const promClient = require("prom-client");

// Create a counter for tracking HTTP status codes
const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["status"],
});

// Configure Prometheus metrics collection
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Set up the Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  try {
    const metrics = await promClient.register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error("Failed to retrieve Prometheus metrics:", error);
    res.status(500).send("Error retrieving metrics");
  }
});

// Configure fluent-logger to forward logs to Fluentd
fluentLogger.configure("fluentd", {
  host: "fluentd",
  port: 24224,
  timeout: 3.0,
  reconnectInterval: 600000,
});

// Middleware to log each request
app.use((req, res, next) => {
  res.on("finish", () => {
    fluentLogger.emit("follow", {
      from: "user",
      to: "web server",
      method: req.method,
      path: req.path,
      status: res.statusCode,
      message: `Processed request to ${req.path} with status ${res.statusCode}`,
    });
  });
  next();
});

// Default route to send a greeting and increment the appropriate counter
app.get("/", (req, res) => {
  httpRequestCounter.labels("200").inc();
  res.send("Hello abrNOC");
});

// Route to simulate an HTTP 500 error for testing
app.get("/test-error", (req, res) => {
  httpRequestCounter.labels("500").inc();
  fluentLogger.emit("follow", {
    from: "user",
    to: "web server",
    message: "Simulated Server Error",
    path: req.path,
    status: "500",
  });
  res.status(500).send("Simulated Server Error");
});

// Handle unauthorized routes
app.use((req, res) => {
  httpRequestCounter.labels("404").inc();
  fluentLogger.emit("follow", {
    from: "user",
    to: "web server",
    message: "Unauthorized Access Attempt",
    path: req.path,
    status: "404",
  });
  res.status(404).send("Not Found");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
