# PIXORA cloud media migration

## Current state
The Vercel frontend expects a separate HTTPS service with `GET /health`, `POST /jobs`, `GET /jobs/:id`, `POST /jobs/:id/cancel`, and `GET /files/:id?ticket=...`. A complete cloud worker is **not yet deployed**. The frontend must remain disabled while `/health` is not ready.

## Recommended deployment
Deploy a containerized worker to a managed service such as Railway or Render, with FFmpeg and yt-dlp installed. For production, use a persistent Redis-backed queue and object storage for results instead of ephemeral filesystem, and restrict public download endpoints to short-lived authorized tickets. Set memory/CPU and execution timeouts and explicit storage quotas. Container hosting can have charges.

## Configuration
1. Provision a stable HTTPS hostname for the worker.
2. Verify the Vercel `MEDIA_BRIDGE_PRIVATE_KEY` is an Ed25519 private key. The worker must receive only the corresponding public key; **never** copy the private key into the worker.
3. The worker must verify signature, `aud=pixora-public-media`, expiry, and per-job ownership for every route, including downloads. Enforce the frontend's per-IP and global quotas server-side, not only in the browser.
4. Set Vercel Production `PUBLIC_MEDIA_BACKEND_URL` to the verified HTTPS worker origin. Redeploy Production to apply the variable.
5. Verify `/api/media-ticket` returns the new origin and authenticated `/health` returns `{"ready":true}` before enabling processing.

## Security and operations
Accept only explicitly authorized media. Reject internal/private network URLs and redirects; restrict supported hosts and duration/size limits. Ensure cancellation kills process groups. Protect against storage exhaustion and concurrent jobs. Clean results after expiry. Set strict CORS to PIXORA's actual production origin. Verify third-party platform terms and permissions. Monitor errors and avoid logging tokens or URLs containing secrets.

## Rollout
Keep the current production deployment untouched until worker deployment, signed-ticket integration, and end-to-end tests pass. Switch Vercel backend URL only after a verified working endpoint exists. Roll back by restoring the previous variable if necessary.

## Compatibility changes in this branch
`api/media-ticket.js` now accepts a configured public HTTPS cloud hostname, rather than only temporary trycloudflare.com domains. This branch is a migration foundation, not a completed worker implementation.
