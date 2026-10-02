const INTRO_ID = 'png-cutout-entry'

if (!document.getElementById(INTRO_ID)) {
  const ACID = '#c9ff39'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const medium = !mobile && window.matchMedia('(max-width: 1200px)').matches
  const tier = mobile ? 'mobile' : medium ? 'medium' : 'desktop'
  const config = {
    desktop: { globe: 1800, stars: 100, arcs: 5, nodes: 7 },
    medium: { globe: 1100, stars: 70, arcs: 4, nodes: 6 },
    mobile: { globe: 520, stars: 40, arcs: 3, nodes: 4 },
  }[tier]

  const style = document.createElement('style')
  style.id = `${INTRO_ID}-style`
  style.textContent = `
    html.entry-locked,html.entry-locked body{overflow:hidden!important;background:#040605!important}
    html.entry-locked .shell{opacity:0;transform:translateY(16px);filter:blur(4px)}
    html.entry-locked.entry-reveal .shell{opacity:1;transform:translateY(0);filter:blur(0);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1),filter .8s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}{position:fixed;inset:0;z-index:9999;overflow:hidden;background:#040605;color:#fff;cursor:crosshair;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Arial,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;opacity:1;filter:blur(0);transition:opacity .72s cubic-bezier(.22,1,.36,1),filter .72s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}.is-leaving{opacity:0;filter:blur(6px);pointer-events:none}
    #${INTRO_ID} canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #${INTRO_ID} .entry-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 46%,rgba(201,255,57,.035) 0,rgba(201,255,57,.012) 19%,transparent 40%),radial-gradient(circle at 50% 48%,transparent 0 38%,rgba(0,0,0,.18) 64%,rgba(0,0,0,.78) 100%)}
    #${INTRO_ID} .entry-grain{position:absolute;inset:-12%;pointer-events:none;opacity:.052;background-image:radial-gradient(rgba(255,255,255,.42) .48px,transparent .62px);background-size:4px 4px;mix-blend-mode:screen;animation:entryGrain 8s steps(8) infinite}
    #${INTRO_ID} .entry-ui{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .8s ease .18s}
    #${INTRO_ID}.is-ready .entry-ui{opacity:1}
    #${INTRO_ID} .entry-brand{position:absolute;left:26px;top:22px;display:grid;gap:4px;text-transform:uppercase}
    #${INTRO_ID} .entry-brand strong{font:900 13px/1 Arial,sans-serif;letter-spacing:.06em;color:#fff}
    #${INTRO_ID} .entry-brand span,#${INTRO_ID} .entry-top-meta,#${INTRO_ID} .entry-left-meta,#${INTRO_ID} .entry-skip,#${INTRO_ID} .entry-enter{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;text-transform:uppercase}
    #${INTRO_ID} .entry-brand span{font-size:8px;line-height:1.4;letter-spacing:.13em;color:rgba(255,255,255,.48)}
    #${INTRO_ID} .entry-top-meta{position:absolute;right:96px;top:23px;display:flex;align-items:center;gap:10px;font-size:8px;letter-spacing:.12em;color:rgba(255,255,255,.34)}
    #${INTRO_ID} .entry-top-meta:before{content:"";width:28px;height:1px;background:rgba(255,255,255,.18)}
    #${INTRO_ID} .entry-left-meta{position:absolute;left:26px;bottom:24px;display:grid;gap:5px;font-size:8px;line-height:1.45;letter-spacing:.09em;color:rgba(255,255,255,.52)}
    #${INTRO_ID} .entry-left-meta b{font-weight:500;color:${ACID}}
    #${INTRO_ID} .entry-enter{position:absolute;left:50%;bottom:23px;transform:translateX(-50%);display:grid;gap:5px;min-width:230px;border:0;background:transparent;color:#fff;text-align:center;pointer-events:auto;cursor:pointer;padding:10px 14px}
    #${INTRO_ID} .entry-enter strong{font-size:11px;line-height:1;letter-spacing:.16em;font-weight:600}
    #${INTRO_ID} .entry-enter span{font-size:7px;line-height:1.4;letter-spacing:.13em;color:rgba(255,255,255,.42)}
    #${INTRO_ID} .entry-enter:before{content:"";position:absolute;left:50%;top:0;width:42px;height:1px;transform:translateX(-50%);background:${ACID};box-shadow:0 0 12px rgba(201,255,57,.35);animation:entryPulseLine 2.8s ease-in-out infinite}
    #${INTRO_ID} .entry-enter:hover strong{color:${ACID}}
    #${INTRO_ID} .entry-enter:hover span{color:rgba(255,255,255,.72)}
    #${INTRO_ID} .entry-skip{position:absolute;right:26px;top:16px;border:1px solid rgba(255,255,255,.16);background:rgba(4,6,5,.42);color:rgba(255,255,255,.54);font-size:8px;letter-spacing:.12em;padding:8px 10px;pointer-events:auto;cursor:pointer}
    #${INTRO_ID} .entry-skip:hover{border-color:${ACID};color:${ACID}}
    #${INTRO_ID} .entry-click-ring{position:absolute;width:10px;height:10px;border:1px solid ${ACID};border-radius:50%;transform:translate(-50%,-50%) scale(.15);opacity:0;pointer-events:none;box-shadow:0 0 18px rgba(201,255,57,.2)}
    #${INTRO_ID} .entry-click-ring.go{animation:entryClick .58s cubic-bezier(.22,1,.36,1) forwards}
    @keyframes entryClick{0%{transform:translate(-50%,-50%) scale(.15);opacity:.95}100%{transform:translate(-50%,-50%) scale(24);opacity:0}}
    @keyframes entryPulseLine{0%,100%{opacity:.35;transform:translateX(-50%) scaleX(.65)}50%{opacity:1;transform:translateX(-50%) scaleX(1.15)}}
    @keyframes entryGrain{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-1.5%,1%,0)}40%{transform:translate3d(1%,-.7%,0)}60%{transform:translate3d(-.8%,1.4%,0)}80%{transform:translate3d(1.3%,-1%,0)}}
    @media(max-width:700px){
      #${INTRO_ID} .entry-brand{left:14px;top:14px}
      #${INTRO_ID} .entry-top-meta{display:none}
      #${INTRO_ID} .entry-skip{right:14px;top:10px}
      #${INTRO_ID} .entry-left-meta{left:14px;bottom:14px;gap:4px}
      #${INTRO_ID} .entry-left-meta span:nth-child(3),#${INTRO_ID} .entry-left-meta span:nth-child(4){display:none}
      #${INTRO_ID} .entry-enter{bottom:68px;min-width:200px}
      #${INTRO_ID} .entry-enter strong{font-size:10px}
    }
    @media(prefers-reduced-motion:reduce){
      #${INTRO_ID}{transition:opacity .24s linear,filter .24s linear}
      #${INTRO_ID} .entry-grain,#${INTRO_ID} .entry-enter:before{animation:none}
      html.entry-locked.entry-reveal .shell{transition:opacity .25s linear}
    }
  `
  document.head.appendChild(style)

  document.documentElement.classList.add('entry-locked')

  const entry = document.createElement('div')
  entry.id = INTRO_ID
  entry.setAttribute('tabindex', '0')
  entry.setAttribute('aria-label', 'PNG Cutout opening screen')
  entry.innerHTML = `
    <canvas class="space-canvas" aria-hidden="true"></canvas>
    <canvas class="globe-canvas" aria-hidden="true"></canvas>
    <div class="entry-vignette" aria-hidden="true"></div>
    <div class="entry-grain" aria-hidden="true"></div>
    <div class="entry-ui">
      <div class="entry-brand"><strong>PNG / CUTOUT</strong><span>DESIGNER UTILITY</span></div>
      <div class="entry-top-meta">FIELD 01 · ORBIT / LOCAL</div>
      <div class="entry-left-meta">
        <span><b>●</b> LOCAL-FIRST</span>
        <span>TRANSPARENT PNG</span>
        <span>FREE CORE</span>
        <span>FOR DESIGN WORKFLOWS</span>
      </div>
      <button class="entry-enter" type="button"><strong>${mobile ? 'TAP TO ENTER' : 'CLICK TO ENTER'}</strong><span>MOVE THE GLOBE · ENTER THE TOOL</span></button>
      <button class="entry-skip" type="button">SKIP</button>
    </div>
    <div class="entry-click-ring" aria-hidden="true"></div>
  `
  document.body.prepend(entry)

  const spaceCanvas = entry.querySelector('.space-canvas')
  const globeCanvas = entry.querySelector('.globe-canvas')
  const sctx = spaceCanvas.getContext('2d')
  const gctx = globeCanvas.getContext('2d')
  const enterButton = entry.querySelector('.entry-enter')
  const skipButton = entry.querySelector('.entry-skip')
  const clickRing = entry.querySelector('.entry-click-ring')
  const DPR = Math.min(window.devicePixelRatio || 1, 2)

  const State = { ENTERING: 'entering', IDLE: 'idle', EXITING: 'exiting', COMPLETE: 'complete' }
  let phase = State.ENTERING
  let startedAt = performance.now()
  let exitStartedAt = 0
  let quickExit = false
  let raf = 0
  let lastFrame = startedAt
  let width = Math.max(1, window.innerWidth)
  let height = Math.max(1, window.innerHeight)
  let globeRadius = 1
  let rotX = -.16
  let rotY = -.54
  let rotZ = .035

  const pointer = {
    x: width / 2, y: height / 2,
    targetX: width / 2, targetY: height / 2,
    lastX: width / 2, lastY: height / 2,
    vx: 0, vy: 0, speed: 0, nx: 0, ny: 0,
  }

  const hash = (n) => {
    const x = Math.sin(n * 91.3458 + 12.17) * 47453.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / Math.max(.0001, b - a), 0, 1)
    return t * t * (3 - 2 * t)
  }
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)

  const stars = Array.from({ length: config.stars }, (_, i) => ({
    x: hash(i * 1.73), y: hash(i * 4.11),
    size: .35 + hash(i * 5.9) * 1.15,
    alpha: .07 + hash(i * 2.7) * .17,
    phase: hash(i * 7.1) * Math.PI * 2,
    driftX: (hash(i * 8.9) - .5) * .0045,
    driftY: (hash(i * 10.3) - .5) * .0032,
    green: hash(i * 12.7) > .86,
  }))

  const orbitTemplates = [
    { cx:.50, cy:.47, rx:.55, ry:.17, rot:-.48, speed:.0024, alpha:.075, green:false },
    { cx:.49, cy:.47, rx:.44, ry:.29, rot:.38, speed:-.0018, alpha:.055, green:false },
    { cx:.53, cy:.45, rx:.67, ry:.34, rot:.11, speed:.0011, alpha:.045, green:true },
    { cx:.46, cy:.51, rx:.82, ry:.42, rot:-.18, speed:-.0007, alpha:.035, green:false },
    { cx:.57, cy:.40, rx:.73, ry:.22, rot:.73, speed:.0005, alpha:.03, green:false },
  ].slice(0, config.arcs)

  const nodes = Array.from({ length: config.nodes }, (_, i) => ({
    orbit: i % orbitTemplates.length,
    angle: hash(i * 9.7) * Math.PI * 2,
    speed: (hash(i * 3.4) > .5 ? 1 : -1) * (.035 + hash(i * 6.6) * .065),
    phase: hash(i * 11.3) * Math.PI * 2,
    free: i >= orbitTemplates.length,
    fx: hash(i * 15.1), fy: hash(i * 19.4),
  }))

  const globePoints = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < config.globe; i++) {
    const y = 1 - (i / Math.max(1, config.globe - 1)) * 2
    const rr = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    globePoints.push({
      x: Math.cos(theta) * rr,
      y,
      z: Math.sin(theta) * rr,
      size: .4 + hash(i * 6.21) * 1.05,
      alpha: .38 + hash(i * 4.31) * .58,
      phase: hash(i * 1.31) * Math.PI * 2,
      accent: hash(i * 8.31) > .93,
      scatterAngle: hash(i * 12.13) * Math.PI * 2,
      scatterSpeed: .85 + hash(i * 13.17) * 2.4,
      entrance: .45 + hash(i * 15.9) * 1.2,
    })
  }

  function resizeCanvas(canvas, ctx) {
    canvas.width = Math.floor(width * DPR)
    canvas.height = Math.floor(height * DPR)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  }

  function resize() {
    width = Math.max(1, window.innerWidth)
    height = Math.max(1, window.innerHeight)
    resizeCanvas(spaceCanvas, sctx)
    resizeCanvas(globeCanvas, gctx)
    globeRadius = Math.min(width, height) * (mobile ? .245 : medium ? .255 : .275)
    pointer.x = clamp(pointer.x, 0, width)
    pointer.y = clamp(pointer.y, 0, height)
    pointer.targetX = clamp(pointer.targetX, 0, width)
    pointer.targetY = clamp(pointer.targetY, 0, height)
  }

  function updatePointer(dt) {
    const response = reduceMotion ? .03 : .105
    pointer.x += (pointer.targetX - pointer.x) * response
    pointer.y += (pointer.targetY - pointer.y) * response
    pointer.vx = (pointer.x - pointer.lastX) / Math.max(.001, dt)
    pointer.vy = (pointer.y - pointer.lastY) / Math.max(.001, dt)
    pointer.lastX = pointer.x
    pointer.lastY = pointer.y
    const rawSpeed = Math.hypot(pointer.vx, pointer.vy)
    pointer.speed += (Math.min(1200, rawSpeed) - pointer.speed) * .1
    pointer.nx = (pointer.x / width - .5) * 2
    pointer.ny = (pointer.y / height - .5) * 2
  }

  function exitProgress(time) {
    if (phase !== State.EXITING) return 0
    const duration = quickExit || reduceMotion ? 360 : 1180
    return clamp((time - exitStartedAt) / duration, 0, 1)
  }

  function drawSpace(timeMs) {
    const t = timeMs * .001
    const age = (timeMs - startedAt) * .001
    const intro = smoothstep(.05, .85, age)
    const orbitIn = smoothstep(.35, 1.35, age)
    const exit = exitProgress(timeMs)
    const fade = 1 - smoothstep(.18, .86, exit)
    const px = reduceMotion ? 0 : pointer.nx
    const py = reduceMotion ? 0 : pointer.ny

    sctx.clearRect(0, 0, width, height)
    sctx.fillStyle = '#040605'
    sctx.fillRect(0, 0, width, height)

    for (const star of stars) {
      const sx = ((star.x + t * star.driftX) % 1 + 1) % 1
      const sy = ((star.y + t * star.driftY) % 1 + 1) % 1
      const x = sx * width + px * 3
      const y = sy * height + py * 2
      const twinkle = reduceMotion ? 1 : .82 + Math.sin(t * .6 + star.phase) * .18
      const a = star.alpha * twinkle * intro * fade
      sctx.beginPath()
      sctx.fillStyle = star.green ? `rgba(201,255,57,${a * .75})` : `rgba(255,255,255,${a})`
      sctx.arc(x, y, star.size, 0, Math.PI * 2)
      sctx.fill()
    }

    const gx = px * 6
    const gy = py * 4
    const gridAlpha = .055 * orbitIn * fade
    sctx.save()
    sctx.translate(gx, gy)
    sctx.lineWidth = .55
    sctx.strokeStyle = `rgba(255,255,255,${gridAlpha})`
    sctx.fillStyle = `rgba(255,255,255,${gridAlpha * 4.5})`
    sctx.font = '7px "SFMono-Regular",Consolas,monospace'
    sctx.textBaseline = 'middle'

    const horizontal = [height * .31, height * .72]
    for (const y of horizontal) {
      sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(width, y); sctx.stroke()
      for (let x = 22; x < width; x += Math.max(56, width / 18)) {
        sctx.beginPath(); sctx.moveTo(x, y - 3); sctx.lineTo(x, y + 3); sctx.stroke()
      }
    }
    const vx = width * .19
    sctx.beginPath(); sctx.moveTo(vx, 0); sctx.lineTo(vx, height); sctx.stroke()
    for (let y = 24; y < height; y += Math.max(54, height / 14)) {
      sctx.beginPath(); sctx.moveTo(vx - 3, y); sctx.lineTo(vx + 3, y); sctx.stroke()
    }
    sctx.fillText('FIELD 01', 28, horizontal[0] - 10)
    sctx.fillText('CUTOUT SYSTEM', width * .73, horizontal[0] + 10)
    sctx.fillText('LOCAL SIGNAL', vx + 10, height * .18)
    sctx.fillText('NODE TRACK', width * .77, horizontal[1] - 10)
    sctx.restore()

    for (let i = 0; i < orbitTemplates.length; i++) {
      const o = orbitTemplates[i]
      const cx = width * o.cx + px * 12
      const cy = height * o.cy + py * 8
      const rx = Math.max(width, height) * o.rx
      const ry = Math.min(width, height) * o.ry
      const rot = o.rot + (reduceMotion ? 0 : t * o.speed)
      sctx.save()
      sctx.translate(cx, cy)
      sctx.rotate(rot)
      sctx.beginPath()
      sctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      sctx.strokeStyle = o.green ? `rgba(201,255,57,${o.alpha * .75 * orbitIn * fade})` : `rgba(255,255,255,${o.alpha * orbitIn * fade})`
      sctx.lineWidth = i === 0 ? .8 : .55
      sctx.stroke()
      sctx.restore()
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      let x, y
      if (n.free) {
        x = n.fx * width + px * 8
        y = n.fy * height + py * 6
      } else {
        const o = orbitTemplates[n.orbit]
        const angle = n.angle + (reduceMotion ? 0 : t * n.speed)
        const rot = o.rot + (reduceMotion ? 0 : t * o.speed)
        const lx = Math.cos(angle) * Math.max(width, height) * o.rx
        const ly = Math.sin(angle) * Math.min(width, height) * o.ry
        const cr = Math.cos(rot), sr = Math.sin(rot)
        x = width * o.cx + lx * cr - ly * sr + px * 12
        y = height * o.cy + lx * sr + ly * cr + py * 8
      }
      const pulse = reduceMotion ? .7 : .62 + Math.sin(t * 1.5 + n.phase) * .32
      const near = clamp(1 - Math.hypot(x - pointer.x, y - pointer.y) / 180, 0, 1)
      const a = (.38 + pulse * .42 + near * .22) * orbitIn * fade
      sctx.beginPath()
      sctx.fillStyle = `rgba(201,255,57,${a})`
      sctx.arc(x, y, 1.4 + pulse * .75, 0, Math.PI * 2)
      sctx.fill()
      if (i < 3) {
        sctx.beginPath()
        sctx.strokeStyle = `rgba(201,255,57,${a * .18})`
        sctx.lineWidth = .6
        sctx.arc(x, y, 5 + pulse * 3, 0, Math.PI * 2)
        sctx.stroke()
      }
    }
  }

  function updateRotation(t) {
    const targetY = -.54 + (reduceMotion ? 0 : pointer.nx * .34) + t * (reduceMotion ? .012 : .055)
    const targetX = -.16 - (reduceMotion ? 0 : pointer.ny * .18)
    const targetZ = reduceMotion ? .02 : pointer.nx * .025
    rotY += (targetY - rotY) * .045
    rotX += (targetX - rotX) * .05
    rotZ += (targetZ - rotZ) * .03
  }

  function rotatePoint(p) {
    const cy = Math.cos(rotY), sy = Math.sin(rotY)
    let x = p.x * cy + p.z * sy
    let z = -p.x * sy + p.z * cy
    const cx = Math.cos(rotX), sx = Math.sin(rotX)
    let y = p.y * cx - z * sx
    z = p.y * sx + z * cx
    const cz = Math.cos(rotZ), sz = Math.sin(rotZ)
    return [x * cz - y * sz, x * sz + y * cz, z]
  }

  function drawGlobe(timeMs) {
    const t = timeMs * .001
    const age = (timeMs - startedAt) * .001
    const exit = exitProgress(timeMs)
    const scatter = easeOut(exit)
    const globalFade = 1 - smoothstep(.28, .95, exit)
    const centerX = width * .5 + (reduceMotion ? 0 : pointer.nx * (mobile ? 9 : 22))
    const centerY = height * .46 + (reduceMotion ? 0 : pointer.ny * (mobile ? 6 : 15))
    const breathe = reduceMotion ? 1 : 1 + Math.sin(t * 1.25) * .012
    const radius = globeRadius * breathe
    const interactRadius = radius * (mobile ? .38 : .42)

    updateRotation(t)
    gctx.clearRect(0, 0, width, height)

    const ringIn = smoothstep(.65, 1.7, age)
    gctx.beginPath()
    gctx.strokeStyle = `rgba(255,255,255,${.055 * ringIn * globalFade})`
    gctx.lineWidth = .6
    gctx.arc(centerX, centerY, radius * (1 + scatter * .2), 0, Math.PI * 2)
    gctx.stroke()

    for (let i = 0; i < globePoints.length; i++) {
      const p = globePoints[i]
      const appear = smoothstep(p.entrance, p.entrance + .85, age)
      const [x, y, z] = rotatePoint(p)
      const depth = clamp((z + 1) * .5, 0, 1)
      const projection = .84 + depth * .18
      let sx = centerX + x * radius * projection
      let sy = centerY + y * radius * projection

      if (appear < 1) {
        const inv = 1 - appear
        sx += Math.cos(p.scatterAngle) * radius * inv * (1.2 + p.scatterSpeed * .42)
        sy += Math.sin(p.scatterAngle) * radius * inv * (1.2 + p.scatterSpeed * .42)
      }

      if (!reduceMotion && phase !== State.EXITING) {
        const dx = sx - pointer.x
        const dy = sy - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist > 1 && dist < interactRadius) {
          const f = Math.pow(1 - dist / interactRadius, 2)
          const velocityBoost = clamp(pointer.speed / 900, 0, 1)
          const force = f * (8 + velocityBoost * 12)
          sx += (dx / dist) * force
          sy += (dy / dist) * force
        }
      }

      if (scatter > 0) {
        const distance = radius * p.scatterSpeed * 1.45 * scatter
        sx += Math.cos(p.scatterAngle) * distance
        sy += Math.sin(p.scatterAngle) * distance
      }

      const alpha = p.alpha * (.24 + depth * .76) * appear * globalFade
      const size = p.size * (.65 + depth * .8)
      gctx.beginPath()
      gctx.fillStyle = p.accent ? `rgba(201,255,57,${alpha * .9})` : `rgba(255,255,255,${alpha})`
      gctx.arc(sx, sy, size, 0, Math.PI * 2)
      gctx.fill()
    }
  }

  function frame(timeMs) {
    if (phase === State.COMPLETE || !entry.isConnected) return
    const dt = Math.min(.033, Math.max(.001, (timeMs - lastFrame) / 1000))
    lastFrame = timeMs
    updatePointer(dt)
    if (phase === State.ENTERING && timeMs - startedAt > 2200) phase = State.IDLE

    drawSpace(timeMs)
    drawGlobe(timeMs)

    if (phase === State.EXITING) {
      const p = exitProgress(timeMs)
      if (!quickExit && !reduceMotion && p > .38 && !document.documentElement.classList.contains('entry-reveal')) document.documentElement.classList.add('entry-reveal')
      if ((quickExit || reduceMotion) && p > .18 && !document.documentElement.classList.contains('entry-reveal')) document.documentElement.classList.add('entry-reveal')
      if (p >= 1) finish()
    }
    raf = requestAnimationFrame(frame)
  }

  function pulseAt(x, y) {
    clickRing.style.left = `${x}px`
    clickRing.style.top = `${y}px`
    clickRing.classList.remove('go')
    void clickRing.offsetWidth
    clickRing.classList.add('go')
  }

  function beginExit({ quick = false, x = pointer.x, y = pointer.y } = {}) {
    if (phase === State.EXITING || phase === State.COMPLETE) return
    quickExit = quick
    phase = State.EXITING
    exitStartedAt = performance.now()
    pulseAt(x, y)
    if (quick || reduceMotion) {
      entry.style.transitionDuration = '.28s'
      requestAnimationFrame(() => entry.classList.add('is-leaving'))
    } else {
      setTimeout(() => entry.classList.add('is-leaving'), 430)
    }
  }

  function finish() {
    if (phase === State.COMPLETE) return
    phase = State.COMPLETE
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    entry.removeEventListener('pointermove', onPointerMove)
    entry.removeEventListener('keydown', onKeydown)
    entry.removeEventListener('pointerup', onEntryPointerUp)
    enterButton.removeEventListener('click', onEnterClick)
    skipButton.removeEventListener('click', onSkipClick)
    entry.remove()
    style.remove()
    document.documentElement.classList.remove('entry-locked', 'entry-reveal')
    try { window.scrollTo({ top: 0, behavior: 'instant' }) } catch { window.scrollTo(0, 0) }
  }

  function onPointerMove(e) {
    if (phase === State.EXITING || phase === State.COMPLETE) return
    pointer.targetX = e.clientX
    pointer.targetY = e.clientY
  }

  function onEntryPointerUp(e) {
    if (e.target.closest('button')) return
    beginExit({ x: e.clientX, y: e.clientY })
  }

  function onEnterClick(e) {
    e.stopPropagation()
    const r = enterButton.getBoundingClientRect()
    beginExit({ x: r.left + r.width / 2, y: r.top })
  }

  function onSkipClick(e) {
    e.stopPropagation()
    const r = skipButton.getBoundingClientRect()
    beginExit({ quick: true, x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  function onKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      beginExit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      beginExit({ quick: true })
    }
  }

  entry.addEventListener('pointermove', onPointerMove)
  entry.addEventListener('pointerup', onEntryPointerUp)
  entry.addEventListener('keydown', onKeydown)
  enterButton.addEventListener('click', onEnterClick)
  skipButton.addEventListener('click', onSkipClick)
  window.addEventListener('resize', resize, { passive: true })

  resize()
  sctx.fillStyle = '#040605'
  sctx.fillRect(0, 0, width, height)
  requestAnimationFrame(() => entry.classList.add('is-ready'))
  raf = requestAnimationFrame(frame)
  requestAnimationFrame(() => entry.focus({ preventScroll: true }))
}
