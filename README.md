# Smart Time Registration

A simple application for tracking and managing time registrations. The project is fully containerized using Docker, making it easy to run without installing dependencies locally.

## Features

* Register and manage time entries
* Clean and lightweight setup
* Runs entirely in Docker for consistency across environments

## Prerequisites

Before you begin, make sure you have the following installed:

* Docker Desktop (or a Docker engine) installed and running.

## Running the Application

### Build and start containers

```bash
docker compose up -d --build
```

This command builds the Docker images (if needed) and starts all services defined in `docker-compose.yml` in detached mode (`-d`), so they run in the background.

### Start existing containers

```bash
docker compose up -d
```

Use this if the images are already built and you just want to start the containers again.

### Stop containers

```bash
docker compose down
```

Stops and removes the running containers, networks, and related resources.

### View logs

```bash
docker compose logs -f
```

Displays real-time logs from the running containers, which is useful for debugging or monitoring activity.

## Accessing the App

Once the containers are running, open your browser and go to:

http://localhost:5173

(Adjust the port if you’ve changed it in the configuration.)

## Project Structure

* `src/` – Main application source code
* `Dockerfile` – Instructions for building the application image
* `docker-compose.yml` – Defines and configures all services

## Notes

* Environment variables may be required depending on your setup
* You can modify ports or services in `docker-compose.yml`
* Rebuild containers after making changes to dependencies or configuration

