import { getBrowserCapabilities, removeBackground } from '@bg0/browser'

const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]
const MAX = 20 * 1024 * 1024
const state = {
  locale: localStorage.getItem('png-remover-locale') || 'zh-TW',
  file: null,
  resultBlob: null,
  originalUrl: '',
  resultUrl: '',
  compare: 55,
  bg: 'transparent',
  zoom: 1,
  panX: 0,
  panY: 0,
  fitWidth: 0,
  fitHeight: 0,
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  panStartX: 0,
  panStartY: 0,
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartZoom: 1,
}

const text = {
  'zh-TW': {
    heroCopy: '<strong>免費，不按張收費。</strong><br>使用開源 BiRefNet 系列模型在瀏覽器端處理，WebGPU 優先、WASM 相容模式備援。',
    toolTitle: 'REMOVE BACKGROUND / 去背工具',
    uploadTitle: 'UPLOAD IMAGE.',
    uploadDesc: '點一下選擇照片、拖曳圖片到這裡，或使用 Ctrl / Cmd + V 貼上。第一次使用需要下載模型，之後會使用瀏覽器快取。',
    zoomHint: '100% = 完整顯示整張圖片；滑鼠滾輪縮放；放大後拖曳；手機雙指縮放；雙擊回到完整顯示。',
    tooLarge: '圖片超過 20MB，請先縮小檔案。',
    processing: '正在去背',
    failed: '處理失敗。請重新整理頁面後再試一次。',
  },
  en: {
    heroCopy: '<strong>Free, with no per-image fee.</strong><br>Open-source BiRefNet models run locally in the browser. WebGPU is preferred with a WASM compatibility fallback.',
    toolTitle: 'REMOVE BACKGROUND / TOOL',
    uploadTitle: 'UPLOAD IMAGE.',
    uploadDesc: 'Choose a photo, drag it here, or paste with Ctrl / Cmd + V. The model downloads on first use and is cached by the browser.',
    zoomHint: '100% = fit the entire image; mouse wheel to zoom; drag when zoomed; pinch on mobile; double-click to fit.',
    tooLarge: 'Image exceeds 20MB. Please use a smaller file.',
    processing: 'Removing background',
    failed: 'Processing failed. Reload the page and try again.',
  }
}

function applyLocale() {
  const t = text[state.locale]
  document.documentElement.lang = state.locale
  $('#heroCopy').innerHTML = t.heroCopy
  $('#toolTitle').textContent = t.toolTitle
  $('#uploadTitle').textContent = t.uploadTitle
  $('#uploadDesc').textContent = t.uploadDesc
  $('#zoomHint').textContent = t.zoomHint
  $('#zhBtn').classList.toggle('active', state.locale === 'zh-TW')
  $('#enBtn').classList.toggle('active', state.locale === 'en')
  localStorage.setItem('png-remover-locale', state.locale)
}

function fmt(n) {
  if (!Number.isFinite(n)) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 ** 2).toFixed(2)} MB`
}

function setStatus(kind, label) {
  $('#dot').className = `dot ${kind}`
  $('#statusText').textContent = label
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }

function fitImagesToStage() {
  const stage = $('#stage')
  const original = $('#originalImg')
  if (!stage || !original?.naturalWidth || !original?.naturalHeight) return false

  const inset = 18
  const availableWidth = Math.max(1, stage.clientWidth - inset * 2)
  const availableHeight = Math.max(1, stage.clientHeight - inset * 2)
  const fitScale = Math.min(
    availableWidth / original.naturalWidth,
    availableHeight / original.naturalHeight,
  )

  state.fitWidth = Math.max(1, Math.floor(original.naturalWidth * fitScale))
  state.fitHeight = Math.max(1, Math.floor(original.naturalHeight * fitScale))

  for (const img of [$('#originalImg'), $('#resultImg')]) {
    img.style.width = `${state.fitWidth}px`
    img.style.height = `${state.fitHeight}px`
    img.style.maxWidth = 'none'
    img.style.maxHeight = 'none'
    img.style.objectFit = 'fill'
  }
  return true
}

function constrainPan() {
  if (state.zoom <= 1 || !state.fitWidth || !state.fitHeight) {
    state.panX = 0
    state.panY = 0
    return
  }

  const stage = $('#stage')
  const scaledWidth = state.fitWidth * state.zoom
  const scaledHeight = state.fitHeight * state.zoom
  const maxX = Math.max(0, (scaledWidth - stage.clientWidth) / 2)
  const maxY = Math.max(0, (scaledHeight - stage.clientHeight) / 2)
  state.panX = clamp(state.panX, -maxX, maxX)
  state.panY = clamp(state.panY, -maxY, maxY)
}

function applyViewTransform() {
  constrainPan()
  const transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`
  $('#originalImg').style.transform = transform
  $('#resultImg').style.transform = transform
  $('#zoomValue').textContent = `${Math.round(state.zoom * 100)}%`
  $('#stage').classList.toggle('can-pan', state.zoom > 1.001)
}

function setZoom(next, keepPan = true) {
  state.zoom = clamp(next, 0.5, 5)
  if (!keepPan || state.zoom <= 1) {
    state.panX = 0
    state.panY = 0
  }
  applyViewTransform()
}

function resetView() {
  fitImagesToStage()
  state.zoom = 1
  state.panX = 0
  state.panY = 0
  applyViewTransform()
}

function setCompare(v) {
  state.compare = Number(v)
  $('#compareRange').value = String(state.compare)
  $('#compareOutput').textContent = `${state.compare}%`
  $('#resultLayer').style.clipPath = `inset(0 ${100 - state.compare}% 0 0)`
  $('#divider').style.left = `${state.compare}%`
}

function setBg(mode) {
  state.bg = mode
  const layer = $('#resultLayer')
  layer.classList.remove('checker', 'bg-white', 'bg-dark')
  layer.classList.add(mode === 'transparent' ? 'checker' : mode === 'white' ? 'bg-white' : 'bg-dark')
  $$('[data-bg]').forEach((b) => b.classList.toggle('active', b.dataset.bg === mode))
}

function revokeUrls() {
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl)
  if (state.resultUrl) URL.revokeObjectURL(state.resultUrl)
  state.originalUrl = ''
  state.resultUrl = ''
}

function reset() {
  revokeUrls()
  state.file = null
  state.resultBlob = null
  state.fitWidth = 0
  state.fitHeight = 0
  $('#fileInput').value = ''
  $('#idle').classList.remove('hidden')
  $('#workspace').classList.add('hidden')
  $('#mobileBar').classList.remove('show')
  $('#idleError').textContent = ''
  resetView()
}

function updateProgress(evt) {
  const p = Math.round(clamp(evt.progress || 0, 0.03, 1) * 100)
  $('#progressBar').style.width = `${p}%`
  $('#progressText').textContent = `${p}%`
  $('#processingMessage').textContent = evt.message || ''
  const title = evt.stage === 'downloading' ? 'DOWNLOADING MODEL.' : evt.stage === 'processing' ? 'REMOVING BACKGROUND.' : evt.stage === 'finishing' ? 'REFINING EDGES.' : 'PREPARING MODEL.'
  $('#processingTitle').textContent = title
}

async function processFile(file) {
  if (!file) return
  if (file.size > MAX) {
    $('#idleError').textContent = text[state.locale].tooLarge
    return
  }
  revokeUrls()
  state.file = file
  state.resultBlob = null
  state.fitWidth = 0
  state.fitHeight = 0
  state.originalUrl = URL.createObjectURL(file)
  const originalImg = $('#originalImg')
  originalImg.onload = () => resetView()
  originalImg.src = state.originalUrl
  $('#fileName').textContent = file.name || 'image'
  $('#inputSize').textContent = fmt(file.size)
  $('#outputSize').textContent = '—'
  $('#modelInfo').textContent = '—'
  $('#idleError').textContent = ''
  $('#idle').classList.add('hidden')
  $('#workspace').classList.remove('hidden')
  $('#processing').classList.remove('hidden')
  $('#error').classList.add('hidden')
  $('#editor').classList.add('hidden')
  $('#resultLayer').classList.add('hidden')
  $('#divider').classList.add('hidden')
  setStatus('processing', text[state.locale].processing)
  resetView()
  setCompare(55)
  updateProgress({ progress: .03, stage: 'preparing', message: 'Preparing local model…' })

  try {
    const result = await removeBackground(file, {
      quality: 'quality',
      onProgress: updateProgress,
    })
    state.resultBlob = result.blob
    state.resultUrl = URL.createObjectURL(result.blob)
    const resultImg = $('#resultImg')
    resultImg.onload = () => {
      fitImagesToStage()
      applyViewTransform()
    }
    resultImg.src = state.resultUrl
    $('#outputSize').textContent = fmt(result.blob.size)
    $('#modelInfo').textContent = `${result.model} / ${result.provider}`
    $('#processing').classList.add('hidden')
    $('#resultLayer').classList.remove('hidden')
    $('#divider').classList.remove('hidden')
    $('#editor').classList.remove('hidden')
    $('#mobileBar').classList.add('show')
    setStatus('done', 'DONE')
    setBg('transparent')
    setCompare(55)
    resetView()
  } catch (err) {
    console.error(err)
    $('#processing').classList.add('hidden')
    $('#error').classList.remove('hidden')
    $('#errorMessage').textContent = err?.message || text[state.locale].failed
    setStatus('error', 'FAILED')
  }
}

function saveResult() {
  if (!state.resultBlob) return
  const a = document.createElement('a')
  const u = URL.createObjectURL(state.resultBlob)
  a.href = u
  a.download = `${(state.file?.name || 'image').replace(/\.[^.]+$/, '')}-transparent.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(u), 1500)
}

$('#stage').addEventListener('wheel', (e) => {
  if ($('#editor').classList.contains('hidden')) return
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.12 : 0.89
  setZoom(state.zoom * factor)
}, { passive: false })

$('#stage').addEventListener('pointerdown', (e) => {
  if ($('#editor').classList.contains('hidden')) return
  $('#stage').setPointerCapture?.(e.pointerId)
  state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (state.pointers.size === 1) {
    state.dragging = true
    state.dragStartX = e.clientX
    state.dragStartY = e.clientY
    state.panStartX = state.panX
    state.panStartY = state.panY
    $('#stage').classList.add('dragging')
  } else if (state.pointers.size === 2) {
    const [a, b] = [...state.pointers.values()]
    state.pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y)
    state.pinchStartZoom = state.zoom
    state.dragging = false
  }
})

$('#stage').addEventListener('pointermove', (e) => {
  if (!state.pointers.has(e.pointerId)) return
  state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (state.pointers.size === 2) {
    const [a, b] = [...state.pointers.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    if (state.pinchStartDistance > 0) setZoom(state.pinchStartZoom * (d / state.pinchStartDistance))
    return
  }
  if (state.dragging && state.zoom > 1) {
    state.panX = state.panStartX + (e.clientX - state.dragStartX)
    state.panY = state.panStartY + (e.clientY - state.dragStartY)
    applyViewTransform()
  }
})

function releasePointer(e) {
  state.pointers.delete(e.pointerId)
  if (state.pointers.size < 2) state.pinchStartDistance = 0
  if (state.pointers.size === 0) {
    state.dragging = false
    $('#stage').classList.remove('dragging')
  }
}
$('#stage').addEventListener('pointerup', releasePointer)
$('#stage').addEventListener('pointercancel', releasePointer)
$('#stage').addEventListener('dblclick', resetView)

$('#zoomOut').onclick = () => setZoom(state.zoom - .25)
$('#zoomIn').onclick = () => setZoom(state.zoom + .25)
$('#fitBtn').onclick = resetView
$('#compareRange').addEventListener('input', (e) => setCompare(e.target.value))
$$('[data-bg]').forEach((b) => { b.onclick = () => setBg(b.dataset.bg) })
$('#downloadBtn').onclick = saveResult
$('#downloadMobile').onclick = saveResult
$('#newBtn').onclick = reset
$('#replaceMobile').onclick = reset
$('#closeBtn').onclick = reset
$('#retryBtn').onclick = () => processFile(state.file)
$('#fileInput').addEventListener('click', (e) => { e.currentTarget.value = '' })
$('#fileInput').addEventListener('change', (e) => processFile(e.target.files?.[0]))
$('#zhBtn').onclick = () => { state.locale = 'zh-TW'; applyLocale() }
$('#enBtn').onclick = () => { state.locale = 'en'; applyLocale() }

;['dragenter', 'dragover'].forEach((ev) => $('#idle').addEventListener(ev, (e) => { e.preventDefault(); e.currentTarget.style.outline = '5px solid var(--acid)' }))
;['dragleave', 'drop'].forEach((ev) => $('#idle').addEventListener(ev, (e) => { e.preventDefault(); e.currentTarget.style.outline = '' }))
$('#idle').addEventListener('drop', (e) => processFile(e.dataTransfer.files?.[0]))
window.addEventListener('paste', (e) => {
  const f = [...(e.clipboardData?.files || [])].find((x) => x.type?.startsWith('image/'))
  if (f) processFile(f)
})

window.addEventListener('resize', () => {
  if (!$('#workspace').classList.contains('hidden') && $('#originalImg').naturalWidth) {
    fitImagesToStage()
    applyViewTransform()
  }
})

const caps = getBrowserCapabilities()
$('#kicker').textContent = caps.webgpu ? 'FREE BIREFNET / WEBGPU READY' : 'FREE BIREFNET / WASM COMPATIBILITY'
applyLocale()