# URL Shortener API 

A fast URL shortener built with Node.js, Redis and Docker.
Just like bit.ly — built from scratch!

## Tech Stack
- **Node.js + Express** — REST API
- **Redis** — Fast URL storage
- **Docker** — Containerized
- **GitHub Actions** — CI/CD pipeline

## How to Run
```bash
# Create Docker network
docker network create url-network

# Run Redis container
docker run -d --name redis --network url-network redis:alpine

# Build and run app
docker build -t url-shortener .
docker run -d -p 3000:3000 --name url-app --network url-network url-shortener
```



