const assert=require('node:assert/strict')
const fs=require('node:fs')
const vm=require('node:vm')
const source=fs.readFileSync('api/handwriting.js','utf8').replace(/^import .*\n/,'').replace('export const config=','const config=').replace('export default async function handler','async function handler')
const frontend=fs.readFileSync('src/handwriting-studio.js','utf8').replace(/^import .*\n/gm,'').replace('export function setupHandwriting','function setupHandwriting')
new vm.Script(frontend)
function setup({authorized=true,configured=true,status=200,image='/9j/AA=='}={}){
 const calls=[],context={session:()=>authorized?{email:'owner'}:null,headers:()=>{},process:{env:configured?{XAI_API_KEY:'test-only'}:{}},Buffer,URL,AbortSignal,Date,fetch:async(url,options)=>{calls.push({url,options});return {ok:status===200,status,json:async()=>({data:[{b64_json:image}]})}}}
 vm.createContext(context);vm.runInContext(source,context)
 return {calls,run:async(overrides={})=>{let result;const res={setHeader(){},status(code){this.code=code;return this},json(body){result={status:this.code,body};return result}};await context.handler({method:'POST',headers:{origin:'https://usepixora.vercel.app',host:'usepixora.vercel.app'},body:{text:'繁體中文',image:'data:image/jpeg;base64,/9j/AA==',consent:true},...overrides},res);return result}}
}
;(async()=>{
 let s=setup({configured:false});let r=await s.run({method:'GET'});assert.equal(r.body.configured,false);assert.equal(r.body.provider,'grok');assert.equal(s.calls.length,0)
 s=setup({authorized:false});assert.equal((await s.run()).status,401);assert.equal(s.calls.length,0)
 s=setup({configured:false});assert.equal((await s.run()).status,503);assert.equal(s.calls.length,0)
 s=setup();assert.equal((await s.run({headers:{origin:'https://other.example',host:'usepixora.vercel.app'}})).status,403);assert.equal(s.calls.length,0)
 s=setup();assert.equal((await s.run({body:{text:'繁體',image:'data:image/jpeg;base64,/9j/AA==',consent:false}})).status,400);assert.equal(s.calls.length,0)
 s=setup();assert.equal((await s.run({body:{text:'字'.repeat(49),image:'data:image/jpeg;base64,/9j/AA==',consent:true}})).status,400)
 s=setup();r=await s.run();assert.equal(r.status,200);assert.match(r.body.image,/^data:image\/jpeg;base64,/);assert.equal(r.body.transparent,true)
 const payload=JSON.parse(s.calls[0].options.body);assert.equal(s.calls[0].url,'https://api.x.ai/v1/images/edits');assert.equal(payload.n,1);assert.equal(payload.resolution,'2k');assert.equal(payload.aspect_ratio,'1:1');assert.equal(payload.response_format,'b64_json');assert.equal(payload.image.type,'image_url');assert.match(payload.prompt,/繁體中文/)
 assert.equal((await s.run()).status,429);assert.equal(s.calls.length,1)
 s=setup({status:401});r=await s.run();assert.equal(r.status,502);assert.match(r.body.error,/Grok 金鑰無效/);assert.ok(!JSON.stringify(r).includes('test-only'))
 s=setup({image:'not valid!'});assert.equal((await s.run()).status,502)
 assert.ok(frontend.includes('XAI_API_KEY'));assert.ok(!frontend.includes('OPENAI_API_KEY'));assert.ok(frontend.includes('recordGeneration(png'))
 const matteSource=fs.readFileSync('src/handwriting-matte.js','utf8').replace('export function','function');const matteContext={};vm.createContext(matteContext);vm.runInContext(matteSource,matteContext);const pixels=new Uint8ClampedArray([255,255,255,255,245,245,245,255,20,65,135,255,225,225,235,255]);matteContext.removeWhiteMatte(pixels);assert.equal(pixels[3],0);assert.equal(pixels[7],0);assert.deepEqual(Array.from(pixels.slice(8,12)),[20,65,135,255]);assert.ok(pixels[15]>0&&pixels[15]<255);
 console.log('Grok handwriting: auth, origin, consent, payload, cooldown, format and error checks passed')
})().catch(error=>{console.error(error);process.exit(1)})
