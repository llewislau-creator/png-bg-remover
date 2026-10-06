import { openPortraitStudio } from './portrait-studio.js'
import { openLayerStudio } from './layer-studio.js'
import { openPromptStudio } from './prompt-extractor.js'
import './pixora-universe.css'
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
  ['earth','地球','Earth','AI 去背','AI Cutout','#319bde',1.53,.17,true],
  ['mars','火星','Mars','人像修飾','Portrait Retouch','#cb6348',1.95,.12,true],
  ['jupiter','木星','Jupiter','字體特效','Font Effects','#d8b494',2.55,.29,true],
  ['saturn','土星','Saturn','圖片分層','Layer Studio','#ddc592',3.25,.24,true],
  ['uranus','天王星','Uranus','圖片轉 PDF','Image to PDF','#87d7de',3.98,.18,true],
  ['neptune','海王星','Neptune','簡報工作台','Presentation Studio','#557ee4',4.65,.18,true],
  ['pluto','冥王星 · 矮行星','Pluto · Dwarf planet','印刷工作台','Print Studio','#aa9a91',5.25,.08,true],
  ['moon','月球','Moon','圖片轉向量','Image to SVG','#c7d1db',0,.055,true],
].map(([id,zh,en,toolZh,toolEn,color,orbit,radius,available],i)=>({id,zh,en,toolZh,toolEn,color,orbit,radius,available,angle:i*2.399}))

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
  station.innerHTML=`<svg viewBox="0 0 80 48" aria-hidden="true"><g fill="#11374e" stroke="#88d6ef" stroke-width="1.2"><path d="M2 13h22v22H2zM56 13h22v22H56z"/><path d="M9 13v22m8-22v22M63 13v22m8-22v22M2 24h22m32 0h22"/><path d="M24 21h32v6H24z"/><ellipse cx="40" cy="24" rx="13" ry="17" fill="#d3edf4"/><ellipse cx="40" cy="24" rx="7" ry="11" fill="#1b536b"/></g><circle cx="40" cy="24" r="3" fill="#86f9db"/></svg><span></span>`
  home.append(station)
  const launch=document.createElement('button');launch.className='pxu-launch';home.append(launch)
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
    toolDialog.setAttribute('aria-label',zh?'太空發射站工具選單':'Spaceport tool menu')
    station.setAttribute('aria-label',zh?'太空發射站：查看所有工具':'Spaceport: view all tools')
    station.querySelector('span').textContent=zh?'發射站':'SPACEPORT'
    launch.textContent=zh?'開始探索 ↗':'Launch exploration ↗'
    toolDialog.querySelector('h2').textContent=zh?'選擇你的目的地':'Choose your destination'
    toolDialog.querySelector('.pxu-dialog-close').textContent=zh?'關閉':'Close'
    toolDialog.querySelector('.pxu-dialog-tools').replaceChildren(...planets.map((destination,i)=>{const button=document.createElement('button');button.type='button';button.textContent=(zh?destination.zh:destination.en)+' / '+(zh?destination.toolZh:destination.toolEn);button.onclick=()=>{toolDialog.close();select(i);home.querySelector('.pxu-enter').focus({preventScroll:true})};return button}))
    text('.pxu-planet',zh?p.zh:p.en)
    text('.pxu-title',zh?p.toolZh:p.toolEn)
    text('.pxu-desc',p.id==='pluto'?(zh?'為名片、海報與活動物料準備印刷稿。選擇尺寸、加入素材、檢查出血與解析度，再匯出 PDF。':'Prepare business cards, posters and event print layouts. Choose a size, add artwork, check bleed and resolution, then export PDF.'):p.id==='uranus'?(zh?'把圖片排成一份 PDF。調整頁面順序、紙張尺寸與檔案容量，全程留在你的瀏覽器。':'Arrange images into a PDF. Set page order, paper size and file size, all in your browser.'):p.available?(zh?'免費移除背景，保留你想要的主體。圖片直接在瀏覽器內處理，無需註冊。':'Remove backgrounds for free. Keep your subject, with images processed in your browser. No account required.'):(zh?`${p.toolZh}工具正在準備中。你可以繼續探索太陽系，或先使用免費 AI 去背。`:`${p.toolEn} is coming soon. Explore the solar system or try free AI background removal.`))
    if(p.id==='mercury')text('.pxu-desc',zh?'從照片整理中英文提示詞、負面提示詞、主色與光線。支援本機色調分析，接入 OpenAI 後可自動辨識主體與場景。':'Compose bilingual prompts, negative prompts, colors and lighting from photos. Local tone analysis works now; OpenAI enables subject and scene analysis.')
    if(p.id==='saturn')text('.pxu-desc',zh?'手動圈選素材，拆成可移動的透明圖層。匯入 AI 分層結果、調整順序與大小，再下載 PNG 或圖層 ZIP。全程本機處理，不設次數限制。':'Select regions into movable transparent layers. Import AI layers, edit their order and size, and export PNG or ZIP locally without usage quotas.')
    if(p.id==='mars')text('.pxu-desc',zh?'用局部柔化與取樣筆刷手動修飾人像。調整色調、比較前後效果，再批次下載。圖片全程留在瀏覽器。':'Retouch portraits with local softening and a sample brush. Adjust colors, compare before and after, and export batches locally.')
    const enter=home.querySelector('.pxu-enter')
    if(p.id==='moon')text('.pxu-desc',zh?'將標誌、圖示或線稿轉成可編輯的 SVG。調整色數、輪廓平滑與雜點過濾，全程在本機處理。':'Convert logos, icons or line art into editable SVG. Adjust colors, contours and noise filtering locally.')
    if(p.id==='venus')text('.pxu-desc',zh?'從圖片擷取主色，查看色碼與比例，建立你的色彩索引。圖片留在瀏覽器，可下載色票、CSS 或 JSON。':'Extract colors and proportions from an image. Keep your image in the browser and export palettes, CSS or JSON.')
    if(p.id==='jupiter')text('.pxu-desc',zh?'讓文字有自己的風格。挑選書法、金屬與霓虹特效，切換橫排或直排，再下載透明 PNG。':'Style your text with calligraphy, metallic and neon effects. Choose horizontal or vertical text and download transparent PNG.')
    if(p.id==='neptune')text('.pxu-desc',zh?'輸入主題或匯入文字，建立大綱草稿。挑選配色、編輯內容與圖片，再匯出可編輯的 PowerPoint。':'Build an outline from a topic or text. Edit your slides and export editable PowerPoint.')
    enter.disabled=!p.available
    enter.textContent=p.id==='pluto'?(zh?'開啟印刷工作台 ↗':'Open Print Studio ↗'):p.id==='uranus'?(zh?'開啟 PDF 工作台 ↗':'Open PDF studio ↗'):p.available?(zh?'開始去背 ↗':'Start removing backgrounds ↗'):(zh?'即將推出':'Coming soon')
    if(p.id==='mercury')enter.textContent=zh?'開啟提示詞工作台 ↗':'Open Prompt Studio ↗'
    if(p.id==='saturn')enter.textContent=zh?'開啟分層工作台 ↗':'Open Layer Studio ↗'
    if(p.id==='mars')enter.textContent=zh?'開啟人像工作台 ↗':'Open Portrait Studio ↗'
    const cutout=home.querySelector('.pxu-cutout')
    if(p.id==='moon')enter.textContent=zh?'開啟向量工作台 ↗':'Open Vector Studio ↗'
    if(p.id==='venus')enter.textContent=zh?'開啟色彩工作台 ↗':'Open Color Studio ↗'
    if(p.id==='jupiter')enter.textContent=zh?'開啟字體工作台 ↗':'Open Font Studio ↗'
    if(p.id==='neptune')enter.textContent=zh?'開啟簡報工作台 ↗':'Open Presentation Studio ↗'
    cutout.hidden=p.available
    cutout.textContent=zh?'先使用 AI 去背 →':'Try AI Cutout →'
    text('.pxu-trust',p.id==='mercury'?(zh?'本機分析免費 · AI 分析需服務設定':'Free local analysis · AI requires service setup'):(zh?'本地處理 · 免費核心功能 · 無需帳號':'Local processing · Free core · No account'))
    text('.pxu-local',p.id==='mercury'?(zh?'AI 分析需傳送圖片至 OpenAI':'AI analysis sends an image to OpenAI'):(zh?'圖片留在你的裝置':'Your images stay on your device'))
    text('.pxu-nav-heading',zh?'探索影像工具':'Explore image tools')
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
      b.querySelector('small').textContent=(zh?planets[i].zh:planets[i].en)+(planets[i].available?'':(zh?' · 即將推出':' · Soon'))
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
  const stars=Array.from({length:180},(_,i)=>({x:random(i+1),y:random(i+500),a:.12+random(i+900)*.5}))
  function random(seed){const v=Math.sin(seed*127.1)*43758.5453;return v-Math.floor(v)}
  function project(x,y,z){
    const xx=x*Math.cos(yaw)-z*Math.sin(yaw),zz=x*Math.sin(yaw)+z*Math.cos(yaw)
    const yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch)
    const perspective=14/(14+depth),mobile=w<760,unit=Math.min(w*(mobile?.070:.049),h*(mobile?.068:.077))*zoom
    return {x:w*(mobile?.50:.61)+xx*unit*perspective,y:h*(mobile?.32:.47)+yy*unit*perspective,scale:unit*perspective,depth}
  }
  function body(p){
    const {x,y,r,world}=p
    if(world.id==='sun'){const halo=ctx.createRadialGradient(x,y,r*.2,x,y,r*3.5);halo.addColorStop(0,'#ffc87599');halo.addColorStop(1,'#ffb45900');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*3.5,0,Math.PI*2);ctx.fill()}
    const gradient=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.04,x,y,r)
    gradient.addColorStop(0,world.id==='sun'?'#fff2b3':'#e7f8ff');gradient.addColorStop(.23,world.color);gradient.addColorStop(.7,world.color);gradient.addColorStop(1,world.id==='sun'?'#cf6a20':'#071321')
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()
    ctx.save();ctx.beginPath();ctx.arc(x,y,r*.97,0,Math.PI*2);ctx.clip()
    if(world.id==='earth'){
      ctx.fillStyle='#54ba9d';for(let i=0;i<16;i++){const angle=random(i+2)*6.28,rr=random(i+40)*r*.78;ctx.beginPath();ctx.ellipse(x+Math.cos(angle)*rr,y+Math.sin(angle)*rr,r*(.07+random(i+70)*.15),r*.09,angle,0,Math.PI*2);ctx.fill()}
      ctx.strokeStyle='#ddf6ff77';ctx.lineWidth=Math.max(1,r*.04);for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y+(i-1)*r*.35,r*.9,r*.12,-.3,0,Math.PI*2);ctx.stroke()}
    }
    if(world.id==='jupiter'||world.id==='saturn'){for(let i=-6;i<7;i++){ctx.fillStyle=i%2?'#76584744':'#fff1d733';ctx.fillRect(x-r,y+i*r*.14,r*2,r*.07)}}
    ctx.restore()
    if(world.id==='saturn'||world.id==='uranus'){ctx.strokeStyle=world.id==='saturn'?'#e5d3a8b0':'#a8f2ef80';ctx.lineWidth=Math.max(1,r*.10);ctx.beginPath();ctx.ellipse(x,y,r*1.9,r*.5,-.32,0,Math.PI*2);ctx.stroke()}
    if(p.index===active){ctx.strokeStyle='#80e6ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,r+6,0,Math.PI*2);ctx.stroke()}
    if(world.id!=='sun'&&(world.id!=='moon'||p.index===active)){
      ctx.font=`${w<760?10:12}px Arial`;ctx.textAlign='center';ctx.fillStyle=p.index===active?'#b4f1ff':'#c3d8e8';ctx.fillText(lang==='zh'?world.zh:world.en,x,y+r+19)
    }
  }
  let lastTime=0,rotation=0
  function drawShuttle(x,y,angle,scale,thrust){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.shadowColor='#70dfff';ctx.shadowBlur=9;ctx.strokeStyle='#90d4e7';ctx.lineWidth=.8;if(thrust){const glow=ctx.createLinearGradient(-14,0,-31,0);glow.addColorStop(0,'#b9faff');glow.addColorStop(1,'#4fbaff00');ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(-12,-4);ctx.lineTo(-32,0);ctx.lineTo(-12,4);ctx.fill()}ctx.fillStyle='#477994';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-13,-15);ctx.lineTo(-8,-3);ctx.lineTo(-8,3);ctx.lineTo(-13,15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d8eef5';ctx.beginPath();ctx.moveTo(18,0);ctx.quadraticCurveTo(7,-7,-13,-5);ctx.lineTo(-13,5);ctx.quadraticCurveTo(7,7,18,0);ctx.fill();ctx.stroke();ctx.fillStyle='#153d55';ctx.beginPath();ctx.ellipse(6,0,4,3,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  function drawRocket(x,y,progress){ctx.save();ctx.translate(x,y-progress*160);ctx.globalAlpha=Math.min(1,(1-progress)*4);ctx.shadowColor='#6edaff';ctx.shadowBlur=9;ctx.fillStyle='#e6f5fa';ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(-8,-10,-6,11);ctx.lineTo(6,11);ctx.quadraticCurveTo(8,-10,0,-20);ctx.fill();ctx.fillStyle='#5cbde3';ctx.beginPath();ctx.arc(0,-4,3,0,6.28);ctx.fill();ctx.fillStyle='#789caf';ctx.beginPath();ctx.moveTo(-6,3);ctx.lineTo(-12,16);ctx.lineTo(-4,12);ctx.moveTo(6,3);ctx.lineTo(12,16);ctx.lineTo(4,12);ctx.fill();if(progress>0){ctx.fillStyle='#ffc47c';ctx.beginPath();ctx.moveTo(-4,12);ctx.lineTo(0,29+Math.sin(progress*80)*5);ctx.lineTo(4,12);ctx.fill()}ctx.restore()}
  function frame(t){
    if(destroyed||!home.isConnected)return
    const dt=Math.min(t-lastTime,50);lastTime=t
    if(moving&&!document.hidden){yaw+=dt*.000025;rotation+=dt*.000008}
    ctx.clearRect(0,0,w,h)
    for(const s of stars){ctx.fillStyle=`rgba(170,220,250,${s.a})`;ctx.fillRect(s.x*w,s.y*h,1,1)}
    for(const p of planets.filter(p=>p.orbit)){
      ctx.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,q=project(Math.cos(a)*p.orbit,0,Math.sin(a)*p.orbit);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y)}
      ctx.strokeStyle=p.id===planets[active].id?'#70dfff55':'#75b9dd22';ctx.lineWidth=1;ctx.stroke()
    }
    const positions=planets.map((p,index)=>{
      const angle=p.angle+rotation/(.5+p.orbit*.12),x=Math.cos(angle)*p.orbit,z=Math.sin(angle)*p.orbit
      return {world:p,index,worldX:x,worldZ:z,...project(x,0,z)}
    })
    const earth=positions[2],moon=positions[9],ma=rotation*5+.8
    Object.assign(moon,project(earth.worldX+Math.cos(ma)*.34,Math.sin(ma)*.10,earth.worldZ+Math.sin(ma)*.34))
    const sun={world:{id:'sun',color:'#ffb94c',radius:.32},index:-1,...project(0,0,0)}
    hit=[sun,...positions].map(p=>({...p,r:Math.max(p.world.radius*p.scale,p.index===9?3:4)})).sort((a,b)=>b.depth-a.depth)
    hit.forEach(body)
    const target=positions[active],animate=!reduced.matches&&!manualPaused&&!document.hidden&&!home.hasAttribute('inert')
    if(animate){flightTime+=dt;shipTravel+=dt}
    const cruise=moving?flightTime*.0008:0,goal={x:target.worldX+Math.cos(cruise)*.55,z:target.worldZ+Math.sin(cruise)*.55,y:.3}
    if(active===9){goal.x=earth.worldX+.55;goal.z=earth.worldZ+.2}
    if(!shipWorld||reduced.matches)shipWorld={...goal}
    const old=project(shipWorld.x,shipWorld.y,shipWorld.z),ease=animate?1-Math.exp(-dt*.003):0
    shipWorld.x+=(goal.x-shipWorld.x)*ease;shipWorld.z+=(goal.z-shipWorld.z)*ease;shipWorld.y+=(goal.y-shipWorld.y)*ease
    const craft=project(shipWorld.x,shipWorld.y,shipWorld.z),distance=Math.hypot(craft.x-old.x,craft.y-old.y)
    if(distance>.02)shipHeading=Math.atan2(craft.y-old.y,craft.x-old.x)
    drawShuttle(craft.x,craft.y,shipHeading,w<760?.66:.9,animate&&(moving||shipTravel<1600))
    const dock=project(earth.worldX+.7,.05,earth.worldZ-.5)
    stationPoint={x:dock.x,y:dock.y+45}
    station.style.left=`${stationPoint.x}px`;station.style.top=`${stationPoint.y}px`
    if(w>=760){if(rocketTime!==null){if(animate)rocketTime+=dt;drawRocket(stationPoint.x+45,stationPoint.y,Math.min(1,rocketTime/2400));if(rocketTime>=2400)rocketTime=null}else drawRocket(stationPoint.x+45,stationPoint.y,0)}
    raf=requestAnimationFrame(frame)
  }
  renderUI();raf=requestAnimationFrame(frame)
}
