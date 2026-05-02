<div align="center">

# URL Shortener

**A production-ready URL shortening service built with Node.js, Redis, Docker networking, and GitHub Actions CI/CD.**

</div>

---

## What it does

Takes a long URL → returns a short code → redirects anyone who visits the short link to the original URL.

Built like Bit.ly from scratch — but the real point is the infrastructure: **two Docker containers communicating over a custom bridge network**, with a full **CI/CD pipeline** that builds and validates the image on every push.

---

## Architecture

```
  Client Request
       │
       ▼
┌─────────────────┐        Custom Docker Bridge Network (url-network)
│   Node.js App   │ ──────────────────────────────────────────────────┐
│  (Express API)  │                                                    │
│   Port: 3000    │◄──── DNS: "redis" ────►  ┌─────────────────────┐  │
└─────────────────┘                          │   Redis Container   │  │
        │                                    │   (In-memory store) │  │
        │                                    │   Port: 6379        │  │
        ▼                                    └─────────────────────┘  │
  Short URL Response                                                   │
                          └────────────────────────────────────────────┘

Key: App container talks to Redis using container name "redis" as hostname
     — not localhost, not an IP. This is Docker bridge networking in action.
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + Express | Fast, lightweight REST API |
| Storage | Redis | O(1) key-value lookup for URL mapping |
| Containerization | Docker | Isolated, reproducible environments |
| Networking | Custom Docker Bridge | Containers talk by name, not IP |
| CI/CD | GitHub Actions | Auto-build + validate on every push |

---

## API Endpoints

### Shorten a URL
```
POST /shorten
Content-Type: application/json

{
  "url": "https://www.example.com/some/very/long/url"
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

### Redirect to original URL
```
GET /:shortCode
```
Redirects to the original long URL.

---

## Run Locally with Docker

> Requires: Docker installed and running

**Step 1 — Create a custom bridge network**
```bash
docker network create url-network
```

**Step 2 — Start Redis container on that network**
```bash
docker run -d \
  --name redis \
  --network url-network \
  redis:alpine
```

**Step 3 — Build the app image**
```bash
docker build -t url-shortener .
```

**Step 4 — Run the app container on the same network**
```bash
docker run -d \
  -p 3000:3000 \
  --name url-app \
  --network url-network \
  url-shortener
```

**Step 5 — Test it**
```bash
# Shorten a URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/prachi-satbhai0741"}'

# Use the returned short code to test redirect
curl -L http://localhost:3000/<shortCode>
```

## CI/CD Pipeline — GitHub Actions

Every push to `main` triggers the workflow:

```
Push to main
     │
     ▼
┌─────────────────────────────────┐
│  1. Checkout code               │
│  2. Set up Docker Buildx        │
│  3. Build Docker image          │
│  4. Verify build succeeded      │
└─────────────────────────────────┘
```

Workflow file: `.github/workflows/`

This ensures the Docker image always builds cleanly — catches broken Dockerfiles or missing dependencies before they become a problem.

---

## Project Structure

```
url-shortener/
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── app.js                 # Express server + Redis logic
├── Dockerfile             # Container build instructions
├── .dockerignore          # Exclude node_modules from image
├── package.json
└── README.md
```

## Author

**Prachi Satbhai** 
