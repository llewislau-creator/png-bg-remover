import {createHmac,timingSafeEqual} from 'node:crypto'
export const origin='https://usepixora.vercel.app'
export const callback=origin+'/api/private-auth?action=callback'
export const owner=()=>process.env.PRIVATE_OWNER_EMAIL?.trim().toLowerCase()
export const configured=()=>Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.PRIVATE_SESSION_SECRET?.length>=32&&owner())
export function sign(data){const value=Buffer.from(JSON.stringify(data)).toString('base64url');return value+'.'+createHmac('sha256',process.env.PRIVATE_SESSION_SECRET).update(value).digest('base64url')}
export function verify(token,type){try{if(!configured()||typeof token!=='string'||token.length>2048)return null;const [value,signature,...rest]=token.split('.');if(rest.length||!signature)return null;const expected=createHmac('sha256',process.env.PRIVATE_SESSION_SECRET).update(value).digest();const actual=Buffer.from(signature,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;const data=JSON.parse(Buffer.from(value,'base64url').toString());return data.type===type&&Number.isFinite(data.exp)&&data.exp>Date.now()?data:null}catch{return null}}
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=' )).filter(([key,value])=>key&&value))}
export const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`
export function session(req){const data=verify(cookies(req)['__Host-pixora-session'],'session');return data?.email===owner()?data:null}
export function headers(res){res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff')}
