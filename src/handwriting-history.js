import {inkBounds,tintInk} from './handwriting-pixels.js'
export function setupHandwritingHistory(section){
 const root=document.createElement('section');root.className='hw-history';root.innerHTML='<section class="hw-generated-preview" hidden><h3>生成圖片預覽</h3><img class="hw-generated-image" alt="生成的手寫中文圖片"><p class="hw-generated-caption"></p><div class="hw-result-tools"><label>字的顏色 <select class="hw-color-mode"><option value="original">保留原色</option><option value="custom">自選單色</option></select></label><label>選擇字色 <input class="hw-ink-color" type="color" value="#d6a32e" aria-label="生成文字顏色"></label><label><input class="hw-trim" type="checkbox" checked>裁切四邊透明空間，只保留文字</label><p>改色在本機處理，不需再次生成。裁切後依比例輸出，長邊 2048 px；修改後請儲存至紀錄。</p></div><a class="hw-generated-download">下載 PNG</a><button class="hw-save-generated" type="button">儲存生成圖片</button></section><h3>生成紀錄</h3><p>成功生成後自動儲存，最多 20 張。紀錄保存在此瀏覽器，清除網站資料或換裝置後不會保留。</p><p class="hw-history-status" role="status" aria-live="polite"></p><div class="hw-history-list"></div>';section.append(root)
 let latest=null,saving=false,renderVersion=0;const status=root.querySelector('.hw-history-status'),save=root.querySelector('.hw-save-generated')
 const database=new Promise((resolve,reject)=>{const request=indexedDB.open('pixora-handwriting-generations',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Storage blocked'))})
 async function storage(mode,action){const db=await database;return new Promise((resolve,reject)=>{const transaction=db.transaction('images',mode),request=action(transaction.objectStore('images'));transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error)})}
 async function applyEdits(){
  if(!latest)return
  const version=++renderVersion,record=latest,original=record.originalImage||record.image
  const bitmap=await createImageBitmap(await (await fetch(original)).blob())
  try{
   if(bitmap.width*bitmap.height>16000000)throw new Error('圖片尺寸過大')
   const source=document.createElement('canvas');source.width=bitmap.width;source.height=bitmap.height
   const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0)
   const pixels=ctx.getImageData(0,0,source.width,source.height)
   const custom=root.querySelector('.hw-color-mode').value==='custom',color=root.querySelector('.hw-ink-color').value,trim=root.querySelector('.hw-trim').checked
   if(custom)tintInk(pixels.data,color)
   ctx.putImageData(pixels,0,0)
   const bounds=trim?inkBounds(pixels.data,source.width,source.height):{x:0,y:0,width:source.width,height:source.height}
   if(!bounds)throw new Error('圖片沒有可見文字，請選擇另一張生成結果。')
   const scale=2048/Math.max(bounds.width,bounds.height),output=document.createElement('canvas')
   output.width=Math.max(1,Math.round(bounds.width*scale));output.height=Math.max(1,Math.round(bounds.height*scale))
   const draw=output.getContext('2d');draw.imageSmoothingQuality='high';draw.drawImage(source,bounds.x,bounds.y,bounds.width,bounds.height,0,0,output.width,output.height)
   const image=output.toDataURL('image/png')
   if(version!==renderVersion||latest?.id!==record.id)return
   latest={...record,originalImage:original,image,width:output.width,height:output.height,color:custom?color:null,trim,saved:false}
   root.querySelector('.hw-generated-image').src=image
   root.querySelector('.hw-generated-caption').textContent=record.text+(record.referenceName?' · 參考：'+record.referenceName:'')+' · '+output.width+' × '+output.height+' px · 透明 PNG'
   const download=root.querySelector('.hw-generated-download');download.href=image;download.download='pixora-handwriting-'+record.id+'.png'
   save.disabled=false;save.textContent='儲存生成圖片／修改'
  }finally{bitmap.close()}
 }
 async function show(record,scroll=false){
  latest=record;renderVersion++
  const box=root.querySelector('.hw-generated-preview');box.hidden=false
  root.querySelector('.hw-color-mode').value=record.color?'custom':'original'
  root.querySelector('.hw-ink-color').value=record.color||'#d6a32e'
  root.querySelector('.hw-trim').checked=record.trim!==false
  root.querySelector('.hw-generated-image').alt='AI 手寫文字：'+record.text
  await applyEdits()
  if(record.saved&&latest?.id===record.id){latest.saved=true;save.disabled=true;save.textContent='已儲存至生成紀錄'}
  if(scroll)box.scrollIntoView({block:'center',behavior:'smooth'})
 }
 const edit=()=>{save.disabled=true;applyEdits().catch(error=>{status.textContent=error.message;save.disabled=Boolean(latest?.saved)})}
 root.querySelector('.hw-color-mode').onchange=edit
 root.querySelector('.hw-ink-color').oninput=()=>{root.querySelector('.hw-color-mode').value='custom';edit()}
 root.querySelector('.hw-trim').onchange=edit
 async function render(){const records=await storage('readonly',store=>store.getAll()),box=root.querySelector('.hw-history-list');box.replaceChildren();if(!records.length){const p=document.createElement('p');p.textContent='尚未有生成紀錄。';box.append(p)}for(const record of records.sort((a,b)=>b.created-a.created)){const card=document.createElement('article'),view=document.createElement('button'),image=document.createElement('img'),label=document.createElement('span'),date=document.createElement('small'),download=document.createElement('a'),remove=document.createElement('button');view.type='button';view.className='hw-history-view';view.setAttribute('aria-label','預覽生成圖片 '+record.text);image.src=record.image;image.alt='';label.textContent=record.text+(record.referenceName?' · '+record.referenceName:'');view.append(image,label);view.onclick=()=>show({...record,saved:true},true).catch(error=>status.textContent=error.message);date.textContent=new Date(record.created).toLocaleString('zh-HK');download.href=record.image;download.download='pixora-handwriting-'+record.id+'.png';download.textContent='下載 PNG';remove.type='button';remove.textContent='移除紀錄';remove.onclick=async()=>{try{await storage('readwrite',store=>store.delete(record.id));if(latest?.id===record.id)show({...latest,saved:false});await render();status.textContent='紀錄已移除。'}catch{status.textContent='無法移除紀錄，請重試。'}};card.append(view,date,download,remove);box.append(card)}}
 async function persist(){if(!latest||latest.saved||saving)return;saving=true;save.disabled=true;const record={...latest};delete record.saved;try{const records=await storage('readonly',store=>store.getAll());if(records.length>=20&&!records.some(r=>r.id===record.id))throw new Error('紀錄已達 20 張，請下載並移除不需要的紀錄後再儲存。');await storage('readwrite',store=>store.put(record));if(latest?.id===record.id){latest.saved=true;save.disabled=true;save.textContent='已儲存至生成紀錄'}await render();status.textContent='圖片已儲存，下次可在生成紀錄預覽及下載。'}catch(error){status.textContent=error.message.startsWith('紀錄已達')?error.message:'圖片已生成，但儲存失敗。請立即下載 PNG，或按「儲存生成圖片」重試。'}finally{saving=false;save.disabled=Boolean(latest?.saved)}}
 save.onclick=persist;render().catch(()=>status.textContent='無法讀取生成紀錄；新圖片仍可即時預覽與下載。')
 return async(image,settings)=>{await show({id:crypto.randomUUID(),image,text:settings.text,vertical:settings.vertical,transparent:settings.transparent,referenceName:settings.referenceName||'',requestId:settings.requestId||'',created:Date.now(),saved:false,originalImage:image,trim:true},true);await persist()}
}
