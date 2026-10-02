const INTRO_ID = 'png-cutout-entry'

if (!document.getElementById(INTRO_ID)) {
  const style = document.createElement('style')
  style.id = `${INTRO_ID}-style`
  style.textContent = `
    html.entry-locked, html.entry-locked body{overflow:hidden!important;background:#000!important}
    #${INTRO_ID}{position:fixed;inset:0;z-index:9999;background:#000;color:#fff;overflow:hidden;cursor:crosshair;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Arial,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;opacity:1;transition:opacity .7s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}.is-leaving{opacity:0;pointer-events:none}
    #${INTRO_ID} canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #${INTRO_ID} .entry-grain{position:absolute;inset:0;pointer-events:none;opacity:.15;background-image:radial-gradient(rgba(255,255,255,.28) .55px,transparent .6px);background-size:5px 5px;mix-blend-mode:screen}
    #${INTRO_ID} .entry-top{position:absolute;left:24px;right:24px;top:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;pointer-events:none;font:10px/1.5 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62)}
    #${INTRO_ID} .entry-brand{color:#fff;font-weight:800;letter-spacing:.04em}
    #${INTRO_ID} .entry-center{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
    #${INTRO_ID} .entry-center span{transform:translateY(min(31vh,260px));font:9px/1.5 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.48);transition:color .2s}
    #${INTRO_ID}:hover .entry-center span{color:rgba(255,255,255,.86)}
    #${INTRO_ID} .entry-bottom{position:absolute;left:24px;right:24px;bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;pointer-events:none;font:9px/1.5 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.46)}
    #${INTRO_ID} .entry-pulse{display:inline-flex;align-items:center;gap:8px}
    #${INTRO_ID} .entry-pulse i{width:7px;height:7px;border:1px solid rgba(255,255,255,.8);border-radius:50%;box-shadow:0 0 18px rgba(255,255,255,.5);animation:entryPulse 1.6s ease-in-out infinite}
    @keyframes entryPulse{0%,100%{transform:scale(.8);opacity:.45}50%{transform:scale(1.15);opacity:1}}
    @media(max-width:640px){#${INTRO_ID} .entry-top,#${INTRO_ID} .entry-bottom{left:14px;right:14px}#${INTRO_ID} .entry-top{top:14px}#${INTRO_ID} .entry-bottom{bottom:14px}#${INTRO_ID} .entry-center span{transform:translateY(min(29vh,210px));font-size:8px}}
    @media(prefers-reduced-motion:reduce){#${INTRO_ID}{transition:opacity .25s linear}#${INTRO_ID} .entry-pulse i{animation:none}}
  `
  document.head.appendChild(style)

  document.documentElement.classList.add('entry-locked')
  const entry = document.createElement('div')
  entry.id = INTRO_ID
  entry.setAttribute('role', 'button')
  entry.setAttribute('tabindex', '0')
  entry.setAttribute('aria-label', 'Enter PNG Cutout')
  entry.innerHTML = `
    <canvas aria-hidden="true"></canvas>
    <div class="entry-grain" aria-hidden="true"></div>
    <div class="entry-top"><span class="entry-brand">PNG / CUTOUT</span><span>DESIGNER MICRO TOOL · 001</span></div>
    <div class="entry-center"><span>MOVE THE GLOBE · CLICK TO ENTER<br>移動滑鼠 · 點擊進入</span></div>
    <div class="entry-bottom"><span class="entry-pulse"><i></i> INTERACTIVE PARTICLE EARTH</span><span>LOCAL-FIRST / BROWSER TOOL</span></div>
  `
  document.body.prepend(entry)

  const canvas = entry.querySelector('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = matchMedia('(max-width: 700px)').matches
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0, h = 0, radius = 0
  let centerX = 0, centerY = 0, targetX = 0, targetY = 0
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2
  let pointerVX = 0, pointerVY = 0, speed = 0
  let lastPX = pointerX, lastPY = pointerY
  let rotX = -0.12, rotY = -0.45
  let targetRotX = rotX, targetRotY = rotY
  let raf = 0, leaving = false, scatterOut = 0

  const ellipses = [
    [-104, 48, 43, 30, -0.12],[-84, 24, 20, 18, 0.18],[-100, 68, 26, 12, 0],
    [-61, -16, 23, 42, -0.12],[-70, 5, 13, 20, 0],
    [16, 7, 30, 39, 0.08],[19, 47, 29, 18, -0.08],
    [77, 43, 54, 30, 0.02],[118, 57, 42, 19, -0.08],[101, 17, 33, 23, 0.12],
    [136, -25, 24, 17, -0.1],[47, -19, 8, 13, 0],[139, 37, 8, 12, -0.18]
  ]

  function ellipseHit(lon, lat, e) {
    const [cx, cy, rx, ry, r] = e
    const dx = lon - cx, dy = lat - cy
    const cr = Math.cos(r), sr = Math.sin(r)
    const x = dx * cr - dy * sr, y = dx * sr + dy * cr
    return (x * x) / (rx * rx) + (y * y) / (ry * ry) < 1
  }

  function isLand(lon, lat) {
    let hit = ellipses.some((e) => ellipseHit(lon, lat, e))
    if (!hit) return false
    if (lon > -18 && lon < 39 && lat > 10 && lat < 32 && Math.sin((lon + lat) * .16) > .58) hit = false
    if (lon > 63 && lon < 92 && lat > 9 && lat < 28 && Math.sin(lon * .18) < -.72) hit = false
    if (lon > 112 && lon < 151 && lat > -10 && lat < 8) hit = Math.sin(lon * .32 + lat) > -.2
    return hit
  }

  function hash(n) {
    const x = Math.sin(n * 91.3458) * 47453.5453
    return x - Math.floor(x)
  }

  const points = []
  const samples = mobile ? 2600 : 5200
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2
    const rr = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const x = Math.cos(theta) * rr
    const z = Math.sin(theta) * rr
    const lat = Math.asin(y) * 180 / Math.PI
    const lon = Math.atan2(z, x) * 180 / Math.PI
    const land = isLand(lon, lat)
    if (!land && i % (mobile ? 19 : 17) !== 0) continue
    points.push({ x, y, z, land, phase: hash(i * 1.31) * Math.PI * 2, weight: .45 + hash(i * 3.17) * .9 })
  }

  function resize() {
    w = Math.max(1, innerWidth); h = Math.max(1, innerHeight)
    canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR)
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    radius = Math.min(w, h) * (mobile ? .285 : .30)
    if (!centerX) centerX = targetX = w / 2
    if (!centerY) centerY = targetY = h / 2
  }

  function rotatePoint(p) {
    const cy = Math.cos(rotY), sy = Math.sin(rotY)
    let x = p.x * cy + p.z * sy
    let z = -p.x * sy + p.z * cy
    const cx = Math.cos(rotX), sx = Math.sin(rotX)
    const y = p.y * cx - z * sx
    z = p.y * sx + z * cx
    return [x, y, z]
  }

  function draw(t) {
    if (!entry.isConnected) return
    const time = t * .001
    pointerVX = pointerX - lastPX; pointerVY = pointerY - lastPY
    lastPX = pointerX; lastPY = pointerY
    speed += (Math.min(35, Math.hypot(pointerVX, pointerVY)) - speed) * .12

    if (!reduceMotion && !leaving) {
      const nx = (pointerX / Math.max(1, w) - .5) * 2
      const ny = (pointerY / Math.max(1, h) - .5) * 2
      targetX = w / 2 + nx * Math.min(w, h) * .075
      targetY = h / 2 + ny * Math.min(w, h) * .055
      targetRotY = -0.42 + nx * .62
      targetRotX = -0.12 - ny * .34
      rotY += (targetRotY - rotY) * .035 + .0011
      rotX += (targetRotX - rotX) * .04
    } else if (!reduceMotion && leaving) {
      scatterOut += (1 - scatterOut) * .055
      rotY += .012
    }
    centerX += (targetX - centerX) * .045
    centerY += (targetY - centerY) * .045

    ctx.fillStyle = leaving ? `rgba(0,0,0,${0.32 + scatterOut * .25})` : 'rgba(0,0,0,.34)'
    ctx.fillRect(0, 0, w, h)

    const repelRadius = radius * .42
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      let [x, y, z] = rotatePoint(p)
      const depth = .74 + (z + 1) * .28
      const breathe = reduceMotion ? 1 : 1 + Math.sin(time * 1.25 + p.phase) * .012 * p.weight
      let localRadius = radius * breathe * (1 + scatterOut * (1.8 + p.weight * 1.9))
      let sx = centerX + x * localRadius * depth
      let sy = centerY + y * localRadius * depth

      if (!reduceMotion && !leaving) {
        const dx = sx - pointerX, dy = sy - pointerY
        const dist = Math.hypot(dx, dy)
        if (dist < repelRadius && dist > 1) {
          const f = (1 - dist / repelRadius) ** 2 * (10 + speed * .85) * p.weight
          sx += dx / dist * f
          sy += dy / dist * f
        }
      }

      const front = clamp01((z + 1) * .5)
      const baseAlpha = p.land ? (.28 + front * .68) : (.07 + front * .18)
      const alpha = leaving ? baseAlpha * (1 - scatterOut * .7) : baseAlpha
      const size = (p.land ? 1.05 : .55) * (.72 + front * .85) * (mobile ? .92 : 1)
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.arc(sx, sy, size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.beginPath()
    ctx.strokeStyle = `rgba(255,255,255,${leaving ? .08 : .12})`
    ctx.lineWidth = .7
    ctx.arc(centerX, centerY, radius * (1 + scatterOut * 1.9), 0, Math.PI * 2)
    ctx.stroke()
    raf = requestAnimationFrame(draw)
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)) }

  function move(e) {
    if (leaving) return
    const p = e.touches?.[0] || e
    if (!p) return
    pointerX = p.clientX; pointerY = p.clientY
  }

  function enterSite() {
    if (leaving) return
    leaving = true
    entry.classList.add('is-leaving')
    targetX = w / 2; targetY = h / 2
    setTimeout(() => {
      cancelAnimationFrame(raf)
      entry.remove()
      style.remove()
      document.documentElement.classList.remove('entry-locked')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 760)
  }

  entry.addEventListener('pointermove', move)
  entry.addEventListener('pointerdown', (e) => { move(e); enterSite() })
  entry.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterSite() } })
  window.addEventListener('resize', resize, { passive: true })
  resize()
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
  raf = requestAnimationFrame(draw)
  requestAnimationFrame(() => entry.focus({ preventScroll: true }))
}
