# Image Processing API — HTTP contract

This document describes the minimal HTTP contract implemented by this repository and expected by compatible clients (such as the Lets-Chat Svelte frontend).

## Endpoint

`GET /api/images`

## Query parameters

- `key` (optional): Media key / relative path of the stored image (for example `uploads/<filename>.png`).
  - If provided, the service loads the object from S3 and requires `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
  - Clients may send a full URL; the service normalizes by taking the pathname and stripping leading slashes.
  - Keys must start with one of the prefixes in `ALLOWED_KEY_PREFIXES` (comma-separated, default `uploads/`).
- `filename` (optional): Base filename without extension (for example `icelandwaterfall`). Reads from local `assets/full/<filename>.jpg`.
- `width` (required): Target width (positive integer).
- `height` (required): Target height (positive integer).

At least one of `key` or `filename` must be provided.

## Response

Return the resized image bytes for the requested dimensions.

- `Content-Type: image/*` (for example `image/jpeg`, `image/png`).
- Responses should be cacheable by URL (query string defines the variant).

## Errors

- **400:** Neither `key` nor `filename`; invalid `key` prefix; missing or non-positive `width`/`height`; dimensions above `MAX_IMAGE_DIMENSION`.
- **500:** `key` mode without S3 configuration, or processing failure.
- **404:** Source object or file does not exist.

## Example

```bash
curl -G "http://127.0.0.1:3000/api/images" \
  --data-urlencode "key=uploads/example.png" \
  --data-urlencode "width=200" \
  --data-urlencode "height=200" \
  -o resized.png
```

## Client configuration (Lets-Chat)

Set `VITE_IMAGE_PROCESSING_BASE_URL` to this service’s public base URL (no trailing slash required). The client calls:

`{VITE_IMAGE_PROCESSING_BASE_URL}/api/images?key=<mediaKey>&width=<w>&height=<h>`
