# Deployment

Use this service behind HTTPS (your platform’s reverse proxy or load balancer). The Lets-Chat frontend should set **`VITE_IMAGE_PROCESSING_BASE_URL`** to that public base URL (no trailing slash required).

## Production command

Platforms run:

```bash
npm ci
npm run build
npm run start
```

Or: `node build/index.js` after `npm ci` and `npm run build`.

`npm start` runs the compiled `build/index.js` without devDependencies.

## Listen address and port

- **`PORT`:** The process listens on the port given by this variable (default `3000`). Most hosts (Northflank, Railway, Fly.io, Render, etc.) inject `PORT`; set it in the environment if your platform does not.
- **`HOST`:** Default `0.0.0.0` so the server accepts traffic inside containers and behind proxies. Override only if you need to bind to a specific interface.

## Docker

Build and run:

```bash
docker build -t image-processing-api .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e S3_BUCKET=your-bucket \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  image-processing-api
```

For **Lets-Chat** with `key=` uploads, the container must have the same **S3** credentials and bucket as your Django/media backend. `ALLOWED_KEY_PREFIXES` must match your stored object keys (often `uploads/`).

Local-only **`filename=`** mode requires `assets/full/` JPEGs in the image (the Dockerfile copies `assets/`). Production with Lets-Chat typically uses **`key=` + S3**, not local files.

## Health checks

`GET /` returns plain text (`200`). Use that path for load balancer or orchestrator health checks.

## Security notes

- Do not commit `.env` with real credentials.
- Prefer IAM roles or your platform’s secret store instead of long-lived keys when possible.
- Keep `MAX_IMAGE_DIMENSION` reasonable to limit CPU/memory use on resize.
