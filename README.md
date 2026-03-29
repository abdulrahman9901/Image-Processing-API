# Image Processing API

Express + TypeScript + [Sharp](https://sharp.pixelplumbing.com/) service that resizes images on demand. Use it for prototyping (local files) or as a resize edge in front of object storage (S3 keys).

Designed to match the HTTP contract expected by the **Lets-Chat** Svelte frontend when `VITE_IMAGE_PROCESSING_BASE_URL` points at this service. The full contract is documented in [`CONTRACT.md`](CONTRACT.md).

## Features

- **`GET /api/images`** with `width` and `height` (required, positive integers).
- **Local files:** `filename` — reads `assets/full/<filename>.jpg`, caches resized thumbs under `assets/thumb/`.
- **Remote storage:** `key` — fetches an object from S3, resizes in memory (no local thumb cache). Keys must match `ALLOWED_KEY_PREFIXES` (default `uploads/`).
- **CORS:** `Access-Control-Allow-Origin: *` on image responses (suitable for browser clients).
- **Configurable:** port, max dimension guard, S3 credentials, key prefixes.

## Quick start

```bash
git clone https://github.com/abdulrahman9901/Image-Processing-API.git
cd Image-Processing-API
npm install
npm run build
npm run start-dev
```

Default URL: `http://127.0.0.1:3000` (override with `PORT`).

### Example (local file)

Place JPEGs in `assets/full/` (a sample `icelandwaterfall.jpg` is included for tests).

```http
GET http://localhost:3000/api/images?filename=icelandwaterfall&width=300&height=100
```

### Example (S3 key, Lets-Chat uploads)

With AWS environment variables set (see below):

```http
GET http://localhost:3000/api/images?key=uploads/chat-image.png&width=200&height=200
```

The `key` value should match what your backend stores (e.g. relative S3 object key). The service normalizes keys that include a full URL by taking the pathname.

## Environment variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Listen port (default `3000`). |
| `ALLOWED_KEY_PREFIXES` | No | Comma-separated allowed prefixes for `key` (default `uploads/`). |
| `MAX_IMAGE_DIMENSION` | No | Reject `width` or `height` above this value (default `4096`). |
| `S3_BUCKET` | For `key` | Bucket name. |
| `AWS_REGION` | For `key` | Default `us-east-1`. |
| `AWS_ACCESS_KEY_ID` | For `key` | AWS access key. |
| `AWS_SECRET_ACCESS_KEY` | For `key` | AWS secret key. |

Copy `.env.example` to `.env` and load it with your process manager or `dotenv` if you add that later.

If `key` is used but S3 is not configured, the API returns **500** (`storage not configured for key-based access`).

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run build` | Compile TypeScript to `build/`. |
| `npm run start-dev` | Dev server with nodemon on `src/index.ts`. |
| `npm run start-prod` | Run compiled `build/index.js`. |
| `npm test` | Build and run Jasmine specs. |
| `npm run lint` | ESLint on `.ts` sources. |

## HTTP status codes

| Status | When |
| :---: | :--- |
| **200** | Image bytes returned (`Content-Type: image/*`). |
| **400** | Missing `key`/`filename`, invalid dimensions, disallowed `key`, or dimensions over the max. |
| **404** | Source image not found (local or S3). |
| **500** | S3 not configured for `key`, or resize/read failure. |

## Integration: Lets-Chat frontend

In the Svelte app, set:

```env
VITE_IMAGE_PROCESSING_BASE_URL=https://your-image-service.example.com
```

The client requests:

`{VITE_IMAGE_PROCESSING_BASE_URL}/api/images?key=<mediaKey>&width=<w>&height=<h>`

If that variable is unset, the frontend falls back to Django’s media download URL (no server-side resize).

## Project layout

```
src/
  index.ts              # Express app + listen
  routes/api/images.ts  # GET /api/images
  utilities.ts          # Local resize + thumb cache
assets/
  full/                 # Source JPEGs for filename= mode
  thumb/                # Generated thumbs (gitignored)
CONTRACT.md             # HTTP contract (for any compatible client)
```

## License

ISC (see `package.json`).
