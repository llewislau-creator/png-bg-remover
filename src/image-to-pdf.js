import './image-to-pdf.css'

const entry = document.getElementById('png-cutout-entry')
const venus = entry ? [...entry.querySelectorAll('.function-planet')].find((planet) =>
  (planet.getAttribute('aria-label') || '').toUpperCase().startsWith('VENUS:')
) : null

const state = {
  items: [],
  dragId: null,
  orientation: 'auto',
  pageSize: 'a4',
  margin: 36,
  quality: 0.88,
  targetMB: 0,
  lastOutputBytes: 0,
}

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

const enc = new TextEncoder()
const bytes = (s) => enc.encode(s)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const formatBytes = (n) => {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 ** 2).toFixed(2)} MB`
}
const sanitizeName = (name) => {
  const base = String(name || 'images').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ')
  return (base || 'images').replace(/\.pdf$/i, '') + '.pdf'
}

function setVenusLabel() {
  if (!venus) return
  venus.dataset.tool = 'image-to-pdf'
  venus.removeAttribute('data-external-tool')
  venus.setAttribute('aria-label', 'VENUS: IMAGE TO PDF')
  const title = venus.querySelector('.planet-label b')
  const meta = venus.querySelector('.planet-label span')
  if (title) title.textContent = '03 / IMAGE TO PDF'
  if (meta) meta.textContent = 'VENUS · LOCAL TOOL'
}

function ensureWorkspace() {
  let workspace = document.getElementById('image-to-pdf-workspace')
  if (workspace) return workspace

  workspace = document.createElement('section')
  workspace.id = 'image-to-pdf-workspace'
  workspace.hidden = true
  workspace.setAttribute('aria-label', 'Image to PDF workspace')
  workspace.innerHTML = `
    <header class="pdf-topbar">
      <div class="pdf-brand"><i class="pdf-orb"></i><div><strong>VENUS / IMAGE TO PDF</strong><span>DESIGNER UTILITY · LOCAL FIRST</span></div></div>
      <div class="pdf-top-actions"><span class="pdf-local">FILES STAY IN THIS BROWSER</span><button class="pdf-back" type="button">← 回到行星選單</button></div>
    </header>
    <div class="pdf-layout">
      <main class="pdf-main">
        <div class="pdf-hero"><div><h1>Images → PDF.</h1></div><p>把多張 JPG、PNG、WEBP 合併成一份 PDF。可排序、設定紙張、方向、邊距、畫質及目標檔案大小，全程在瀏覽器本地完成。</p></div>
        <label class="pdf-drop" for="pdfFileInput">
          <input id="pdfFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden>
          <div class="pdf-drop-inner"><div class="pdf-drop-icon">＋</div><h2>DROP IMAGES HERE</h2><p>拖入多張圖片，或從電腦 / 手機選擇。最多 40 張，單次總檔案建議不超過 120 MB。</p><span class="pdf-primary">SELECT IMAGES / 選擇圖片</span></div>
        </label>
        <div class="pdf-list-head"><div><strong>PAGE ORDER</strong><br><span class="pdf-list-meta">0 IMAGES</span></div><button class="pdf-add" type="button">＋ ADD IMAGES</button></div>
        <div class="pdf-grid"></div>
        <div class="pdf-empty-note">加入圖片後可拖曳縮圖重新排序；手機可使用 ↑ / ↓。</div>
      </main>
      <aside class="pdf-sidebar">
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>DOCUMENT</strong><span>01</span></div>
          <div class="pdf-field"><label>PDF 檔名</label><input class="pdf-filename" type="text" value="images.pdf" spellcheck="false"></div>
          <div class="pdf-inline">
            <div class="pdf-field"><label>紙張尺寸</label><select class="pdf-page-size"><option value="a4">A4</option><option value="letter">US Letter</option><option value="fit">Fit Image / 依圖片</option></select></div>
            <div class="pdf-field"><label>邊距</label><select class="pdf-margin"><option value="0">無</option><option value="18">小</option><option value="36" selected>標準</option><option value="54">大</option></select></div>
          </div>
          <div class="pdf-field"><label>方向</label><div class="pdf-segment"><button type="button" data-orientation="auto" class="active">AUTO</button><button type="button" data-orientation="portrait">直向</button><button type="button" data-orientation="landscape">橫向</button></div></div>
        </div>
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>COMPRESSION</strong><span>02</span></div>
          <div class="pdf-field"><label>圖片畫質</label><input class="pdf-quality" type="range" min="45" max="95" value="88"><div class="pdf-quality-row"><span>較小</span><b class="pdf-quality-value">88%</b><span>較清晰</span></div></div>
          <div class="pdf-field"><label>目標 PDF 大小（MB，可留空）</label><input class="pdf-target" type="number" min="0" step="0.1" placeholder="例如 5"></div>
          <div class="pdf-fineprint">若設定目標大小，系統會先降低 JPEG 壓縮率；仍超標時才會逐步縮小圖片解析度，以盡量接近指定容量。</div>
        </div>
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>EXPORT</strong><span>03</span></div>
          <div class="pdf-summary"><div><small>IMAGES</small><b class="pdf-count">0</b></div><div><small>INPUT</small><b class="pdf-input-size">—</b></div><div><small>PAGES</small><b class="pdf-pages">0</b></div><div><small>LAST PDF</small><b class="pdf-output-size">—</b></div></div>
          <button class="pdf-generate" type="button" disabled>CREATE & DOWNLOAD PDF</button>
          <div class="pdf-status">加入圖片後即可建立 PDF。<div class="pdf-progress"><i></i></div></div>
        </div>
      </aside>
    </div>
  `
  document.body.appendChild(workspace)
  bindWorkspace(workspace)
  return workspace
}

function bindWorkspace(workspace) {
  const input = workspace.querySelector('#pdfFileInput')
  const drop = workspace.querySelector('.pdf-drop')
  const add = workspace.querySelector('.pdf-add')
  const back = workspace.querySelector('.pdf-back')
  const pageSize = workspace.querySelector('.pdf-page-size')
  const margin = workspace.querySelector('.pdf-margin')
  const quality = workspace.querySelector('.pdf-quality')
  const target = workspace.querySelector('.pdf-target')
  const generate = workspace.querySelector('.pdf-generate')

  input.addEventListener('change', async () => { await addFiles(input.files); input.value = '' })
  add.addEventListener('click', () => input.click())
  back.addEventListener('click', closeWorkspace)

  ;['dragenter','dragover'].forEach((name) => drop.addEventListener(name, (e) => { e.preventDefault(); drop.classList.add('is-over') }))
  ;['dragleave','drop'].forEach((name) => drop.addEventListener(name, (e) => { e.preventDefault(); drop.classList.remove('is-over') }))
  drop.addEventListener('drop', async (e) => { await addFiles(e.dataTransfer.files) })

  pageSize.addEventListener('change', () => { state.pageSize = pageSize.value })
  margin.addEventListener('change', () => { state.margin = Number(margin.value) || 0 })
  quality.addEventListener('input', () => { state.quality = Number(quality.value) / 100; workspace.querySelector('.pdf-quality-value').textContent = `${quality.value}%` })
  target.addEventListener('input', () => { state.targetMB = Math.max(0, Number(target.value) || 0) })
  workspace.querySelectorAll('[data-orientation]').forEach((button) => button.addEventListener('click', () => {
    state.orientation = button.dataset.orientation
    workspace.querySelectorAll('[data-orientation]').forEach((b) => b.classList.toggle('active', b === button))
  }))
  generate.addEventListener('click', generateAndDownload)
  workspace.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWorkspace() })
}

function openWorkspace() {
  const workspace = ensureWorkspace()
  workspace.hidden = false
  renderItems()
  requestAnimationFrame(() => workspace.querySelector('.pdf-back')?.focus({preventScroll:true}))
}

function closeWorkspace() {
  const workspace = document.getElementById('image-to-pdf-workspace')
  if (workspace) workspace.hidden = true
  venus?.focus({preventScroll:true})
}

async function addFiles(fileList) {
  const files = [...(fileList || [])].filter((file) => /^image\/(jpeg|png|webp|avif)$/i.test(file.type))
  if (!files.length) return setStatus('沒有找到可用的 JPG / PNG / WEBP / AVIF 圖片。', true)
  const existingBytes = state.items.reduce((sum, item) => sum + item.file.size, 0)
  const incomingBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (state.items.length + files.length > 40) return setStatus('最多可加入 40 張圖片。', true)
  if (existingBytes + incomingBytes > 120 * 1024 * 1024) return setStatus('這批圖片總大小超過 120 MB，請分批處理。', true)

  setStatus('正在讀取圖片…')
  for (const file of files) {
    const url = URL.createObjectURL(file)
    try {
      const info = await inspectImage(url)
      state.items.push({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, file, url, width: info.width, height: info.height })
    } catch {
      URL.revokeObjectURL(url)
    }
  }
  state.lastOutputBytes = 0
  renderItems()
  setStatus(state.items.length ? `已加入 ${state.items.length} 張圖片，可調整順序及輸出設定。` : '圖片讀取失敗，請改用 JPG / PNG / WEBP。', !state.items.length)
}

function inspectImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({width:img.naturalWidth,height:img.naturalHeight})
    img.onerror = reject
    img.src = url
  })
}

function renderItems() {
  const workspace = document.getElementById('image-to-pdf-workspace')
  if (!workspace) return
  const grid = workspace.querySelector('.pdf-grid')
  grid.innerHTML = ''

  state.items.forEach((item, index) => {
    const card = document.createElement('article')
    card.className = 'pdf-card'
    card.draggable = true
    card.dataset.id = item.id
    card.innerHTML = `
      <div class="pdf-thumb"><img src="${item.url}" alt=""></div>
      <div class="pdf-card-body"><div class="pdf-file-name"></div><div class="pdf-file-meta">${item.width} × ${item.height} · ${formatBytes(item.file.size)}</div><div class="pdf-card-actions"><button type="button" data-move="up" aria-label="Move up">↑</button><button type="button" data-move="down" aria-label="Move down">↓</button><button type="button" class="remove" data-remove aria-label="Remove image">REMOVE</button></div></div>`
    card.querySelector('.pdf-file-name').textContent = `${String(index + 1).padStart(2,'0')} · ${item.file.name}`
    card.addEventListener('dragstart', () => { state.dragId = item.id; card.classList.add('dragging') })
    card.addEventListener('dragend', () => { state.dragId = null; card.classList.remove('dragging') })
    card.addEventListener('dragover', (e) => e.preventDefault())
    card.addEventListener('drop', (e) => { e.preventDefault(); reorderById(state.dragId, item.id) })
    card.querySelector('[data-remove]').addEventListener('click', () => removeItem(item.id))
    card.querySelector('[data-move="up"]').addEventListener('click', () => moveItem(item.id, -1))
    card.querySelector('[data-move="down"]').addEventListener('click', () => moveItem(item.id, 1))
    grid.appendChild(card)
  })

  const total = state.items.reduce((sum, item) => sum + item.file.size, 0)
  workspace.querySelector('.pdf-list-meta').textContent = `${state.items.length} IMAGES · ${formatBytes(total)}`
  workspace.querySelector('.pdf-count').textContent = String(state.items.length)
  workspace.querySelector('.pdf-pages').textContent = String(state.items.length)
  workspace.querySelector('.pdf-input-size').textContent = formatBytes(total)
  workspace.querySelector('.pdf-output-size').textContent = formatBytes(state.lastOutputBytes)
  workspace.querySelector('.pdf-generate').disabled = !state.items.length
  workspace.querySelector('.pdf-empty-note').style.display = state.items.length ? 'none' : ''
}

function removeItem(id) {
  const index = state.items.findIndex((item) => item.id === id)
  if (index < 0) return
  URL.revokeObjectURL(state.items[index].url)
  state.items.splice(index, 1)
  state.lastOutputBytes = 0
  renderItems()
}

function moveItem(id, delta) {
  const from = state.items.findIndex((item) => item.id === id)
  const to = clamp(from + delta, 0, state.items.length - 1)
  if (from < 0 || from === to) return
  const [item] = state.items.splice(from, 1)
  state.items.splice(to, 0, item)
  renderItems()
}

function reorderById(fromId, toId) {
  if (!fromId || fromId === toId) return
  const from = state.items.findIndex((item) => item.id === fromId)
  const to = state.items.findIndex((item) => item.id === toId)
  if (from < 0 || to < 0) return
  const [item] = state.items.splice(from, 1)
  state.items.splice(to, 0, item)
  renderItems()
}

function setStatus(message, error = false, success = false) {
  const workspace = document.getElementById('image-to-pdf-workspace')
  if (!workspace) return
  const status = workspace.querySelector('.pdf-status')
  const progress = status.querySelector('.pdf-progress')?.outerHTML || '<div class="pdf-progress"><i></i></div>'
  status.classList.toggle('error', error)
  status.classList.toggle('success', success)
  status.innerHTML = `${message}${progress}`
}

function setProgress(value) {
  const bar = document.querySelector('#image-to-pdf-workspace .pdf-progress i')
  if (bar) bar.style.width = `${clamp(value,0,100)}%`
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(async (blob) => {
    if (!blob) return reject(new Error('JPEG encoding failed'))
    resolve(new Uint8Array(await blob.arrayBuffer()))
  }, 'image/jpeg', quality))
}

async function encodeImage(img, quality, resolutionScale = 1) {
  const maxBase = 3600
  const baseScale = Math.min(1, maxBase / Math.max(img.naturalWidth, img.naturalHeight))
  const scale = Math.max(.12, baseScale * resolutionScale)
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', {alpha:false})
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  return { jpeg: await canvasToJpeg(canvas, quality), width, height }
}

function resolvePage(imageWidth, imageHeight) {
  if (state.pageSize === 'fit') {
    let width = imageWidth * .75
    let height = imageHeight * .75
    const max = Math.max(width, height)
    if (max > 1440) { const s = 1440 / max; width *= s; height *= s }
    return [Math.max(72,width), Math.max(72,height)]
  }

  let [pw, ph] = PAGE_SIZES[state.pageSize] || PAGE_SIZES.a4
  if (state.orientation === 'landscape') [pw, ph] = [ph, pw]
  else if (state.orientation === 'portrait') { if (pw > ph) [pw, ph] = [ph, pw] }
  else if (imageWidth > imageHeight && pw < ph) [pw, ph] = [ph, pw]
  return [pw, ph]
}

function makePageRecord(encoded, naturalWidth, naturalHeight) {
  const [pageW, pageH] = resolvePage(naturalWidth, naturalHeight)
  const margin = state.pageSize === 'fit' ? 0 : Math.min(state.margin, Math.min(pageW,pageH) * .2)
  const availW = Math.max(1, pageW - margin * 2)
  const availH = Math.max(1, pageH - margin * 2)
  const ratio = Math.min(availW / encoded.width, availH / encoded.height)
  const drawW = encoded.width * ratio
  const drawH = encoded.height * ratio
  const x = (pageW - drawW) / 2
  const y = (pageH - drawH) / 2
  return { ...encoded, pageW, pageH, drawW, drawH, x, y }
}

function concatChunks(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length }
  return out
}

function buildPdf(pageRecords) {
  const objectCount = 2 + pageRecords.length * 3
  const objects = new Array(objectCount + 1)
  const pageIds = []

  pageRecords.forEach((page, index) => {
    const pageId = 3 + index * 3
    const imageId = pageId + 1
    const contentId = pageId + 2
    pageIds.push(pageId)

    const content = `q\n${page.drawW.toFixed(3)} 0 0 ${page.drawH.toFixed(3)} ${page.x.toFixed(3)} ${page.y.toFixed(3)} cm\n/Im0 Do\nQ\n`
    const contentBytes = bytes(content)
    objects[pageId] = bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageW.toFixed(3)} ${page.pageH.toFixed(3)}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`)
    objects[imageId] = concatChunks([
      bytes(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`),
      page.jpeg,
      bytes('\nendstream')
    ])
    objects[contentId] = concatChunks([bytes(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, bytes('endstream')])
  })

  objects[1] = bytes('<< /Type /Catalog /Pages 2 0 R >>')
  objects[2] = bytes(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`)

  const chunks = [bytes('%PDF-1.4\n')]
  const offsets = new Array(objectCount + 1).fill(0)
  let offset = chunks[0].length
  for (let id = 1; id <= objectCount; id++) {
    offsets[id] = offset
    const objectBytes = concatChunks([bytes(`${id} 0 obj\n`), objects[id], bytes('\nendobj\n')])
    chunks.push(objectBytes)
    offset += objectBytes.length
  }

  const xrefOffset = offset
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`
  for (let id = 1; id <= objectCount; id++) xref += `${String(offsets[id]).padStart(10,'0')} 00000 n \n`
  xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  chunks.push(bytes(xref))
  return new Blob(chunks, {type:'application/pdf'})
}

async function createPdf(prepared, quality, resolutionScale = 1, progressBase = 0, progressSpan = 80) {
  const pages = []
  for (let i = 0; i < prepared.length; i++) {
    const item = prepared[i]
    const encoded = await encodeImage(item.img, quality, resolutionScale)
    pages.push(makePageRecord(encoded, item.img.naturalWidth, item.img.naturalHeight))
    setProgress(progressBase + ((i + 1) / prepared.length) * progressSpan)
  }
  return buildPdf(pages)
}

async function generateAndDownload() {
  if (!state.items.length) return
  const workspace = ensureWorkspace()
  const button = workspace.querySelector('.pdf-generate')
  const filename = sanitizeName(workspace.querySelector('.pdf-filename').value)
  button.disabled = true
  setStatus('正在準備圖片及建立 PDF…')
  setProgress(3)

  try {
    const prepared = []
    for (let i = 0; i < state.items.length; i++) {
      prepared.push({ item: state.items[i], img: await loadImage(state.items[i].url) })
      setProgress(3 + ((i + 1) / state.items.length) * 10)
    }

    let quality = clamp(state.quality, .45, .95)
    let resolutionScale = 1
    let blob = await createPdf(prepared, quality, resolutionScale, 14, 70)
    const targetBytes = state.targetMB > 0 ? state.targetMB * 1024 * 1024 : 0

    if (targetBytes && blob.size > targetBytes) {
      setStatus(`目前約 ${formatBytes(blob.size)}，正在嘗試接近 ${state.targetMB.toFixed(1)} MB…`)
      let low = .28
      let high = quality
      let best = null
      for (let pass = 0; pass < 5; pass++) {
        quality = (low + high) / 2
        const candidate = await createPdf(prepared, quality, 1, 18 + pass * 10, 9)
        if (candidate.size <= targetBytes) { best = candidate; low = quality } else high = quality
      }
      if (best) blob = best
      else {
        quality = .28
        blob = await createPdf(prepared, quality, 1, 60, 12)
        while (blob.size > targetBytes && resolutionScale > .36) {
          resolutionScale *= .82
          blob = await createPdf(prepared, quality, resolutionScale, 72, 18)
        }
      }
    }

    setProgress(100)
    state.lastOutputBytes = blob.size
    renderItems()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 4000)

    const targetNote = state.targetMB > 0 ? ` · 目標 ${state.targetMB.toFixed(1)} MB` : ''
    setStatus(`完成：${state.items.length} 頁 · ${formatBytes(blob.size)}${targetNote}`, false, true)
    setProgress(100)
  } catch (error) {
    console.error(error)
    setStatus(`建立 PDF 失敗：${error?.message || '未知錯誤'}`, true)
    setProgress(0)
  } finally {
    button.disabled = !state.items.length
  }
}

setVenusLabel()
if (venus) {
  venus.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    openWorkspace()
  }, true)
}
