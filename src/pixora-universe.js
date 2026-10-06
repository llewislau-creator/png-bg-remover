import { openPortraitStudio } from './portrait-studio.js'
import { openLayerStudio } from './layer-studio.js'
import { openPromptStudio } from './prompt-extractor.js'
import './pixora-universe.css'
import './studio-theme.css'
import { openImageToPdf } from './image-to-pdf.js'
import { openPrintStudio } from './print-studio.js'
import { openPresentationStudio } from './presentation-studio.js'
import { openFontStudio } from './font-studio.js'
import { openColorStudio } from './color-studio.js'
import { openVectorStudio } from './vector-studio.js'

// Perspective-projected solar system. No external graphics runtime or image uploads.
const planets = [
  ['mercury','水星','Mercury','圖片轉提示詞','Image to Prompt','#a8a5a0',.75,.10,true],
  ['venus','金星','Venus','色彩分析','Color Analyzer','#e4b777',1.12,.14,true],
  ['earth','地球','Earth','AI 圖片去背','AI Background Remover','#319bde',1.53,.17,true],
  ['mars','火星','Mars','人像修飾','Portrait Retouch','#cb6348',1.95,.12,true],
  ['jupiter','木星','Jupiter','文字特效','Text Effects','#d8b494',2.55,.29,true],
  ['saturn','土星','Saturn','圖片分層編輯','Image Layers','#ddc592',3.25,.24,true],
  ['uranus','天王星','Uranus','圖片轉 PDF','Image to PDF','#87d7de',3.98,.18,true],
  ['neptune','海王星','Neptune','簡報製作','Presentation Builder','#557ee4',4.65,.18,true],
  ['pluto','冥王星 · 矮行星','Pluto · Dwarf planet','印刷排版','Print Layout','#aa9a91',5.25,.08,true],
  ['moon','月球','Moon','圖片轉 SVG','Image to SVG','#c7d1db',0,.055,true],
].map(([id,zh,en,toolZh,toolEn,color,orbit,radius,available],i)=>({id,zh,en,toolZh,toolEn,color,orbit,radius,available,angle:i*2.399}))

const toolCopy={
  mercury:{summary:['整理提示詞與圖片色調','Compose prompts and analyze colors'],description:['分析圖片色調，配合你填寫的主體描述，整理中英文提示詞、負面提示詞與光線建議。可編輯、複製及下載 TXT 或 JSON；自動辨識內容需啟用 AI 服務。','Analyze image colors and use your subject description to compose Chinese and English prompts, negative prompts, and lighting suggestions. Edit, copy, or export TXT and JSON. Automatic content recognition requires an enabled AI service.']},
  venus:{summary:['擷取主色與色碼','Extract colors and HEX codes'],description:['上傳圖片，擷取主要顏色、HEX 色碼及色彩比例。建立配色參考，並下載色票圖片、CSS 或 JSON。','Upload an image to extract its main colors, HEX codes, and color proportions. Build a palette and export it as an image, CSS, or JSON.']},
  earth:{summary:['移除背景，保留主體','Remove backgrounds automatically'],description:['用 AI 自動移除圖片背景，保留人物或物件，下載透明背景 PNG。圖片在你的瀏覽器內處理，無需註冊。','Automatically remove image backgrounds with AI, keep the person or object, and download a transparent PNG. Images are processed in your browser. No account required.']},
  mars:{summary:['局部柔化與手動修補','Soften, retouch, and adjust colors'],description:['用筆刷局部柔化肌膚，取樣修補小瑕疵，再調整色調與濾鏡。支援前後比較、單張 PNG 及批次 ZIP 下載。','Use brushes to soften skin and manually repair small blemishes with sampled pixels. Adjust colors and filters, compare before and after, and download PNG images or a batch ZIP.']},
  jupiter:{summary:['製作有風格的文字圖片','Create styled text images'],description:['輸入文字，選擇書法、金屬或霓虹等特效，調整橫排、直排與配色。下載透明 PNG，加入海報或簡報。','Enter text, choose calligraphy, metallic, or neon effects, and adjust its orientation and colors. Download a transparent PNG for posters or presentations.']},
  saturn:{summary:['手動拆分與編輯圖層','Split and edit image layers'],description:['手動圈選圖片區域，拆成可移動的透明圖層。調整大小、順序與透明度，也可匯入已分層的 PNG 或 ZIP，再匯出圖片與圖層 ZIP。','Manually select image regions to create movable transparent layers. Adjust their size, order, and opacity, or import existing PNG and ZIP layers. Export a combined image or a layer ZIP.']},
  uranus:{summary:['合併圖片成 PDF','Combine images into a PDF'],description:['將多張圖片合併成一份 PDF。調整圖片順序、紙張尺寸與壓縮品質，製作方便分享或列印的文件。','Combine multiple images into one PDF. Arrange their order, choose a page size, and adjust compression quality to create a document for sharing or printing.']},
  neptune:{summary:['編輯投影片，匯出 PPTX','Create slides and export PPTX'],description:['從主題或文字建立簡報大綱草稿，選擇版面與配色，編輯內容並加入圖片。匯出可繼續編輯的 PowerPoint（PPTX）。','Start a slide outline from a topic or text. Choose layouts and colors, edit the content, and add images. Export an editable PowerPoint file (PPTX).']},
  pluto:{summary:['製作名片與海報印刷稿','Prepare cards and posters for print'],description:['為名片、海報等設計印刷版面。設定尺寸、出血與安全邊界，加入圖片及文字，檢查圖片解析度後匯出 PDF。','Design print layouts for business cards and posters. Set dimensions, bleed, and safe margins, add images and text, check image resolution, and export a PDF.']},
  moon:{summary:['標誌與線稿轉成向量','Convert logos and line art to SVG'],description:['將標誌、圖示或線稿描繪成 SVG 向量圖。調整色數、輪廓平滑與雜點過濾，下載可在向量軟體中繼續編輯的 SVG。','Trace logos, icons, or line art into SVG vectors. Adjust the number of colors, contour smoothing, and noise filtering, then download an SVG for further editing in vector software.']},
}

if (!document.getElementById('pixora-universe-home')) {
  const home = document.createElement('section')
  home.id = 'pixora-universe-home'
  home.innerHTML = `<canvas class="pxu-canvas" tabindex="0" role="img"></canvas>
    <div class="pxu-shade"></div>
    <header class="pxu-top"><div class="pxu-brand">PIXORA<small>UNIVERSE / LOCAL IMAGE TOOLS</small></div><div class="pxu-status"><span class="pxu-local"></span><div class="pxu-lang"><button type="button" data-lang="zh">繁中</button><button type="button" data-lang="en">EN</button></div></div></header>
    <div class="pxu-copy"><p class="pxu-kicker">YOUR LOCAL IMAGE UNIVERSE</p><p class="pxu-planet"></p><h1 class="pxu-title"></h1><p class="pxu-desc"></p><button type="button" class="pxu-enter"></button><button type="button" class="pxu-cutout"></button><p class="pxu-trust"></p></div>
    <nav class="pxu-nav" aria-label="影像工具"><p class="pxu-nav-heading"></p><div class="pxu-nav-list"></div></nav>
    <footer class="pxu-bottom"><div><p class="pxu-help"></p><p class="pxu-note"></p></div><div class="pxu-controls"><button type="button" data-control="out">−</button><output class="pxu-zoom">100%</output><button type="button" data-control="in">＋</button><button type="button" data-control="reset"></button><button type="button" data-control="motion"></button></div></footer>`
  document.body.append(home)
  const station=document.createElement('button')
  station.className='pxu-station'
  station.innerHTML=`<svg viewBox="0 0 160 100" aria-hidden="true"><defs><linearGradient id="pxu-alloy" x2=".3" y2="1"><stop stop-color="#e3eff4"/><stop offset=".45" stop-color="#647e91"/><stop offset="1" stop-color="#172c40"/></linearGradient><linearGradient id="pxu-panel" x2="1" y2="1"><stop stop-color="#163756"/><stop offset="1" stop-color="#062034"/></linearGradient></defs><g transform="translate(80 46) rotate(-18)"><ellipse rx="35" ry="23" fill="none" stroke="#182f42" stroke-width="8"/><ellipse rx="35" ry="23" fill="none" stroke="url(#pxu-alloy)" stroke-width="5"/><path d="M-29-15 29 15M-29 15 29-15" stroke="#59768a" stroke-width="2"/><path d="M-67-21h23v40h-23zM44-21h23v40H44z" fill="url(#pxu-panel)" stroke="#4b819f" stroke-width=".8"/><path d="M-59-21v40m8-40v40m103-40v40m8-40v40M-67-11h23m-23 10h23m-23 10h23m88-20h23m-23 10h23m-23 10h23" stroke="#3d6886" stroke-width=".5"/><path d="M-44 0h88" stroke="#8ba7b6" stroke-width="4"/><rect x="-10" y="-20" width="20" height="40" rx="8" fill="url(#pxu-alloy)" stroke="#aac5d4" stroke-width=".6"/><path d="M-9-7H9M-9 9H9" stroke="#253f54" stroke-width="3"/><rect x="-5" y="-4" width="10" height="7" rx="2" fill="#13283b"/><path d="M-4-1h8" stroke="#8be4ef"/><circle cy="-24" r="2" fill="#8ce6e0"/><circle cx="35" r="1.5" fill="#86e1eb"/></g><path d="M79 78v8m-19 0h38" stroke="#547689" stroke-width=".6"/></svg><span></span>`
  home.append(station)
  const astronaut=document.createElement('button');astronaut.type='button';astronaut.className='pxu-astronaut';astronaut.setAttribute('aria-expanded','false')
  astronaut.innerHTML=`<svg viewBox="0 0 90 120" aria-hidden="true"><defs><linearGradient id="pxu-suit" x2="1" y2="1"><stop stop-color="#f3f8fa"/><stop offset=".5" stop-color="#b9cbd6"/><stop offset="1" stop-color="#526d83"/></linearGradient><linearGradient id="pxu-visor" x2="1" y2="1"><stop stop-color="#dcb977"/><stop offset=".45" stop-color="#5e4930"/><stop offset="1" stop-color="#132839"/></linearGradient></defs><g transform="rotate(-12 45 60)" stroke="#6a899e" stroke-width="1"><rect x="25" y="42" width="40" height="43" rx="10" fill="#425c72"/><path d="M33 49 19 64 12 59M58 49 69 37 73 24" fill="none" stroke="#bed2df" stroke-width="13" stroke-linecap="round"/><path d="M35 78 29 99 20 104M54 78 59 97 71 100" fill="none" stroke="#bfd2de" stroke-width="14" stroke-linecap="round"/><rect x="27" y="42" width="35" height="40" rx="11" fill="url(#pxu-suit)"/><path d="M31 71h27" stroke="#4c728b" stroke-width="4"/><rect x="34" y="53" width="21" height="13" rx="3" fill="#284a61"/><path d="M38 57h12m-12 5h5" stroke="#9ce8ed" stroke-width="2"/><circle cx="44" cy="30" r="23" fill="url(#pxu-suit)"/><rect x="26" y="15" width="36" height="28" rx="13" fill="url(#pxu-visor)"/><path d="M32 21q8-5 16-3" fill="none" stroke="#fff4d0" stroke-width="2" opacity=".6"/><circle cx="20" cy="31" r="3" fill="#94d5e3"/><path d="M15 58 10 55M72 24 73 18" stroke="#e2edf0" stroke-width="8" stroke-linecap="round"/></g></svg><span hidden>Lewis</span>`
  astronaut.onclick=()=>{const label=astronaut.querySelector('span');label.hidden=!label.hidden;astronaut.setAttribute('aria-expanded',String(!label.hidden))};home.append(astronaut)
  const moonDog=document.createElement('div');moonDog.className='pxu-moon-dog';moonDog.setAttribute('role','img');moonDog.innerHTML=`<svg viewBox="0 0 90 80" aria-hidden="true"><defs><linearGradient id="pxu-dog-suit" x2="1" y2="1"><stop stop-color="#e1edf4"/><stop offset="1" stop-color="#69859b"/></linearGradient></defs><path d="M68 48q19-22 8-25" fill="none" stroke="#d7b68b" stroke-width="7" stroke-linecap="round"/><ellipse cx="53" cy="47" rx="25" ry="15" fill="url(#pxu-dog-suit)" stroke="#64859b"/><path d="M41 55v12m22-12v12" stroke="#a3bac9" stroke-width="8" stroke-linecap="round"/><circle cx="30" cy="30" r="25" fill="#bde8fc14" stroke="#9fd5e7" stroke-width="1.5"/><path d="M18 16 12 29 21 34M39 16 45 29 37 34" fill="#8e6747"/><ellipse cx="29" cy="29" rx="14" ry="17" fill="#d7b68b"/><ellipse cx="29" cy="37" rx="10" ry="7" fill="#efe0c5"/><circle cx="24" cy="28" r="1.8" fill="#172535"/><circle cx="34" cy="28" r="1.8" fill="#172535"/><path d="M26 34q3-3 6 0l-3 3z" fill="#26303c"/><path d="M20 9q10-4 19 2" fill="none" stroke="#e2f5ff" stroke-width="2" opacity=".6"/><rect x="43" y="36" width="11" height="14" rx="3" fill="#38576c"/><circle cx="48" cy="41" r="2" fill="#a3eaff"/><path d="M14 71h65" stroke="#9bb3c34d" stroke-width="2" stroke-linecap="round"/></svg>`;home.append(moonDog)
  const launch=document.createElement('button');launch.className='pxu-launch';home.append(launch)
  const effects=document.createElement('button');effects.type='button';effects.className='pxu-effects';home.querySelector('.pxu-status').prepend(effects)
  let effectsEnabled=true,ambientTime=0
  try{effectsEnabled=localStorage.getItem('pixora-effects')!=='off'}catch{}
  effects.onclick=()=>{effectsEnabled=!effectsEnabled;try{localStorage.setItem('pixora-effects',effectsEnabled?'on':'off')}catch{}renderUI()}
  const toolDialog=document.createElement('dialog');toolDialog.className='pxu-tool-dialog';toolDialog.innerHTML='<header><div><small>PIXORA / SPACEPORT</small><h2></h2></div><button class="pxu-dialog-close" type="button"></button></header><div class="pxu-dialog-tools"></div>';home.append(toolDialog)
  let stationPoint={x:0,y:0},shipWorld=null,shipHeading=0,shipTravel=0,flightTime=0,rocketTime=null,manualPaused=false
  station.onclick=()=>toolDialog.showModal()
  toolDialog.querySelector('.pxu-dialog-close').onclick=()=>toolDialog.close()
  toolDialog.setAttribute('aria-label','太空發射站工具選單')
  launch.onclick=()=>{if(reduced.matches||w<760){rocketTime=null;toolDialog.showModal();return}rocketTime=0;manualPaused=false;moving=true;renderUI()}
  document.documentElement.classList.add('pxu-open')
  document.body.classList.add('pxu-open')
  let lang = 'zh'
  try { lang = localStorage.getItem('pixora-lang') === 'en' ? 'en' : 'zh' } catch {}
  let active = planets.findIndex(p=>p.id==='earth')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let moving = !reduced.matches, yaw = -.22, pitch = .62, zoom = 1, w = 0, h = 0, hit = [], raf = 0, destroyed = false
  const canvas = home.querySelector('canvas'), ctx = canvas.getContext('2d')
  const pointers = new Map()
  let gesture = null
  const nav = home.querySelector('.pxu-nav-list')
  for (const [i,p] of planets.entries()) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.planet = p.id
    button.innerHTML = `<i style="--planet:${p.color}"></i><span></span><small></small>`
    button.onclick = ()=>select(i)
    nav.append(button)
  }
  function text(selector,value){home.querySelector(selector).textContent=value}
  function renderUI(){
    const p = planets[active], zh = lang==='zh'
    home.dataset.language=lang
    astronaut.setAttribute('aria-label',zh?'太空人：點擊顯示 Lewis':'Astronaut: click to reveal Lewis')
    moonDog.setAttribute('aria-label',zh?'月球上的太空狗':'A space dog on the Moon')
    effects.textContent=zh?`動態效果 ${effectsEnabled?'開':'關'}`:`Effects ${effectsEnabled?'on':'off'}`
    effects.setAttribute('aria-pressed',String(effectsEnabled))
    toolDialog.setAttribute('aria-label',zh?'太空發射站工具選單':'Spaceport tool menu')
    station.setAttribute('aria-label',zh?'太空發射站：查看所有工具':'Spaceport: view all tools')
    station.querySelector('span').textContent=zh?'發射站':'SPACEPORT'
    launch.textContent=zh?'開始探索 ↗':'Launch exploration ↗'
    toolDialog.querySelector('h2').textContent=zh?'選擇你的目的地':'Choose your destination'
    toolDialog.querySelector('.pxu-dialog-close').textContent=zh?'關閉':'Close'
    toolDialog.querySelector('.pxu-dialog-tools').replaceChildren(...[
      {title:zh?'修圖與圖片處理':'Photo editing',ids:['earth','mars','saturn','moon']},
      {title:zh?'色彩與創作':'Color and design',ids:['mercury','venus','jupiter']},
      {title:zh?'文件與排版':'Documents and layouts',ids:['uranus','neptune','pluto']}
    ].map(group=>{const section=document.createElement('section');const heading=document.createElement('h3');heading.textContent=group.title;section.append(heading);for(const id of group.ids){const i=planets.findIndex(p=>p.id===id),destination=planets[i],button=document.createElement('button'),title=document.createElement('b'),summary=document.createElement('small');title.textContent=zh?destination.toolZh:destination.toolEn;summary.textContent=toolCopy[id].summary[zh?0:1];button.append(title,summary);button.onclick=()=>{toolDialog.close();select(i);home.querySelector('.pxu-enter').focus({preventScroll:true})};section.append(button)}return section}))
    text('.pxu-planet',zh?p.zh:p.en)
    text('.pxu-title',zh?p.toolZh:p.toolEn)
    text('.pxu-desc',toolCopy[p.id].description[zh?0:1])
    const enter=home.querySelector('.pxu-enter')
    enter.disabled=!p.available
    enter.textContent=zh?'開啟工具 ↗':'Open tool ↗'
    const cutout=home.querySelector('.pxu-cutout')
    cutout.hidden=p.available
    cutout.textContent=zh?'先使用 AI 去背 →':'Try AI Cutout →'
    text('.pxu-trust',p.id==='mercury'?(zh?'本機色調分析免費 · AI 辨識需啟用服務':'Free local color analysis · AI recognition requires setup'):(zh?'瀏覽器本機處理 · 免費使用 · 無需註冊':'Processed in your browser · Free to use · No account'))
    text('.pxu-local',p.id==='mercury'?(zh?'啟用 AI 辨識時，圖片會傳送至 OpenAI':'AI recognition sends images to OpenAI'):(zh?'圖片留在你的裝置':'Your images stay on your device'))
    text('.pxu-nav-heading',zh?'選擇圖片工具':'Choose an image tool')
    home.querySelector('.pxu-nav').setAttribute('aria-label',zh?'圖片工具':'Image tools')
    const touch=matchMedia('(pointer:coarse)').matches
    text('.pxu-help',zh?(touch?'單指旋轉 · 雙指縮放 · 點選行星':'拖曳探索 360° · 滾輪縮放 · 點擊行星'):(touch?'Drag to rotate · Pinch to zoom · Tap a planet':'Drag to explore 360° · Scroll to zoom · Select a planet'))
    text('.pxu-note',zh?'八大行星 + 冥王星 · 月球是地球的衛星 · 大小與距離為示意':'Eight planets + Pluto · Moon is Earth’s satellite · Sizes and distances are illustrative')
    canvas.setAttribute('aria-label',zh?'互動太陽系，方向鍵旋轉，加減鍵縮放。也可使用工具選單選擇行星。':'Interactive solar system. Arrow keys rotate, plus and minus zoom. Use the tool menu to select planets.')
    home.querySelector('[data-control="reset"]').textContent=zh?'重設視角':'Reset view'
    const motion=home.querySelector('[data-control="motion"]')
    motion.textContent=moving?(zh?'暫停自轉':'Pause rotation'):(zh?'開始自轉':'Start rotation')
    motion.setAttribute('aria-pressed',String(moving))
    home.querySelector('[data-control="out"]').setAttribute('aria-label',zh?'縮小':'Zoom out')
    home.querySelector('[data-control="in"]').setAttribute('aria-label',zh?'放大':'Zoom in')
    text('.pxu-zoom',`${Math.round(zoom*100)}%`)
    nav.querySelectorAll('button').forEach((b,i)=>{
      b.classList.toggle('active',i===active)
      b.setAttribute('aria-pressed',String(i===active))
      b.querySelector('span').textContent=zh?planets[i].toolZh:planets[i].toolEn
      b.querySelector('small').textContent=toolCopy[planets[i].id].summary[zh?0:1]
      b.title=(zh?planets[i].zh:planets[i].en)+' · '+toolCopy[planets[i].id].description[zh?0:1]
    })
    home.querySelectorAll('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))})
  }
  function pause(){moving=false;renderUI()}
  function select(i){active=i;shipTravel=0;flightTime=0;pause()}
  function setZoom(value){zoom=Math.max(.55,Math.min(2.2,value));renderUI()}
  home.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem('pixora-lang',lang)}catch{}renderUI()})
  function enterTool(){
    destroyed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();reduced.removeEventListener('change',motionPreference)
    home.remove();document.documentElement.classList.remove('pxu-open');document.body.classList.remove('pxu-open')
    // Restore keyboard focus as well as visibility when leaving the overlay.
    document.getElementById('idle')?.scrollIntoView({behavior:'instant',block:'start'})
    document.getElementById('fileInput')?.focus({preventScroll:true})
  }
  home.querySelector('.pxu-enter').onclick=()=>{
    if(planets[active].id==='mars'){pause();openPortraitStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='saturn'){pause();openLayerStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='mercury'){pause();openPromptStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='moon'){pause();openVectorStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='venus'){pause();openColorStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='jupiter'){pause();openFontStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='neptune'){pause();openPresentationStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='pluto'){pause();openPrintStudio(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].id==='uranus'){pause();openImageToPdf(()=>home.querySelector('.pxu-enter')?.focus());return}
    if(planets[active].available)enterTool()
  }
  home.querySelector('.pxu-cutout').onclick=enterTool
  home.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>{
    const c=b.dataset.control
    if(c==='in'||c==='out'){pause();setZoom(zoom*(c==='in'?1.15:1/1.15))}
    if(c==='reset'){yaw=-.22;pitch=.62;zoom=1;active=2;shipWorld=null;rocketTime=null;manualPaused=false;moving=!reduced.matches;renderUI()}
    if(c==='motion'){moving=!moving;manualPaused=!moving;renderUI()}
  })
  function motionPreference(){if(reduced.matches)pause()}
  reduced.addEventListener('change',motionPreference)
  function resize(){
    w=home.clientWidth;h=home.clientHeight
    const dpr=Math.min(devicePixelRatio||1,2)
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(home);resize()
  canvas.addEventListener('wheel',e=>{e.preventDefault();pause();setZoom(zoom*Math.exp(-e.deltaY*.001))},{passive:false})
  function startGesture(){
    const points=[...pointers.values()]
    gesture={yaw,pitch,zoom,x:points[0].x,y:points[0].y,travel:0,distance:points.length>1?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):0,multi:points.length>1}
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return
    pause();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});startGesture();canvas.classList.add('dragging')
  })
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId))return
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY})
    const points=[...pointers.values()]
    if(points.length>1){const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);if(gesture.distance)setZoom(gesture.zoom*distance/gesture.distance);gesture.multi=true}
    else {const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture.travel=Math.max(gesture.travel,Math.hypot(dx,dy));yaw=gesture.yaw+dx*.006;pitch=Math.max(-1.35,Math.min(1.35,gesture.pitch+dy*.006))}
  })
  function release(e,cancelled=false){
    if(!pointers.has(e.pointerId))return
    const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top
    if(!cancelled&&pointers.size===1&&!gesture.multi&&gesture.travel<7){const target=[...hit].reverse().find(p=>Math.hypot(x-p.x,y-p.y)<Math.max(p.r+6,14));if(target&&target.index>=0)select(target.index)}
    const multi=gesture.multi
    pointers.delete(e.pointerId)
    if(pointers.size){startGesture();gesture.multi=multi}else{gesture=null;canvas.classList.remove('dragging')}
  }
  canvas.addEventListener('pointerup',e=>release(e))
  canvas.addEventListener('pointercancel',e=>release(e,true))
  canvas.addEventListener('lostpointercapture',e=>release(e,true))
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key))return
    e.preventDefault();pause()
    if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12
    if(e.key==='ArrowUp')pitch=Math.max(-1.35,pitch-.12);if(e.key==='ArrowDown')pitch=Math.min(1.35,pitch+.12)
    if(e.key==='+'||e.key==='=')setZoom(zoom*1.15);if(e.key==='-')setZoom(zoom/1.15)
    if(e.key==='0'){yaw=-.22;pitch=.62;setZoom(1)}
  })
  const stars=Array.from({length:320},(_,i)=>({x:random(i+1),y:random(i+500),a:.25+random(i+900)*.65}))
  function random(seed){const v=Math.sin(seed*127.1)*43758.5453;return v-Math.floor(v)}
  function project(x,y,z){
    const xx=x*Math.cos(yaw)-z*Math.sin(yaw),zz=x*Math.sin(yaw)+z*Math.cos(yaw)
    const yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch)
    const perspective=14/(14+depth),mobile=w<760,unit=Math.min(w*(mobile?.073:.057),h*(mobile?.073:.093))*zoom
    return {x:w*(mobile?.50:.61)+xx*unit*perspective,y:h*(mobile?.32:.47)+yy*unit*perspective,scale:unit*perspective,depth}
  }
  function body(p){
    const {x,y,r,world}=p
    const sunPosition=project(0,0,0),lightAngle=Math.atan2(sunPosition.y-y,sunPosition.x-x)
    if(world.id==='sun'){
      const pulse=1+Math.sin(ambientTime*.001)*.12,extent=r*5.8*pulse,halo=ctx.createRadialGradient(x,y,r*.6,x,y,extent)
      halo.addColorStop(0,'#ffd071bd');halo.addColorStop(.2,'#ffa13970');halo.addColorStop(.5,'#ed792526');halo.addColorStop(1,'#ffb45900');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,extent,0,Math.PI*2);ctx.fill()
    }
    const gradient=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.04,x,y,r)
    gradient.addColorStop(0,world.id==='sun'?'#fff2b3':'#e7f8ff');gradient.addColorStop(.23,world.color);gradient.addColorStop(.7,world.color);gradient.addColorStop(1,world.id==='sun'?'#cf6a20':'#071321')
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()
    ctx.save();ctx.beginPath();ctx.arc(x,y,r*.97,0,Math.PI*2);ctx.clip()
    if(world.id==='earth'){
      ctx.fillStyle='#54ba9d';for(let i=0;i<16;i++){const angle=random(i+2)*6.28,rr=random(i+40)*r*.78;ctx.beginPath();ctx.ellipse(x+Math.cos(angle)*rr,y+Math.sin(angle)*rr,r*(.07+random(i+70)*.15),r*.09,angle,0,Math.PI*2);ctx.fill()}
      ctx.strokeStyle='#ddf6ff77';ctx.lineWidth=Math.max(1,r*.04);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y+(i-1)*r*.35,r*.9,r*.12,-.3,0,Math.PI*2);ctx.stroke()}
    }
    if(world.id==='jupiter'||world.id==='saturn'){for(let i=-6;i<7;i++){ctx.fillStyle=i%2?'#76584744':'#fff1d733';ctx.fillRect(x-r,y+i*r*.14,r*2,r*.07)}}
    if(world.id!=='sun'){
      const lx=Math.cos(lightAngle),ly=Math.sin(lightAngle),shade=ctx.createLinearGradient(x+lx*r,y+ly*r,x-lx*r,y-ly*r)
      shade.addColorStop(0,'#ffd9a316');shade.addColorStop(.35,'#03101a05');shade.addColorStop(.7,'#02091690');shade.addColorStop(1,'#01040cd9');ctx.fillStyle=shade;ctx.fillRect(x-r,y-r,r*2,r*2)
    }else{
      for(let i=0;i<24;i++){const a=random(i+3300)*6.28+ambientTime*.00004,d=Math.sqrt(random(i+3400))*r*.84;ctx.fillStyle=i%2?'#ffe5a63b':'#e9712727';ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,Math.max(.6,r*.06),0,6.28);ctx.fill()}
    }
    ctx.restore()
    if(world.id==='earth'){ctx.strokeStyle='#70ceff80';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r+1.7,0,6.28);ctx.stroke()}
    if(world.id==='saturn'||world.id==='uranus'){ctx.strokeStyle=world.id==='saturn'?'#e5d3a8b0':'#a8f2ef80';ctx.lineWidth=Math.max(1,r*.10);ctx.beginPath();ctx.ellipse(x,y,r*1.9,r*.5,-.32,0,Math.PI*2);ctx.stroke()}
    if(p.index===active){ctx.strokeStyle='#80e6ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,r+6,0,Math.PI*2);ctx.stroke()}
    if(world.id!=='sun'&&(world.id!=='moon'||p.index===active)){
      ctx.font=`${w<760?10:12}px Arial`;ctx.textAlign='center';ctx.fillStyle=p.index===active?'#b4f1ff':'#c3d8e8';ctx.fillText(lang==='zh'?world.zh:world.en,x,y+r+19)
    }
  }
  let lastTime=0,rotation=0
  function drawShuttle(x,y,angle,scale,thrust){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale)
    const shape=(points,fill,stroke='#7994a5')=>{ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke()}
    if(thrust){for(const side of [-1,1]){const plume=ctx.createLinearGradient(-19,0,-45,0);plume.addColorStop(0,'#c8f9ffb0');plume.addColorStop(.3,'#51c9f560');plume.addColorStop(1,'#51c9f500');shape([[-18,side*7-2],[-45,side*7],[-18,side*7+2]],plume,'transparent')}}
    const metal=ctx.createLinearGradient(0,-18,0,18);metal.addColorStop(0,'#bed0db');metal.addColorStop(.4,'#708a9b');metal.addColorStop(1,'#1b3449')
    shape([[15,0],[-16,-23],[-12,-8],[-22,-6],[-22,6],[-12,8],[-16,23]],metal)
    shape([[-12,-18],[-2,-5],[-8,-6]],'#1c3549');shape([[-12,18],[-2,5],[-8,6]],'#1c3549')
    const hull=ctx.createLinearGradient(0,-6,0,6);hull.addColorStop(0,'#f3f6f5');hull.addColorStop(.48,'#a7bbc7');hull.addColorStop(1,'#405b70')
    ctx.beginPath();ctx.moveTo(26,0);ctx.bezierCurveTo(16,-8,-2,-7,-20,-5);ctx.lineTo(-20,5);ctx.bezierCurveTo(-2,7,16,8,26,0);ctx.fillStyle=hull;ctx.fill();ctx.strokeStyle='#b4c7d0';ctx.stroke()
    shape([[15,0],[8,-3],[3,-2],[3,2],[8,3]],'#0b2337','#789fad')
    ctx.strokeStyle='#b7e7ed';ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(12,0);ctx.stroke()
    ctx.fillStyle='#172e40';ctx.fillRect(-21,-9,6,4);ctx.fillRect(-21,5,6,4)
    ctx.fillStyle='#a3eef1';ctx.fillRect(-22,-8,2,2);ctx.fillRect(-22,6,2,2)
    ctx.strokeStyle='#546c7c';ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(0,0);ctx.stroke();ctx.restore()
  }
  function drawRocket(x,y,progress){
    ctx.save();ctx.translate(x,y-progress*200);ctx.rotate(.12);ctx.globalAlpha=Math.min(1,(1-progress)*5)
    const metal=ctx.createLinearGradient(-6,0,6,0);metal.addColorStop(0,'#4f687c');metal.addColorStop(.38,'#e4edf0');metal.addColorStop(.7,'#a6bcc9');metal.addColorStop(1,'#314b60')
    ctx.fillStyle='#355269';ctx.beginPath();ctx.moveTo(-4,7);ctx.lineTo(-11,20);ctx.lineTo(-3,17);ctx.moveTo(4,7);ctx.lineTo(11,20);ctx.lineTo(3,17);ctx.fill()
    ctx.beginPath();ctx.moveTo(0,-32);ctx.bezierCurveTo(-5,-27,-5,-20,-5,-15);ctx.lineTo(-5,17);ctx.lineTo(5,17);ctx.lineTo(5,-15);ctx.bezierCurveTo(5,-20,5,-27,0,-32);ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle='#97b2c1';ctx.lineWidth=.6;ctx.stroke()
    ctx.fillStyle='#172f43';ctx.fillRect(-5,-14,10,4);ctx.fillRect(-5,8,10,2);ctx.fillRect(-3,17,6,3)
    ctx.fillStyle='#76cbdc';ctx.fillRect(-1,-7,2,9)
    if(progress>0){const flame=ctx.createLinearGradient(0,20,0,62);flame.addColorStop(0,'#fff4d5');flame.addColorStop(.2,'#9ce6fb');flame.addColorStop(.55,'#309ddd90');flame.addColorStop(1,'#309ddd00');ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(-3,20);ctx.quadraticCurveTo(-6,33,0,62+Math.sin(progress*90)*4);ctx.quadraticCurveTo(6,33,3,20);ctx.fill()}
    ctx.restore()
  }
  function frame(t){
    if(destroyed||!home.isConnected)return
    const dt=Math.min(t-lastTime,50);lastTime=t
    if(effectsEnabled&&!reduced.matches&&!manualPaused&&!document.hidden&&!home.hasAttribute('inert'))ambientTime+=dt
    if(moving&&!document.hidden){yaw+=dt*.000025;rotation+=dt*.000008}
    ctx.clearRect(0,0,w,h)
    for(let i=0;i<stars.length;i++){
      if(w<760&&i%2)continue
      const s=stars[i],layer=i%3,shift=layer===0?4:layer===1?13:28,drift=ambientTime*.0000008*layer
      const sx=((s.x*w+Math.sin(yaw)*shift+drift*w)%w+w)%w,sy=((s.y*h+Math.sin(pitch)*shift*.6)%h+h)%h
      const alpha=s.a*(.75+.25*Math.sin(ambientTime*.0009+i)),size=layer===2?2.1:1.2
      ctx.fillStyle=`rgba(170,220,250,${alpha})`;ctx.beginPath();ctx.arc(sx,sy,size/2,0,6.28);ctx.fill()
      if(i%31===0){ctx.strokeStyle=`rgba(183,226,255,${alpha*.35})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke()}
    }
    for(const p of planets.filter(p=>p.orbit)){
      ctx.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,q=project(Math.cos(a)*p.orbit,0,Math.sin(a)*p.orbit);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y)}
      ctx.strokeStyle=p.id===planets[active].id?'#70dfff55':'#75b9dd22';ctx.lineWidth=1;ctx.stroke()
    }
    const positions=planets.map((p,index)=>{
      const angle=p.angle+rotation/(.5+p.orbit*.12),x=Math.cos(angle)*p.orbit,z=Math.sin(angle)*p.orbit
      return {world:p,index,worldX:x,worldZ:z,...project(x,0,z)}
    })
    const earth=positions[2],moon=positions[9],ma=rotation*5+.8
    Object.assign(moon,project(earth.worldX+Math.cos(ma)*.9,Math.sin(ma)*.20,earth.worldZ+Math.sin(ma)*.9))
    const sun={world:{id:'sun',color:'#ffb94c',radius:.32},index:-1,...project(0,0,0)}
    hit=[sun,...positions].map(p=>({...p,r:Math.max(p.world.radius*p.scale*(p.index===active?(w<760?1.8:2.4):1),p.index===9?(w<760?4:7):4)})).sort((a,b)=>b.depth-a.depth)
    hit.forEach(body)
    const lunar=hit.find(p=>p.index===9)
    moonDog.style.left=`${lunar.x}px`;moonDog.style.top=`${lunar.y-lunar.r+6}px`
    const walker=project(earth.worldX-1.3,.8,earth.worldZ+.7)
    astronaut.style.left=`${walker.x}px`;astronaut.style.top=`${walker.y+Math.sin(ambientTime*.001)*3}px`
    const target=positions[active],animate=!reduced.matches&&!manualPaused&&!document.hidden&&!home.hasAttribute('inert')
    if(animate){flightTime+=dt;shipTravel+=dt}
    const cruise=moving?flightTime*.0008:0,goal={x:target.worldX+Math.cos(cruise)*.95,z:target.worldZ+Math.sin(cruise)*.95,y:.45}
    if(active===9){goal.x=earth.worldX+.55;goal.z=earth.worldZ+.2}
    if(!shipWorld||reduced.matches)shipWorld={...goal}
    const old=project(shipWorld.x,shipWorld.y,shipWorld.z),ease=animate?1-Math.exp(-dt*.003):0
    shipWorld.x+=(goal.x-shipWorld.x)*ease;shipWorld.z+=(goal.z-shipWorld.z)*ease;shipWorld.y+=(goal.y-shipWorld.y)*ease
    const craft=project(shipWorld.x,shipWorld.y,shipWorld.z),distance=Math.hypot(craft.x-old.x,craft.y-old.y)
    if(distance>.02)shipHeading=Math.atan2(craft.y-old.y,craft.x-old.x)
    drawShuttle(craft.x,craft.y,shipHeading,w<760?.7:1.1,animate&&(moving||shipTravel<1600))
    const dock=project(earth.worldX+.7,.05,earth.worldZ-.5)
    stationPoint={x:dock.x+28,y:dock.y+80}
    station.style.left=`${stationPoint.x}px`;station.style.top=`${stationPoint.y}px`
    if(w>=760){if(rocketTime!==null){if(animate)rocketTime+=dt;drawRocket(stationPoint.x+72,stationPoint.y-8,Math.min(1,rocketTime/2400));if(rocketTime>=2400)rocketTime=null}else drawRocket(stationPoint.x+72,stationPoint.y-8,0)}
    raf=requestAnimationFrame(frame)
  }
  renderUI();raf=requestAnimationFrame(frame)
}
