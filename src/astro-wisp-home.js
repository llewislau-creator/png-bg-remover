import { openPortraitStudio } from './portrait-studio.js'
import { openLayerStudio } from './layer-studio.js'
import { openPromptStudio } from './prompt-extractor.js'
import { openVectorStudio } from './vector-studio.js'
import { openColorStudio } from './color-studio.js'
import { openFontStudio } from './font-studio.js'
import { openImageToPdf } from './image-to-pdf.js'
import { openPresentationStudio } from './presentation-studio.js'
import { openPrintStudio } from './print-studio.js'
// Keep the existing workbench visual overrides that the Universe entry previously imported.
import './studio-theme.css'
import './astro-wisp-home.css'

// Astro Wisp is a visual guide. Actual image processing remains in existing Pixora tools.
const TOOL_LIST = [
  { id:'cutout', zh:'AI 圖片去背', en:'AI Background Remover', zhSub:'一鍵製作透明 PNG', enSub:'Make a transparent PNG', icon:'✦', fn:null },
  { id:'pdf', zh:'圖片轉 PDF', en:'Images to PDF', zhSub:'排序圖片並匯出文件', enSub:'Arrange and export pages', icon:'▤', fn:openImageToPdf },
  { id:'color', zh:'色彩分析', en:'Color Analyzer', zhSub:'擷取圖片色票與色碼', enSub:'Extract palette and color codes', icon:'◉', fn:openColorStudio },
  { id:'prompt', zh:'圖片轉提示詞', en:'Image to Prompt', zhSub:'整理圖片與創作方向', enSub:'Compose an image prompt', icon:'⌁', fn:openPromptStudio },
  { id:'portrait', zh:'人像修飾', en:'Portrait Retouch', zhSub:'局部修補及色調調整', enSub:'Retouch portraits', icon:'◐', fn:openPortraitStudio },
  { id:'layers', zh:'圖片分層編輯', en:'Image Layers', zhSub:'獨立圖層與編輯', enSub:'Edit with image layers', icon:'▱', fn:openLayerStudio },
  { id:'vector', zh:'圖片轉 SVG', en:'Image to SVG', zhSub:'描繪向量線條', enSub:'Trace vector shapes', icon:'◇', fn:openVectorStudio },
  { id:'fonts', zh:'文字特效', en:'Text Effects', zhSub:'製作文字造型', enSub:'Create text styles', icon:'Aa', fn:openFontStudio },
  { id:'slides', zh:'簡報製作', en:'Presentation Builder', zhSub:'整理簡報內容', enSub:'Build presentations', icon:'▣', fn:openPresentationStudio },
  { id:'print', zh:'印刷排版', en:'Print Layout', zhSub:'尺寸、出血與安全邊界', enSub:'Layouts, bleed and margins', icon:'▦', fn:openPrintStudio }
]

const COPY = {
  zh:{
    subtitle:'YOUR VISUAL AI COMPANION', navTools:'所有工具', motion:'暫停動態', motionOff:'開啟動態',
    kicker:'PIXORA / VISUAL WORKSPACE',
    headline:'讓好點子，<br><span>輕鬆成形。</span>',
    intro:'Astro Wisp 是你的創作引導員。從去背、色彩到文件整理，選擇工具，立即開始。',
    uploadTitle:'把圖片交給 Astro Wisp', uploadHint:'拖放、點擊或貼上圖片 · PNG / JPG / WEBP / HEIC · 單檔上限 20 MB',
    uploadButton:'選擇圖片 →', uploadHelp:'圖片上傳後會直接進入既有去背工作台。',
    quick:'快速開始', statusIdle:'Astro Wisp 已準備好協助你', statusCurious:'想做什麼？選擇圖片或工具吧。',statusReceive:'已收到圖片，正在開啟去背工具…',
    statusError:'圖片無法使用，請選擇支援的格式。', statusLarge:'圖片超過 20 MB，請選擇較小的檔案。',
    allTitle:'你的創作工具箱',allSub:'所有工具仍使用 Pixora 現有的處理流程。',note:'部分工具完全在瀏覽器處理；需要 AI 辨識的功能會在啟用時說明資料傳送方式。',
    media:'影音下載 ↗',private:'個人空間 ↗',footer:'Made for real creative workflows.',skip:'跳至工具列表',loading:'開啟工具…'
  },
  en:{
    subtitle:'YOUR VISUAL AI COMPANION',navTools:'All tools', motion:'Pause motion', motionOff:'Enable motion',
    kicker:'PIXORA / VISUAL WORKSPACE',
    headline:'Make room for<br><span>your best ideas.</span>',
    intro:'Meet Astro Wisp, your visual guide. Remove backgrounds, analyze colors, prepare documents and keep creating.',
    uploadTitle:'Give Astro Wisp an image',uploadHint:'Drop, click or paste · PNG / JPG / WEBP / HEIC · Up to 20 MB',
    uploadButton:'Choose an image →',uploadHelp:'Images open directly in the existing background removal studio.',
    quick:'Start here',statusIdle:'Astro Wisp is ready to help',statusCurious:'What will you make? Choose an image or tool.',statusReceive:'Image received. Opening cutout studio…',
    statusError:'Unsupported image. Please choose a supported format.',statusLarge:'Image is over 20 MB. Choose a smaller file.',
    allTitle:'Explore the creative toolkit',allSub:'Every tool continues to use the existing Pixora workflow.',note:'Some tools process locally. AI recognition features explain when image data needs to leave your device.',
    media:'Media downloads ↗',private:'Private space ↗',footer:'Made for real creative workflows.',skip:'Skip to tools',loading:'Opening tool…'
  }
}

if (!document.getElementById('pixora-universe-home')) {
  const home=document.createElement('section')
  home.id='pixora-universe-home'
  home.className='aw-root'
  home.dataset.agentState='idle'
  let lang='zh'
  try{lang=localStorage.getItem('pixora-lang')==='en'?'en':'zh'}catch{}
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  let motionEnabled=!reduced.matches
  let lookFrame=0
  const toolCards=TOOL_LIST.map(tool=>[
    '<button type="button" class="aw-tool" data-tool="',tool.id,'">',
      '<span class="aw-tool-icon" aria-hidden="true">',tool.icon,'</span>',
      '<span class="aw-tool-body"><strong data-name="',tool.id,'"></strong><small data-desc="',tool.id,'"></small></span>',
      '<span class="aw-tool-arrow" aria-hidden="true">↗</span>',
    '</button>'
  ].join('')).join('')
  home.innerHTML=[
    '<a class="aw-skip" href="#aw-tools" id="aw-skip"></a>',
    '<div class="aw-scene-stars" aria-hidden="true"></div>',
    '<div class="aw-shell">',
    '<div class="aw-nav">',
      '<a href="#aw-top" class="aw-logo" aria-label="Pixora home"><span class="aw-logo-mark">✦</span><span>PIXORA<small>ASTRO WISP STUDIO</small></span></a>',
      '<div class="aw-nav-actions">',
        '<button class="aw-nav-tools" type="button" id="aw-open-tools"></button>',
        '<div class="aw-language" role="group" aria-label="Language"><button type="button" data-lang="zh">繁中</button><button type="button" data-lang="en">EN</button></div>',
        '<button class="aw-motion" type="button" id="aw-motion" aria-pressed="true" aria-label="Toggle animation">◌</button>',
      '</div>',
    '</div>',
    '<main id="aw-top">',
      '<section class="aw-hero" aria-labelledby="aw-heading">',
        '<div class="aw-copy">',
          '<div class="aw-kicker"><span class="aw-signal"></span><span id="aw-kicker"></span></div>',
          '<h1 id="aw-heading"></h1>',
          '<p id="aw-intro"></p>',
          '<div class="aw-quick"><span id="aw-quick-label"></span><button type="button" data-tool="cutout">✦ <span data-short="cutout"></span></button><button type="button" data-tool="pdf">▤ <span data-short="pdf"></span></button><button type="button" data-tool="color">◉ <span data-short="color"></span></button></div>',
        '</div>',
        '<div class="aw-visual" id="aw-visual">',
          '<div class="aw-planet-glow" aria-hidden="true"></div>',
          '<div class="aw-float-card aw-card-before" aria-hidden="true"><span class="aw-mini-image">▧</span><small>JPG</small></div>',
          '<div class="aw-float-card aw-card-after" aria-hidden="true"><span class="aw-mini-checker">✦</span><small>PNG</small></div>',
          '<div class="aw-character" role="img" aria-label="Astro Wisp: a floating pearl-metallic AI agent with tiny ear-like corners and a violet orbital ring">',
            '<svg viewBox="0 0 450 430" class="aw-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
              '<defs>',
                '<linearGradient id="aw-pearl" x1=".07" y1=".03" x2=".93" y2=".94"><stop stop-color="#ffffff"/><stop offset=".18" stop-color="#eaf1ff"/><stop offset=".44" stop-color="#bbbdf2"/><stop offset=".64" stop-color="#e8defa"/><stop offset=".83" stop-color="#a7c0f3"/><stop offset="1" stop-color="#ebe6ff"/></linearGradient>',
                '<linearGradient id="aw-edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9eeaff"/><stop offset=".51" stop-color="#a493ff"/><stop offset="1" stop-color="#ffc8ef"/></linearGradient>',
                '<linearGradient id="aw-orbit-gradient" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#8de9ff"/><stop offset=".47" stop-color="#ad95ff"/><stop offset="1" stop-color="#f9b7ef"/></linearGradient>',
                '<radialGradient id="aw-cheek"><stop stop-color="#f4a7d7" stop-opacity=".65"/><stop offset="1" stop-color="#f4a7d7" stop-opacity="0"/></radialGradient>',
                '<filter id="aw-shadow" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="15"/></filter>',
              '</defs>',
              '<ellipse cx="220" cy="384" rx="128" ry="24" fill="#9b77e2" opacity=".20" filter="url(#aw-shadow)"/>',
              '<g class="aw-character-move">',
                '<g class="aw-orbit-back"><ellipse cx="225" cy="214" rx="193" ry="70" transform="rotate(-13 225 214)" fill="none" stroke="url(#aw-orbit-gradient)" stroke-width="8" opacity=".47"/></g>',
                '<path d="M133 112 Q129 80 144 69 Q166 52 194 86 Q225 79 259 85 Q282 49 310 63 Q338 78 316 120 Q365 151 361 223 Q357 314 281 343 Q221 369 158 349 Q81 325 79 231 Q78 162 133 112 Z" fill="url(#aw-pearl)" stroke="url(#aw-edge)" stroke-width="4"/>',
                '<path d="M139 107 Q137 83 147 79 Q162 71 184 96" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>',
                '<path d="M278 91 Q302 66 313 78" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>',
                '<ellipse cx="123" cy="217" rx="35" ry="27" transform="rotate(-16 123 217)" fill="url(#aw-pearl)" stroke="url(#aw-edge)" stroke-width="3"/>',
                '<ellipse cx="326" cy="218" rx="35" ry="27" transform="rotate(16 326 218)" fill="url(#aw-pearl)" stroke="url(#aw-edge)" stroke-width="3"/>',
                '<ellipse cx="148" cy="211" rx="41" ry="32" fill="url(#aw-cheek)"/><ellipse cx="293" cy="211" rx="41" ry="32" fill="url(#aw-cheek)"/>',
                '<g class="aw-eyes">',
                   '<ellipse cx="177" cy="193" rx="8.7" ry="12.5" fill="#2e3567"/><ellipse cx="270" cy="193" rx="8.7" ry="12.5" fill="#2e3567"/>',
                   '<circle cx="180" cy="189" r="2.8" fill="#fff"/><circle cx="273" cy="189" r="2.8" fill="#fff"/>',
                '</g>',
                '<path class="aw-mouth" d="M216 217 Q224 225 233 217" fill="none" stroke="#52588b" stroke-width="3.3" stroke-linecap="round"/>',
                '<g class="aw-orbit-front"><path d="M38 240 C105 312 293 340 411 204" fill="none" stroke="url(#aw-orbit-gradient)" stroke-width="9" stroke-linecap="round"/><path d="M46 236 C136 304 295 322 408 207" fill="none" stroke="#fff" stroke-opacity=".52" stroke-width="2"/></g>',
                '<circle class="aw-spark" cx="52" cy="239" r="5" fill="#dcceff"/><circle class="aw-spark" cx="406" cy="211" r="5" fill="#f8e7ff"/>',
              '</g>',
            '</svg>',
          '</div>',
          '<div class="aw-stage-caption"><span class="aw-live-dot"></span><span id="aw-caption"></span></div>',
        '</div>',
        '<div class="aw-actions">',
          '<div class="aw-upload" id="aw-upload" tabindex="0" role="button" aria-label="Choose an image or drop a file">',
            '<span class="aw-upload-icon" aria-hidden="true">↥</span>',
            '<div class="aw-upload-text"><strong id="aw-upload-title"></strong><small id="aw-upload-hint"></small></div>',
            '<button type="button" class="aw-cta" id="aw-choose"></button>',
          '</div>',
          '<p class="aw-upload-help" id="aw-upload-help"></p>',
          '<div role="status" aria-live="polite" class="aw-feedback" id="aw-feedback"></div>',
        '</div>',
      '</section>',
      '<section class="aw-tools-section" id="aw-tools" aria-labelledby="aw-tools-title">',
        '<div class="aw-section-heading"><div><p class="aw-section-kicker">THE TOOLKIT / 01—10</p><h2 id="aw-tools-title"></h2><p id="aw-tools-sub"></p></div><span class="aw-section-orbit" aria-hidden="true">✳</span></div>',
        '<div class="aw-tool-grid">',toolCards,'</div>',
      '</section>',
      '<footer class="aw-footer"><div><b>PIXORA</b><span id="aw-footer"></span></div><div class="aw-footer-links"><a href="/media" id="aw-media"></a><a href="/private" id="aw-private"></a></div><p id="aw-note"></p></footer>',
    '</main>',
    '</div>',
    '<input type="file" id="aw-file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" hidden>'
  ].join('')
  document.body.append(home)
  document.documentElement.classList.add('pxu-open')
  document.body.classList.add('pxu-open')
  const $=selector=>home.querySelector(selector)
  const $$=selector=>[...home.querySelectorAll(selector)]
  const set=(selector,value)=>{const node=$(selector);if(node)node.textContent=value}
  function paint(){
    const t=COPY[lang]
    home.dataset.language=lang
    set('#aw-kicker',t.kicker)
    $('#aw-heading').innerHTML=t.headline
    set('#aw-intro',t.intro)
    set('#aw-quick-label',t.quick)
    set('#aw-upload-title',t.uploadTitle)
    set('#aw-upload-hint',t.uploadHint)
    set('#aw-choose',t.uploadButton)
    set('#aw-upload-help',t.uploadHelp)
    set('#aw-tools-title',t.allTitle)
    set('#aw-tools-sub',t.allSub)
    set('#aw-note',t.note)
    set('#aw-footer',t.footer)
    set('#aw-media',t.media)
    set('#aw-private',t.private)
    set('#aw-open-tools',t.navTools+' ↗')
    set('#aw-skip',t.skip)
    set('#aw-caption',home.dataset.agentState==='curious'?t.statusCurious:t.statusIdle)
    const motion=$('#aw-motion')
    motion.textContent=motionEnabled?'◌':'⊘'
    motion.title=motionEnabled?t.motion:t.motionOff
    motion.setAttribute('aria-label',motion.title)
    motion.setAttribute('aria-pressed',String(motionEnabled))
    home.classList.toggle('aw-paused',!motionEnabled)
    $$('.aw-tool').forEach(button=>{
      const tool=TOOL_LIST.find(item=>item.id===button.dataset.tool)
      button.querySelector('strong').textContent=tool[lang]
      button.querySelector('small').textContent=lang==='zh'?tool.zhSub:tool.enSub
    })
    $$('[data-short]').forEach(el=>{const tool=TOOL_LIST.find(item=>item.id===el.dataset.short);el.textContent=tool[lang]})
    $$('[data-lang]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.lang===lang);btn.setAttribute('aria-pressed',String(btn.dataset.lang===lang))})
    $('#aw-file').setAttribute('aria-label',t.uploadButton)
    $('#aw-upload').setAttribute('aria-label',t.uploadTitle+' — '+t.uploadHint)
  }
  function agent(state,message){
    home.dataset.agentState=state
    if(message)set('#aw-feedback',message)
    const t=COPY[lang]
    set('#aw-caption',state==='curious'?t.statusCurious:state==='receiving'?t.statusReceive:state==='error'?message:t.statusIdle)
  }
  function valid(file){
    if(!file)return false
    const ext=file.name.toLowerCase()
    const type=['image/png','image/jpeg','image/webp','image/heic','image/heif'].includes(file.type)
    const extOk=/\.(png|jpe?g|webp|heic|heif)$/.test(ext)
    return type||(!file.type&&extOk)
  }
  function openCutout(file){
    const original=document.getElementById('fileInput')
    if(!original){agent('error',COPY[lang].statusError);return}
    if(file){
      if(file.size>20*1024*1024){agent('error',COPY[lang].statusLarge);return}
      if(!valid(file)){agent('error',COPY[lang].statusError);return}
    }
    if(file){try{
      const transfer=new DataTransfer()
      transfer.items.add(file)
      original.files=transfer.files
    }catch(err){agent('error',COPY[lang].statusError);return}}
    agent('receiving',file?COPY[lang].statusReceive:'')
    home.remove()
    document.documentElement.classList.remove('pxu-open')
    document.body.classList.remove('pxu-open')
    const localeButton=document.getElementById(lang==='en'?'enBtn':'zhBtn')
    localeButton?.click()
    if(file)original.dispatchEvent(new Event('change',{bubbles:true}))
    else original.focus({preventScroll:true})
    document.getElementById('idle')?.scrollIntoView({block:'start',behavior:'instant'})
  }
  function launchTool(id,button){
    const tool=TOOL_LIST.find(item=>item.id===id)
    if(!tool)return
    if(!tool.fn){openCutout();return}
    agent('curious')
    const anchor=button||$('#aw-open-tools')
    try{
      tool.fn(()=>{if(home.isConnected){home.removeAttribute('inert');anchor?.focus({preventScroll:true})}})
    }catch(err){
      console.error('Could not open Pixora studio',err)
      home.removeAttribute('inert')
      agent('error',lang==='zh'?'工具無法開啟，請重新整理再試。':'Unable to open this tool. Please refresh and try again.')
    }
  }
  const picker=$('#aw-file')
  function choose(){picker.click()}
  function acceptFile(file){if(file)openCutout(file)}
  $('#aw-choose').addEventListener('click',event=>{event.stopPropagation();choose()})
  $('#aw-upload').addEventListener('click',event=>{if(event.target.closest('button'))return;choose()})
  $('#aw-upload').addEventListener('keydown',event=>{if(event.target!==$('#aw-upload'))return;if(event.key==='Enter'||event.key===' '){event.preventDefault();choose()}})
  picker.addEventListener('change',()=>{acceptFile(picker.files?.[0]);picker.value=''})
  home.addEventListener('click',event=>{
    const button=event.target.closest('[data-tool]')
    if(button)launchTool(button.dataset.tool,button)
  })
  $$('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
    lang=button.dataset.lang
    try{localStorage.setItem('pixora-lang',lang)}catch{}
    paint()
  }))
  $('#aw-open-tools').addEventListener('click',()=>$('#aw-tools').scrollIntoView({behavior:motionEnabled?'smooth':'instant'}))
  $('#aw-motion').addEventListener('click',()=>{motionEnabled=!motionEnabled;paint()})
  const hover=$('#aw-visual')
  hover.addEventListener('pointermove',event=>{
    if(!motionEnabled||event.pointerType==='touch'||lookFrame)return
    const rect=hover.getBoundingClientRect()
    const x=(event.clientX-rect.left)/rect.width-.5
    const y=(event.clientY-rect.top)/rect.height-.5
    lookFrame=requestAnimationFrame(()=>{
      $('.aw-eyes').style.transform='translate('+Math.max(-4,Math.min(4,x*8))+'px,'+Math.max(-3,Math.min(3,y*6))+'px)'
      lookFrame=0
    })
    home.dataset.agentState='curious'
  })
  hover.addEventListener('pointerleave',()=>{$('.aw-eyes').style.transform='';if(home.dataset.agentState==='curious')agent('idle')})
  let dragDepth=0
  home.addEventListener('dragenter',event=>{if(!event.dataTransfer?.types?.includes('Files'))return;event.preventDefault();dragDepth++;home.classList.add('aw-dragging');agent('curious')})
  home.addEventListener('dragover',event=>{if(!event.dataTransfer?.types?.includes('Files'))return;event.preventDefault();event.dataTransfer.dropEffect='copy'})
  home.addEventListener('dragleave',event=>{if(!event.dataTransfer?.types?.includes('Files'))return;dragDepth=Math.max(0,dragDepth-1);if(!dragDepth){home.classList.remove('aw-dragging');agent('idle')}})
  home.addEventListener('drop',event=>{
    event.preventDefault()
    dragDepth=0
    home.classList.remove('aw-dragging')
    const file=[...(event.dataTransfer?.files||[])].find(f=>valid(f))||event.dataTransfer?.files?.[0]
    if(file)acceptFile(file)
  })
  window.addEventListener('paste',event=>{
    if(!home.isConnected||home.hasAttribute('inert'))return
    if(document.activeElement?.matches('input,textarea,[contenteditable]'))return
    const file=[...(event.clipboardData?.files||[])].find(f=>valid(f))
    if(file){event.preventDefault();acceptFile(file)}
  })
  function syncMotion(event){if(event.matches){motionEnabled=false;paint()}}
  reduced.addEventListener?.('change',syncMotion)
  paint()
  document.title='Pixora — Astro Wisp AI Image Studio'
  const desc=document.querySelector('meta[name="description"]')
  if(desc)desc.setAttribute('content','Pixora：由 Astro Wisp 引導的圖片工具工作台，支援 AI 圖片去背、圖片轉 PDF、色彩分析及更多創作工具。')
}
