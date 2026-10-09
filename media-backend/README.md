# PIXORA Windows media bridge (experimental)

## Prerequisites
Windows 10/11, Python 3.11+, FFmpeg and Cloudflare cloudflared on PATH. Install FFmpeg and cloudflared from their official sources. Run in PowerShell in this folder.

## Key setup
The Vercel `MEDIA_BRIDGE_PRIVATE_KEY` must be an Ed25519 PEM private key. Derive its public key **locally**, never paste the private key into this repository. Example Python code (run locally, with cryptography installed):

```python
from cryptography.hazmat.primitives import serialization
private=serialization.load_pem_private_key(open("private.pem","rb").read(),password=None)
print(private.public_key().public_bytes(serialization.Encoding.PEM,serialization.PublicFormat.SubjectPublicKeyInfo).decode())
```

Put the printed public PEM into `.env` as `MEDIA_BRIDGE_PUBLIC_KEY` with literal `\\n` between lines. Do not commit `.env`. If the Vercel key is not Ed25519 PEM, generate a new matching key pair securely and update Vercel. Restart/redeploy Vercel after key changes.

## Start
1. Copy `.env.example` to `.env`, configure the public key and `PIXORA_ORIGIN`.
2. Run `powershell -ExecutionPolicy Bypass -File .\\start.ps1` (or execute the script from PowerShell).
3. In a second terminal: `cloudflared tunnel --url http://127.0.0.1:8765`
4. Copy the generated `https://...trycloudflare.com` URL into the Vercel Production variable `PUBLIC_MEDIA_BACKEND_URL`. Redeploy the PIXORA site to update its Content Security Policy.
5. Open `https://usepixora.vercel.app/media` and select **重新檢查服務**.

The Quick Tunnel hostname changes on restart. For production use, prefer a stable named tunnel, but the current PIXORA `backendUrl()` validation accepts only `trycloudflare.com` hosts. Keep both terminal windows open and Windows awake.

## Notes
This is a single-process, experimental queue. Jobs and daily limits reset on restart. The worker runs at most one job at a time, queues two, and cleans completed files after about one hour. Keep Windows access private, never expose the local port directly. The application checks signed tickets, expiry and job ownership. It does not bypass YouTube access restrictions or DRM. Some content may not be downloadable.
