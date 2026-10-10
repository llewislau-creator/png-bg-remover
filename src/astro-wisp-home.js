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
import { mountPora } from './pora-character.js'

// PORA guides visitors visually. Actual image processing remains in existing Pixora tools.
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
    subtitle:'YOUR VISUAL AI COMPANION', navTools:'所有工具', motion:'暫停動態', motionOff:'開啟動態', musicPlay:'播放音樂', musicPause:'暫停音樂', musicLoading:'音樂載入中', musicRetry:'重試音樂',
    kicker:'PIXORA / VISUAL WORKSPACE',
    headline:'Reveal What<br><span>Could Be.</span>',
    intro:'認識 PORA 波拉，陪你探索每個創作可能。從圖片去背、色彩到文字效果，選擇工具，立即開始。',
    uploadTitle:'把圖片交給 PORA 波拉', uploadHint:'拖放、點擊或貼上圖片 · PNG / JPG / WEBP / HEIC · 單檔上限 20 MB',
    uploadButton:'選擇圖片 →', uploadHelp:'圖片上傳後會直接進入既有去背工作台。',
    quick:'快速開始', statusIdle:'PORA 波拉已準備好陪你創作', statusCurious:'想做什麼？選擇圖片或工具吧。',statusReceive:'已收到圖片，正在開啟去背工具…',
    statusError:'圖片無法使用，請選擇支援的格式。', statusLarge:'圖片超過 20 MB，請選擇較小的檔案。',
    allTitle:'你的創作工具箱',allSub:'所有工具仍使用 Pixora 現有的處理流程。',note:'部分工具完全在瀏覽器處理；需要 AI 辨識的功能會在啟用時說明資料傳送方式。',
    media:'影音下載 ↗',private:'個人空間 ↗',footer:'Made for real creative workflows.',skip:'跳至工具列表',loading:'開啟工具…'
  },
  en:{
    subtitle:'YOUR VISUAL AI COMPANION',navTools:'All tools', motion:'Pause motion', motionOff:'Enable motion', musicPlay:'Play music', musicPause:'Pause music', musicLoading:'Loading music', musicRetry:'Retry music',
    kicker:'PIXORA / VISUAL WORKSPACE',
    headline:'Reveal What<br><span>Could Be.</span>',
    intro:'Meet PORA, your gentle AI creative companion. Remove backgrounds, explore colors, prepare documents and keep creating.',
    uploadTitle:'Give PORA an image',uploadHint:'Drop, click or paste · PNG / JPG / WEBP / HEIC · Up to 20 MB',
    uploadButton:'Choose an image →',uploadHelp:'Images open directly in the existing background removal studio.',
    quick:'Start here',statusIdle:'PORA is ready to create with you',statusCurious:'What will you make? Choose an image or tool.',statusReceive:'Image received. Opening cutout studio…',
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
      '<a href="#aw-top" class="aw-logo" aria-label="Pixora home"><span class="aw-logo-mark">✦</span><span>PIXORA<small>PORA CREATIVE UNIVERSE</small></span></a>',
      '<div class="aw-nav-actions">',
        '<button class="aw-nav-tools" type="button" id="aw-open-tools"></button>',
        '<div class="aw-language" role="group" aria-label="Language"><button type="button" data-lang="zh">繁中</button><button type="button" data-lang="en">EN</button></div>',
        '<button type="button" class="aw-music" id="aw-music" aria-pressed="false"><span aria-hidden="true" class="aw-music-icon">♫</span><span class="aw-music-label"></span></button>',
        '<button class="aw-motion" type="button" id="aw-motion" aria-pressed="true" aria-label="Toggle animation">◌</button>',
      '</div>',
    '</div>',
    '<main id="aw-top">',
      '<section class="aw-hero" aria-labelledby="aw-heading">',
        '<div class="aw-copy">',
          '<div class="aw-kicker"><span class="aw-signal"></span><span id="aw-kicker"></span></div>',
          '<h1 id="aw-heading"></h1>',
          '<p class="aw-brand-cn" lang="zh-Hant">讓尚未被看見的可能性，逐漸顯現</p>',
          '<p id="aw-intro"></p>',
          '<div class="aw-quick"><span id="aw-quick-label"></span><button type="button" data-tool="cutout">✦ <span data-short="cutout"></span></button><button type="button" data-tool="pdf">▤ <span data-short="pdf"></span></button><button type="button" data-tool="color">◉ <span data-short="color"></span></button></div>',
        '</div>',
        '<div class="aw-visual" id="aw-visual">',
          '<div class="aw-planet-glow" aria-hidden="true"></div>',
          '<div class="aw-float-card aw-card-before" aria-hidden="true"><span class="aw-mini-image">▧</span><small>JPG</small></div>',
          '<div class="aw-float-card aw-card-after" aria-hidden="true"><span class="aw-mini-checker">✦</span><small>PNG</small></div>',
          '<div class="aw-character" role="img" aria-label="PORA, your gentle creative companion"></div>',
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
    '<input type="file" id="aw-file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" hidden>',
    '<audio id="aw-audio" src="/audio/home-ambient.m4a" preload="none" loop hidden></audio>'
  ].join('')
  document.body.append(home)
  home.classList.add('pora-ready')
  const pora=mountPora(home)
  document.documentElement.classList.add('pxu-open')
  document.body.classList.add('pxu-open')
  const $=selector=>home.querySelector(selector)
  const $$=selector=>[...home.querySelectorAll(selector)]
  const set=(selector,value)=>{const node=$(selector);if(node)node.textContent=value}
  const bgm=$('#aw-audio')
  const musicButton=$('#aw-music')
  let musicStarting=false,musicFailed=false,musicFade=0,musicAttempt=0
  bgm.volume=0
  function updateMusicUI(){
    const t=COPY[lang]
    const playing=!bgm.paused
    const label=musicStarting?t.musicLoading:musicFailed?t.musicRetry:playing?t.musicPause:t.musicPlay
    musicButton.querySelector('.aw-music-label').textContent=label
    musicButton.title=label
    musicButton.setAttribute('aria-label',label)
    musicButton.setAttribute('aria-pressed',String(playing))
    musicButton.disabled=musicStarting
  }
  function stopMusic(){
    musicAttempt++
    if(musicFade)clearInterval(musicFade)
    musicFade=0
    bgm.pause()
    bgm.volume=0
    musicStarting=false
    musicFailed=false
    updateMusicUI()
  }
  async function playMusic(){
    if(musicStarting||!bgm.paused)return
    const attempt=++musicAttempt
    musicStarting=true
    musicFailed=false
    bgm.volume=0
    updateMusicUI()
    try{
      // Playback is initiated only from the user clicking the music control.
      await bgm.play()
      if(attempt!==musicAttempt){bgm.pause();return}
      musicStarting=false
      updateMusicUI()
      const started=performance.now()
      musicFade=window.setInterval(()=>{
        if(attempt!==musicAttempt||bgm.paused){clearInterval(musicFade);musicFade=0;return}
        bgm.volume=Math.min(.2, .2*(performance.now()-started)/5000)
        if(bgm.volume>=.2){clearInterval(musicFade);musicFade=0}
      },50)
    }catch(error){
      if(attempt!==musicAttempt)return
      musicStarting=false
      musicFailed=true
      updateMusicUI()
    }
  }
  musicButton.addEventListener('click',()=>{if(musicStarting||!bgm.paused)stopMusic();else playMusic()})
  bgm.addEventListener('error',()=>{musicStarting=false;musicFailed=true;updateMusicUI()})
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!bgm.paused)stopMusic()})
  function paint(){
    const t=COPY[lang]
    home.dataset.language=lang
    pora.setLanguage(lang)
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
    updateMusicUI()
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
    stopMusic()
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
    stopMusic()
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
      $('.aw-eyes').forEach(eyes=>{eyes.style.transform='translate('+Math.max(-4,Math.min(4,x*8))+'px,'+Math.max(-3,Math.min(3,y*6))+'px)'})
      lookFrame=0
    })
    home.dataset.agentState='curious'
  })
  hover.addEventListener('pointerleave',()=>{$('.aw-eyes').forEach(eyes=>{eyes.style.transform='' });if(home.dataset.agentState==='curious')agent('idle')})
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
  document.title='PIXORA — PORA 波拉・Reveal What Could Be'
  const desc=document.querySelector('meta[name="description"]')
  if(desc)desc.setAttribute('content','PIXORA：跟 PORA 波拉探索圖片去背、圖片轉 PDF、色彩分析及更多創作工具，讓尚未被看見的可能性逐漸顯現。')
}
