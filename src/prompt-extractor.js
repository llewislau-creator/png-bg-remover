import './prompt-extractor.css'

let studio=null
let toastTimer=0
const state={asset:null,analysis:null,subject:'',style:'auto',model:'universal',detail:'detailed',prompt:'',negative:'',fileName:'prompt-extractor'}

const mars=[...document.querySelectorAll('#png-cutout-entry .function-planet')].find(p=>(p.getAttribute('aria-label')||'').toUpperCase().startsWith('MARS:'))
if(mars){
  mars.dataset.status='active'
  mars.setAttribute('aria-label','MARS: PROMPT EXTRACTOR')
  const b=mars.querySelector('.planet-label b'),s=mars.querySelector('.planet-label span')
  if(b)b.textContent='04 / PROMPT EXTRACTOR'
  if(s)s.textContent='MARS · OPEN TOOL'
  mars.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openStudio()},true)
}

function safeName(v='prompt-extractor'){return (v||'prompt-extractor').replace(/[\\/:*?"<>|]+/g,'-').trim()||'prompt-extractor'}
function showToast(msg){const el=studio?.querySelector('.pe-toast');if(!el)return;el.textContent=msg;el.classList.add('is-on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-on'),1700)}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2;const d=max-min;if(d){s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h*=60}return {h,s,l}}
function colorName({r,g,b}){const {h,s,l}=rgbToHsl(r,g,b);if(l<.12)return'near-black';if(l>.9&&s<.12)return'white';if(s<.11)return l>.68?'light neutral':l>.36?'mid gray':'charcoal';let name=h<15||h>=345?'red':h<45?'orange':h<70?'yellow':h<155?'green':h<195?'cyan':h<255?'blue':h<285?'violet':h<330?'magenta':'rose';if(l<.3)name='deep '+name;else if(l>.72)name='pale '+name;else if(s<.35)name='muted '+name;return name}
function gcd(a,b){while(b){const t=b;b=a%b;a=t}return a||1}
function aspectLabel(w,h){const g=gcd(w,h),rw=Math.round(w/g),rh=Math.round(h/g);if(rw>24||rh>24){const common=[[1,1],[4,3],[3,2],[16,9],[9,16],[2,3],[3,4],[21,9]];let best=common[0],err=Infinity;for(const p of common){const e=Math.abs(w/h-p[0]/p[1]);if(e<err){err=e;best=p}}return `${best[0]}:${best[1]}`}return `${rw}:${rh}`}
function fileToAsset(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>resolve({file,name:file.name,url:r.result,width:img.naturalWidth,height:img.naturalHeight,type:file.type,img});img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
function paletteFrom(data){const bins=new Map();for(let i=0;i<data.length;i+=16){const a=data[i+3];if(a<160)continue;const r=Math.round(data[i]/32)*32,g=Math.round(data[i+1]/32)*32,b=Math.round(data[i+2]/32)*32;const key=`${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)}`;bins.set(key,(bins.get(key)||0)+1)}const sorted=[...bins.entries()].sort((a,b)=>b[1]-a[1]);const out=[];for(const [key,count] of sorted){const [r,g,b]=key.split(',').map(Number);if(out.every(c=>Math.hypot(c.r-r,c.g-g,c.b-b)>58)){out.push({r,g,b,count,hex:rgbToHex(r,g,b),name:colorName({r,g,b})})}if(out.length===5)break}return out}

async function analyzeAsset(asset){
  const max=180,scale=Math.min(1,max/Math.max(asset.width,asset.height)),w=Math.max(24,Math.round(asset.width*scale)),h=Math.max(24,Math.round(asset.height*scale))
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(asset.img,0,0,w,h)
  const id=ctx.getImageData(0,0,w,h),d=id.data,lum=new Float32Array(w*h)
  let sum=0,sum2=0,satSum=0,tempSum=0,valid=0,high=0,low=0
  let left=0,right=0,top=0,bottom=0,lc=0,rc=0,tc=0,bc=0
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;if(d[i+3]<80)continue;const r=d[i],g=d[i+1],b=d[i+2],l=.2126*r+.7152*g+.0722*b;lum[y*w+x]=l;sum+=l;sum2+=l*l;valid++;if(l>220)high++;if(l<45)low++;satSum+=rgbToHsl(r,g,b).s;tempSum+=(r-b)
    if(x<w/2){left+=l;lc++}else{right+=l;rc++}if(y<h/2){top+=l;tc++}else{bottom+=l;bc++}
  }
  const mean=sum/Math.max(1,valid),std=Math.sqrt(Math.max(0,sum2/Math.max(1,valid)-mean*mean)),sat=satSum/Math.max(1,valid),temp=tempSum/Math.max(1,valid)
  let edgeCount=0,edgeSum=0,centerEdge=0,centerCount=0,outerEdge=0,outerCount=0,leftEdge=0,rightEdge=0,topEdge=0,bottomEdge=0
  const threshold=52
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const gx=lum[y*w+x+1]-lum[y*w+x-1],gy=lum[(y+1)*w+x]-lum[(y-1)*w+x],e=Math.abs(gx)+Math.abs(gy);edgeSum+=e;if(e>threshold)edgeCount++
    const center=x>w*.28&&x<w*.72&&y>h*.25&&y<h*.75;if(center){centerEdge+=e;centerCount++}else{outerEdge+=e;outerCount++}
    if(x<w/2)leftEdge+=e;else rightEdge+=e;if(y<h/2)topEdge+=e;else bottomEdge+=e
  }
  const px=Math.max(1,(w-2)*(h-2)),edgeDensity=edgeCount/px,edgeAvg=edgeSum/px,ce=centerEdge/Math.max(1,centerCount),oe=outerEdge/Math.max(1,outerCount)
  const lAvg=left/Math.max(1,lc),rAvg=right/Math.max(1,rc),tAvg=top/Math.max(1,tc),bAvg=bottom/Math.max(1,bc)
  let light='soft, even illumination';const horiz=Math.abs(lAvg-rAvg),vert=Math.abs(tAvg-bAvg)
  if(Math.max(horiz,vert)>13){if(horiz>vert)light=lAvg>rAvg?'directional light from camera-left':'directional light from camera-right';else light=tAvg>bAvg?'top-lit illumination':'uplight / brighter lower field'}
  if(std>72)light+=' with strong contrast';else if(std<35)light+=' with gentle tonal transitions'
  const brightness=mean>180?'high-key':mean<82?'low-key':'balanced exposure'
  const contrast=std>70?'high contrast':std<36?'soft contrast':'moderate contrast'
  const saturation=sat>.55?'vivid saturation':sat<.24?'muted saturation':'controlled saturation'
  const temperature=temp>13?'warm color temperature':temp<-13?'cool color temperature':'neutral color temperature'
  const texture=edgeDensity>.23?'highly detailed / tactile texture':edgeDensity<.09?'clean, smooth visual texture':'moderate surface detail'
  let composition='balanced composition';if(ce>oe*1.22)composition='center-weighted focal composition';else if(leftEdge>rightEdge*1.18)composition='visual weight concentrated on the left';else if(rightEdge>leftEdge*1.18)composition='visual weight concentrated on the right';else if(topEdge>bottomEdge*1.18)composition='top-weighted composition';else if(bottomEdge>topEdge*1.18)composition='lower-frame visual emphasis'
  const orientation=asset.width/asset.height>1.12?'landscape':asset.height/asset.width>1.12?'portrait':'square'
  const palette=paletteFrom(d)
  let faces=0
  try{if('FaceDetector'in window){const detector=new window.FaceDetector({fastMode:true,maxDetectedFaces:6});const result=await detector.detect(asset.img);faces=result.length}}catch{}
  const subjectSuggestion=faces?`${faces>1?'group portrait':'portrait subject'}`:'primary visual subject'
  return {width:asset.width,height:asset.height,orientation,aspect:aspectLabel(asset.width,asset.height),brightness,brightnessValue:Math.round(mean),contrast,contrastValue:Math.round(std),saturation,saturationValue:Math.round(sat*100),temperature,temperatureValue:Math.round(temp),light,texture,composition,edgeDensity,edgeAvg,highlightPct:Math.round(high/Math.max(1,valid)*100),shadowPct:Math.round(low/Math.max(1,valid)*100),palette,faces,subjectSuggestion}
}

function stylePhrase(){const m={auto:'natural visual treatment faithful to the reference',photo:'professional photography, realistic materials, physically plausible light',cinematic:'cinematic visual language, atmospheric depth, controlled dramatic lighting',product:'premium commercial product photography, clean art direction, precise material rendering',editorial:'editorial art direction, sophisticated layout sensibility, contemporary visual culture',illustration:'refined illustration, intentional shapes, crafted texture, cohesive graphic language',render:'high-end 3D render, physically based materials, global illumination, precise surfaces'};return m[state.style]||m.auto}
function detailPhrase(a){if(state.detail==='concise')return `${a.composition}, ${a.light}`;if(state.detail==='production')return `${a.composition}, ${a.light}, ${a.texture}, ${a.contrast}, ${a.saturation}, realistic depth separation, controlled highlights and shadows, production-ready detail`;return `${a.composition}, ${a.light}, ${a.texture}, ${a.contrast}, ${a.saturation}`}
function buildPrompts(){
  const a=state.analysis;if(!a){state.prompt='';state.negative='';return}
  const subject=(state.subject||a.subjectSuggestion).trim()
  const colors=a.palette.map(c=>`${c.name} ${c.hex}`).join(', ')
  const base=`${subject}, ${stylePhrase()}, ${detailPhrase(a)}, ${a.temperature}, palette of ${colors||'balanced neutral colors'}, ${a.orientation} ${a.aspect} framing`
  if(state.model==='midjourney')state.prompt=`${base} --ar ${a.aspect.replace(':',':')} --stylize 175`
  else if(state.model==='flux')state.prompt=`Create ${base}. Preserve a clear primary focal point, coherent spatial relationships, believable lighting behavior, and nuanced surface detail.`
  else if(state.model==='sdxl')state.prompt=`${base}, sharp intentional focus, coherent anatomy and geometry, professional finish`
  else state.prompt=base
  const negatives=['blurry','low resolution','unintentional noise','compression artifacts','muddy colors','clipped highlights','crushed shadows','warped geometry','duplicate elements','unreadable text','watermark']
  if(a.edgeDensity<.1)negatives.push('oversharpening','excessive micro-detail')
  if(a.saturationValue<28)negatives.push('oversaturated colors')
  state.negative=negatives.join(', ')
}

function openStudio(){
  if(studio){studio.style.display='grid';document.body.style.overflow='hidden';renderAll();return}
  studio=document.createElement('div');studio.id='prompt-extractor';studio.innerHTML=`
  <header class="pe-topbar"><button class="pe-back" type="button">← 回到行星選單</button><div class="pe-brand"><b>MARS / PROMPT EXTRACTOR</b><span>Image analysis · Prompt composer · Local processing</span></div><button class="pe-action" type="button">COPY PROMPT</button></header>
  <div class="pe-shell">
    <aside class="pe-sidebar">
      <section class="pe-section"><h3>01 / Reference image</h3><button class="pe-drop" type="button"><div><b>SELECT / DROP IMAGE</b><span>JPG · PNG · WEBP · AVIF · paste supported</span></div></button><input class="pe-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden><p class="pe-help">圖片只在瀏覽器本地分析，不會上傳到第三方。</p></section>
      <section class="pe-section"><h3>02 / Subject hint</h3><div class="pe-field"><label>What is the main subject? · optional</label><textarea class="pe-subject" placeholder="例如：a chrome espresso machine on a stone counter"></textarea></div><p class="pe-help">本地 Canvas 可精準分析色彩、亮度、構圖與細節密度，但不能可靠辨認所有物件。補一句主體描述可令 Prompt 更準確。</p></section>
      <section class="pe-section"><h3>03 / Visual treatment</h3><div class="pe-field"><label>Style</label><select class="pe-style"><option value="auto">Auto / faithful</option><option value="photo">Photography</option><option value="cinematic">Cinematic</option><option value="product">Product / commercial</option><option value="editorial">Editorial</option><option value="illustration">Illustration</option><option value="render">3D render</option></select></div><div class="pe-field"><label>Prompt detail</label><select class="pe-detail"><option value="concise">Concise</option><option value="detailed" selected>Detailed</option><option value="production">Production</option></select></div></section>
      <section class="pe-section"><h3>04 / Target model</h3><div class="pe-models"><button class="pe-model is-active" data-model="universal">UNIVERSAL<small>portable prompt</small></button><button class="pe-model" data-model="midjourney">MIDJOURNEY<small>adds aspect ratio</small></button><button class="pe-model" data-model="sdxl">SDXL<small>positive + negative</small></button><button class="pe-model" data-model="flux">FLUX<small>natural-language prompt</small></button></div></section>
      <section class="pe-section"><h3>05 / Export</h3><div class="pe-field"><label>Filename</label><input class="pe-filename" value="prompt-extractor" maxlength="80"></div><div class="pe-actions"><button class="pe-btn pe-json" type="button">DOWNLOAD JSON</button><button class="pe-btn pe-txt" type="button">DOWNLOAD TXT</button></div></section>
    </aside>
    <main class="pe-main"><div class="pe-toolbar"><button class="pe-btn pe-reanalyse" type="button">RE-ANALYZE</button><button class="pe-btn danger pe-clear" type="button">CLEAR</button><span class="pe-spacer"></span><span class="pe-status"><strong>LOCAL</strong> · pixel-level visual analysis</span></div><div class="pe-canvas-wrap"><div class="pe-stage"><div class="pe-empty"><b>Drop a reference image</b><span>Extract palette, composition, lighting, contrast, texture density and reusable generation language.</span></div><img class="pe-preview" hidden alt="Reference preview"><div class="pe-image-meta"></div></div></div></main>
    <aside class="pe-inspector">
      <section class="pe-section"><h3>Visual analysis</h3><div class="pe-metrics"></div><div class="pe-tags" style="margin-top:10px"></div></section>
      <section class="pe-section"><h3>Palette</h3><div class="pe-palette"></div></section>
      <section class="pe-section"><h3>Generated prompt</h3><textarea class="pe-prompt" spellcheck="false" placeholder="Upload an image to generate a prompt."></textarea><div class="pe-actions"><button class="pe-btn acid pe-copy" type="button">COPY PROMPT</button><button class="pe-btn pe-regenerate" type="button">REBUILD</button></div></section>
      <section class="pe-section"><h3>Negative prompt</h3><textarea class="pe-prompt pe-negative" spellcheck="false"></textarea><button class="pe-btn pe-copy-negative" style="width:100%;margin-top:8px" type="button">COPY NEGATIVE</button></section>
      <section class="pe-section"><div class="pe-note"><b>Analysis boundary</b><br>色彩、曝光、對比、畫幅及邊緣密度由圖片像素實際量測。主體／材質語意若沒有 vision model 不能可靠自動識別，因此提供 Subject Hint，而不是虛構 AI 結果。</div></section>
    </aside>
  </div><div class="pe-toast" role="status"></div>`
  document.body.appendChild(studio);document.body.style.overflow='hidden';bind();renderAll()
}
function closeStudio(){if(!studio)return;studio.style.display='none';document.body.style.overflow=''}
function bind(){
  const q=s=>studio.querySelector(s)
  q('.pe-back').addEventListener('click',closeStudio);q('.pe-drop').addEventListener('click',()=>q('.pe-file').click());q('.pe-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)await acceptFile(f);e.target.value=''})
  q('.pe-subject').addEventListener('input',e=>{state.subject=e.target.value;buildPrompts();renderPromptOnly()});q('.pe-style').addEventListener('change',e=>{state.style=e.target.value;buildPrompts();renderPromptOnly()});q('.pe-detail').addEventListener('change',e=>{state.detail=e.target.value;buildPrompts();renderPromptOnly()});q('.pe-filename').addEventListener('input',e=>state.fileName=e.target.value)
  studio.querySelectorAll('.pe-model').forEach(btn=>btn.addEventListener('click',()=>{state.model=btn.dataset.model;studio.querySelectorAll('.pe-model').forEach(x=>x.classList.toggle('is-active',x===btn));buildPrompts();renderPromptOnly()}))
  q('.pe-copy').addEventListener('click',copyPrompt);q('.pe-action').addEventListener('click',copyPrompt);q('.pe-copy-negative').addEventListener('click',()=>copyText(state.negative,'Negative prompt copied'));q('.pe-regenerate').addEventListener('click',()=>{buildPrompts();renderPromptOnly();showToast('Prompt rebuilt')});q('.pe-reanalyse').addEventListener('click',reanalyse);q('.pe-clear').addEventListener('click',clearAll);q('.pe-json').addEventListener('click',downloadJson);q('.pe-txt').addEventListener('click',downloadTxt)
  q('.pe-prompt').addEventListener('input',e=>state.prompt=e.target.value);q('.pe-negative').addEventListener('input',e=>state.negative=e.target.value)
  const drop=q('.pe-stage');['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.style.outline='1px solid #b7ff2a'}));['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.style.outline=''}));drop.addEventListener('drop',async e=>{const f=[...(e.dataTransfer?.files||[])].find(x=>x.type.startsWith('image/'));if(f)await acceptFile(f)})
  studio.addEventListener('paste',async e=>{const f=[...(e.clipboardData?.files||[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();await acceptFile(f)}})
}
async function acceptFile(file){if(!file.type.startsWith('image/'))return showToast('Please select an image');try{showToast('Analyzing image…');state.asset=await fileToAsset(file);state.analysis=await analyzeAsset(state.asset);buildPrompts();renderAll();showToast('Visual analysis complete')}catch(err){console.error(err);showToast('Unable to analyze image')}}
async function reanalyse(){if(!state.asset)return showToast('Upload an image first');state.analysis=await analyzeAsset(state.asset);buildPrompts();renderAll();showToast('Analysis refreshed')}
function clearAll(){state.asset=null;state.analysis=null;state.prompt='';state.negative='';state.subject='';if(studio){studio.querySelector('.pe-subject').value=''}renderAll()}
function renderAll(){renderPreview();renderAnalysis();renderPromptOnly()}
function renderPreview(){if(!studio)return;const img=studio.querySelector('.pe-preview'),empty=studio.querySelector('.pe-empty'),meta=studio.querySelector('.pe-image-meta'),drop=studio.querySelector('.pe-drop');if(!state.asset){img.hidden=true;empty.hidden=false;meta.innerHTML='';drop.classList.remove('has-file');drop.querySelector('b').textContent='SELECT / DROP IMAGE';drop.querySelector('span').textContent='JPG · PNG · WEBP · AVIF · paste supported';return}img.src=state.asset.url;img.hidden=false;empty.hidden=true;drop.classList.add('has-file');drop.querySelector('b').textContent=state.asset.name;drop.querySelector('span').textContent=`${state.asset.width} × ${state.asset.height}px`;const a=state.analysis;meta.innerHTML=a?`<span class="pe-chip">${a.orientation.toUpperCase()}</span><span class="pe-chip">${a.aspect}</span><span class="pe-chip">${state.asset.width} × ${state.asset.height}px</span>`:''}
function renderAnalysis(){if(!studio)return;const a=state.analysis,m=studio.querySelector('.pe-metrics'),tags=studio.querySelector('.pe-tags'),pal=studio.querySelector('.pe-palette');if(!a){m.innerHTML='<div class="pe-metric"><small>Status</small><b>Waiting for image</b></div>';tags.innerHTML='';pal.innerHTML='';return}const items=[['Exposure',a.brightness,`${a.brightnessValue}/255`],['Contrast',a.contrast,`σ ${a.contrastValue}`],['Color',a.saturation,`${a.saturationValue}% saturation`],['Temperature',a.temperature,`${a.temperatureValue>0?'+':''}${a.temperatureValue} R−B`],['Composition',a.composition,a.aspect],['Texture',a.texture,`${Math.round(a.edgeDensity*100)}% edge density`]];m.innerHTML=items.map(x=>`<div class="pe-metric"><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('');tags.innerHTML=[a.light,`${a.highlightPct}% highlights`,`${a.shadowPct}% shadows`,a.faces?`${a.faces} face${a.faces>1?'s':''} detected`:'no semantic object model'].map(x=>`<span class="pe-tag">${x}</span>`).join('');pal.innerHTML=a.palette.map(c=>`<div class="pe-swatch" style="background:${c.hex}" title="${c.name}"><span>${c.hex}</span></div>`).join('')}
function renderPromptOnly(){if(!studio)return;studio.querySelector('.pe-prompt').value=state.prompt||'';studio.querySelector('.pe-negative').value=state.negative||''}
async function copyText(text,msg){if(!text)return showToast('Nothing to copy');try{await navigator.clipboard.writeText(text);showToast(msg)}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();showToast(msg)}}
function copyPrompt(){copyText(state.prompt,'Prompt copied')}
function downloadBlob(content,type,name){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadJson(){if(!state.analysis)return showToast('Analyze an image first');downloadBlob(JSON.stringify({source:{name:state.asset?.name,width:state.asset?.width,height:state.asset?.height},subject:state.subject,model:state.model,style:state.style,analysis:state.analysis,prompt:state.prompt,negativePrompt:state.negative},null,2),'application/json',safeName(state.fileName)+'.json')}
function downloadTxt(){if(!state.analysis)return showToast('Analyze an image first');const txt=`PROMPT\n${state.prompt}\n\nNEGATIVE PROMPT\n${state.negative}\n\nSOURCE\n${state.asset?.name||''}\n${state.asset?.width||0} × ${state.asset?.height||0}px\n`;downloadBlob(txt,'text/plain;charset=utf-8',safeName(state.fileName)+'.txt')}
