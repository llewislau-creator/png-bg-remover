import './image-to-pdf.css'
import './pdf-studio.css'

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
  maxEdge: 2200,
  customWidth: 210,
  customHeight: 297,
  busy: false,
}

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  a3: [841.89,1190.55],
  a5: [419.53,595.28],
  b4: [708.66,1000.63],
  b5: [498.90,708.66],
  legal: [612,1008],
  tabloid: [792,1224],
  photo: [288,432],
  square: [612,612],
}
let onReturn = null

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
  workspace.setAttribute('role', 'dialog')
  workspace.setAttribute('aria-modal', 'true')
  workspace.innerHTML = `
    <header class="pdf-topbar">
      <div class="pdf-brand"><i class="pdf-orb"></i><div><strong>PIXORA / PDF STUDIO</strong><span>URANUS · 圖片轉 PDF 工作台</span></div></div>
      <div class="pdf-top-actions"><span class="pdf-local">● 本機處理 · 沒有上傳</span><button class="pdf-back" type="button">← 回到行星選單</button></div>
    </header>
    <div class="pdf-layout">
      <aside class="pdf-workflow"><small>編輯工作台</small><h2>製作流程</h2><ol><li>加入素材</li><li>排好頁面</li><li>輸出 PDF</li></ol><p>圖片留在你的裝置處理。無需帳號，無浮水印。</p></aside>
      <main class="pdf-main">
        <div class="pdf-hero"><small>01 / 素材清單</small><h1>把圖片排成<br>一份 PDF。</h1><p>加入圖片，排好順序，再決定頁面尺寸與檔案重量。</p></div>
        <label class="pdf-drop" for="pdfFileInput">
          <input id="pdfFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden>
          <div class="pdf-drop-inner"><div class="pdf-drop-icon">＋</div><h2>拖曳圖片到這裡</h2><p>JPG / PNG / WEBP / AVIF · 最多 40 張 · 合計 120 MB</p><button type="button" class="pdf-primary pdf-select">選擇圖片</button></div>
        </label>
        <div class="pdf-list-head"><div><strong>頁面順序</strong><br><span class="pdf-list-meta">0 張素材</span></div><button class="pdf-add" type="button">＋ 加入圖片</button></div>
        <div class="pdf-grid"></div>
        <div class="pdf-empty-note"><strong>工作台還是空的</strong><p>加入圖片後，這裡會變成你的頁面索引。</p></div><p class="pdf-order-hint">拖曳縮圖調整順序；手機可用 ↑ / ↓ 移動頁面。</p>
      </main>
      <aside class="pdf-sidebar">
        <div class="pdf-spec-intro"><small>02 / 輸出規格</small><h2>先排好頁面，<br>再決定檔案重量。</h2></div>
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>文件設定</strong><span>01</span></div>
          <div class="pdf-field"><label for="pdfFilename">PDF 檔名</label><input id="pdfFilename" class="pdf-filename" type="text" value="images.pdf" spellcheck="false"></div>
          <div class="pdf-inline">
            <div class="pdf-field"><label for="pdfPaper">頁面尺寸</label><select id="pdfPaper" class="pdf-page-size"><option value="a3">A3</option><option value="a4" selected>A4 · 210 × 297 mm</option><option value="a5">A5</option><option value="b4">B4</option><option value="b5">B5</option><option value="letter">Letter</option><option value="legal">Legal</option><option value="tabloid">Tabloid</option><option value="photo">相片 4 × 6</option><option value="square">正方形</option><option value="custom">自訂寬度／高度</option><option value="fit">貼合圖片尺寸</option></select></div>
            <div class="pdf-field"><label for="pdfMargin">邊距</label><select id="pdfMargin" class="pdf-margin"><option value="0">無</option><option value="18">小</option><option value="36" selected>標準</option><option value="54">大</option></select></div>
          </div>
          <div class="pdf-custom pdf-inline" hidden><div class="pdf-field"><label for="pdfWidth">寬度（mm）</label><input id="pdfWidth" type="number" min="20" max="1000" value="210"></div><div class="pdf-field"><label for="pdfHeight">高度（mm）</label><input id="pdfHeight" type="number" min="20" max="1000" value="297"></div></div><p class="pdf-page-info"></p>
          <div class="pdf-field"><label>方向</label><div class="pdf-segment"><button type="button" data-orientation="auto" class="active">自動</button><button type="button" data-orientation="portrait">直向</button><button type="button" data-orientation="landscape">橫向</button></div></div>
        </div>
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>影像與容量</strong><span>02</span></div>
          <div class="pdf-field"><label for="pdfQuality">圖片畫質</label><input id="pdfQuality" class="pdf-quality" type="range" min="45" max="95" value="88"><div class="pdf-quality-row"><span>較小</span><b class="pdf-quality-value">88%</b><span>較清晰</span></div></div>
          <div class="pdf-field"><label for="pdfMaxEdge">最大長邊</label><input id="pdfMaxEdge" class="pdf-max-edge" type="range" min="800" max="4800" step="100" value="2200"><output class="pdf-edge-value">2200 px</output></div>
          <div class="pdf-field"><label for="pdfTarget">目標 PDF 大小（MB，可留空）</label><input id="pdfTarget" class="pdf-target" type="number" min="0" step="0.1" placeholder="例如 5"></div>
          <div class="pdf-fineprint">若設定目標大小，系統會先降低 JPEG 壓縮率；仍超標時才會逐步縮小圖片解析度，以盡量接近指定容量。</div>
        </div>
        <div class="pdf-section"><div class="pdf-section-title"><strong>我的預設</strong><span>03</span></div><div class="pdf-field"><label for="pdfPresetName">預設名稱</label><input id="pdfPresetName" type="text" maxlength="50" placeholder="例如：A4 輕量文件"></div><div class="pdf-preset-actions"><button type="button" class="pdf-save-preset">保存設定</button><button type="button" class="pdf-load-preset">套用預設</button></div><p class="pdf-preset-status" role="status"></p></div>
        <div class="pdf-section">
          <div class="pdf-section-title"><strong>輸出前檢查</strong><span>04</span></div>
          <div class="pdf-summary"><div><small>素材數量</small><b class="pdf-count">0</b></div><div><small>來源檔案</small><b class="pdf-input-size">—</b></div><div><small>PDF 頁數</small><b class="pdf-pages">0</b></div><div><small>上次輸出</small><b class="pdf-output-size">—</b></div></div><p class="pdf-check"></p>
          <button class="pdf-generate" type="button" disabled>建立並下載 PDF</button>
          <div class="pdf-status" role="status" aria-live="polite">加入圖片後即可建立 PDF。<div class="pdf-progress"><i></i></div></div>
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
  workspace.querySelector('.pdf-select').addEventListener('click', (event) => {event.preventDefault();input.click()})
  back.addEventListener('click', closeWorkspace)

  ;['dragenter','dragover'].forEach((name) => drop.addEventListener(name, (e) => { e.preventDefault(); drop.classList.add('is-over') }))
  ;['dragleave','drop'].forEach((name) => drop.addEventListener(name, (e) => { e.preventDefault(); drop.classList.remove('is-over') }))
  drop.addEventListener('drop', async (e) => { await addFiles(e.dataTransfer.files) })

  pageSize.addEventListener('change', () => { state.pageSize = pageSize.value;updateSpecs() })
  margin.addEventListener('change', () => { state.margin = Number(margin.value) || 0 })
  quality.addEventListener('input', () => { state.quality = Number(quality.value) / 100; workspace.querySelector('.pdf-quality-value').textContent = `${quality.value}%` })
  target.addEventListener('input', () => { state.targetMB = Math.max(0, Number(target.value) || 0);updateSpecs() })
  workspace.querySelector('.pdf-max-edge').addEventListener('input',e=>{state.maxEdge=Number(e.target.value);updateSpecs()})
  workspace.querySelector('#pdfWidth').addEventListener('input',e=>{state.customWidth=Number(e.target.value);updateSpecs()})
  workspace.querySelector('#pdfHeight').addEventListener('input',e=>{state.customHeight=Number(e.target.value);updateSpecs()})
  workspace.querySelector('.pdf-save-preset').addEventListener('click',savePreset)
  workspace.querySelector('.pdf-load-preset').addEventListener('click',loadPreset)
  workspace.querySelectorAll('[data-orientation]').forEach((button) => button.addEventListener('click', () => {
    state.orientation = button.dataset.orientation
    workspace.querySelectorAll('[data-orientation]').forEach((b) => b.classList.toggle('active', b === button))
    updateSpecs()
  }))
  generate.addEventListener('click', generateAndDownload)
  workspace.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWorkspace() })
  updateSpecs()
}

export function openImageToPdf(returnFocus=null) {
  onReturn=returnFocus
  const workspace = ensureWorkspace()
  const home=document.getElementById('pixora-universe-home')
  if(home)home.inert=true
  workspace.hidden = false
  renderItems()
  requestAnimationFrame(() => workspace.querySelector('.pdf-back')?.focus({preventScroll:true}))
}

function closeWorkspace() {
  if(state.busy)return
  const workspace = document.getElementById('image-to-pdf-workspace')
  if (workspace) workspace.hidden = true
  const home=document.getElementById('pixora-universe-home')
  if(home)home.inert=false
  venus?.focus({preventScroll:true})
  onReturn?.()
}

function updateSpecs(){
  const ws=document.getElementById('image-to-pdf-workspace');if(!ws)return
  ws.querySelector('.pdf-custom').hidden=state.pageSize!=='custom'
  const [pw,ph]=resolvePage(100,100)
  ws.querySelector('.pdf-page-info').textContent=state.pageSize==='fit'?'依各張圖片比例建立頁面。':`頁面：${(pw/72*25.4).toFixed(1)} × ${(ph/72*25.4).toFixed(1)} mm${state.orientation==='auto'?' · 橫向素材會自動轉向':''}`
  ws.querySelector('.pdf-edge-value').textContent=`${state.maxEdge} px`
  ws.querySelector('.pdf-check').textContent=`✓ ${state.items.length} 頁素材 · ${state.targetMB>0?`目標 ${state.targetMB} MB`:'未設定容量限制'}`
}
function savePreset(){
  const ws=ensureWorkspace(),name=ws.querySelector('#pdfPresetName').value.trim()||'我的 PDF 設定'
  try{
    const settings={name,orientation:state.orientation,pageSize:state.pageSize,margin:state.margin,quality:state.quality,targetMB:state.targetMB,maxEdge:state.maxEdge,customWidth:state.customWidth,customHeight:state.customHeight}
    localStorage.setItem('pixora-pdf-preset',JSON.stringify(settings))
    ws.querySelector('.pdf-preset-status').textContent=`已保存「${name}」。`
  }catch{ws.querySelector('.pdf-preset-status').textContent='瀏覽器無法保存設定。'}
}
function loadPreset(){
  const ws=ensureWorkspace()
  try{
    const p=JSON.parse(localStorage.getItem('pixora-pdf-preset')||'null')
    if(!p)throw new Error('尚未保存預設。')
    state.pageSize=[...Object.keys(PAGE_SIZES),'custom','fit'].includes(p.pageSize)?p.pageSize:'a4'
    state.orientation=['auto','portrait','landscape'].includes(p.orientation)?p.orientation:'auto'
    for(const [key,min,max] of [['margin',0,54],['quality',.45,.95],['targetMB',0,1000],['maxEdge',800,4800],['customWidth',20,1000],['customHeight',20,1000]]){
      if(Number.isFinite(p[key]))state[key]=clamp(p[key],min,max)
    }
    ws.querySelector('.pdf-page-size').value=state.pageSize;ws.querySelector('.pdf-margin').value=String(state.margin)
    ws.querySelector('.pdf-quality').value=String(Math.round(state.quality*100));ws.querySelector('.pdf-quality-value').textContent=`${Math.round(state.quality*100)}%`
    ws.querySelector('.pdf-target').value=state.targetMB||'';ws.querySelector('.pdf-max-edge').value=state.maxEdge
    ws.querySelector('#pdfWidth').value=state.customWidth;ws.querySelector('#pdfHeight').value=state.customHeight
    ws.querySelector('#pdfPresetName').value=String(p.name||'我的 PDF 設定')
    ws.querySelectorAll('[data-orientation]').forEach(b=>b.classList.toggle('active',b.dataset.orientation===state.orientation))
    ws.querySelector('.pdf-preset-status').textContent='已套用保存的預設。';updateSpecs()
  }catch(error){ws.querySelector('.pdf-preset-status').textContent=error.message||'預設無法讀取。'}
}

async function addFiles(fileList) {
  if(state.busy)return
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
      <div class="pdf-card-body"><div class="pdf-file-name"></div><div class="pdf-file-meta">${item.width} × ${item.height} · ${formatBytes(item.file.size)}</div><div class="pdf-card-actions"><button type="button" data-move="up" aria-label="向前移動第 ${index+1} 頁">↑</button><button type="button" data-move="down" aria-label="向後移動第 ${index+1} 頁">↓</button><button type="button" class="remove" data-remove aria-label="移除第 ${index+1} 頁">移除</button></div></div>`
    card.querySelector('[data-move="up"]').disabled=index===0
    card.querySelector('[data-move="down"]').disabled=index===state.items.length-1
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
  workspace.querySelector('.pdf-list-meta').textContent = `${state.items.length} 張素材 · ${formatBytes(total)}`
  workspace.querySelector('.pdf-count').textContent = String(state.items.length)
  workspace.querySelector('.pdf-pages').textContent = String(state.items.length)
  workspace.querySelector('.pdf-input-size').textContent = formatBytes(total)
  workspace.querySelector('.pdf-output-size').textContent = formatBytes(state.lastOutputBytes)
  workspace.querySelector('.pdf-generate').disabled = !state.items.length||state.busy
  workspace.querySelector('.pdf-empty-note').style.display = state.items.length ? 'none' : ''
  updateSpecs()
}

function removeItem(id) {
  if(state.busy)return
  const index = state.items.findIndex((item) => item.id === id)
  if (index < 0) return
  URL.revokeObjectURL(state.items[index].url)
  state.items.splice(index, 1)
  state.lastOutputBytes = 0
  renderItems()
}

function moveItem(id, delta) {
  if(state.busy)return
  const from = state.items.findIndex((item) => item.id === id)
  const to = clamp(from + delta, 0, state.items.length - 1)
  if (from < 0 || from === to) return
  const [item] = state.items.splice(from, 1)
  state.items.splice(to, 0, item)
  renderItems()
}

function reorderById(fromId, toId) {
  if(state.busy)return
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
  status.innerHTML = progress
  status.prepend(document.createTextNode(message))
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
  const maxBase = state.maxEdge
  const baseScale = Math.min(1, maxBase / Math.max(img.naturalWidth, img.naturalHeight))
  const scale = Math.max(.0001, baseScale * resolutionScale)
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

  let [pw, ph] = state.pageSize==='custom'?[state.customWidth/25.4*72,state.customHeight/25.4*72]:(PAGE_SIZES[state.pageSize] || PAGE_SIZES.a4)
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
  if (!state.items.length||state.busy) return
  const workspace = ensureWorkspace()
  if(state.pageSize==='custom'&&(!Number.isFinite(state.customWidth)||!Number.isFinite(state.customHeight)||state.customWidth<20||state.customWidth>1000||state.customHeight<20||state.customHeight>1000))return setStatus('自訂寬度與高度必須介於 20 至 1000 mm。',true)
  const button = workspace.querySelector('.pdf-generate')
  const filename = sanitizeName(workspace.querySelector('.pdf-filename').value)
  button.disabled = true
  state.busy=true
  const controls=[...workspace.querySelectorAll('button,input,select')].map(el=>({el,disabled:el.disabled}))
  controls.forEach(({el})=>el.disabled=true)
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
      setStatus(`目前約 ${formatBytes(blob.size)}，正在嘗試接近 ${state.targetMB} MB…`)
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

    const targetNote = state.targetMB > 0 ? ` · 目標 ${state.targetMB} MB` : ''
    const over=targetBytes>0&&blob.size>targetBytes
    setStatus(`${over?'已輸出，但未達目標容量':'完成'}：${state.items.length} 頁 · ${formatBytes(blob.size)}${targetNote}${over?'。可降低最大長邊或減少頁數。':''}`, false, !over)
    setProgress(100)
  } catch (error) {
    console.error(error)
    setStatus(`建立 PDF 失敗：${error?.message || '未知錯誤'}`, true)
    setProgress(0)
  } finally {
    state.busy=false
    controls.forEach(({el,disabled})=>{if(el.isConnected)el.disabled=disabled})
    button.disabled = !state.items.length
  }
}

setVenusLabel()
if (venus) {
  venus.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    openImageToPdf()
  }, true)
}
