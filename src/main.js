import { getBrowserCapabilities, removeBackground } from '@bg0/browser'

const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]
const MAX = 20 * 1024 * 1024
const BG_ORDER = ['transparent', 'white', 'gray', 'dark', 'custom']

const state = {
  locale: localStorage.getItem('png-cutout-locale') || 'zh-TW',
  file: null,
  rawResultBlob: null,
  resultBlob: null,
  originalUrl: '',
  resultUrl: '',
  naturalWidth: 0,
  naturalHeight: 0,
  scale: 1,
  fitScale: 1,
  panX: 0,
  panY: 0,
  compare: 55,
  view: 'result',
  previousView: 'result',
  bg: 'transparent',
  customBg: '#c9ff39',
  cleanup: 0,
  adjustmentTimer: null,
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  panStartX: 0,
  panStartY: 0,
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartScale: 1,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  pinchMidX: 0,
  pinchMidY: 0,
}

const i18n = {
  'zh-TW': {
    localStatus:'LOCAL PROCESSING · NO ACCOUNT', headline:'快速產生透明素材。',
    introCopy:'為專業設計工作流程而做的小工具：貼上、去背、檢查、修整、複製。它不是另一套設計軟件，而是你需要透明 PNG 時可以直接打開的快捷工具。',
    freeCore:'FREE CORE', toolLabel:'CUTOUT UTILITY', dropTitle:'DROP OR PASTE.',
    dropDesc:'拖入圖片、按 ⌘/Ctrl + V，或者從電腦 / 手機選擇。AI 模型在瀏覽器本地執行；第一次使用需要下載模型檔。',
    selectImage:'SELECT IMAGE / 選擇圖片', workflowCopy:'打開 → 處理 → 複製 / 下載 → 離開',
    privacyCopy:'圖片像素在瀏覽器內處理；程式與模型檔會由網站 / CDN 下載。',
    productRule:'FAST / CORRECTABLE', ruleCopy:'基本工具保持免費；只有真正產生成本的進階服務才考慮收費。',
    replace:'REPLACE', processingHint:'原圖會先顯示；模型完成後再切換至透明結果。第一次可能較慢，之後會使用瀏覽器快取。',
    retry:'RETRY', viewResult:'RESULT', viewOriginal:'ORIGINAL', viewSplit:'SPLIT', inspector:'INSPECTOR', viewBg:'VIEW BACKGROUND',
    edgeTitle:'EDGE / MASK', firstPass:'FIRST-PASS CONTROL', cleanup:'CLEANUP', livePreview:'LIVE PREVIEW', resetEdge:'RESET EDGE',
    cleanupHint:'Cleanup 會壓低低信心半透明背景。複雜主體仍建議以視覺檢查為準。',
    outputTitle:'OUTPUT', size:'SIZE', trim:'TRIM TRANSPARENT PIXELS', exportTitle:'EXPORT / CONTINUE', copyPng:'COPY PNG', downloadPng:'DOWNLOAD PNG', replaceImage:'REPLACE IMAGE',
    inspectorFoot:'這個工具的目標不是取代設計軟件，而是令「得到一張可用透明素材」更快、更可預測。',
    utilityNotSuite:'Utility, not a suite.', positioningCopy:'PNG / CUTOUT 專注做一件事：快速取得可以繼續放進 Figma、Photoshop、Illustrator、Keynote 或其他設計流程的透明素材。沒有帳號、沒有專案管理、沒有刻意製造的升級阻力。',
    sustainable:'Free core. Sustainable later.', sustainableCopy:'核心單張處理會以免費、無浮水印為原則。未來如果加入大量批次、雲端運算或其他真正產生伺服器成本的功能，才會考慮以合理收費維持網站營運，而不是把基本功能鎖起來。',
    shortcutTitle:'KEYBOARD SHORTCUTS', scPaste:'貼上圖片', scBefore:'按住查看原圖', scFit:'完整顯示', sc100:'100% 像素', scBg:'切換預覽背景', scCopy:'複製 PNG', scSave:'下載 PNG',
    tooLarge:'圖片超過 20 MB，請先縮小檔案。', processing:'正在去背', failed:'處理失敗。', copied:'PNG 已複製到剪貼簿。', copyFail:'此瀏覽器無法直接複製 PNG，請使用下載。', preparingExport:'正在準備輸出…', edgeUpdated:'邊緣已更新。',
  },
  en: {
    localStatus:'LOCAL PROCESSING · NO ACCOUNT', headline:'Make transparent assets. Fast.',
    introCopy:'A small utility for professional design workflows: paste, remove, inspect, refine, copy. It is not another design suite—just a fast tool to open when you need a transparent PNG.',
    freeCore:'FREE CORE', toolLabel:'CUTOUT UTILITY', dropTitle:'DROP OR PASTE.',
    dropDesc:'Drop an image, press ⌘/Ctrl + V, or choose from desktop / mobile. The AI model runs locally in the browser; the first use downloads model assets.',
    selectImage:'SELECT IMAGE', workflowCopy:'Open → process → copy / download → leave', privacyCopy:'Image pixels are processed in your browser; app and model files are downloaded from the site / CDN.',
    productRule:'FAST / CORRECTABLE', ruleCopy:'The core utility stays free; only features with real infrastructure cost may be paid later.', replace:'REPLACE',
    processingHint:'The original appears immediately; the transparent result replaces it when the model finishes. The first run may be slower, then the browser can reuse its cache.', retry:'RETRY',
    viewResult:'RESULT', viewOriginal:'ORIGINAL', viewSplit:'SPLIT', inspector:'INSPECTOR', viewBg:'VIEW BACKGROUND', edgeTitle:'EDGE / MASK', firstPass:'FIRST-PASS CONTROL', cleanup:'CLEANUP', livePreview:'LIVE PREVIEW', resetEdge:'RESET EDGE',
    cleanupHint:'Cleanup suppresses low-confidence semi-transparent background. Complex subjects still require visual inspection.', outputTitle:'OUTPUT', size:'SIZE', trim:'TRIM TRANSPARENT PIXELS', exportTitle:'EXPORT / CONTINUE', copyPng:'COPY PNG', downloadPng:'DOWNLOAD PNG', replaceImage:'REPLACE IMAGE',
    inspectorFoot:'This utility does not replace design software. It makes getting a usable transparent asset faster and more predictable.', utilityNotSuite:'Utility, not a suite.',
    positioningCopy:'PNG / CUTOUT focuses on one job: create transparent assets you can continue using in Figma, Photoshop, Illustrator, Keynote or any other design workflow. No accounts, no project management, no artificial upgrade friction.',
    sustainable:'Free core. Sustainable later.', sustainableCopy:'Single-image core use is intended to stay free and watermark-free. If future batch, cloud compute or other infrastructure-heavy features create real operating cost, reasonable paid options can support the site without locking the basics.',
    shortcutTitle:'KEYBOARD SHORTCUTS', scPaste:'Paste image', scBefore:'Hold original', scFit:'Fit image', sc100:'100% pixels', scBg:'Cycle background', scCopy:'Copy PNG', scSave:'Download PNG',
    tooLarge:'Image exceeds 20 MB. Please use a smaller file.', processing:'Removing background', failed:'Processing failed.', copied:'PNG copied to clipboard.', copyFail:'This browser cannot copy PNG directly. Please download instead.', preparingExport:'Preparing export…', edgeUpdated:'Edge updated.',
  }
}

function t(key) { return i18n[state.locale][key] ?? key }
function applyLocale() {
  document.documentElement.lang = state.locale
  $$('[data-i]').forEach((el) => { const key = el.dataset.i; if (i18n[state.locale][key] != null) el.textContent = i18n[state.locale][key] })
  $('#zhBtn').classList.toggle('active', state.locale === 'zh-TW')
  $('#enBtn').classList.toggle('active', state.locale === 'en')
  try { localStorage.setItem('png-cutout-locale', state.locale) } catch {}
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function fmtBytes(n) { if (!Number.isFinite(n)) return '—'; if (n < 1024) return `${n} B`; if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`; return `${(n / 1024 ** 2).toFixed(2)} MB` }
function fmtDims(w, h) { return w && h ? `${w} × ${h}` : '—' }
function setStatus(kind, label) { $('#dot').className = `dot ${kind}`; $('#statusText').textContent = label }
function setActionMessage(msg, error = false) { const el = $('#actionMessage'); el.textContent = msg; el.style.color = error ? 'var(--red)' : 'var(--muted)' }
function revokeResultUrl() { if (state.resultUrl) URL.revokeObjectURL(state.resultUrl); state.resultUrl = '' }
function revokeAllUrls() { if (state.originalUrl) URL.revokeObjectURL(state.originalUrl); revokeResultUrl(); state.originalUrl = '' }

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve()
  return new Promise((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject })
}

function computeFitScale() {
  const stage = $('#stage')
  if (!stage || !state.naturalWidth || !state.naturalHeight) return 1
  const pad = 34
  return Math.min((stage.clientWidth - pad * 2) / state.naturalWidth, (stage.clientHeight - pad * 2) / state.naturalHeight)
}

function clampPan() {
  const stage = $('#stage')
  if (!stage || !state.naturalWidth) return
  const shownW = state.naturalWidth * state.scale
  const shownH = state.naturalHeight * state.scale
  const limitX = Math.max(0, (shownW - stage.clientWidth) / 2 + 36)
  const limitY = Math.max(0, (shownH - stage.clientHeight) / 2 + 36)
  state.panX = clamp(state.panX, -limitX, limitX)
  state.panY = clamp(state.panY, -limitY, limitY)
  if (shownW <= stage.clientWidth - 20) state.panX = 0
  if (shownH <= stage.clientHeight - 20) state.panY = 0
}

function applyTransform() {
  clampPan()
  const transform = `translate(-50%, -50%) translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`
  $('#originalImg').style.transform = transform
  $('#resultImg').style.transform = transform
  $('#zoomValue').textContent = `${Math.round(state.scale * 100)}%`
  const isFit = Math.abs(state.scale - state.fitScale) < 0.002 && Math.abs(state.panX) < 1 && Math.abs(state.panY) < 1
  $('#fitBtn').classList.toggle('active', isFit)
  $('#pixelBtn').classList.toggle('active', Math.abs(state.scale - 1) < 0.002)
  $('#stage').classList.toggle('can-pan', state.naturalWidth * state.scale > $('#stage').clientWidth || state.naturalHeight * state.scale > $('#stage').clientHeight)
}

function fitView() { state.fitScale = computeFitScale(); state.scale = state.fitScale; state.panX = 0; state.panY = 0; applyTransform() }
function pixelView() { state.fitScale = computeFitScale(); state.scale = 1; state.panX = 0; state.panY = 0; applyTransform() }
function setScale(next, anchorX = null, anchorY = null) {
  const stage = $('#stage'); if (!stage || !state.naturalWidth) return
  const old = state.scale
  const min = Math.max(0.05, state.fitScale * 0.35)
  const max = Math.max(5, state.fitScale * 8)
  const nextScale = clamp(next, min, max)
  if (anchorX != null && anchorY != null) {
    const r = stage.getBoundingClientRect(); const cx = r.left + r.width / 2; const cy = r.top + r.height / 2
    const imageX = (anchorX - cx - state.panX) / old; const imageY = (anchorY - cy - state.panY) / old
    state.panX = anchorX - cx - imageX * nextScale; state.panY = anchorY - cy - imageY * nextScale
  }
  state.scale = nextScale; applyTransform()
}

function setCompare(v) {
  state.compare = Number(v); $('#compareRange').value = String(state.compare); $('#compareOutput').textContent = `${state.compare}%`
  if (state.view === 'split') { $('#resultLayer').style.clipPath = `inset(0 ${100 - state.compare}% 0 0)`; $('#divider').style.left = `${state.compare}%` }
}

function setView(mode) {
  if (!state.resultBlob && mode !== 'original') return
  state.view = mode
  $$('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === mode))
  $('#compareControl').classList.toggle('hidden', mode !== 'split')
  $('#divider').classList.toggle('hidden', mode !== 'split')
  $('#beforeTag').classList.toggle('hidden', mode === 'result')
  $('#afterTag').classList.toggle('hidden', mode === 'original')
  if (mode === 'original') {
    $('#originalLayer').classList.remove('hidden'); $('#resultLayer').classList.add('hidden'); $('#resultLayer').style.clipPath = 'none'
  } else if (mode === 'result') {
    $('#originalLayer').classList.add('hidden'); $('#resultLayer').classList.remove('hidden'); $('#resultLayer').style.clipPath = 'none'
  } else {
    $('#originalLayer').classList.remove('hidden'); $('#resultLayer').classList.remove('hidden'); setCompare(state.compare)
  }
}

function setBg(mode) {
  state.bg = mode
  const layer = $('#resultLayer')
  layer.classList.remove('checker','bg-white','bg-gray','bg-dark','bg-custom')
  layer.style.setProperty('--custom-bg', state.customBg)
  layer.classList.add(mode === 'transparent' ? 'checker' : `bg-${mode}`)
  $$('[data-bg]').forEach((b) => b.classList.toggle('active', b.dataset.bg === mode))
  $('#customBgRow').classList.toggle('hidden', mode !== 'custom')
}
function cycleBg() { const i = BG_ORDER.indexOf(state.bg); setBg(BG_ORDER[(i + 1) % BG_ORDER.length]) }

function updateProgress(evt) {
  const p = Math.round(clamp(evt.progress || 0.03, 0.03, 1) * 100)
  $('#progressBar').style.width = `${p}%`; $('#progressText').textContent = `${p}%`; $('#processingMessage').textContent = evt.message || ''
  $('#processingTitle').textContent = evt.stage === 'downloading' ? 'DOWNLOADING MODEL.' : evt.stage === 'processing' ? 'REMOVING BACKGROUND.' : evt.stage === 'finishing' ? 'REFINING EDGES.' : 'PREPARING MODEL.'
  if (evt.download?.totalBytes) $('#processingMessage').textContent = `${evt.message || 'Downloading local model…'} ${fmtBytes(evt.download.loadedBytes)} / ${fmtBytes(evt.download.totalBytes)}`
}

async function canvasBlob(canvas) { return await new Promise((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('PNG encode failed')), 'image/png')) }

async function applyCleanup(blob, amount) {
  if (!blob || amount <= 0) return blob
  const bitmap = await createImageBitmap(blob)
  try {
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height); const d = image.data
    const cutoff = Math.round(amount * 1.35)
    for (let i = 3; i < d.length; i += 4) {
      const a = d[i]
      if (a <= cutoff) d[i] = 0
      else d[i] = Math.round(((a - cutoff) / (255 - cutoff)) * 255)
    }
    ctx.putImageData(image, 0, 0)
    return await canvasBlob(canvas)
  } finally { bitmap.close() }
}

async function refreshAdjustedResult() {
  if (!state.rawResultBlob) return
  setActionMessage(state.locale === 'zh-TW' ? '正在更新邊緣…' : 'Updating edge…')
  const blob = await applyCleanup(state.rawResultBlob, state.cleanup)
  state.resultBlob = blob
  revokeResultUrl(); state.resultUrl = URL.createObjectURL(blob)
  const img = $('#resultImg'); img.src = state.resultUrl; await waitForImage(img)
  $('#outputSize').textContent = fmtBytes(blob.size)
  setActionMessage(t('edgeUpdated'))
}
function scheduleCleanup() { clearTimeout(state.adjustmentTimer); if (!$('#liveCleanup').checked) return; state.adjustmentTimer = setTimeout(() => refreshAdjustedResult().catch(console.error), 180) }

async function trimTransparent(blob) {
  const bmp = await createImageBitmap(blob)
  try {
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height
    const ctx = c.getContext('2d', { willReadFrequently:true }); ctx.drawImage(bmp,0,0)
    const d = ctx.getImageData(0,0,c.width,c.height).data
    let minX=c.width,minY=c.height,maxX=-1,maxY=-1
    for(let y=0;y<c.height;y++){for(let x=0;x<c.width;x++){if(d[(y*c.width+x)*4+3]>0){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}}}
    if(maxX<0 || (minX===0&&minY===0&&maxX===c.width-1&&maxY===c.height-1)) return blob
    const out=document.createElement('canvas'); out.width=maxX-minX+1; out.height=maxY-minY+1; out.getContext('2d').drawImage(c,minX,minY,out.width,out.height,0,0,out.width,out.height)
    return await canvasBlob(out)
  } finally { bmp.close() }
}

async function resizeMax(blob, maxDim) {
  if (!maxDim) return blob
  const bmp = await createImageBitmap(blob)
  try {
    const current = Math.max(bmp.width,bmp.height); if (current <= maxDim) return blob
    const scale=maxDim/current,w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale))
    const c=document.createElement('canvas'); c.width=w;c.height=h;c.getContext('2d').drawImage(bmp,0,0,w,h); return await canvasBlob(c)
  } finally { bmp.close() }
}

async function prepareExport() {
  if (!state.resultBlob) throw new Error('No result')
  setActionMessage(t('preparingExport'))
  let blob = state.resultBlob
  if ($('#trimCheck').checked) blob = await trimTransparent(blob)
  const size = $('#sizeSelect').value
  if (size !== 'original') blob = await resizeMax(blob, Number(size))
  return blob
}

async function copyResult() {
  try {
    const blob = await prepareExport()
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('clipboard unsupported')
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    setActionMessage(t('copied'))
  } catch (err) { console.warn(err); setActionMessage(t('copyFail'), true) }
}

async function downloadResult() {
  try {
    const blob = await prepareExport(); const url=URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url;a.download=`${(state.file?.name||'image').replace(/\.[^.]+$/,'')}-cutout.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);setActionMessage('')
  } catch (err) { console.error(err); setActionMessage(err.message || 'Export failed', true) }
}

function reset() {
  clearTimeout(state.adjustmentTimer); revokeAllUrls()
  Object.assign(state,{file:null,rawResultBlob:null,resultBlob:null,naturalWidth:0,naturalHeight:0,panX:0,panY:0,scale:1,fitScale:1,view:'result',cleanup:0})
  $('#fileInput').value='';$('#idle').classList.remove('hidden');$('#workspace').classList.add('hidden');$('#mobileBar').classList.remove('show');$('#idleError').textContent='';$('#cleanupRange').value='0';$('#cleanupOutput').textContent='0';setActionMessage('')
}

async function processFile(file) {
  if (!file) return
  if (file.size > MAX) { $('#idleError').textContent = t('tooLarge'); return }
  revokeAllUrls(); state.file=file;state.rawResultBlob=null;state.resultBlob=null;state.cleanup=0
  $('#cleanupRange').value='0';$('#cleanupOutput').textContent='0';$('#idleError').textContent='';$('#idle').classList.add('hidden');$('#workspace').classList.remove('hidden');$('#inspector').classList.add('hidden');$('#viewerBar').classList.add('hidden');$('#mobileBar').classList.remove('show')
  $('#processing').classList.remove('hidden');$('#error').classList.add('hidden');$('#resultLayer').classList.add('hidden');$('#divider').classList.add('hidden');setStatus('processing', t('processing'))
  $('#fileName').textContent=file.name||'image';$('#inputSize').textContent=fmtBytes(file.size);$('#outputSize').textContent='—';$('#modelInfo').textContent='—';$('#outputDimensions').textContent='—';$('#imageDimensions').textContent='—'
  state.originalUrl=URL.createObjectURL(file);const original=$('#originalImg');original.src=state.originalUrl
  try { await waitForImage(original);state.naturalWidth=original.naturalWidth;state.naturalHeight=original.naturalHeight;$('#imageDimensions').textContent=fmtDims(state.naturalWidth,state.naturalHeight);$('#outputDimensions').textContent=fmtDims(state.naturalWidth,state.naturalHeight);fitView() } catch {}
  setView('original');updateProgress({stage:'preparing',progress:.03,message:'Preparing local model…'})
  try {
    const result = await removeBackground(file,{quality:'quality',onProgress:updateProgress})
    state.rawResultBlob=result.blob;state.resultBlob=result.blob;revokeResultUrl();state.resultUrl=URL.createObjectURL(result.blob);const resultImg=$('#resultImg');resultImg.src=state.resultUrl;await waitForImage(resultImg)
    if (!state.naturalWidth) {state.naturalWidth=result.width;state.naturalHeight=result.height}
    $('#outputSize').textContent=fmtBytes(result.blob.size);$('#outputDimensions').textContent=fmtDims(result.width,result.height);$('#modelInfo').textContent=`${result.model} / ${result.provider}`;$('#runtimeLabel').textContent=`LOCAL / ${String(result.provider).toUpperCase()}`
    $('#processing').classList.add('hidden');$('#inspector').classList.remove('hidden');$('#viewerBar').classList.remove('hidden');$('#mobileBar').classList.add('show');setStatus('done','DONE');setBg('transparent');fitView();setCompare(55);setView('result')
  } catch (err) { console.error(err);$('#processing').classList.add('hidden');$('#error').classList.remove('hidden');$('#errorMessage').textContent=err?.message||t('failed');setStatus('error','FAILED') }
}

function isTypingTarget(target) { return ['INPUT','SELECT','TEXTAREA'].includes(target?.tagName) }

$('#stage').addEventListener('wheel',(e)=>{if(!state.resultBlob)return;e.preventDefault();setScale(state.scale*(e.deltaY<0?1.12:.89),e.clientX,e.clientY)},{passive:false})
$('#stage').addEventListener('pointerdown',(e)=>{if(!state.naturalWidth)return;$('#stage').setPointerCapture?.(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===1){state.dragging=true;state.dragStartX=e.clientX;state.dragStartY=e.clientY;state.panStartX=state.panX;state.panStartY=state.panY;$('#stage').classList.add('dragging')}else if(state.pointers.size===2){const[a,b]=[...state.pointers.values()];state.pinchStartDistance=Math.hypot(a.x-b.x,a.y-b.y);state.pinchStartScale=state.scale;state.pinchStartPanX=state.panX;state.pinchStartPanY=state.panY;state.pinchMidX=(a.x+b.x)/2;state.pinchMidY=(a.y+b.y)/2;state.dragging=false}})
$('#stage').addEventListener('pointermove',(e)=>{if(!state.pointers.has(e.pointerId))return;state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===2){const[a,b]=[...state.pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(state.pinchStartDistance>0){state.panX=state.pinchStartPanX;state.panY=state.pinchStartPanY;state.scale=state.pinchStartScale;setScale(state.pinchStartScale*(d/state.pinchStartDistance),state.pinchMidX,state.pinchMidY)}return}if(state.dragging){state.panX=state.panStartX+(e.clientX-state.dragStartX);state.panY=state.panStartY+(e.clientY-state.dragStartY);applyTransform()}})
function releasePointer(e){state.pointers.delete(e.pointerId);if(state.pointers.size<2)state.pinchStartDistance=0;if(state.pointers.size===0){state.dragging=false;$('#stage').classList.remove('dragging')}}
$('#stage').addEventListener('pointerup',releasePointer);$('#stage').addEventListener('pointercancel',releasePointer);$('#stage').addEventListener('dblclick',fitView)

$('#fitBtn').onclick=fitView;$('#pixelBtn').onclick=pixelView;$('#zoomOut').onclick=()=>setScale(state.scale/1.25);$('#zoomIn').onclick=()=>setScale(state.scale*1.25)
$('#compareRange').addEventListener('input',(e)=>setCompare(e.target.value));$$('[data-view]').forEach((b)=>b.onclick=()=>setView(b.dataset.view));$$('[data-bg]').forEach((b)=>b.onclick=()=>setBg(b.dataset.bg))
$('#customBg').addEventListener('input',(e)=>{state.customBg=e.target.value;$('#resultLayer').style.setProperty('--custom-bg',state.customBg);if(state.bg==='custom')setBg('custom')})
$('#cleanupRange').addEventListener('input',(e)=>{state.cleanup=Number(e.target.value);$('#cleanupOutput').textContent=String(state.cleanup);scheduleCleanup()})
$('#liveCleanup').addEventListener('change',()=>{if($('#liveCleanup').checked)scheduleCleanup()});$('#resetEdgeBtn').onclick=()=>{state.cleanup=0;$('#cleanupRange').value='0';$('#cleanupOutput').textContent='0';refreshAdjustedResult().catch(console.error)}
$('#copyBtn').onclick=copyResult;$('#copyMobile').onclick=copyResult;$('#downloadBtn').onclick=downloadResult;$('#downloadMobile').onclick=downloadResult
$('#replaceBtn').onclick=reset;$('#replaceBtnTop').onclick=reset;$('#closeBtn').onclick=reset;$('#retryBtn').onclick=()=>processFile(state.file)
$('#fileInput').addEventListener('click',(e)=>e.currentTarget.value='');$('#fileInput').addEventListener('change',(e)=>processFile(e.target.files?.[0]))
$('#zhBtn').onclick=()=>{state.locale='zh-TW';applyLocale()};$('#enBtn').onclick=()=>{state.locale='en';applyLocale()}
$('#shortcutsBtn').onclick=()=>$('#shortcutModal').classList.remove('hidden');$('#shortcutClose').onclick=()=>$('#shortcutModal').classList.add('hidden');$('#shortcutModal').addEventListener('click',(e)=>{if(e.target===$('#shortcutModal'))$('#shortcutModal').classList.add('hidden')})
$('#pasteHintBtn').onclick=()=>setActionMessage(state.locale==='zh-TW'?'直接按 ⌘/Ctrl + V 貼上剪貼簿圖片。':'Press ⌘/Ctrl + V to paste an image from your clipboard.')
;['dragenter','dragover'].forEach((ev)=>$('#idle').addEventListener(ev,(e)=>{e.preventDefault();$('#idle').style.outline='5px solid var(--acid)';$('#idle').style.outlineOffset='-5px'}));['dragleave','drop'].forEach((ev)=>$('#idle').addEventListener(ev,(e)=>{e.preventDefault();$('#idle').style.outline=''}));$('#idle').addEventListener('drop',(e)=>processFile(e.dataTransfer.files?.[0]))
window.addEventListener('paste',(e)=>{const f=[...(e.clipboardData?.files||[])].find((x)=>x.type?.startsWith('image/'));if(f)processFile(f)})
window.addEventListener('resize',()=>{if(state.naturalWidth){const wasFit=Math.abs(state.scale-state.fitScale)<.01;state.fitScale=computeFitScale();if(wasFit)fitView();else applyTransform()}})
window.addEventListener('keydown',(e)=>{if(isTypingTarget(e.target))return;if(e.key==='b'||e.key==='B'){if(state.resultBlob&&!e.repeat){state.previousView=state.view;setView('original')}}else if(e.key==='0'){e.preventDefault();fitView()}else if(e.key==='1'){e.preventDefault();pixelView()}else if(e.key==='g'||e.key==='G'){if(state.resultBlob)cycleBg()}else if((e.key==='+'||e.key==='=')&&state.resultBlob){e.preventDefault();setScale(state.scale*1.25)}else if(e.key==='-'&&state.resultBlob){e.preventDefault();setScale(state.scale/1.25)}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'&&state.resultBlob){e.preventDefault();copyResult()}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&state.resultBlob){e.preventDefault();downloadResult()}else if(e.key==='Escape'){$('#shortcutModal').classList.add('hidden')}})
window.addEventListener('keyup',(e)=>{if((e.key==='b'||e.key==='B')&&state.resultBlob&&!isTypingTarget(e.target))setView(state.previousView||'result')})

const caps=getBrowserCapabilities();$('#engineBadge').textContent=caps.webgpu?'BiRefNet / WebGPU':'BiRefNet / WASM';$('#runtimeLabel').textContent=caps.webgpu?'LOCAL / WEBGPU READY':'LOCAL / WASM READY';applyLocale();setView('original')