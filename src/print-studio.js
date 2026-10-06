import { jsPDF } from 'jspdf'
import './print-studio.css'
import './print-reference.css'

const PRODUCTS={
  business:{name:'Business Card',label:'名片',w:90,h:54,dpi:300,sides:2,materials:['350gsm coated','300gsm matte','Textured stock'],base:.55},
  flyer:{name:'Flyer',label:'宣傳單',w:148,h:210,dpi:300,sides:2,materials:['157gsm coated','200gsm matte','250gsm coated'],base:.8},
  poster:{name:'Poster',label:'海報',w:297,h:420,dpi:300,sides:1,materials:['200gsm coated','Synthetic paper','Photo paper'],base:5.8},
  trifold:{name:'Tri-fold',label:'三折頁',w:297,h:210,dpi:300,sides:2,materials:['157gsm coated','200gsm matte','250gsm coated'],base:1.5,folds:3},
  menu:{name:'Menu / Card',label:'餐牌／卡片',w:210,h:297,dpi:300,sides:2,materials:['300gsm matte','350gsm coated','Synthetic paper'],base:3.2},
  rollup:{name:'Roll-up',label:'易拉寶',w:800,h:2000,dpi:150,sides:1,materials:['PP synthetic','PET banner','Matte banner'],base:65},
  custom:{name:'Custom Size',label:'自訂尺寸',w:210,h:297,dpi:300,sides:2,materials:['Standard stock','Premium stock','Synthetic stock'],base:2.2}
}
const MATERIAL_FACTORS={'350gsm coated':1.12,'300gsm matte':1.05,'Textured stock':1.7,'157gsm coated':1,'200gsm matte':1.18,'250gsm coated':1.35,'Synthetic paper':1.75,'Photo paper':1.65,'PP synthetic':1,'PET banner':1.3,'Matte banner':1.16,'Standard stock':1,'Premium stock':1.55,'Synthetic stock':1.75}
const FINISHES={none:{name:'No finish',factor:1},matte:{name:'Matte lamination',factor:1.32},gloss:{name:'Gloss lamination',factor:1.28},spot:{name:'Spot UV',factor:1.72},foil:{name:'Foil accent',factor:2.1}}
let studio=null,toastTimer=0,onReturn=null,previewRevision=0,exporting=false
const state={product:'business',orientation:'landscape',bleed:3,safe:5,material:'350gsm coated',finish:'none',quantity:100,sides:2,currentSide:'front',fit:'cover',customW:210,customH:297,front:null,back:null,fileName:'print-studio'}

const saturn=[...document.querySelectorAll('#png-cutout-entry .function-planet')].find(p=>(p.getAttribute('aria-label')||'').toUpperCase().startsWith('SATURN:'))
if(saturn){
  saturn.dataset.status='active';saturn.setAttribute('aria-label','SATURN: PRINT STUDIO')
  const b=saturn.querySelector('.planet-label b'),s=saturn.querySelector('.planet-label span')
  if(b)b.textContent='06 / PRINT STUDIO';if(s)s.textContent='SATURN · OPEN TOOL'
  saturn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openPrintStudio()},true)
}

function product(){return PRODUCTS[state.product]}
function dims(){
  let w=state.product==='custom'?Math.min(1000,Math.max(20,Number(state.customW)||210)):product().w
  let h=state.product==='custom'?Math.min(1000,Math.max(20,Number(state.customH)||297)):product().h
  const portrait=state.orientation==='portrait'
  if(portrait&&w>h)[w,h]=[h,w]
  if(!portrait&&w<h)[w,h]=[h,w]
  return {w,h}
}
function currentAsset(){return state.currentSide==='back'?state.back:state.front}
function safeName(v='print-studio'){return (v||'print-studio').replace(/[\\/:*?"<>|]+/g,'-').trim()||'print-studio'}
function showToast(msg){const el=studio?.querySelector('.pr-toast');if(!el)return;el.textContent=msg;el.classList.add('is-on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-on'),1700)}
function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>resolve({file,name:file.name,url:r.result,width:img.naturalWidth,height:img.naturalHeight,type:file.type});img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}

export function openPrintStudio(returnFocus=null){
  onReturn=returnFocus
  const home=document.getElementById('pixora-universe-home');if(home)home.inert=true
  if(studio){studio.style.display='grid';document.body.style.overflow='hidden';renderAll();studio.querySelector('.pr-back').focus();return}
  studio=document.createElement('div');studio.id='print-studio';studio.innerHTML=`
  <header class="pr-topbar"><button class="pr-back" type="button">← 回到行星選單</button><div class="pr-brand"><b>SATURN / PRINT STUDIO</b><span>Preflight · Bleed · Preview · Quote · PDF</span></div><button class="pr-export" type="button">EXPORT PRINT PDF</button></header>
  <div class="pr-shell">
    <aside class="pr-sidebar">
      <section class="pr-section"><h3>01 / Material type</h3><div class="pr-product-grid"></div></section>
      <section class="pr-section"><h3>02 / Size & production</h3><div class="pr-grid2"><div class="pr-field"><label>Orientation</label><select class="pr-orientation"><option value="landscape">Landscape</option><option value="portrait">Portrait</option></select></div><div class="pr-field"><label>Sides</label><select class="pr-sides"><option value="1">Single-sided</option><option value="2">Double-sided</option></select></div></div><div class="pr-custom-size pr-grid2" style="margin-top:10px;display:none"><div class="pr-field"><label>Width mm</label><input class="pr-cw" type="number" min="20" max="3000" value="210"></div><div class="pr-field"><label>Height mm</label><input class="pr-ch" type="number" min="20" max="3000" value="297"></div></div><div class="pr-grid2" style="margin-top:10px"><div class="pr-field"><label>Bleed mm</label><input class="pr-bleed" type="number" min="0" max="20" step="0.5" value="3"></div><div class="pr-field"><label>Safe margin mm</label><input class="pr-safe" type="number" min="0" max="30" step="0.5" value="5"></div></div></section>
      <section class="pr-section"><h3>03 / Stock & finish</h3><div class="pr-field"><label>Material</label><select class="pr-material"></select></div><div class="pr-field" style="margin-top:10px"><label>Finish</label><select class="pr-finish">${Object.entries(FINISHES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></div><div class="pr-field" style="margin-top:10px"><label>Quantity</label><select class="pr-qty">${[10,25,50,100,200,500,1000,2000,5000].map(n=>`<option value="${n}" ${n===100?'selected':''}>${n.toLocaleString()}</option>`).join('')}</select></div></section>
      <section class="pr-section"><h3>04 / Artwork</h3><div class="pr-side-switch"><button class="is-active" data-side="front">FRONT</button><button data-side="back">BACK</button></div><div class="pr-upload" style="margin-top:10px"><button class="pr-drop" type="button"><div><b>SELECT / DROP ARTWORK</b><span>JPG · PNG · WEBP · AVIF</span></div></button><input class="pr-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden><div class="pr-field"><label>Image placement</label><select class="pr-fit"><option value="cover">Fill + crop</option><option value="contain">Fit inside</option></select></div></div><p class="pr-help">雙面印刷可分別上傳 FRONT / BACK。拖曳圖片到預覽區亦可加入。</p></section>
      <section class="pr-section"><h3>05 / Output</h3><div class="pr-field"><label>PDF filename</label><input class="pr-filename" maxlength="80" value="print-studio"></div><p class="pr-help">輸出 PDF 會包含 bleed 與 crop marks。RGB 圖片不會被假裝轉成真正的印廠 ICC/CMYK。</p></section>
    </aside>
    <main class="pr-main"><div class="pr-toolbar"><button class="pr-btn small pr-fit-view" type="button">FIT VIEW</button><button class="pr-btn small pr-clear" type="button">CLEAR ARTWORK</button><span class="pr-spacer"></span><span class="pr-status"><strong>LOCAL</strong> · browser prepress workspace</span></div><div class="pr-canvas-wrap"><div class="pr-preview-shell"><div class="pr-empty-preview"><div><b>Upload artwork</b><span>Bleed, trim and safe-zone preview will appear here.</span></div></div><canvas class="pr-preview" hidden></canvas></div></div></main>
    <aside class="pr-inspector">
      <section class="pr-section"><h3>Preflight</h3><div class="pr-metrics"><div class="pr-metric pr-dpi"><small>Effective DPI</small><b>—</b></div><div class="pr-metric pr-size"><small>Trim Size</small><b>—</b></div></div><div class="pr-checks" style="margin-top:12px"></div></section>
      <section class="pr-section"><h3>Job specification</h3><div class="pr-spec"></div><div class="pr-note" style="margin-top:12px">Production note: 商業印刷通常要求 CMYK/ICC 工作流程。此瀏覽器工具負責幾何尺寸、出血、裁切線與解析度預檢；正式送印前仍應由印廠做色彩與字體最終檢查。</div></section>
      <section class="pr-section"><h3>Indicative quote</h3><div class="pr-quote"><div class="pr-quote-head"><span>DEMO ESTIMATE</span><b class="pr-price">¥—</b></div><p>僅作介面與規格比較，不是任何印刷供應商的即時報價或下單承諾。</p></div></section>
    </aside>
  </div><div class="pr-toast" role="status"></div>`
  studio.setAttribute('role','dialog');studio.setAttribute('aria-modal','true');studio.setAttribute('aria-label','印刷工作台')
  document.body.appendChild(studio);document.body.style.overflow='hidden';enhanceWorkspace();bind();renderProducts();syncControls();renderAll();studio.querySelector('.pr-back').focus()
}
function closeStudio(){if(!studio||exporting)return;studio.style.display='none';document.body.style.overflow='';const home=document.getElementById('pixora-universe-home');if(home)home.inert=false;onReturn?.()}

function enhanceWorkspace(){
  const intro=document.createElement('section');intro.className='pr-discover'
  intro.innerHTML=`<p class="pr-eyebrow">PLUTO / PRINT MATERIALS</p><h1>讓創意，<em>成為印刷物料。</em></h1><p>從使用情境出發，選擇物料、加入素材，再檢查輸出規格。</p><div class="pr-scenes"><button type="button" data-scene="poster"><i class="pr-scene-art event"><span>EVENT<br>2026</span></i><b>活動與展覽</b><small>海報 · 易拉寶 · 三折頁</small></button><button type="button" data-scene="business"><i class="pr-scene-art brand"><span>PIXORA<br>STUDIO</span></i><b>品牌與商務</b><small>名片 · 品牌卡片</small></button><button type="button" data-scene="flyer"><i class="pr-scene-art shop"><span>NEW<br>COLLECTION</span></i><b>門店與宣傳</b><small>宣傳單 · 餐牌</small></button></div>`
  studio.querySelector('.pr-main').prepend(intro)
  const upload=document.createElement('button');upload.type='button';upload.className='pr-upload-main';upload.textContent='選擇設計稿'
  upload.onclick=()=>studio.querySelector('.pr-file').click();studio.querySelector('.pr-empty-preview>div').append(upload)
  studio.querySelector('.pr-note').textContent='印刷稿以 RGB 輸出。正式製作前，請由印廠確認 CMYK／ICC 色彩與紙材加工規格。'
  studio.querySelector('.pr-sidebar .pr-section:last-child .pr-help').textContent='輸出 PDF 包含出血與裁切標記，方便交給印廠確認成品範圍。'
  intro.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{chooseProduct(b.dataset.scene);showToast(`已選擇${product().label}，可加入你的設計稿。`)})
  const quote=studio.querySelector('.pr-quote')?.closest('section')
  if(quote)quote.innerHTML='<h3>輸出流程</h3><ol class="pr-output-steps"><li>選擇物料與尺寸</li><li>加入正反面設計稿</li><li>檢查出血與解析度</li><li>匯出 PDF，交給印廠確認</li></ol><p class="pr-help">素材在本機處理。紙材與加工選項用於整理製作需求。</p>'
  studio.querySelectorAll('.pr-field').forEach((field,i)=>{const label=field.querySelector('label'),control=field.querySelector('input,select');if(label&&control){control.id=`print-field-${i}`;label.htmlFor=control.id}})
  studio.addEventListener('keydown',e=>{if(e.key==='Escape')closeStudio()})
}
function chooseProduct(key){
  if(exporting)return
  const p=PRODUCTS[key];state.product=key;state.orientation=p.w>=p.h?'landscape':'portrait';state.sides=p.sides;state.material=p.materials[0];if(state.sides===1)state.currentSide='front';renderProducts();syncControls();renderAll()
}
const translations={
  '200gsm coated':'200g 銅版紙',
  'SATURN / PRINT STUDIO':'PIXORA / 印刷工作台','Preflight · Bleed · Preview · Quote · PDF':'冥王星 · 物料 / 預覽 / 輸出','EXPORT PRINT PDF':'匯出印刷 PDF',
  '01 / Material type':'01 / 物料分類','02 / Size & production':'02 / 尺寸與製作','03 / Stock & finish':'03 / 紙材與加工','04 / Artwork':'04 / 設計素材','05 / Output':'05 / 輸出設定',
  'Orientation':'方向','Landscape':'橫向','Portrait':'直向','Sides':'印刷面數','Single-sided':'單面','Double-sided':'雙面','Width mm':'寬度（mm）','Height mm':'高度（mm）','Bleed mm':'出血（mm）','Safe margin mm':'安全邊距（mm）',
  'Material':'紙材','Finish':'加工','Quantity':'數量','FRONT':'正面','BACK':'反面','SELECT / DROP ARTWORK':'選擇設計稿','Image placement':'圖片配置','Fill + crop':'填滿並裁切','Fit inside':'完整顯示','PDF filename':'PDF 檔名',
  'FIT VIEW':'查看預覽','CLEAR ARTWORK':'移除這面的素材','LOCAL':'本機處理','browser prepress workspace':'印刷排版預覽','Upload artwork':'加入你的設計稿','Bleed, trim and safe-zone preview will appear here.':'紅色為裁切線，綠色為安全範圍。',
  '· browser prepress workspace':'· 印刷排版預覽','custom mm':'自訂 mm','雙面印刷可分別上傳 FRONT / BACK。拖曳圖片到預覽區亦可加入。':'可分別加入正反面設計稿，也可直接拖曳圖片到預覽區。',
  'Preflight':'印刷前檢查','Effective DPI':'有效解析度','Trim Size':'成品尺寸','Job specification':'製作規格',
  'No finish':'無加工','Matte lamination':'霧膜','Gloss lamination':'亮膜','Spot UV':'局部 UV','Foil accent':'燙金效果',
  '350gsm coated':'350g 銅版紙','300gsm matte':'300g 霧面紙','Textured stock':'紋理紙','157gsm coated':'157g 銅版紙','200gsm matte':'200g 霧面紙','250gsm coated':'250g 銅版紙','Synthetic paper':'合成紙','Photo paper':'相紙','PP synthetic':'PP 合成紙','PET banner':'PET 展示布','Matte banner':'霧面展示布','Standard stock':'標準紙材','Premium stock':'厚卡紙','Synthetic stock':'合成紙材'
}
function translateWorkspace(){
  const walker=document.createTreeWalker(studio,NodeFilter.SHOW_TEXT);let node
  while((node=walker.nextNode())){const value=node.nodeValue.trim();if(translations[value])node.nodeValue=node.nodeValue.replace(value,translations[value])}
}

function bind(){
  const q=s=>studio.querySelector(s)
  q('.pr-back').addEventListener('click',closeStudio);q('.pr-export').addEventListener('click',exportPdf)
  q('.pr-orientation').addEventListener('change',e=>{state.orientation=e.target.value;renderAll()})
  q('.pr-sides').addEventListener('change',e=>{state.sides=Number(e.target.value);if(state.sides===1&&state.currentSide==='back')state.currentSide='front';syncControls();renderAll()})
  q('.pr-bleed').addEventListener('input',e=>{state.bleed=Math.min(20,Math.max(0,Number(e.target.value)||0));renderAll()});q('.pr-safe').addEventListener('input',e=>{state.safe=Math.min(30,Math.max(0,Number(e.target.value)||0));renderAll()})
  q('.pr-cw').addEventListener('input',e=>{state.customW=Number(e.target.value)||210;renderAll()});q('.pr-ch').addEventListener('input',e=>{state.customH=Number(e.target.value)||297;renderAll()})
  q('.pr-material').addEventListener('change',e=>{state.material=e.target.value;renderInspector()});q('.pr-finish').addEventListener('change',e=>{state.finish=e.target.value;renderInspector()});q('.pr-qty').addEventListener('change',e=>{state.quantity=Number(e.target.value)||100;renderInspector()})
  q('.pr-fit').addEventListener('change',e=>{state.fit=e.target.value;renderPreview();renderInspector()});q('.pr-filename').addEventListener('input',e=>state.fileName=e.target.value)
  q('.pr-drop').addEventListener('click',()=>q('.pr-file').click());q('.pr-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)await acceptArtwork(f);e.target.value=''})
  studio.querySelectorAll('.pr-side-switch button').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.side==='back'&&state.sides===1)return;state.currentSide=btn.dataset.side;syncControls();renderAll()}))
  q('.pr-clear').addEventListener('click',()=>{if(state.currentSide==='front')state.front=null;else state.back=null;renderAll()})
  q('.pr-fit-view').addEventListener('click',()=>q('.pr-preview')?.scrollIntoView({behavior:'smooth',block:'center'}))
  const wrap=q('.pr-canvas-wrap');['dragenter','dragover'].forEach(t=>wrap.addEventListener(t,e=>{e.preventDefault();wrap.style.outline='1px solid #b7ff2a'}));['dragleave','drop'].forEach(t=>wrap.addEventListener(t,e=>{e.preventDefault();wrap.style.outline=''}));wrap.addEventListener('drop',async e=>{const f=[...(e.dataTransfer?.files||[])].find(x=>x.type.startsWith('image/'));if(f)await acceptArtwork(f)})
}
async function acceptArtwork(file){
  if(exporting)return
  if(!/^image\/(jpeg|png|webp|avif)$/.test(file.type))return showToast('請選擇 JPG、PNG、WEBP 或 AVIF 圖片。')
  if(file.size>40*1024*1024)return showToast('設計稿大小請控制在 40 MB 以內。')
  const side=state.currentSide
  try{const a=await readFile(file);state[side]=a;renderAll();showToast((side==='front'?'正面':'反面')+'設計稿已加入。')}catch{showToast('無法讀取這張圖片。')}
}

function renderProducts(){const box=studio.querySelector('.pr-product-grid');box.innerHTML='';Object.entries(PRODUCTS).forEach(([key,p])=>{const b=document.createElement('button');b.type='button';b.className='pr-product'+(state.product===key?' is-active':'');b.innerHTML=`<b>${p.label}</b><span>${key==='custom'?'custom mm':`${p.w} × ${p.h} mm`}</span>`;b.addEventListener('click',()=>{state.product=key;state.orientation=p.w>=p.h?'landscape':'portrait';state.sides=p.sides;state.material=p.materials[0];if(state.sides===1)state.currentSide='front';renderProducts();syncControls();renderAll()});box.appendChild(b)})}
function syncControls(){
  const q=s=>studio.querySelector(s),p=product();q('.pr-orientation').value=state.orientation;q('.pr-sides').value=String(state.sides);q('.pr-sides').disabled=p.sides===1;q('.pr-custom-size').style.display=state.product==='custom'?'grid':'none';q('.pr-cw').value=state.customW;q('.pr-ch').value=state.customH
  const mat=q('.pr-material');mat.innerHTML=p.materials.map(x=>`<option value="${x}">${x}</option>`).join('');if(!p.materials.includes(state.material))state.material=p.materials[0];mat.value=state.material
  studio.querySelectorAll('.pr-side-switch button').forEach(btn=>{btn.classList.toggle('is-active',btn.dataset.side===state.currentSide);btn.disabled=btn.dataset.side==='back'&&state.sides===1})
  q('.pr-fit').value=state.fit;q('.pr-drop').classList.toggle('has-file',!!currentAsset());const a=currentAsset();q('.pr-drop b').textContent=a?a.name:'SELECT / DROP ARTWORK';q('.pr-drop span').textContent=a?`${a.width} × ${a.height}px`:'JPG · PNG · WEBP · AVIF'
}
function renderAll(){syncControls();renderPreview();renderInspector();translateWorkspace()}

function drawImageFit(ctx,img,x,y,w,h,mode){const ir=img.naturalWidth/img.naturalHeight,tr=w/h;let dw,dh,dx,dy;if(mode==='cover'){if(ir>tr){dh=h;dw=h*ir;dx=x-(dw-w)/2;dy=y}else{dw=w;dh=w/ir;dx=x;dy=y-(dh-h)/2}}else{if(ir>tr){dw=w;dh=w/ir;dx=x;dy=y+(h-dh)/2}else{dh=h;dw=h*ir;dx=x+(w-dw)/2;dy=y}}ctx.drawImage(img,dx,dy,dw,dh)}
function renderPreview(){
  const revision=++previewRevision
  const canvas=studio.querySelector('.pr-preview'),empty=studio.querySelector('.pr-empty-preview'),a=currentAsset();if(!a){canvas.hidden=true;empty.style.display='grid';return}canvas.hidden=false;empty.style.display='none'
  const {w,h}=dims(),bleed=state.bleed,safe=state.safe,totalW=w+bleed*2,totalH=h+bleed*2,max=1100,scale=Math.min(max/totalW,760/totalH,3);canvas.width=Math.max(1,Math.round(totalW*scale));canvas.height=Math.max(1,Math.round(totalH*scale));const sx=canvas.width/totalW,sy=canvas.height/totalH,ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)
  const img=new Image();img.onload=()=>{if(revision!==previewRevision)return;ctx.save();ctx.beginPath();ctx.rect(0,0,canvas.width,canvas.height);ctx.clip();drawImageFit(ctx,img,0,0,canvas.width,canvas.height,state.fit);ctx.restore();ctx.lineWidth=1.5;ctx.setLineDash([7,5]);ctx.strokeStyle='rgba(255,70,70,.95)';ctx.strokeRect(bleed*sx,bleed*sy,w*sx,h*sy);ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(45,210,110,.9)';ctx.strokeRect((bleed+safe)*sx,(bleed+safe)*sy,Math.max(1,(w-safe*2)*sx),Math.max(1,(h-safe*2)*sy));ctx.setLineDash([]);ctx.fillStyle='rgba(0,0,0,.72)';ctx.font='12px Arial';ctx.fillText('裁切',bleed*sx+6,bleed*sy+15);ctx.fillStyle='rgba(30,140,70,.95)';ctx.fillText('安全範圍',(bleed+safe)*sx+6,(bleed+safe)*sy+15);if(product().folds===3){ctx.strokeStyle='rgba(50,120,255,.8)';ctx.setLineDash([4,5]);for(let i=1;i<3;i++){const gx=(bleed+w*i/3)*sx;ctx.beginPath();ctx.moveTo(gx,bleed*sy);ctx.lineTo(gx,(bleed+h)*sy);ctx.stroke()}ctx.setLineDash([])}};img.src=a.url
}
function effectiveDpi(a){if(!a)return 0;const {w,h}=dims();const physW=(w+state.bleed*2)/25.4,physH=(h+state.bleed*2)/25.4;return Math.floor((state.fit==='cover'?Math.min:Math.max)(a.width/physW,a.height/physH))}
function quote(){const p=product(),q=state.quantity,area=(dims().w*dims().h)/(90*54),mat=MATERIAL_FACTORS[state.material]||1,fin=FINISHES[state.finish]?.factor||1,side=state.sides===2?1.55:1;let unit=p.base*Math.max(.6,Math.pow(area,.55))*mat*fin*side;const volume=q>=2000?.48:q>=1000?.55:q>=500?.64:q>=200?.76:q>=100?.86:1;unit*=volume;return Math.max(12,unit*q)}
function renderInspector(){
  const a=currentAsset(),dpi=effectiveDpi(a),target=product().dpi,{w,h}=dims(),dpiBox=studio.querySelector('.pr-dpi'),sizeBox=studio.querySelector('.pr-size')
  dpiBox.querySelector('b').textContent=a?dpi+' DPI':'—';dpiBox.className='pr-metric pr-dpi '+(!a?'':dpi>=target?'good':dpi>=target*.7?'warn':'bad');sizeBox.querySelector('b').textContent=Math.round(w)+' × '+Math.round(h)+' mm'
  const checks=[
    {c:a?(dpi>=target?'good':dpi>=target*.7?'warn':'bad'):'warn',t:'解析度',d:a?'建議 '+target+' DPI · 目前約 '+dpi+' DPI':'加入設計稿後計算有效解析度。'},
    {c:state.bleed>=3?'good':'warn',t:'出血範圍',d:'每邊 '+state.bleed+' mm；通常預留 3 mm，請依印廠規格確認。'},
    {c:state.safe>=3?'good':'warn',t:'安全範圍',d:'重要文字與標誌距離裁切線至少 '+state.safe+' mm。'},
    {c:'warn',t:'色彩模式',d:'預覽與輸出使用 RGB；CMYK／ICC 色彩轉換請由印廠確認。'}
  ]
  if(state.sides===2)checks.push({c:state.front&&state.back?'good':'warn',t:'雙面素材',d:state.front&&state.back?'正反面設計稿均已加入。':'請加入正反面設計稿，或選擇單面印刷。'})
  studio.querySelector('.pr-checks').innerHTML=checks.map(x=>'<div class="pr-check '+x.c+'"><i></i><div><b>'+x.t+'</b><span>'+x.d+'</span></div></div>').join('')
  studio.querySelector('.pr-spec').innerHTML=[['物料',product().label],['成品尺寸',w.toFixed(1)+' × '+h.toFixed(1)+' mm'],['出血',state.bleed+' mm / 邊'],['紙材',translations[state.material]||state.material],['加工',translations[FINISHES[state.finish].name]],['面數',state.sides===2?'雙面':'單面'],['數量',state.quantity.toLocaleString()]].map(([label,value])=>'<div><span>'+label+'</span><b>'+value+'</b></div>').join('')
  studio.querySelector('.pr-export').disabled=exporting||!state.front||(state.sides===2&&!state.back)
  translateWorkspace()
}

function calcPlacement(imgW,imgH,x,y,w,h,mode){const ir=imgW/imgH,tr=w/h;if(mode==='cover'){if(ir>tr){const drawH=h,drawW=h*ir;return{x:x-(drawW-w)/2,y,w:drawW,h:drawH,crop:true}}const drawW=w,drawH=w/ir;return{x,y:y-(drawH-h)/2,w:drawW,h:drawH,crop:true}}if(ir>tr){const drawW=w,drawH=w/ir;return{x,y:y+(h-drawH)/2,w:drawW,h:drawH}}const drawH=h,drawW=h*ir;return{x:x+(w-drawW)/2,y,w:drawW,h:drawH}}
async function cropToRegion(asset,ratio){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const max=3600;let cw,ch;if(ratio>=1){cw=max;ch=Math.round(max/ratio)}else{ch=max;cw=Math.round(max*ratio)}const c=document.createElement('canvas');c.width=cw;c.height=ch;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cw,ch);const ir=img.naturalWidth/img.naturalHeight;let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;if(ir>ratio){sw=img.naturalHeight*ratio;sx=(img.naturalWidth-sw)/2}else{sh=img.naturalWidth/ratio;sy=(img.naturalHeight-sh)/2}ctx.drawImage(img,sx,sy,sw,sh,0,0,cw,ch);resolve(c.toDataURL('image/jpeg',.96))};img.onerror=reject;img.src=asset.url})}
function drawCropMarks(doc,trimX,trimY,w,h){doc.setDrawColor(35,35,35);doc.setLineWidth(.18);const m=3,g=1.2;[[trimX,trimY],[trimX+w,trimY],[trimX,trimY+h],[trimX+w,trimY+h]].forEach(([x,y],i)=>{const left=i===0||i===2,top=i<2;doc.line(x+(left?-g:g),y,x+(left?-(g+m):(g+m)),y);doc.line(x,y+(top?-g:g),x,y+(top?-(g+m):(g+m)))})}
async function exportPdf(){
  if(exporting)return
  if(!state.front||(state.sides===2&&!state.back))return showToast('請先加入所需的正反面素材，或改為單面印刷。')
  const assets=[state.front,state.sides===2?state.back:null].filter(Boolean)
  exporting=true
  const controls=[...studio.querySelectorAll('button,input,select')].map(el=>({el,disabled:el.disabled}))
  controls.forEach(({el})=>el.disabled=true)
  showToast('正在建立印刷 PDF…')
  try {
  const {w,h}=dims(),bleed=state.bleed,slug=6,pageW=w+2*(bleed+slug),pageH=h+2*(bleed+slug),orient=pageW>pageH?'landscape':'portrait';const doc=new jsPDF({orientation:orient,unit:'mm',format:[pageW,pageH],compress:true});const regionX=slug,regionY=slug,regionW=w+bleed*2,regionH=h+bleed*2,trimX=slug+bleed,trimY=slug+bleed
  for(let i=0;i<assets.length;i++){
    if(i)doc.addPage([pageW,pageH],orient);const a=assets[i];doc.setFillColor(255,255,255);doc.rect(0,0,pageW,pageH,'F')
    if(state.fit==='cover'){const data=await cropToRegion(a,regionW/regionH);doc.addImage(data,'JPEG',regionX,regionY,regionW,regionH,undefined,'FAST')}
    else{const p=calcPlacement(a.width,a.height,regionX,regionY,regionW,regionH,'contain');const fmt=a.type.includes('png')?'PNG':a.type.includes('webp')?'WEBP':'JPEG';try{doc.addImage(a.url,fmt,p.x,p.y,p.w,p.h,undefined,'FAST')}catch{const data=await cropToRegion(a,a.width/a.height);doc.addImage(data,'JPEG',p.x,p.y,p.w,p.h,undefined,'FAST')}}
    drawCropMarks(doc,trimX,trimY,w,h);doc.setFontSize(5);doc.setTextColor(90);doc.text(`${product().name} · ${w.toFixed(1)}×${h.toFixed(1)}mm · bleed ${bleed}mm · ${i===0?'FRONT':'BACK'}`,slug,pageH-1.7)
  }
  doc.save(safeName(state.fileName)+'.pdf');showToast('印刷 PDF 已匯出。')
  }catch(error){console.error(error);showToast('輸出失敗，請確認圖片與尺寸。')}
  finally{exporting=false;controls.forEach(({el,disabled})=>el.disabled=disabled);renderInspector()}
}

