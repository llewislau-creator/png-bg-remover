import {setupFontWorkspace} from './font-workspace.js'
import {setupHandwriting} from './handwriting-studio.js'
import {setupTypographyReferences} from './typography-references.js'
import './font-studio.css'
const styles=[
{id:'ink',name:'墨韻書法',category:'書法',font:'"DFKai-SB","KaiTi",serif',colors:['#292621','#292621'],bg:'#eee6d6'},
{id:'song',name:'典雅宋體',category:'書法',font:'"SimSun","PMingLiU",serif',colors:['#233e35','#233e35'],bg:'#e9eee6'},
{id:'gold',name:'流光金屬',category:'質感',font:'"Microsoft JhengHei",sans-serif',colors:['#fff0a6','#a5691c','#ffe9a2'],bg:'#222119'},
{id:'silver',name:'銀色未來',category:'質感',font:'Arial,"Microsoft JhengHei",sans-serif',colors:['#fafbff','#6c83a4','#eef4ff'],bg:'#182435'},
{id:'neon',name:'霓虹光影',category:'潮流',font:'Arial,"Microsoft JhengHei",sans-serif',colors:['#bd7aff','#5deaff'],bg:'#150c28',glow:'#bd7aff'},
{id:'pop',name:'活力撞色',category:'潮流',font:'"Microsoft JhengHei",sans-serif',colors:['#ffad25','#ff4481'],bg:'#f3edff',outline:'#432066'},
{id:'ocean',name:'海洋漸層',category:'品牌',font:'"Microsoft JhengHei",sans-serif',colors:['#45dbd6','#1470b9'],bg:'#e1f4f1'},
{id:'rose',name:'花漾柔光',category:'品牌',font:'"SimSun","PMingLiU",serif',colors:['#ed96ba','#9e5d9f'],bg:'#fff0f5'},
{id:'mono',name:'極簡黑白',category:'品牌',font:'Arial,"Microsoft JhengHei",sans-serif',colors:['#171717','#171717'],bg:'#f6f6f6'},
{id:'sunset',name:'落日餘暉',category:'質感',font:'"Microsoft JhengHei",sans-serif',colors:['#ffe39a','#ec694b','#993b88'],bg:'#281923'},
{id:'outline',name:'空心輪廓',category:'潮流',font:'Arial,"Microsoft JhengHei",sans-serif',colors:['#6e49ca','#6e49ca'],bg:'#eee9fb',hollow:true},
{id:'red',name:'朱砂題字',category:'書法',font:'"DFKai-SB","KaiTi",serif',colors:['#a3382e','#a3382e'],bg:'#f5e9d4'}]
styles.push(
{id:'kai',name:'楷書題字',category:'書法',font:'"DFKai-SB","KaiTi",serif',colors:['#183829','#183829'],bg:'#e9eedf'},
{id:'ming',name:'明體雅韻',category:'書法',font:'"MingLiU","PMingLiU",serif',colors:['#383149','#383149'],bg:'#f0eaf5'},
{id:'retro',name:'復古報刊',category:'品牌',font:'Georgia,"PMingLiU",serif',colors:['#71452d','#71452d'],bg:'#efe3ca'},
{id:'typewriter',name:'打字機',category:'品牌',font:'"Courier New","Microsoft JhengHei",monospace',colors:['#253c48','#253c48'],bg:'#e9eef0'},
{id:'script',name:'Elegant Script',category:'書法',font:'"Segoe Script",cursive',colors:['#9e7152','#9e7152'],bg:'#f6eee8'},
{id:'impact',name:'BOLD IMPACT',category:'潮流',font:'Impact,sans-serif',colors:['#ec693f','#ec693f'],bg:'#211f24'},
{id:'serif',name:'Editorial Serif',category:'品牌',font:'Georgia,serif',colors:['#26352b','#26352b'],bg:'#f0efdf'},
{id:'tech',name:'MONO SPACE',category:'質感',font:'Consolas,monospace',colors:['#bdfcf2','#4797c6'],bg:'#0a222a'})
const extraStyles=[
['copper','赤銅浮雕','質感',['#f6d2aa','#a65230','#e8b988'],'#261d18',{extrude:'#532d20'}],
['ice','冰晶銀藍','質感',['#ffffff','#9bd7f0','#476ea7'],'#142337',{outline:'#80c9e1'}],
['pearl','珍珠光澤','質感',['#fffefb','#d6bfd3','#f8f4ed'],'#332a34',{}],
['emerald','翡翠流光','質感',['#b4f2b0','#238778','#144e4d'],'#0b2422',{}],
['chrome','鉻金鏡面','質感',['#ffffff','#647787','#effaff','#41586b'],'#17222a',{extrude:'#071018'}],
['velvet','紫絨金邊','質感',['#dba3ef','#77459b'],'#211429',{outline:'#e7c16c'}],
['electric','電光藍','潮流',['#9ffcff','#367aff'],'#071629',{glow:'#368cff'}],
['cyber','賽博粉紫','潮流',['#ff66da','#9265ff'],'#150822',{glow:'#fb63ff',outline:'#39194f'}],
['lime','螢光檸檬','潮流',['#ecff60','#97e843'],'#14200d',{glow:'#b9ef44'}],
['bubble','糖果泡泡','潮流',['#ffb4e1','#f277bb'],'#f9eaf5',{outline:'#9e3a81',extrude:'#ce64a7'}],
['comic','漫畫衝擊','潮流',['#fff272','#ff9732'],'#233151',{outline:'#111e32',extrude:'#111e32'}],
['holo','全息幻彩','潮流',['#a7f5ef','#c99cff','#ffb4dc','#9ceaf4'],'#19162c',{}],
['teal','青瓷雅字','書法',['#426d6a','#426d6a'],'#e5efe7',{}],
['tea','茶褐題簽','書法',['#6b4629','#6b4629'],'#efe6d1',{}],
['midnight','夜墨銀箔','書法',['#e4e8df','#9bada8'],'#142321',{}],
['cinnabar','朱印墨字','書法',['#bc4336','#723930'],'#f8ebd4',{outline:'#863a2e'}],
['sage','鼠尾草品牌','品牌',['#526d58','#526d58'],'#eaf0df',{}],
['coral','珊瑚品牌','品牌',['#ed826d','#da5a63'],'#ffefdf',{}],
['navy','海軍藍標題','品牌',['#243c63','#243c63'],'#e4edf3',{}],
['terracotta','陶土印記','品牌',['#ac654b','#844334'],'#efdfc9',{}]]
styles.push(...extraStyles.map(([id,name,category,colors,bg,effect])=>({id,name,category,colors,bg,font:category==='書法'?'"DFKai-SB","KaiTi",serif':'"Microsoft JhengHei",sans-serif',...effect})))

const fontChoices=[['','依風格預設 / Style default'],['"Microsoft JhengHei",sans-serif','微軟正黑體'],['"DFKai-SB",serif','標楷體'],['"PMingLiU",serif','新細明體'],['"MingLiU",serif','細明體'],['"PingFang TC",sans-serif','蘋方繁體（macOS）'],['"Heiti TC",sans-serif','黑體繁體（macOS）'],['Arial,sans-serif','Arial'],['Georgia,serif','Georgia'],['"Times New Roman",serif','Times New Roman'],['Verdana,sans-serif','Verdana'],['Tahoma,sans-serif','Tahoma'],['Impact,sans-serif','Impact'],['"Trebuchet MS",sans-serif','Trebuchet MS'],['"Courier New",monospace','Courier New'],['Consolas,monospace','Consolas'],['"Segoe Script",cursive','Segoe Script'],['"Comic Sans MS",cursive','Comic Sans MS']]
const chineseWebFonts=[
['Noto Sans TC','思源黑體',[300,400,500,700,900]],['Noto Serif TC','思源宋體',[300,400,500,700,900]],
['LXGW WenKai TC','霞鶩文楷',[300,400,700]],['LXGW WenKai Mono TC','文楷等寬',[300,400,700]],
['Chiron Sung HK','昭源宋體',[300,400,500,700,900]],['Chiron Hei HK','昭源黑體',[300,400,500,700,900]],
['Huninn','粉圓',[400]],['Iansui','芫荽手寫',[400]],['Chocolate Classical Sans','朱古力黑體',[400]],['WDXL Lubrifont TC','潤滑字體',[400]]]
const weightNames={300:'細體',400:'標準',500:'中等',700:'粗體',900:'特粗'}
const chinesePresets=chineseWebFonts.flatMap(([family,label,weights])=>weights.map(weight=>({value:'web:'+family+':'+weight,label:label+' · '+weightNames[weight]+' '+weight,font:'"'+family+'",serif',weight})))
fontChoices.splice(1,0,...chinesePresets.map(p=>[p.value,p.label]))
function resolveStyle(style,font){const preset=chinesePresets.find(p=>p.value===font);return preset?{...style,font:preset.font,weight:preset.weight}:font?{...style,font}:style}
const fontSheets=new Map();let previewRequest=0
async function ensureFont(style,text){const entry=chineseWebFonts.find(([family])=>style.font.startsWith('"'+family+'"'));if(!entry)return;const family=entry[0],weight=style.weight||700,key=family+':'+weight;if(!fontSheets.has(key)){fontSheets.set(key,new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family).replace(/%20/g,'+')+':wght@'+weight+'&display=swap';link.onload=resolve;link.onerror=()=>{fontSheets.delete(key);link.remove();reject(new Error('Font stylesheet unavailable'))};document.head.append(link)}))}await fontSheets.get(key);const loaded=await document.fonts.load(weight+' 64px "'+family+'"',text||'繁體中文字');if(!loaded.length)throw new Error('Font unavailable')}
let customFontCount=0,previewZoom=1,galleryZoom=.75
let panel=null,onReturn=null,timer=0
const state={text:'靈感成字',style:'ink',vertical:false,transparent:true,size:1600,category:'全部',tab:'gallery',history:[],favorites:new Set()}
try{state.favorites=new Set(JSON.parse(localStorage.getItem('pixora-font-favorites')||'[]'))}catch{}
const chosen=()=>resolveStyle(styles.find(s=>s.id===state.style)||styles[0],state.font)
function notify(message){panel.querySelector('.fs-toast').textContent=message;clearTimeout(timer);timer=setTimeout(()=>panel.querySelector('.fs-toast').textContent='',3500)}
export function openFontStudio(callback=null){
 onReturn=callback;document.getElementById('pixora-universe-home')?.setAttribute('inert','');document.body.style.overflow='hidden'
 if(panel){panel.hidden=false;panel.querySelector('#fs-text').focus();return}
 panel=document.createElement('section');panel.id='font-studio';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','字體特效工作台')
 panel.innerHTML=`<header class="fs-header"><button class="fs-back">← 回到行星選單</button><div><b>PIXORA / 字體特效</b><small>木星 · 本機創作</small></div><button class="fs-download">下載 PNG</button></header><div class="fs-shell"><aside class="fs-controls"><h3>文字內容</h3><label for="fs-text">輸入你的文字</label><textarea id="fs-text" maxlength="48">靈感成字</textarea><p class="fs-counter"></p><div class="fs-direction"><button data-direction="horizontal">橫向</button><button data-direction="vertical">直向</button></div><h3>字體選擇 / Font</h3><label for="fs-font">繁體字體 · 30 款（10 家族 × 不同字重）</label><select id="fs-font"></select><label for="fs-font-file">匯入字體（TTF／OTF／WOFF／WOFF2）</label><input id="fs-font-file" type="file" accept=".ttf,.otf,.woff,.woff2"><p class="fs-note">30 款繁體字體選項，含 10 個字型家族及實際支援的字重。首次使用需連線下載。裝置字體未安裝時會替代。匯入字體與文字在本機處理。</p><h3>文字效果</h3><div class="fs-style-list"></div><h3>輸出設定</h3><label for="fs-size">圖片尺寸</label><select id="fs-size"><option value="800">800 × 800</option><option value="1600" selected>1600 × 1600</option><option value="2400">2400 × 2400</option></select><label class="fs-check"><input class="fs-transparent" type="checkbox" checked>透明背景</label><button class="fs-create">建立作品</button><p class="fs-note">本機字體與特效排版，尚未接入 AI 生成字形。書法效果依裝置字體顯示。</p></aside><main class="fs-main"><div class="fs-hero"><small>JUPITER / TYPE EXPLORER</small><h1>讓文字，<em>有自己的風格。</em></h1><p>選擇字體特效，將靈感變成你的下一個標題。</p><span>本機處理 · 無需帳號</span></div><section class="fs-work"><div class="fs-work-title"><div><b class="fs-selected"></b><small>即時预覽 · 不會上傳文字</small></div><button class="fs-favorite">收藏風格</button></div><div class="fs-preview-tools" aria-label="預覽縮放"><button type="button" data-preview-zoom="out" aria-label="縮小預覽">−</button><output class="fs-preview-zoom">100%</output><button type="button" data-preview-zoom="in" aria-label="放大預覽">＋</button><button type="button" data-preview-zoom="reset">重設預覽</button><span class="fs-preview-background" role="group" aria-label="預覽背景"><button type="button" data-preview-bg="transparent" aria-pressed="true">透明</button><button type="button" data-preview-bg="white" aria-pressed="false">白色</button><button type="button" data-preview-bg="gray" aria-pressed="false">灰色</button><button type="button" data-preview-bg="black" aria-pressed="false">黑色</button></span><small>滑鼠滾輪縮放 · Shift＋滾輪捲動 · 不影響 PNG 尺寸</small></div><div class="fs-canvas-wrap"><div class="fs-preview-space"><canvas class="fs-canvas" width="800" height="800" aria-label="字體特效預覽"></canvas></div></div></section><nav class="fs-tabs"><button data-tab="gallery">風格廣場 · 40 款</button><button data-tab="favorites">我的收藏</button><button data-tab="history">作品紀錄</button></nav><div class="fs-gallery-tools" role="group" aria-label="風格卡片大小"><span>卡片大小</span><button type="button" data-gallery-zoom="out" aria-label="縮小風格卡片">−</button><output class="fs-gallery-zoom">75%</output><button type="button" data-gallery-zoom="in" aria-label="放大風格卡片">＋</button><button type="button" data-gallery-zoom="reset">重設卡片</button><small>滑鼠移到風格區，Ctrl＋滾輪縮放</small></div><div class="fs-filters"></div><div class="fs-gallery"></div></main></div><p class="fs-toast" role="status" aria-live="polite"></p>`
 document.body.append(panel)
 setupHandwriting(panel,()=>({text:state.text,vertical:state.vertical,transparent:state.transparent}))
 setupFontWorkspace(panel)
 const fontSelect=panel.querySelector('#fs-font');for(const [value,label] of fontChoices){const option=document.createElement('option');option.value=value;option.textContent=label;fontSelect.append(option)}
 setupTypographyReferences(panel)
 fontSelect.onchange=()=>{state.font=fontSelect.value;renderPreview()}
 panel.querySelector('#fs-font-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>20*1024*1024){notify('字體檔案請小於 20 MB。');return}try{const family='PixoraImported'+(++customFontCount),face=new FontFace(family,await file.arrayBuffer());await face.load();document.fonts.add(face);const option=document.createElement('option');option.value='"'+family+'",sans-serif';option.textContent=file.name; fontSelect.append(option);fontSelect.value=option.value;state.font=option.value;renderPreview();notify('字體已載入，可預覽及匯出 PNG。')}catch{notify('無法讀取此字體，請選擇有效的字體檔。')}finally{e.target.value=''}}
 function setPreviewZoom(value,pointer=null){const wrap=panel.querySelector('.fs-canvas-wrap'),canvas=panel.querySelector('.fs-canvas'),before=canvas.getBoundingClientRect(),origin=pointer?{x:(pointer.x-before.left)/before.width,y:(pointer.y-before.top)/before.height}:null;previewZoom=Math.max(.5,Math.min(3,value));panel.querySelector('.fs-preview-zoom').textContent=Math.round(previewZoom*100)+'%';panel.querySelector('.fs-preview-space').style.setProperty('--preview-size',310*previewZoom+'px');panel.querySelector('[data-preview-zoom="out"]').disabled=previewZoom<=.5;panel.querySelector('[data-preview-zoom="in"]').disabled=previewZoom>=3;if(origin){const after=canvas.getBoundingClientRect();wrap.scrollLeft+=after.left+origin.x*after.width-pointer.x;wrap.scrollTop+=after.top+origin.y*after.height-pointer.y}else if(value===1){wrap.scrollLeft=0;wrap.scrollTop=0}}
 panel.querySelectorAll('[data-preview-zoom]').forEach(button=>button.onclick=()=>setPreviewZoom(button.dataset.previewZoom==='reset'?1:previewZoom+(button.dataset.previewZoom==='in'?.25:-.25)))
 panel.querySelector('.fs-canvas-wrap').addEventListener('wheel',event=>{if(!event.deltaY||event.shiftKey)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?310:1);setPreviewZoom(previewZoom*Math.exp(-Math.max(-200,Math.min(200,delta))*.002),{x:event.clientX,y:event.clientY})},{passive:false})
 panel.querySelectorAll('[data-preview-bg]').forEach(button=>button.onclick=()=>{const bg=button.dataset.previewBg,wrap=panel.querySelector('.fs-canvas-wrap');wrap.style.backgroundColor={white:'#ffffff',gray:'#808080',black:'#000000',transparent:'#ffffff'}[bg];wrap.style.backgroundImage=bg==='transparent'?'':'none';panel.querySelectorAll('[data-preview-bg]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))})
 function setGalleryZoom(value){galleryZoom=Math.max(.5,Math.min(1.5,value));panel.querySelector('.fs-gallery').style.setProperty('--gallery-card-size',Math.round(280*galleryZoom)+'px');panel.querySelector('.fs-gallery-zoom').textContent=Math.round(galleryZoom*100)+'%';panel.querySelector('[data-gallery-zoom="out"]').disabled=galleryZoom<=.5;panel.querySelector('[data-gallery-zoom="in"]').disabled=galleryZoom>=1.5}
 panel.querySelectorAll('[data-gallery-zoom]').forEach(button=>button.onclick=()=>setGalleryZoom(button.dataset.galleryZoom==='reset'?.75:galleryZoom+(button.dataset.galleryZoom==='in'?.125:-.125)))
 panel.querySelector('.fs-gallery').addEventListener('wheel',event=>{if(!event.ctrlKey||!event.deltaY)return;event.preventDefault();setGalleryZoom(galleryZoom+(event.deltaY<0?.125:-.125))},{passive:false});setGalleryZoom(galleryZoom)
 panel.querySelector('.fs-back').onclick=close
 panel.querySelector('#fs-text').oninput=e=>{state.text=e.target.value;renderPreview()}
 panel.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{state.vertical=b.dataset.direction==='vertical';renderPreview()})
 panel.querySelector('#fs-size').onchange=e=>state.size=Number(e.target.value)
 panel.querySelector('.fs-transparent').onchange=e=>{state.transparent=e.target.checked;renderPreview()}
 panel.querySelector('.fs-favorite').onclick=()=>{if(state.favorites.has(state.style))state.favorites.delete(state.style);else state.favorites.add(state.style);try{localStorage.setItem('pixora-font-favorites',JSON.stringify([...state.favorites]))}catch{}renderPreview();renderGallery()}
 panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderGallery()})
 panel.querySelector('.fs-create').onclick=()=>{if(!valid())return;state.history.unshift({text:state.text,style:state.style,vertical:state.vertical,transparent:state.transparent,font:state.font});state.history=state.history.slice(0,12);state.tab='history';renderGallery();notify('作品已加入本次工作階段的紀錄。')}
 panel.querySelector('.fs-download').onclick=download
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()})
 renderStyles();renderGallery();renderPreview();panel.querySelector('#fs-text').focus()
}
function close(){panel.hidden=true;document.body.style.overflow='';document.getElementById('pixora-universe-home')?.removeAttribute('inert');onReturn?.()}
function valid(){if(!state.text.trim()){notify('請先輸入文字。');panel.querySelector('#fs-text').focus();return false}return true}
function selectStyle(id){state.style=id;renderStyles();renderPreview()}
function renderStyles(){const box=panel.querySelector('.fs-style-list');box.replaceChildren();styles.forEach(s=>{const b=document.createElement('button');b.textContent=s.name;b.style.fontFamily=s.font;b.className=s.id===state.style?'active':'';b.setAttribute('aria-pressed',String(s.id===state.style));b.onclick=()=>selectStyle(s.id);box.append(b)})}
function draw(canvas,style,text,vertical,transparent){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);if(!transparent){ctx.fillStyle=style.bg;ctx.fillRect(0,0,w,h)}
 const content=text.trim()||'輸入文字';let lines=vertical?content.split('\n').map(x=>Array.from(x)).filter(x=>x.length):content.split('\n').filter(x=>x.trim());if(!lines.length)lines=vertical?[Array.from(content)]:[content]
 let fontSize=w*.19;const maxCharacters=Math.max(...lines.map(line=>Array.from(line).length));if(vertical)fontSize=Math.min(fontSize,h*.78/(maxCharacters*1.16),w*.78/(lines.length*1.3));else{fontSize=Math.min(fontSize,h*.75/(lines.length*1.3));ctx.font=`${style.weight||900} ${fontSize}px ${style.font}`;const widest=Math.max(...lines.map(line=>ctx.measureText(line).width));fontSize*=Math.min(1,w*.78/widest)}
 ctx.font=`${style.weight||900} ${fontSize}px ${style.font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';const gradient=ctx.createLinearGradient(0,h*.25,0,h*.75);style.colors.forEach((color,i)=>gradient.addColorStop(i/(style.colors.length-1),color));ctx.fillStyle=gradient;ctx.strokeStyle=style.outline||style.colors[0];ctx.lineWidth=fontSize*.025;if(style.glow){ctx.shadowColor=style.glow;ctx.shadowBlur=fontSize*.13}
 function glyph(t,x,y){if(style.extrude){ctx.save();ctx.shadowBlur=0;ctx.fillStyle=style.extrude;for(let d=5;d>0;d--)ctx.fillText(t,x+d*fontSize*.009,y+d*fontSize*.009);ctx.restore()}if(style.outline||style.hollow)ctx.strokeText(t,x,y);if(!style.hollow)ctx.fillText(t,x,y)}
 if(vertical){lines.forEach((column,i)=>column.forEach((char,j)=>glyph(char,w/2+((lines.length-1)/2-i)*fontSize*1.3,h/2+(j-(column.length-1)/2)*fontSize*1.16)))}else lines.forEach((line,i)=>glyph(line,w/2,h/2+(i-(lines.length-1)/2)*fontSize*1.3))
}
async function renderPreview(){const request=++previewRequest;try{await ensureFont(chosen(),state.text)}catch{if(request===previewRequest)notify('字體下載失敗，暫用替代字體；請檢查連線後重選。')}if(request!==previewRequest)return;draw(panel.querySelector('.fs-canvas'),chosen(),state.text,state.vertical,state.transparent);panel.querySelector('.fs-selected').textContent=chosen().name;panel.querySelector('.fs-counter').textContent=`${state.text.length} / 48 字元`;panel.querySelector('.fs-favorite').textContent=state.favorites.has(state.style)?'★ 已收藏':'☆ 收藏風格';panel.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.direction==='vertical')===state.vertical)));panel.querySelector('.fs-download').disabled=!state.text.trim();panel.querySelector('.fs-create').disabled=!state.text.trim()}
function renderGallery(){
 panel.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===state.tab)))
 const filters=panel.querySelector('.fs-filters');filters.replaceChildren();if(state.tab!=='history')['全部','書法','質感','潮流','品牌'].forEach(category=>{const b=document.createElement('button');b.textContent=category;b.setAttribute('aria-pressed',String(state.category===category));b.onclick=()=>{state.category=category;renderGallery()};filters.append(b)})
 const items=state.tab==='history'?state.history:styles.filter(s=>(state.category==='全部'||s.category===state.category)&&(state.tab!=='favorites'||state.favorites.has(s.id)))
 const gallery=panel.querySelector('.fs-gallery');gallery.replaceChildren();if(!items.length){const p=document.createElement('p');p.className='fs-no-items';p.textContent=state.tab==='history'?'尚未建立作品。輸入文字後按「建立作品」。':'此分類尚無收藏。可在預覽區收藏喜歡的風格。';gallery.append(p)}
 items.forEach(item=>{const s=state.tab==='history'?styles.find(s=>s.id===item.style):item;const card=document.createElement('button');card.className='fs-card';card.setAttribute('aria-label',state.tab==='history'?`開啟作品 ${item.text}`:`使用 ${s.name}`);const canvas=document.createElement('canvas');canvas.width=600;canvas.height=360;draw(canvas,state.tab==='history'?resolveStyle(s,item.font):s,state.tab==='history'?item.text:s.name,state.tab==='history'?item.vertical:false,false);const footer=document.createElement('span'),title=document.createElement('b'),action=document.createElement('small');title.textContent=state.tab==='history'?item.text:s.name;action.textContent='立即使用 ↗';footer.append(title,action);card.append(canvas,footer);card.onclick=()=>{if(state.tab==='history'){Object.assign(state,{text:item.text,vertical:item.vertical,transparent:item.transparent,font:item.font||''});panel.querySelector('#fs-font').value=state.font;panel.querySelector('#fs-text').value=state.text;panel.querySelector('.fs-transparent').checked=state.transparent}selectStyle(s.id);panel.querySelector('.fs-work').scrollIntoView({block:'nearest',behavior:'smooth'})};gallery.append(card)})
}
async function download(){if(!valid())return;const button=panel.querySelector('.fs-download');button.disabled=true;try{await ensureFont(chosen(),state.text);await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=canvas.height=state.size;draw(canvas,chosen(),state.text,state.vertical,state.transparent);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pixora-font-'+state.style+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notify(`PNG 已匯出 · ${state.size} × ${state.size}`)}catch{notify('匯出失敗，請重試。')}finally{button.disabled=!state.text.trim()}}
