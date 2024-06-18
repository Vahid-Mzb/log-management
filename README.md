# abrNoc Monitoring and Log Management Service

## Introduction

This repository contains a Node.js web application that returns a plain text greeting on port 8888. The project is containerized using Docker, includes Fluentd for log collection, stores logs in Elasticsearch, and utilizes Prometheus for monitoring with Alertmanager to send notifications through Telegram.

## Features

- **Web Server**: Simple HTTP server in Node.js displaying "Hello abrNOC".
- **Logging**: Fluentd collects logs and forwards them to Elasticsearch.
- **Monitoring**: Prometheus monitors the system, with Alertmanager handling alerts and notifications via a Telegram bot (@Alert_abrnoc_bot).
- **Containerization**: Everything is run using Docker and orchestrated with Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- `curl` (for interacting with Elasticsearch directly)

## Docker Compose Configuration Summary

This Docker Compose file sets up an integrated monitoring and log management system with the following components:

### Services

#### Elasticsearch

- **Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.3.0`
- Configured as a single-node cluster with security features disabled for simplicity.
- Exposes port `9200` and includes health checks to ensure availability before other services start.

#### Fluentd

- Custom image built from a Dockerfile in `./fluentd`.
- Receives logs on port `24224` (both TCP and UDP).
- Dependent on the healthy start of Elasticsearch and initialization of Prometheus.

#### Web Server

- Node.js web server built from `./webserver` Dockerfile.
- Host port `80` is mapped to container port `8888`.
- Begins operation once Fluentd is ready to handle logs.

#### Prometheus

- **Image**: `prom/prometheus:v2.26.0`
- Configuration and rules loaded from `./prometheus`.
- Accessible through port `9090`.
- Starts after Elasticsearch to ensure data connectivity.

#### Alertmanager

- **Image**: `prom/alertmanager:latest`
- Configurations loaded from `./alertmanager`.
- Manages alerts from Prometheus and sends notifications, accessible via port `9093`.
- Relies on Prometheus for operational triggers.

### Network

- **App-Network**: Uses a bridge driver for internal connectivity among services.

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone [repository-url]
   cd [repository-directory]
   ```

2. **Build and Run Containers**
   ```bash
   docker-compose up --build
   ```

## Usage

### Accessing the Web Server

Visit `http://localhost:80` in your browser to see the "Hello abrNOC" message.

### Viewing Logs in Elasticsearch

To view the logs stored in Elasticsearch, run the following command:

```bash
curl http://localhost:9200/fluentd/_search?pretty
```

![elasticsearch](https://i.imgur.com/Ql6a9gk.png)

### Triggering an Alert

To manually trigger an alert and receive a message from Telegram, you can make an erroneous request using `curl`. This will activate the alert in Prometheus:

```bash
curl localhost/test-error
```

![telegram](https://i.imgur.com/SAtO2DQ.png)

### Monitoring with Prometheus

Access Prometheus by navigating to `http://localhost:9090`.

![metrics](https://i.imgur.com/RQ7hYBN.png)

Shows the Prometheus Metrics Explorer, which lists various metrics that Prometheus is configured to monitor. These metrics include HTTP requests, Node.js specific metrics like event loop lag, garbage collection details, and memory usage.

![active](https://i.imgur.com/YPLDuby.png)

The Alerts panel in Prometheus before any alerts are triggered. It shows that there are configurations for alerts such as `HighErrorRate500` and `HighUnauthorizedAttempts`, but none are active.

![firing](https://i.imgur.com/dEFnv0J.png)

After triggering an error by making a request to `localhost/test-error`, the Alerts panel updates to show that the `HighErrorRate500` is firing.

### Receiving Alerts

Alerts are configured to be sent to a Telegram bot. Ensure your Telegram bot is set up correctly to receive notifications.

## Configuration Files

- **Docker Compose**: Defines the services and network configurations.
- **Fluentd Configuration**: Custom Fluentd image setup to work with Elasticsearch.
- **Prometheus Configuration**: Metrics collection and alert rules.
- **Alertmanager Configuration**: Alert routing and notification settings.
