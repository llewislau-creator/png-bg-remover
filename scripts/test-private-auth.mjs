import assert from 'node:assert/strict'
import auth from '../api/private-auth.js'
import media from '../api/private-media.js'
import {sign,verify,session} from '../lib/private-auth.js'
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},end(body){this.body=body}})
let res=response();media({method:'GET',url:'/private',headers:{}},res);assert(!res.body.includes('id="preview"'));assert(res.body.includes('登入服務尚未設定'))
Object.assign(process.env,{GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test',PRIVATE_SESSION_SECRET:'x'.repeat(48),PRIVATE_OWNER_EMAIL:'owner@example.com'})
const token=sign({type:'session',email:'owner@example.com',exp:Date.now()+60000})
assert(verify(token,'session'));assert.equal(verify(token+'x','session'),null);assert.equal(verify(sign({type:'session',email:'owner@example.com',exp:0}),'session'),null)
assert.equal(session({headers:{cookie:'__Host-pixora-session='+sign({type:'session',email:'other@example.com',exp:Date.now()+60000})}}),null)
res=response();media({method:'GET',url:'/private',headers:{cookie:'__Host-pixora-session='+token}},res);assert(res.body.includes('id="preview"'));assert.equal(res.headers['Cache-Control'],'private, no-store')
res=response();await auth({method:'GET',url:'/api/private-auth?action=callback&state=wrong&code=test',headers:{}},res);assert.equal(res.headers.Location,'/private?error=signin')
res=response();await auth({method:'GET',url:'/api/private-auth?action=start',headers:{}},res);assert(res.headers.Location.includes('code_challenge='));assert(res.headers['Set-Cookie'].includes('HttpOnly; Secure; SameSite=Lax'))
const startCookie=res.headers['Set-Cookie'].split(';')[0],state=new URL(res.headers.Location).searchParams.get('state'),flow={method:'GET',url:'/api/private-auth?action=callback&state='+state+'&code=test',headers:{cookie:startCookie}}
let verified=true,email='other@example.com';globalThis.fetch=async(url)=>({ok:true,json:async()=>url.includes('/token')?{access_token:'test'}:{email,email_verified:verified}})
res=response();await auth(flow,res);assert.equal(res.headers.Location,'/private?error=denied')
email='owner@example.com';verified=false;res=response();await auth(flow,res);assert.equal(res.headers.Location,'/private?error=denied')
verified=true;res=response();await auth(flow,res);assert.equal(res.headers.Location,'/private');assert(res.headers['Set-Cookie'][1].includes('__Host-pixora-session='))
res=response();await auth({method:'POST',url:'/api/private-auth?action=logout',headers:{origin:'https://evil.example'}},res);assert.equal(res.statusCode,403)
console.log('Private authentication tests passed: locked page, signatures, expiry, whitelist, OAuth state/PKCE, verified email, logout origin.')
