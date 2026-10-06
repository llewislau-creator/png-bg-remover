import {randomBytes,createHash} from 'node:crypto'
import {origin,callback,owner,configured,sign,verify,cookies,cookie,headers} from '../lib/private-auth.js'
export default async function handler(req,res){
  headers(res);const url=new URL(req.url,origin),action=url.searchParams.get('action')
  const redirect=(path)=>{res.statusCode=303;res.setHeader('Location',path);res.end()}
  if(action==='logout'){if(req.method!=='POST'||req.headers.origin!==origin){res.statusCode=403;res.end('Forbidden');return}res.setHeader('Set-Cookie',cookie('__Host-pixora-session','',0));redirect('/private');return}
  if(req.method!=='GET'){res.statusCode=405;res.end('Method not allowed');return}
  if(!configured()){res.statusCode=503;res.end('Private sign-in is not configured.');return}
  if(action==='start'){
    const state=randomBytes(32).toString('base64url'),verifier=randomBytes(32).toString('base64url')
    res.setHeader('Set-Cookie',cookie('__Host-pixora-oauth',sign({type:'oauth',state,verifier,exp:Date.now()+600000}),600))
    const target=new URL('https://accounts.google.com/o/oauth2/v2/auth');target.search=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',prompt:'select_account'}).toString();redirect(target.href);return
  }
  if(action!=='callback'){res.statusCode=404;res.end('Not found');return}
  const flow=verify(cookies(req)['__Host-pixora-oauth'],'oauth');res.setHeader('Set-Cookie',cookie('__Host-pixora-oauth','',0))
  const code=url.searchParams.get('code');if(!flow||flow.state!==url.searchParams.get('state')||!code||code.length>4096){redirect('/private?error=signin');return}
  try{
    const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:callback,grant_type:'authorization_code',code_verifier:flow.verifier}),signal:AbortSignal.timeout(10000)})
    const token=await response.json();if(!response.ok||typeof token.access_token!=='string')throw Error('Token rejected')
    const userResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(10000)});const user=await userResponse.json()
    if(!userResponse.ok||user.email_verified!==true||user.email?.toLowerCase()!==owner()){redirect('/private?error=denied');return}
    res.setHeader('Set-Cookie',[cookie('__Host-pixora-oauth','',0),cookie('__Host-pixora-session',sign({type:'session',email:owner(),exp:Date.now()+3600000}),3600)]);redirect('/private')
  }catch{redirect('/private?error=signin')}
}
