# Deployment

## Docker

### Build Locally

To build the Docker image locally:

```bash
docker build -t hkrecruitment .
```

### Run Locally

To run the application using Docker, you need to provide the required environment variables. You can pass them using the `-e` flag or an `.env` file.

```bash
docker run -p 3000:3000 \
  -e POSTGRES_URL=postgres://user:password@host:5432/db \
  -e BETTER_AUTH_SECRET=your_secret \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  hkrecruitment
```

Note: Replace the environment variables with your actual configuration.
If you need to connect to services running on your host machine (e.g. a local PostgreSQL database), use `host.docker.internal` instead of `localhost` in your connection strings (on Docker Desktop for Mac/Windows). For Linux, you might need to use `--add-host=host.docker.internal:host-gateway`.

## GitHub Actions

This repository is configured with a GitHub Action workflow that automatically builds and pushes the Docker image to the GitHub Container Registry (ghcr.io) when a new tag starting with `v` is pushed (e.g., `v1.0.0`).

### Prerequisites

- The GitHub Action requires `write` permission to packages. This is configured in the workflow file.

### Usage

1.  Create a new tag: `git tag v1.0.0`.
2.  Push the tag: `git push origin v1.0.0`.
3.  The "Docker" workflow will trigger automatically.
4.  Once the workflow completes, the image will be available at `ghcr.io/<username>/<repository>:v1.0.0` and `ghcr.io/<username>/<repository>:latest`.

### Pulling the Image

To pull the image from the GitHub Container Registry:

```bash
docker pull ghcr.io/<username>/<repository>:latest
```
