const INTRO_ID = 'png-cutout-entry'

if (!document.getElementById(INTRO_ID)) {
  const style = document.createElement('style')
  style.id = `${INTRO_ID}-style`
  style.textContent = `
    html.entry-locked, html.entry-locked body{overflow:hidden!important;background:#030303!important}
    #${INTRO_ID}{position:fixed;inset:0;z-index:9999;background:#030303;color:#fff;overflow:hidden;cursor:crosshair;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Arial,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;opacity:1;transition:opacity .9s cubic-bezier(.22,1,.36,1),filter .9s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}.is-leaving{opacity:0;filter:blur(5px);pointer-events:none}
    #${INTRO_ID} canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #${INTRO_ID} .entry-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 48%,transparent 0 32%,rgba(0,0,0,.14) 56%,rgba(0,0,0,.72) 100%)}
    #${INTRO_ID} .entry-grain{position:absolute;inset:-18%;pointer-events:none;opacity:.11;background-image:radial-gradient(rgba(255,255,255,.33) .5px,transparent .7px);background-size:4px 4px;mix-blend-mode:screen;animation:entryGrain 8s steps(8) infinite}
    #${INTRO_ID} .entry-top{position:absolute;left:26px;right:26px;top:22px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;pointer-events:none;font:10px/1.5 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.44)}
    #${INTRO_ID} .entry-brand{color:#fff;font-weight:900;letter-spacing:.05em;font-size:11px}
    #${INTRO_ID} .entry-index{display:flex;align-items:center;gap:9px}
    #${INTRO_ID} .entry-index i{width:24px;height:1px;background:rgba(255,255,255,.28)}
    #${INTRO_ID} .entry-center{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
    #${INTRO_ID} .entry-center span{transform:translateY(min(34vh,300px));font:9px/1.65 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.42);text-align:center;transition:color .25s,letter-spacing .25s}
    #${INTRO_ID}:hover .entry-center span{color:rgba(255,255,255,.88);letter-spacing:.21em}
    #${INTRO_ID} .entry-left-meta{position:absolute;left:26px;bottom:24px;display:grid;gap:5px;pointer-events:none;font:8px/1.5 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.38)}
    #${INTRO_ID} .entry-left-meta b{font-weight:500;color:rgba(201,255,57,.86)}
    #${INTRO_ID} .entry-right-meta{position:absolute;right:26px;bottom:24px;text-align:right;pointer-events:none;font:8px/1.55 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.34)}
    #${INTRO_ID} .entry-pulse{display:inline-flex;align-items:center;gap:8px}
    #${INTRO_ID} .entry-pulse i{width:6px;height:6px;border:1px solid #c9ff39;border-radius:50%;box-shadow:0 0 18px rgba(201,255,57,.45);animation:entryPulse 1.9s ease-in-out infinite}
    #${INTRO_ID} .entry-click-ring{position:absolute;width:10px;height:10px;border:1px solid #c9ff39;border-radius:50%;transform:translate(-50%,-50%) scale(.1);opacity:0;pointer-events:none}
    #${INTRO_ID} .entry-click-ring.go{animation:entryClick .72s cubic-bezier(.22,1,.36,1) forwards}
    @keyframes entryPulse{0%,100%{transform:scale(.75);opacity:.35}50%{transform:scale(1.22);opacity:1}}
    @keyframes entryClick{0%{transform:translate(-50%,-50%) scale(.15);opacity:.95}100%{transform:translate(-50%,-50%) scale(28);opacity:0}}
    @keyframes entryGrain{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-2%,1%,0)}40%{transform:translate3d(1.5%,-1%,0)}60%{transform:translate3d(-1%,2%,0)}80%{transform:translate3d(2%,-1.5%,0)}}
    @media(max-width:640px){#${INTRO_ID} .entry-top{left:14px;right:14px;top:14px}#${INTRO_ID} .entry-left-meta{left:14px;bottom:14px}#${INTRO_ID} .entry-right-meta{right:14px;bottom:14px}#${INTRO_ID} .entry-center span{transform:translateY(min(31vh,225px));font-size:8px}#${INTRO_ID} .entry-top>span:last-child{display:none}}
    @media(prefers-reduced-motion:reduce){#${INTRO_ID}{transition:opacity .25s linear,filter .25s linear}#${INTRO_ID} .entry-pulse i,#${INTRO_ID} .entry-grain{animation:none}}
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
    <div class="entry-vignette" aria-hidden="true"></div>
    <div class="entry-grain" aria-hidden="true"></div>
    <div class="entry-top"><span class="entry-brand">PNG / CUTOUT</span><span class="entry-index"><i></i>ORBITAL INTERFACE · 002</span></div>
    <div class="entry-center"><span>MOVE / OBSERVE<br>CLICK TO ENTER</span></div>
    <div class="entry-left-meta"><span><b>●</b> LOCAL-FIRST</span><span>TRANSPARENT PNG</span><span>FREE CORE / DESIGNER UTILITY</span></div>
    <div class="entry-right-meta">PARTICLE FIELD<br>ORBIT SYSTEM / LIVE<br>移動滑鼠 · 點擊進入</div>
    <div class="entry-click-ring" aria-hidden="true"></div>
  `
  document.body.prepend(entry)

  const canvas = entry.querySelector('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })
  const clickRing = entry.querySelector('.entry-click-ring')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = matchMedia('(max-width: 700px)').matches
  const DPR = Math.min(window.devicePixelRatio || 1, 2)

  let w = 0, h = 0, radius = 0
  let centerX = 0, centerY = 0, targetX = 0, targetY = 0
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2
  let pointerVX = 0, pointerVY = 0, speed = 0
  let lastPX = pointerX, lastPY = pointerY
  let rotX = -0.18, rotY = -0.62, rotZ = 0.06
  let targetRotX = rotX, targetRotY = rotY, targetRotZ = rotZ
  let raf = 0, leaving = false, scatterOut = 0, enterTime = performance.now()

  const ACID = [201, 255, 57]
  const orbitDefs = [
    { a: 1.38, b: .36, tilt: -.72, roll: .10, phase: .2, speed: .075, alpha: .16 },
    { a: 1.18, b: .62, tilt: .44, roll: -.28, phase: 1.5, speed: -.052, alpha: .11 },
    { a: 1.50, b: .76, tilt: .15, roll: .62, phase: 2.6, speed: .035, alpha: .085 },
    { a: 1.08, b: .92, tilt: -.18, roll: 1.05, phase: .85, speed: -.026, alpha: .075 },
  ]

  function hash(n) {
    const x = Math.sin(n * 91.3458) * 47453.5453
    return x - Math.floor(x)
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)) }

  const stars = []
  const starCount = mobile ? 70 : 145
  for (let i = 0; i < starCount; i++) {
    stars.push({ x: hash(i * 1.73), y: hash(i * 4.11), a: .05 + hash(i * 2.7) * .18, s: .25 + hash(i * 5.9) * .65, phase: hash(i * 7.1) * Math.PI * 2 })
  }

  const points = []
  const count = mobile ? 720 : 1780
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const rr = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const x = Math.cos(theta) * rr
    const z = Math.sin(theta) * rr
    const latitudeBand = .72 + Math.pow(Math.abs(y), .75) * .34
    const densityAccent = hash(i * 8.31) > .89
    points.push({ x, y, z, phase: hash(i * 1.31) * Math.PI * 2, weight: .55 + hash(i * 3.17) * 1.1, size: .42 + hash(i * 6.21) * .95, accent: densityAccent, latWeight: latitudeBand, drift: (hash(i * 2.19) - .5) * .024 })
  }

  const nodes = orbitDefs.map((o, i) => ({ orbit: i, offset: hash(i * 9.7) * Math.PI * 2, pulse: hash(i * 11.3) * Math.PI * 2 }))

  function resize() {
    w = Math.max(1, innerWidth); h = Math.max(1, innerHeight)
    canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR)
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    radius = Math.min(w, h) * (mobile ? .255 : .285)
    if (!centerX) centerX = targetX = w / 2
    if (!centerY) centerY = targetY = h / 2
  }

  function rotate3(x, y, z) {
    const cy = Math.cos(rotY), sy = Math.sin(rotY)
    let nx = x * cy + z * sy
    let nz = -x * sy + z * cy
    const cx = Math.cos(rotX), sx = Math.sin(rotX)
    let ny = y * cx - nz * sx
    nz = y * sx + nz * cx
    const cz = Math.cos(rotZ), sz = Math.sin(rotZ)
    const rx = nx * cz - ny * sz
    const ry = nx * sz + ny * cz
    return [rx, ry, nz]
  }

  function orbitPoint(def, angle) {
    let x = Math.cos(angle) * def.a
    let y = Math.sin(angle) * def.b
    let z = Math.sin(angle * 1.9 + def.phase) * .055
    const ct = Math.cos(def.tilt), st = Math.sin(def.tilt)
    const y1 = y * ct - z * st
    const z1 = y * st + z * ct
    y = y1; z = z1
    const cr = Math.cos(def.roll), sr = Math.sin(def.roll)
    const x1 = x * cr - y * sr
    const y2 = x * sr + y * cr
    return rotate3(x1, y2, z)
  }

  function drawOrbit(def, time, index) {
    const segments = mobile ? 92 : 150
    ctx.beginPath()
    let first = true
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2 + def.phase
      const [x, y, z] = orbitPoint(def, a)
      const depth = .86 + (z + 1) * .08
      const sx = centerX + x * radius * depth
      const sy = centerY + y * radius * depth
      if (first) { ctx.moveTo(sx, sy); first = false } else ctx.lineTo(sx, sy)
    }
    const pulse = .78 + Math.sin(time * .45 + index * 1.7) * .22
    ctx.strokeStyle = `rgba(215,218,211,${def.alpha * pulse * (1 - scatterOut * .8)})`
    ctx.lineWidth = .55
    ctx.stroke()
  }

  function drawNode(def, node, time) {
    const angle = time * def.speed + node.offset + def.phase
    const [x, y, z] = orbitPoint(def, angle)
    const depth = .86 + (z + 1) * .08
    const sx = centerX + x * radius * depth
    const sy = centerY + y * radius * depth
    const glow = .62 + Math.sin(time * 1.7 + node.pulse) * .38
    ctx.beginPath()
    ctx.fillStyle = `rgba(${ACID[0]},${ACID[1]},${ACID[2]},${(.45 + glow * .45) * (1 - scatterOut)})`
    ctx.arc(sx, sy, 1.25 + glow * .75, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${ACID[0]},${ACID[1]},${ACID[2]},${.12 * glow * (1 - scatterOut)})`
    ctx.lineWidth = .65
    ctx.arc(sx, sy, 5 + glow * 3, 0, Math.PI * 2)
    ctx.stroke()
  }

  function drawDataMarks(time) {
    const alpha = (1 - scatterOut) * .24
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotZ * .4)
    ctx.strokeStyle = `rgba(255,255,255,${alpha * .42})`
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.lineWidth = .5
    ctx.font = '7px "SFMono-Regular",Consolas,monospace'
    ctx.textAlign = 'left'
    const marks = [[radius * 1.36, -radius * .46, 'R-01'],[-radius * 1.48, radius * .25, 'AXIS / 17.4'],[radius * .94, radius * 1.02, 'FIELD 02']]
    for (const [x, y, label] of marks) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.stroke(); ctx.fillText(label, x + 20, y + 2) }
    const tickR = radius * 1.58
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * Math.PI * 2 + time * .006
      const len = i % 6 === 0 ? 7 : 3
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * tickR, Math.sin(a) * tickR); ctx.lineTo(Math.cos(a) * (tickR + len), Math.sin(a) * (tickR + len)); ctx.stroke()
    }
    ctx.restore()
  }

  function draw(t) {
    if (!entry.isConnected) return
    const time = t * .001
    pointerVX = pointerX - lastPX; pointerVY = pointerY - lastPY
    lastPX = pointerX; lastPY = pointerY
    speed += (Math.min(38, Math.hypot(pointerVX, pointerVY)) - speed) * .12
    const introAge = clamp01((t - enterTime) / 1600)

    if (!reduceMotion && !leaving) {
      const nx = (pointerX / Math.max(1, w) - .5) * 2
      const ny = (pointerY / Math.max(1, h) - .5) * 2
      targetX = w / 2 + nx * Math.min(w, h) * .052
      targetY = h / 2 + ny * Math.min(w, h) * .035
      targetRotY = -0.60 + nx * .48
      targetRotX = -0.18 - ny * .27
      targetRotZ = .06 + nx * .045
      rotY += (targetRotY - rotY) * .032 + .0008
      rotX += (targetRotX - rotX) * .038
      rotZ += (targetRotZ - rotZ) * .028
    } else if (!reduceMotion && leaving) {
      scatterOut += (1 - scatterOut) * .07
      rotY += .013
      rotZ += .004
    }
    centerX += (targetX - centerX) * .042
    centerY += (targetY - centerY) * .042

    ctx.fillStyle = leaving ? `rgba(3,3,3,${.24 + scatterOut * .30})` : 'rgba(3,3,3,.30)'
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      const tw = .72 + Math.sin(time * .45 + s.phase) * .28
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${s.a * tw * (1 - scatterOut)})`; ctx.arc(s.x * w, s.y * h, s.s, 0, Math.PI * 2); ctx.fill()
    }

    for (let i = 0; i < orbitDefs.length; i++) drawOrbit(orbitDefs[i], time, i)
    if (!mobile) drawDataMarks(time)

    const repelRadius = radius * .46
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      let [x, y, z] = rotate3(p.x, p.y + Math.sin(time * .62 + p.phase) * p.drift, p.z)
      const front = clamp01((z + 1) * .5)
      const depth = .78 + front * .32
      const breathe = reduceMotion ? 1 : 1 + Math.sin(time * 1.03 + p.phase) * .007 * p.weight
      const formIn = .18 + introAge * .82
      const spread = (1 - introAge) * (1.7 + p.weight * .55)
      let localRadius = radius * breathe * formIn * (1 + scatterOut * (1.8 + p.weight * 2.4))
      let sx = centerX + x * localRadius * depth + (1 - introAge) * x * radius * spread
      let sy = centerY + y * localRadius * depth + (1 - introAge) * y * radius * spread
      let interaction = 0
      if (!reduceMotion && !leaving) {
        const dx = sx - pointerX, dy = sy - pointerY
        const dist = Math.hypot(dx, dy)
        if (dist < repelRadius && dist > 1) {
          interaction = (1 - dist / repelRadius) ** 2
          const f = interaction * (12 + speed * .92) * p.weight
          sx += dx / dist * f; sy += dy / dist * f
        }
      }
      const silhouette = .22 + front * .66
      const alpha = (p.accent ? .46 : silhouette) * p.latWeight * introAge * (1 - scatterOut * .72)
      const size = p.size * (.56 + front * .86) * (mobile ? .90 : 1)
      const acidMix = p.accent ? .72 : Math.min(.22, interaction * .48)
      const r = Math.round(255 * (1 - acidMix) + ACID[0] * acidMix)
      const g = Math.round(255 * (1 - acidMix) + ACID[1] * acidMix)
      const b = Math.round(255 * (1 - acidMix) + ACID[2] * acidMix)
      ctx.beginPath(); ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`; ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill()
    }

    ctx.beginPath(); ctx.strokeStyle = `rgba(255,255,255,${.105 * introAge * (1 - scatterOut)})`; ctx.lineWidth = .6; ctx.arc(centerX, centerY, radius * (1 + scatterOut * 1.85), 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < nodes.length; i++) drawNode(orbitDefs[nodes[i].orbit], nodes[i], time)
    raf = requestAnimationFrame(draw)
  }

  function move(e) {
    if (leaving) return
    const p = e.touches?.[0] || e
    if (!p) return
    pointerX = p.clientX; pointerY = p.clientY
  }

  function enterSite(e) {
    if (leaving) return
    leaving = true
    const px = e?.clientX ?? pointerX
    const py = e?.clientY ?? pointerY
    clickRing.style.left = `${px}px`; clickRing.style.top = `${py}px`; clickRing.classList.remove('go'); void clickRing.offsetWidth; clickRing.classList.add('go')
    entry.classList.add('is-leaving')
    targetX = w / 2; targetY = h / 2
    setTimeout(() => {
      cancelAnimationFrame(raf); entry.remove(); style.remove(); document.documentElement.classList.remove('entry-locked'); window.scrollTo({ top: 0, behavior: 'instant' })
    }, 930)
  }

  entry.addEventListener('pointermove', move)
  entry.addEventListener('pointerdown', (e) => { move(e); enterSite(e) })
  entry.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterSite(e) } })
  window.addEventListener('resize', resize, { passive: true })
  resize()
  ctx.fillStyle = '#030303'; ctx.fillRect(0, 0, w, h)
  raf = requestAnimationFrame(draw)
  requestAnimationFrame(() => entry.focus({ preventScroll: true }))
}
