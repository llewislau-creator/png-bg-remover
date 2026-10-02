import { removeBackground } from '@bg0/browser'
import heic2any from 'heic2any'
import JSZip from 'jszip'
import './batch-refine.css'

const $ = (s) => document.querySelector(s)
const MAX_FILE = 20 * 1024 * 1024
const ACCEPT_RE = /\.(jpe?g|png|webp|heic|heif)$/i
const batch = { items: [], running: false, generation: 0, format: 'png', jpgBg: '#ffffff', nextId: 1 }
let singleRefinedBlob = null
let singleRefinedUrl = ''
let settingSingleRefinedSrc = false

function isSupported(file) { return Boolean(file && (file.type?.startsWith('image/') || ACCEPT_RE.test(file.name || ''))) }
function isHeic(file) { return /heic|heif/i.test(file?.type || '') || /\.(heic|heif)$/i.test(file?.name || '') }
function fmtBytes(n) { if (!Number.isFinite(n)) return '—'; if (n < 1024) return `${n} B`; if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`; return `${(n / 1024 ** 2).toFixed(2)} MB` }
function safeBase(name) { return (name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'image' }
function blobUrl(blob) { return URL.createObjectURL(blob) }
function revoke(url) { if (url) URL.revokeObjectURL(url) }
function canvasBlob(canvas, type = 'image/png', quality) { return new Promise((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Image encode failed')), type, quality)) }

async function normalizeInput(file) {
  if (!isHeic(file)) return file
  const converted = await heic2any({ blob: file, toType: 'image/png', quality: 0.96 })
  const first = Array.isArray(converted) ? converted[0] : converted
  if (!(first instanceof Blob)) throw new Error('HEIC conversion failed')
  return first
}

async function exportBlob(blob, format = batch.format, bg = batch.jpgBg) {
  if (format === 'png') return blob
  const bmp = await createImageBitmap(blob)
  try {
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height
    const ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0)
    return await canvasBlob(c, 'image/jpeg', .92)
  } finally { bmp.close() }
}

function triggerDownload(blob, filename) {
  const url = blobUrl(blob), a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => revoke(url), 1500)
}

function injectBatchUI() {
  if ($('#batchWorkspace')) return
  const fileInput = $('#fileInput')
  if (fileInput) fileInput.multiple = true

  const dropActions = document.querySelector('.drop-actions')
  if (dropActions) {
    const b = document.createElement('button')
    b.id = 'batchLaunch'; b.type = 'button'; b.className = 'ghost batch-launch'; b.textContent = 'BATCH / 批量處理'
    dropActions.appendChild(b)
    const note = document.createElement('div')
    note.className = 'batch-feature-note'
    note.innerHTML = '<span><b>BATCH</b> · JPG / JPEG / PNG / WEBP / HEIC · PNG / JPG · ZIP</span><span><b>MANUAL REFINE</b> · 擦除 / 還原局部 · Undo / Redo · 修正髮絲、商品邊緣與細小物體</span>'
    dropActions.parentElement?.appendChild(note)
  }

  const hiddenInput = document.createElement('input')
  hiddenInput.id = 'batchInput'; hiddenInput.type = 'file'; hiddenInput.multiple = true
  hiddenInput.accept = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif'; hiddenInput.hidden = true
  document.body.appendChild(hiddenInput)

  const workspace = document.createElement('div')
  workspace.id = 'batchWorkspace'; workspace.className = 'batch-workspace'
  workspace.innerHTML = `
    <div class="batch-head">
      <div class="batch-title"><i></i><div><strong>BATCH CUTOUT / 批量處理</strong><span id="batchHeadStatus">SELECT MULTIPLE · PROCESS LOCALLY · EXPORT INDIVIDUAL OR ZIP</span></div></div>
      <div class="batch-toolbar">
        <div class="batch-format-wrap"><label>OUTPUT</label><select id="batchFormat"><option value="png">PNG / ALPHA</option><option value="jpg">JPG</option></select></div>
        <span id="batchJpgBg" class="batch-jpg-bg"><label>JPG BG</label><select id="batchBg"><option value="#ffffff">WHITE</option><option value="#050806">BLACK</option><option value="#c9ff39">ACID</option></select></span>
        <button id="batchAdd">+ ADD IMAGES</button><button id="batchZip" class="primary-action" disabled>DOWNLOAD ZIP</button><button id="batchClose">CLEAR / RETURN</button>
      </div>
    </div>
    <div class="batch-summary">
      <div class="batch-stat"><small>SELECTED</small><b id="batchSelected">0</b></div>
      <div class="batch-stat"><small>PROCESSING</small><b id="batchProcessing">0</b></div>
      <div class="batch-stat acid"><small>DONE</small><b id="batchDone">0</b></div>
      <div class="batch-stat"><small>FAILED</small><b id="batchFailed">0</b></div>
    </div>
    <div id="batchGrid" class="batch-grid"></div>
    <div id="batchEmpty" class="batch-empty">一次選擇或拖入多張圖片。為避免 GPU / 記憶體過載，瀏覽器會按隊列逐張完成。</div>`
  $('#idle')?.after(workspace)

  const refineBtn = document.createElement('button')
  refineBtn.id = 'refineSingleBtn'; refineBtn.type = 'button'; refineBtn.className = 'refine-single-btn'; refineBtn.textContent = 'REFINE MANUALLY / 手動精修'
  document.querySelector('.action-stack')?.prepend(refineBtn)

  const modal = document.createElement('div')
  modal.id = 'refineModal'; modal.className = 'refine-modal'
  modal.innerHTML = `
    <div class="refine-top">
      <div class="refine-heading"><strong id="refineTitle">MANUAL MASK REFINE / 手動精修</strong><span>KEEP 還原主體 · ERASE 擦除背景 · 可 Undo / Redo</span></div>
      <div class="refine-tools">
        <button id="refineKeep" class="active">KEEP / 還原</button><button id="refineErase">ERASE / 擦除</button>
        <label>BRUSH</label><input id="refineSize" type="range" min="8" max="180" value="48"/><span id="refineSizeOut">48</span>
        <button id="refineUndo">UNDO</button><button id="refineRedo">REDO</button>
      </div>
    </div>
    <div class="refine-stage"><div id="refineCanvasWrap" class="refine-canvas-wrap"><canvas id="refineCanvas"></canvas><div id="brushCursor" class="brush-cursor"></div></div><div id="refineBusy" class="refine-busy">BUILDING FULL-RES MASK…</div></div>
    <div class="refine-bottom"><div class="refine-bottom-note">只修改 alpha mask；原圖像素留在瀏覽器內。KEEP 可補回被 AI 刪走的位置，ERASE 可清走殘留背景。</div><div class="refine-bottom-actions"><button id="refineCancel">CANCEL</button><button id="refineReset">RESET MASK</button><button id="refineSave" class="save">APPLY REFINE / 套用精修</button></div></div>`
  document.body.appendChild(modal)
}

function showBatch() {
  $('#idle')?.classList.add('hidden'); $('#workspace')?.classList.add('hidden'); $('#batchWorkspace')?.classList.add('show')
}
function hideBatch() {
  $('#batchWorkspace')?.classList.remove('show'); $('#idle')?.classList.remove('hidden')
}

function makeItem(file) {
  return { id: batch.nextId++, file, inputBlob: null, resultBlob: null, resultUrl: '', status: file.size > MAX_FILE ? 'error' : 'queued', error: file.size > MAX_FILE ? 'File exceeds 20 MB' : '', progress: 0 }
}

function renderBatchCard(item) {
  const card = document.createElement('article'); card.className = 'batch-card'; card.dataset.id = String(item.id)
  const src = item.resultUrl || blobUrl(item.file); if (!item.resultUrl) setTimeout(() => revoke(src), 5000)
  card.innerHTML = `
    <div class="batch-thumb"><img alt="${safeBase(item.file.name)}" src="${src}"/><div class="batch-progress-overlay ${item.status === 'done' || item.status === 'error' ? 'hidden' : ''}"><div class="batch-progress-bar"><i style="width:${item.progress}%"></i></div><div class="batch-progress-text"><span>${item.status.toUpperCase()}</span><span>${item.progress}%</span></div></div></div>
    <div class="batch-card-body"><div class="batch-file"><strong title="${item.file.name}">${item.file.name}</strong><span>${fmtBytes(item.file.size)}</span></div><div class="batch-status ${item.status === 'error' ? 'error' : ''}">${item.error || statusLabel(item)}</div><div class="batch-card-actions"><button class="refine" ${item.status === 'done' ? '' : 'disabled'}>REFINE / 精修</button><button class="download" ${item.status === 'done' ? '' : 'disabled'}>DOWNLOAD</button></div></div>`
  card.querySelector('.download')?.addEventListener('click', () => downloadItem(item))
  card.querySelector('.refine')?.addEventListener('click', () => refineBatchItem(item))
  return card
}

function statusLabel(item) {
  if (item.status === 'queued') return '等待處理 / QUEUED'
  if (item.status === 'preparing') return isHeic(item.file) ? '轉換 HEIC… / CONVERTING' : '準備模型 / PREPARING'
  if (item.status === 'processing') return '正在去背 / PROCESSING'
  if (item.status === 'done') return '完成 / READY'
  return item.error || 'FAILED'
}

function refreshBatchUI() {
  const grid = $('#batchGrid'); if (!grid) return
  grid.innerHTML = ''; batch.items.forEach((item) => grid.appendChild(renderBatchCard(item)))
  $('#batchEmpty')?.classList.toggle('hidden', batch.items.length > 0)
  const processing = batch.items.filter((x) => x.status === 'preparing' || x.status === 'processing').length
  const done = batch.items.filter((x) => x.status === 'done').length
  const failed = batch.items.filter((x) => x.status === 'error').length
  $('#batchSelected').textContent = String(batch.items.length); $('#batchProcessing').textContent = String(processing); $('#batchDone').textContent = String(done); $('#batchFailed').textContent = String(failed)
  $('#batchZip').disabled = done === 0
  $('#batchHeadStatus').textContent = batch.running ? `${done} / ${batch.items.length} DONE · LOCAL QUEUE ACTIVE` : done ? `${done} READY · DOWNLOAD INDIVIDUALLY OR ZIP` : 'SELECT MULTIPLE · PROCESS LOCALLY · EXPORT INDIVIDUAL OR ZIP'
}

function updateItemProgress(item, pct, text) {
  item.progress = Math.max(1, Math.min(100, Math.round((pct || .01) * 100)))
  const card = document.querySelector(`.batch-card[data-id="${item.id}"]`)
  if (!card) return
  const bar = card.querySelector('.batch-progress-bar i'); if (bar) bar.style.width = `${item.progress}%`
  const spans = card.querySelectorAll('.batch-progress-text span'); if (spans[0]) spans[0].textContent = text || item.status.toUpperCase(); if (spans[1]) spans[1].textContent = `${item.progress}%`
  const status = card.querySelector('.batch-status'); if (status) status.textContent = statusLabel(item)
}

async function processItem(item, generation) {
  if (item.status === 'error') return
  try {
    item.status = 'preparing'; item.progress = 2; refreshBatchUI()
    item.inputBlob = await normalizeInput(item.file)
    if (generation !== batch.generation) return
    item.status = 'processing'; refreshBatchUI()
    const result = await removeBackground(item.inputBlob, { quality: 'quality', onProgress: (evt) => updateItemProgress(item, evt.progress, evt.stage === 'downloading' ? 'MODEL' : 'CUTOUT') })
    if (generation !== batch.generation) return
    item.resultBlob = result.blob; revoke(item.resultUrl); item.resultUrl = blobUrl(result.blob); item.status = 'done'; item.progress = 100; item.error = ''
  } catch (err) { item.status = 'error'; item.error = err?.message || 'Processing failed' }
  refreshBatchUI()
}

async function runBatchQueue() {
  if (batch.running) return
  batch.running = true; const generation = batch.generation; refreshBatchUI()
  try {
    while (generation === batch.generation) {
      const next = batch.items.find((x) => x.status === 'queued')
      if (!next) break
      await processItem(next, generation)
    }
  } finally { if (generation === batch.generation) batch.running = false; refreshBatchUI() }
}

function addBatchFiles(files) {
  const accepted = [...files].filter(isSupported)
  if (!accepted.length) return
  showBatch(); accepted.forEach((f) => batch.items.push(makeItem(f))); refreshBatchUI(); runBatchQueue()
}

async function downloadItem(item) {
  if (!item.resultBlob) return
  try { const out = await exportBlob(item.resultBlob); const ext = batch.format === 'png' ? 'png' : 'jpg'; triggerDownload(out, `${safeBase(item.file.name)}-cutout.${ext}`) } catch (err) { item.error = err?.message || 'Export failed'; refreshBatchUI() }
}

async function downloadZip() {
  const done = batch.items.filter((x) => x.status === 'done' && x.resultBlob); if (!done.length) return
  const btn = $('#batchZip'); btn.disabled = true; const old = btn.textContent; btn.textContent = 'BUILDING ZIP…'
  try {
    const zip = new JSZip(), ext = batch.format === 'png' ? 'png' : 'jpg'
    for (const item of done) zip.file(`${safeBase(item.file.name)}-cutout.${ext}`, await exportBlob(item.resultBlob))
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } })
    triggerDownload(blob, `png-cutout-batch-${Date.now()}.zip`)
  } catch (err) { console.error(err); alert(err?.message || 'ZIP export failed') }
  finally { btn.textContent = old; btn.disabled = false }
}

function clearBatch() {
  batch.generation++; batch.running = false; batch.items.forEach((x) => revoke(x.resultUrl)); batch.items = []; refreshBatchUI(); hideBatch()
}

const refine = { originalBmp: null, resultBmp: null, baseMask: null, mask: null, ew: 0, eh: 0, fullW: 0, fullH: 0, strokes: [], cursor: 0, mode: 'keep', size: 48, drawing: false, current: null, onSave: null }

function closeBitmaps() { refine.originalBmp?.close?.(); refine.resultBmp?.close?.(); refine.originalBmp = null; refine.resultBmp = null }
function setRefineMode(mode) { refine.mode = mode; $('#refineKeep').classList.toggle('active', mode === 'keep'); $('#refineErase').classList.toggle('active', mode === 'erase') }

function maskFromResult(bitmap, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h); for (let i = 0; i < img.data.length; i += 4) { img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255 }
  ctx.putImageData(img, 0, 0); return c
}

function drawStroke(ctx, stroke, w, h) {
  if (!stroke?.points?.length) return
  const points = stroke.points, size = Math.max(1, stroke.sizeNorm * Math.min(w, h)); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = size
  if (stroke.mode === 'erase') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.fillStyle = '#000' } else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff' }
  if (points.length === 1) { ctx.beginPath(); ctx.arc(points[0].x * w, points[0].y * h, size / 2, 0, Math.PI * 2); ctx.fill() }
  else { ctx.beginPath(); ctx.moveTo(points[0].x * w, points[0].y * h); for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x * w, points[i].y * h); ctx.stroke() }
  ctx.restore()
}

function rebuildMask() {
  if (!refine.mask || !refine.baseMask) return
  const ctx = refine.mask.getContext('2d'); ctx.clearRect(0, 0, refine.ew, refine.eh); ctx.drawImage(refine.baseMask, 0, 0)
  for (let i = 0; i < refine.cursor; i++) drawStroke(ctx, refine.strokes[i], refine.ew, refine.eh)
  renderRefinePreview()
}

function renderRefinePreview() {
  const c = $('#refineCanvas'); if (!c || !refine.originalBmp || !refine.mask) return
  c.width = refine.ew; c.height = refine.eh; const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(refine.originalBmp, 0, 0, refine.ew, refine.eh); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(refine.mask, 0, 0); ctx.globalCompositeOperation = 'source-over'
}

function pointFromPointer(e) {
  const c = $('#refineCanvas'), r = c.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }
}

function updateBrushCursor(e) {
  const wrap = $('#refineCanvasWrap'), c = $('#refineCanvas'), cursor = $('#brushCursor'); if (!wrap || !c || !cursor) return
  const wr = wrap.getBoundingClientRect(), cr = c.getBoundingClientRect(), cssSize = refine.size * (cr.width / Math.max(1, refine.ew)); cursor.style.width = `${cssSize}px`; cursor.style.height = `${cssSize}px`; cursor.style.left = `${e.clientX - wr.left}px`; cursor.style.top = `${e.clientY - wr.top}px`
}

async function openRefine({ originalBlob, resultBlob, title, onSave }) {
  closeBitmaps(); refine.strokes = []; refine.cursor = 0; refine.mode = 'keep'; refine.size = 48; refine.onSave = onSave; setRefineMode('keep'); $('#refineSize').value = '48'; $('#refineSizeOut').textContent = '48'; $('#refineTitle').textContent = title || 'MANUAL MASK REFINE / 手動精修'
  $('#refineModal').classList.add('show'); document.documentElement.style.overflow = 'hidden'; $('#refineBusy').classList.add('show'); $('#refineBusy').textContent = 'PREPARING MASK…'
  try {
    refine.originalBmp = await createImageBitmap(originalBlob); refine.resultBmp = await createImageBitmap(resultBlob); refine.fullW = refine.resultBmp.width; refine.fullH = refine.resultBmp.height
    const scale = Math.min(1, 1600 / Math.max(refine.fullW, refine.fullH)); refine.ew = Math.max(1, Math.round(refine.fullW * scale)); refine.eh = Math.max(1, Math.round(refine.fullH * scale))
    refine.baseMask = maskFromResult(refine.resultBmp, refine.ew, refine.eh); refine.mask = document.createElement('canvas'); refine.mask.width = refine.ew; refine.mask.height = refine.eh; refine.mask.getContext('2d').drawImage(refine.baseMask, 0, 0); renderRefinePreview()
  } catch (err) { console.error(err); closeRefine(); alert(err?.message || 'Cannot open refine editor') }
  finally { $('#refineBusy').classList.remove('show') }
}

function closeRefine() { $('#refineModal')?.classList.remove('show'); document.documentElement.style.overflow = ''; refine.drawing = false; refine.current = null; closeBitmaps() }

async function buildRefinedFullBlob() {
  const w = refine.fullW, h = refine.fullH, mask = maskFromResult(refine.resultBmp, w, h), mctx = mask.getContext('2d')
  for (let i = 0; i < refine.cursor; i++) drawStroke(mctx, refine.strokes[i], w, h)
  const out = document.createElement('canvas'); out.width = w; out.height = h; const ctx = out.getContext('2d'); ctx.drawImage(refine.originalBmp, 0, 0, w, h); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-over'; return await canvasBlob(out)
}

async function saveRefine() {
  const busy = $('#refineBusy'); busy.classList.add('show'); busy.textContent = 'BUILDING FULL-RES MASK…'
  try { const blob = await buildRefinedFullBlob(); await refine.onSave?.(blob); closeRefine() } catch (err) { console.error(err); busy.textContent = err?.message || 'REFINE FAILED'; setTimeout(() => busy.classList.remove('show'), 1200) }
}

async function refineBatchItem(item) {
  if (!item.resultBlob) return
  await openRefine({ originalBlob: item.inputBlob || item.file, resultBlob: item.resultBlob, title: `${item.file.name} · MANUAL REFINE`, onSave: async (blob) => { item.resultBlob = blob; revoke(item.resultUrl); item.resultUrl = blobUrl(blob); item.error = '手動精修已套用 / MANUALLY REFINED'; refreshBatchUI() } })
}

async function blobFromImage(img) { if (!img?.src) throw new Error('Image unavailable'); const res = await fetch(img.src); if (!res.ok) throw new Error('Cannot read image'); return await res.blob() }

async function refineSingle() {
  const resultImg = $('#resultImg'), originalImg = $('#originalImg'); if (!resultImg?.src || !originalImg?.src) return
  try {
    const [originalBlob, resultBlob] = await Promise.all([blobFromImage(originalImg), blobFromImage(resultImg)])
    await openRefine({ originalBlob, resultBlob, title: `${$('#fileName')?.textContent || 'IMAGE'} · MANUAL REFINE`, onSave: async (blob) => {
      singleRefinedBlob = blob; revoke(singleRefinedUrl); singleRefinedUrl = blobUrl(blob); settingSingleRefinedSrc = true; resultImg.src = singleRefinedUrl; $('#outputSize').textContent = fmtBytes(blob.size); setTimeout(() => { settingSingleRefinedSrc = false }, 0)
      const msg = $('#actionMessage'); if (msg) { msg.textContent = '手動精修已套用。COPY / DOWNLOAD 會使用精修結果。'; msg.style.color = 'var(--acid)' }
    } })
  } catch (err) { console.error(err); const msg = $('#actionMessage'); if (msg) msg.textContent = err?.message || 'Cannot open manual refine' }
}

async function trimBlob(blob) {
  const bmp = await createImageBitmap(blob)
  try {
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bmp, 0, 0); const d = ctx.getImageData(0, 0, c.width, c.height).data
    let minX = c.width, minY = c.height, maxX = -1, maxY = -1
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
    if (maxX < 0 || (minX === 0 && minY === 0 && maxX === c.width - 1 && maxY === c.height - 1)) return blob
    const out = document.createElement('canvas'); out.width = maxX - minX + 1; out.height = maxY - minY + 1; out.getContext('2d').drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height); return await canvasBlob(out)
  } finally { bmp.close() }
}

async function resizeBlob(blob, maxDim) {
  if (!maxDim) return blob; const bmp = await createImageBitmap(blob)
  try { const m = Math.max(bmp.width, bmp.height); if (m <= maxDim) return blob; const s = maxDim / m, w = Math.round(bmp.width * s), h = Math.round(bmp.height * s), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(bmp, 0, 0, w, h); return await canvasBlob(c) } finally { bmp.close() }
}

async function prepareSingleRefined() { let blob = singleRefinedBlob; if (!blob) return null; if ($('#trimCheck')?.checked) blob = await trimBlob(blob); const v = $('#sizeSelect')?.value; if (v && v !== 'original') blob = await resizeBlob(blob, Number(v)); return blob }

function hookSingleExports() {
  const download = $('#downloadBtn'), downloadMobile = $('#downloadMobile'), copy = $('#copyBtn'), copyMobile = $('#copyMobile')
  const oldDownload = download?.onclick, oldDownloadMobile = downloadMobile?.onclick, oldCopy = copy?.onclick, oldCopyMobile = copyMobile?.onclick
  const refinedDownload = async (fallback, ev) => { if (!singleRefinedBlob) return fallback?.call(ev?.currentTarget || null, ev); ev?.preventDefault(); const blob = await prepareSingleRefined(); triggerDownload(blob, `${safeBase($('#fileName')?.textContent || 'image')}-cutout.png`) }
  const refinedCopy = async (fallback, ev) => { if (!singleRefinedBlob) return fallback?.call(ev?.currentTarget || null, ev); ev?.preventDefault(); try { const blob = await prepareSingleRefined(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); $('#actionMessage').textContent = '精修 PNG 已複製。' } catch { $('#actionMessage').textContent = '此瀏覽器無法直接複製 PNG，請下載。' } }
  if (download) download.onclick = (e) => refinedDownload(oldDownload, e); if (downloadMobile) downloadMobile.onclick = (e) => refinedDownload(oldDownloadMobile, e); if (copy) copy.onclick = (e) => refinedCopy(oldCopy, e); if (copyMobile) copyMobile.onclick = (e) => refinedCopy(oldCopyMobile, e)
  const resultImg = $('#resultImg'); if (resultImg) new MutationObserver(() => { if (!settingSingleRefinedSrc && singleRefinedBlob) { singleRefinedBlob = null; revoke(singleRefinedUrl); singleRefinedUrl = '' } }).observe(resultImg, { attributes: true, attributeFilter: ['src'] })
}

function bindUI() {
  $('#batchLaunch')?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); $('#batchInput').click() })
  $('#batchInput')?.addEventListener('change', (e) => { addBatchFiles(e.target.files || []); e.target.value = '' })
  $('#batchAdd')?.addEventListener('click', () => $('#batchInput').click())
  $('#batchClose')?.addEventListener('click', clearBatch); $('#batchZip')?.addEventListener('click', downloadZip)
  $('#batchFormat')?.addEventListener('change', (e) => { batch.format = e.target.value; $('#batchJpgBg').classList.toggle('show', batch.format === 'jpg') })
  $('#batchBg')?.addEventListener('change', (e) => { batch.jpgBg = e.target.value })
  $('#refineSingleBtn')?.addEventListener('click', refineSingle)

  const mainInput = $('#fileInput')
  mainInput?.addEventListener('change', (e) => { const files = e.target.files; if (files?.length > 1) { e.preventDefault(); e.stopImmediatePropagation(); addBatchFiles(files); e.target.value = '' } }, true)
  $('#idle')?.addEventListener('drop', (e) => { const files = e.dataTransfer?.files; if (files?.length > 1) { e.preventDefault(); e.stopImmediatePropagation(); addBatchFiles(files) } }, true)

  const wrap = $('#refineCanvasWrap')
  wrap?.addEventListener('pointerdown', (e) => { if (!refine.mask) return; e.preventDefault(); refine.drawing = true; if (refine.cursor < refine.strokes.length) refine.strokes = refine.strokes.slice(0, refine.cursor); const p = pointFromPointer(e); refine.current = { mode: refine.mode, sizeNorm: refine.size / Math.min(refine.ew, refine.eh), points: [p] }; drawStroke(refine.mask.getContext('2d'), refine.current, refine.ew, refine.eh); renderRefinePreview(); wrap.setPointerCapture?.(e.pointerId); updateBrushCursor(e) })
  wrap?.addEventListener('pointermove', (e) => { updateBrushCursor(e); if (!refine.drawing || !refine.current) return; const p = pointFromPointer(e), pts = refine.current.points, last = pts[pts.length - 1]; if (Math.hypot(p.x - last.x, p.y - last.y) < .0015) return; const segment = { mode: refine.current.mode, sizeNorm: refine.current.sizeNorm, points: [last, p] }; pts.push(p); drawStroke(refine.mask.getContext('2d'), segment, refine.ew, refine.eh); renderRefinePreview() })
  const endStroke = () => { if (!refine.drawing) return; refine.drawing = false; if (refine.current) { refine.strokes.push(refine.current); refine.cursor = refine.strokes.length; refine.current = null } }
  wrap?.addEventListener('pointerup', endStroke); wrap?.addEventListener('pointercancel', endStroke)
  $('#refineKeep')?.addEventListener('click', () => setRefineMode('keep')); $('#refineErase')?.addEventListener('click', () => setRefineMode('erase'))
  $('#refineSize')?.addEventListener('input', (e) => { refine.size = Number(e.target.value); $('#refineSizeOut').textContent = String(refine.size) })
  $('#refineUndo')?.addEventListener('click', () => { if (refine.cursor > 0) { refine.cursor--; rebuildMask() } }); $('#refineRedo')?.addEventListener('click', () => { if (refine.cursor < refine.strokes.length) { refine.cursor++; rebuildMask() } })
  $('#refineReset')?.addEventListener('click', () => { refine.strokes = []; refine.cursor = 0; rebuildMask() }); $('#refineCancel')?.addEventListener('click', closeRefine); $('#refineSave')?.addEventListener('click', saveRefine)
  window.addEventListener('keydown', (e) => { if (!$('#refineModal')?.classList.contains('show')) return; if (e.key === 'Escape') closeRefine(); else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) $('#refineRedo').click(); else $('#refineUndo').click() } })
}

injectBatchUI(); bindUI(); hookSingleExports(); refreshBatchUI()
