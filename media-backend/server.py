import asyncio, base64, datetime, ipaddress, json, os, re, shutil, subprocess, time, uuid
from collections import defaultdict, deque
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

ROOT=Path(__file__).resolve().parent
load_dotenv(ROOT/".env")
DATA=ROOT/"downloads"
DATA.mkdir(exist_ok=True)
ORIGIN=os.getenv("PIXORA_ORIGIN","https://usepixora.vercel.app").rstrip("/")
app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
app.add_middleware(CORSMiddleware,allow_origins=[ORIGIN],allow_methods=["GET","POST"],allow_headers=["Authorization","Content-Type"])
jobs={}
queue=deque()
active=None
limits=defaultdict(list)
MAX_AGE=3600
def key():
    value=os.getenv("MEDIA_BRIDGE_PUBLIC_KEY","").replace("\\n","\n")
    if not value: return None
    obj=serialization.load_pem_public_key(value.encode())
    if not isinstance(obj,Ed25519PublicKey): raise ValueError("Expected Ed25519 public key")
    return obj
def verify(token):
    try:
        body,sig=token.split(".")
        pub=key()
        if not pub: raise ValueError("Missing key")
        pub.verify(base64.urlsafe_b64decode(sig+"="*(-len(sig)%4)),body.encode())
        claims=json.loads(base64.urlsafe_b64decode(body+"="*(-len(body)%4)))
        if claims.get("aud")!="pixora-public-media" or not isinstance(claims.get("exp"),(int,float)) or claims["exp"]<time.time()*1000 or claims["exp"]>time.time()*1000+3700000: raise ValueError("Expired ticket")
        if not isinstance(claims.get("sub"),str) or not isinstance(claims.get("rate"),str): raise ValueError("Invalid ticket")
        return claims
    except Exception: raise HTTPException(401,"Invalid or expired ticket")
def auth(request,download=False):
    token=request.query_params.get("ticket") if download else request.headers.get("authorization","").removeprefix("Bearer ").strip()
    return verify(token or "")
def message(job):
    return {"queued":"等候處理","running":"下載／轉換中","done":"完成，可以下載。","error":"處理失敗，請檢查影片是否可下載。","canceled":"已取消"}[job["state"]]
def view(job):
    return {"id":job["id"],"state":job["state"],"message":message(job),"position":(list(queue).index(job["id"])+1 if job["id"] in queue else 0)}
def validate_url(raw):
    try:
        u=urlparse(raw)
        host=(u.hostname or "").lower()
        if u.scheme!="https" or host not in ("youtube.com","www.youtube.com","m.youtube.com","youtu.be"): raise ValueError()
        if u.port not in (None,443) or u.username or u.password: raise ValueError()
        if not (re.fullmatch(r"/[A-Za-z0-9_-]{11}",u.path) if host=="youtu.be" else (u.path=="/watch" or re.fullmatch(r"/shorts/[A-Za-z0-9_-]{11}",u.path))): raise ValueError()
        return raw
    except Exception: raise HTTPException(400,"Invalid YouTube URL")
def cleanup():
    now=time.time()
    for jid,j in list(jobs.items()):
        if now-j["created"]>MAX_AGE:
            if j["state"]=="running": continue
            shutil.rmtree(DATA/jid,ignore_errors=True)
            jobs.pop(jid,None)
    for k,v in list(limits.items()): limits[k]=[t for t in v if now-t<86400]
def process(job):
    folder=DATA/job["id"]
    folder.mkdir(exist_ok=True)
    url=job["url"]
    fmt=job["format"]
    q=job["quality"]
    output=str(folder/"media.%(ext)s")
    command=["yt-dlp","--no-playlist","--no-config","--no-cache-dir","--no-write-info-json","--no-write-thumbnail","--no-write-subs","--max-downloads","1","--match-filter","duration <= 900","--max-filesize","100M","--socket-timeout","15","--retries","2","--paths",str(folder),"-o",output]
    if fmt=="mp3":
        command+=["-f","bestaudio[filesize<100M]/bestaudio","-x","--audio-format","mp3","--audio-quality",str(q)+"K"]
    else:
        command+=["-f",f"bestvideo[height<={q}][filesize<100M]+bestaudio[filesize<100M]/best[height<={q}][filesize<100M]","--merge-output-format","mp4","--recode-video","mp4"]
    command.append(url)
    proc=subprocess.Popen(command,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    job["proc"]=proc
    try:
        try: code=proc.wait(timeout=600)
        except subprocess.TimeoutExpired: proc.kill();proc.wait();raise RuntimeError("Timeout")
        if job["state"]=="canceled": return
        if code!=0: raise RuntimeError("Download failed")
        found=[p for p in folder.iterdir() if p.is_file() and p.suffix.lower()==("."+fmt)]
        if not found or found[0].stat().st_size>256*1024*1024: raise RuntimeError("Output unavailable or too large")
        job["file"]=str(found[0]);job["state"]="done"
    except Exception: job["state"]="error"
    finally: job.pop("proc",None)
async def worker():
    global active
    while True:
        cleanup()
        if queue:
            jid=queue.popleft()
            job=jobs.get(jid)
            if job and job["state"]=="queued":
                active=jid;job["state"]="running"
                await asyncio.to_thread(process,job)
                active=None
        await asyncio.sleep(1)
@app.on_event("startup")
async def startup():
    app.state.worker=asyncio.create_task(worker())
@app.get("/health")
def health(request:Request):
    auth(request)
    return {"ready":bool(key() and shutil.which("yt-dlp") and shutil.which("ffmpeg"))}
@app.post("/jobs")
async def create(request:Request):
    claims=auth(request)
    cleanup()
    if not key() or not shutil.which("ffmpeg") or not shutil.which("yt-dlp"): raise HTTPException(503,"Backend not ready")
    data=await request.json()
    if data.get("authorized") is not True: raise HTTPException(400,"Permission confirmation required")
    fmt=data.get("format");quality=str(data.get("quality"))
    if fmt not in ("mp3","mp4") or quality not in (("128","192","320") if fmt=="mp3" else ("480","720")): raise HTTPException(400,"Invalid format")
    url=validate_url(str(data.get("url","")))
    if len(queue)>=2: raise HTTPException(429,"Queue full")
    now=time.time();day=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    ipkey="ip:"+claims["rate"]+":"+day;sitekey="site:"+day
    if len(limits[ipkey])>=3 or len(limits[sitekey])>=10: raise HTTPException(429,"Daily limit reached")
    limits[ipkey].append(now);limits[sitekey].append(now)
    jid=str(uuid.uuid4())
    jobs[jid]={"id":jid,"url":url,"format":fmt,"quality":quality,"state":"queued","owner":claims["sub"],"created":now}
    queue.append(jid)
    return {"id":jid}
@app.get("/jobs/{jid}")
def get_job(jid:str,request:Request):
    claims=auth(request)
    job=jobs.get(jid)
    if not job or job["owner"]!=claims["sub"]: raise HTTPException(404,"Not found")
    return view(job)
@app.post("/jobs/{jid}/cancel")
def cancel(jid:str,request:Request):
    claims=auth(request)
    job=jobs.get(jid)
    if not job or job["owner"]!=claims["sub"]: raise HTTPException(404,"Not found")
    if job["state"] in ("queued","running"):
        job["state"]="canceled"
        proc=job.get("proc")
        if proc: proc.terminate()
    return view(job)
@app.get("/files/{jid}")
def file(jid:str,request:Request):
    claims=auth(request,True)
    job=jobs.get(jid)
    if not job or job["owner"]!=claims["sub"] or job["state"]!="done": raise HTTPException(404,"Not found")
    path=Path(job["file"])
    if not path.is_file(): raise HTTPException(404,"Expired")
    return FileResponse(path,filename="pixora-"+jid+path.suffix,media_type="application/octet-stream")
