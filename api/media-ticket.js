import {sign,createPrivateKey,createHmac,randomUUID} from 'node:crypto'
import {headers,origin} from '../lib/private-auth.js'
export function backendUrl(){
 const raw=process.env.PUBLIC_MEDIA_BACKEND_URL;try{const u=new URL(raw);return u.protocol==='https:'&&/^[a-z0-9-]+\.trycloudflare\.com$/.test(u.hostname)&&!u.username&&!u.password&&!u.port?u.origin:null}catch{return null}
}
export default function handler(req,res){
 headers(res);res.setHeader('Content-Type','application/json');
 if(req.method!=='POST'){res.statusCode=405;return res.end(JSON.stringify({error:'Method not allowed'}))}
 if(req.headers.origin!==origin){res.statusCode=403;return res.end(JSON.stringify({error:'Invalid origin'}))}
 try{
  const bridge=backendUrl(),key=process.env.MEDIA_BRIDGE_PRIVATE_KEY;if(!bridge||!key)throw Error();
  const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const cookie=(req.headers.cookie||'').match(/(?:^|;\s*)__Host-pixora-media=([a-f0-9-]{36})(?:;|$)/)?.[1]||randomUUID();
  const rate=createHmac('sha256',key).update(ip).digest('hex'),sub=createHmac('sha256',key).update('browser:'+cookie).digest('hex');
  const exp=Date.now()+60*60*1000,body=Buffer.from(JSON.stringify({aud:'pixora-public-media',sub,rate,exp})).toString('base64url');
  const signature=sign(null,Buffer.from(body),createPrivateKey(key)).toString('base64url');
  res.setHeader('Set-Cookie',`__Host-pixora-media=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
  res.end(JSON.stringify({ticket:body+'.'+signature,expiresAt:exp,bridge}));
 }catch{res.statusCode=503;res.end(JSON.stringify({error:'共用下載服務尚未連接，請稍後再試。'}))}
}
