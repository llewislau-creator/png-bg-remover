$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (!(Get-Command py -ErrorAction SilentlyContinue)) { throw "Install Python 3.11+ first from python.org" }
if (!(Test-Path ".venv")) { py -3 -m venv .venv }
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
if (!(Test-Path ".env")) { Copy-Item ".env.example" ".env"; Write-Host "Edit .env to add MEDIA_BRIDGE_PUBLIC_KEY before running"; exit 1 }
if (!(Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw "Install FFmpeg and add it to PATH" }
& ".\.venv\Scripts\python.exe" -m uvicorn server:app --host 127.0.0.1 --port 8765
