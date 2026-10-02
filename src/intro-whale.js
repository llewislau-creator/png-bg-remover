const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('png-cutout-whale-style')) {
  const globeCanvas = entry.querySelector('.globe-canvas')
  if (globeCanvas) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio || 1, 1.75)
    const ACID = '#c9ff39'

    const style = document.createElement('style')
    style.id = 'png-cutout-whale-style'
    style.textContent = `
      #png-cutout-entry .whale-canvas{position:absolute;inset:0;z-index:7;width:100%;height:100%;display:block;pointer-events:none;will-change:opacity}
      #png-cutout-entry .whale-caption{position:absolute;left:50%;top:74%;z-index:9;transform:translate(-50%,-50%);pointer-events:none;font:7px/1.4 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.24);opacity:0;transition:opacity 1.5s ease 1.9s;white-space:nowrap}
      #png-cutout-entry.is-ready .whale-caption{opacity:1}
      #png-cutout-entry .whale-caption:before{content:"";display:inline-block;width:26px;height:1px;margin:0 9px 2px 0;background:linear-gradient(90deg,rgba(201,255,57,.58),rgba(201,255,57,0))}
      @media(max-width:700px){#png-cutout-entry .whale-caption{display:none}}
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .whale-caption{transition:opacity .3s linear}}
    `
    document.head.appendChild(style)

    const canvas = document.createElement('canvas')
    canvas.className = 'whale-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    const systemLayer = entry.querySelector('.entry-system-layer')
    entry.insertBefore(canvas, systemLayer || entry.querySelector('.entry-ui') || null)

    const caption = document.createElement('div')
    caption.className = 'whale-caption'
    caption.textContent = 'ORBITAL GUIDE / COSMIC WHALE'
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(caption, ui || null)

    const topMeta = entry.querySelector('.entry-top-meta')
    const enterCopy = entry.querySelector('.entry-enter span')
    if (topMeta) topMeta.textContent = 'EARTH / MOON / SUN / WHALE · 07 CONTINENTS'
    if (enterCopy) enterCopy.textContent = mobile ? 'MOVE · PINCH · ENTER THE FIELD' : 'MOVE · SCROLL TO ZOOM · ENTER THE FIELD'

    const ctx = canvas.getContext('2d')
    let width = Math.max(1, window.innerWidth)
    let height = Math.max(1, window.innerHeight)
    let pointerX = width * 0.5
    let pointerY = height * 0.5
    let targetNx = 0
    let targetNy = 0
    let nx = 0
    let ny = 0
    let whaleOffsetX = 0
    let whaleOffsetY = 0
    let lastTime = performance.now()
    const startedAt = lastTime
    let exitStartedAt = 0
    let raf = 0
    let lastTrailEmit = 0
    let pointerLastX = pointerX
    let pointerLastY = pointerY
    let pointerSpeed = 0
    const trail = []

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const lerp = (a, b, t) => a + (b - a) * t
    const smoothstep = (a, b, x) => {
      const t = clamp((x - a) / Math.max(0.0001, b - a), 0, 1)
      return t * t * (3 - 2 * t)
    }
    const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
    const hash = (n) => {
      const x = Math.sin(n * 71.371 + 19.73) * 43758.5453
      return x - Math.floor(x)
    }

    const path = [
      [-0.62, 0.66],
      [-0.30, 0.82],
      [0.18, 0.76],
      [0.58, 0.50],
      [0.30, 0.60],
      [-0.18, 0.73],
      [-0.55, 0.66],
    ]

    function samplePath(t) {
      const n = path.length
      const u = ((t % 1) + 1) % 1 * n
      const i = Math.floor(u)
      const f = u - i
      const p0 = path[(i - 1 + n) % n]
      const p1 = path[i % n]
      const p2 = path[(i + 1) % n]
      const p3 = path[(i + 2) % n]
      const f2 = f * f
      const f3 = f2 * f
      const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * f + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * f2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * f3)
      const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * f + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * f2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * f3)
      return { x, y }
    }

    const bodyParticles = Array.from({ length: mobile ? 54 : 118 }, (_, i) => {
      let x = -0.40 + hash(i * 3.17) * 0.92
      const profile = Math.sqrt(Math.max(0, 1 - Math.pow((x - 0.03) / 0.51, 2)))
      const y = (hash(i * 5.23) - 0.5) * profile * 0.25 + 0.005
      return {
        x,
        y,
        size: 0.45 + hash(i * 7.9) * 1.05,
        alpha: 0.12 + hash(i * 9.11) * 0.36,
        phase: hash(i * 12.37) * Math.PI * 2,
        green: hash(i * 14.13) > 0.965,
      }
    })

    function resize() {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      canvas.width = Math.floor(width * DPR)
      canvas.height = Math.floor(height * DPR)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    function getZoom() {
      const match = globeCanvas.style.transform?.match(/scale\(([-\d.]+)\)/)
      return match ? clamp(Number(match[1]) || 1, 0.6, 1.7) : 1
    }

    function getEarthState() {
      const zoom = getZoom()
      const radius = Math.min(width, height) * (mobile ? 0.235 : width < 1200 ? 0.25 : 0.268) * zoom
      const x = width * 0.5 + nx * (mobile ? 7 : 15)
      const y = height * 0.465 + ny * (mobile ? 5 : 10)
      return { x, y, radius, zoom }
    }

    function worldFromLocal(cx, cy, rotation, unit, lx, ly) {
      const c = Math.cos(rotation)
      const s = Math.sin(rotation)
      return {
        x: cx + (lx * c - ly * s) * unit,
        y: cy + (lx * s + ly * c) * unit,
      }
    }

    function drawTrail(exitP) {
      ctx.save()
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i]
        const age = 1 - p.life
        const drift = age * age * 18
        const a = p.life * p.life * (exitP > 0 ? 0.72 : 0.44)
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(201,255,57,${a * 0.62})` : `rgba(255,255,255,${a})`
        ctx.arc(p.x - drift, p.y + Math.sin(p.phase + age * 5) * 3, p.size * (0.6 + p.life), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    function emitTrail(tail, time, intensity) {
      if (time - lastTrailEmit < (mobile ? 62 : 42) / Math.max(1, intensity)) return
      lastTrailEmit = time
      const count = intensity > 1.7 ? 3 : intensity > 1.1 ? 2 : 1
      for (let i = 0; i < count; i++) {
        const seed = time * 0.001 + i * 13.7
        trail.push({
          x: tail.x + (hash(seed * 7.1) - 0.5) * 8,
          y: tail.y + (hash(seed * 11.3) - 0.5) * 8,
          life: 1,
          size: 0.65 + hash(seed * 17.9) * 1.75,
          green: hash(seed * 23.7) > 0.94,
          phase: hash(seed * 31.1) * Math.PI * 2,
        })
      }
      while (trail.length > (mobile ? 28 : 50)) trail.shift()
    }

    function updateTrail(dt, exitP) {
      const decay = (reducedMotion ? 1.6 : exitP > 0 ? 0.62 : 0.82) * dt
      for (const p of trail) p.life -= decay
      while (trail.length && trail[0].life <= 0) trail.shift()
    }

    function drawWhale(cx, cy, rotation, unit, formation, hover, depthAlpha, exitP, time) {
      const dissolve = smoothstep(0.42, 0.94, exitP)
      const leap = easeOut(clamp((exitP - 0.08) / 0.34, 0, 1))
      const visible = formation * (1 - dissolve) * depthAlpha
      if (visible <= 0.005) return

      const tailWave = reducedMotion ? 0 : Math.sin(time * 0.00205) * (0.045 + hover * 0.028)
      const bodyGlow = 5 + hover * 8 + leap * 8
      const lineAlpha = (0.62 + hover * 0.18) * visible

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.scale(unit, unit)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = `rgba(255,255,255,${0.13 + hover * 0.08})`
      ctx.shadowBlur = bodyGlow
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
      ctx.lineWidth = 1.25 / unit

      ctx.beginPath()
      ctx.moveTo(-0.44, -0.02)
      ctx.bezierCurveTo(-0.30, -0.16, 0.04, -0.19, 0.34, -0.11)
      ctx.bezierCurveTo(0.47, -0.08, 0.56, -0.03, 0.54, 0.015)
      ctx.bezierCurveTo(0.51, 0.07, 0.42, 0.10, 0.28, 0.115)
      ctx.bezierCurveTo(0.05, 0.145, -0.20, 0.145, -0.38, 0.08)
      ctx.bezierCurveTo(-0.46, 0.05, -0.49, 0.015, -0.44, -0.02)
      ctx.stroke()

      ctx.shadowBlur = 0
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.65})`
      ctx.lineWidth = 0.86 / unit

      ctx.save()
      ctx.translate(-0.455, 0.015)
      ctx.rotate(tailWave)
      ctx.beginPath()
      ctx.moveTo(0.02, 0)
      ctx.bezierCurveTo(-0.05, -0.055, -0.14, -0.115, -0.22, -0.092)
      ctx.bezierCurveTo(-0.16, -0.02, -0.09, 0.015, 0.005, 0.027)
      ctx.bezierCurveTo(-0.08, 0.04, -0.16, 0.10, -0.21, 0.16)
      ctx.bezierCurveTo(-0.12, 0.17, -0.035, 0.10, 0.02, 0.035)
      ctx.stroke()
      ctx.restore()

      ctx.beginPath()
      ctx.moveTo(0.10, 0.095)
      ctx.bezierCurveTo(0.07, 0.16, 0.02, 0.24, -0.035, 0.30)
      ctx.bezierCurveTo(0.055, 0.275, 0.13, 0.20, 0.18, 0.12)
      ctx.stroke()

      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.33})`
      ctx.lineWidth = 0.58 / unit
      for (let i = 0; i < 7; i++) {
        const o = i * 0.017
        ctx.beginPath()
        ctx.moveTo(0.38 - o * 0.8, -0.055 + o * 0.22)
        ctx.bezierCurveTo(0.24 - o, 0.005 + o, 0.03 - o * 0.6, 0.085 + o * 1.15, -0.26 - o * 0.28, 0.064 + o * 0.6)
        ctx.stroke()
      }

      const particleInfluence = hover * 0.010
      for (let i = 0; i < bodyParticles.length; i++) {
        const p = bodyParticles[i]
        const pulse = 0.7 + Math.sin(time * 0.0012 + p.phase) * 0.3
        const jitterX = reducedMotion ? 0 : Math.sin(time * 0.0008 + p.phase) * particleInfluence
        const jitterY = reducedMotion ? 0 : Math.cos(time * 0.0009 + p.phase) * particleInfluence
        const a = p.alpha * visible * (0.6 + hover * 0.55) * pulse
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(201,255,57,${a * 0.9})` : `rgba(255,255,255,${a})`
        ctx.arc(p.x + jitterX, p.y + jitterY, p.size / unit, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.beginPath()
      ctx.fillStyle = `rgba(201,255,57,${visible * (0.48 + hover * 0.32)})`
      ctx.arc(0.395, -0.058, 1.45 / unit, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function beginExit() {
      if (!exitStartedAt) exitStartedAt = performance.now()
    }

    function onPointerMove(event) {
      pointerX = event.clientX
      pointerY = event.clientY
      targetNx = clamp((pointerX / width - 0.5) * 2, -1, 1)
      targetNy = clamp((pointerY / height - 0.5) * 2, -1, 1)
    }

    function onPointerUp(event) {
      if (event.defaultPrevented) return
      beginExit()
    }

    function onKeydown(event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') beginExit()
    }

    function frame(time) {
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        style.remove()
        return
      }

      const dt = Math.min(0.033, Math.max(0.001, (time - lastTime) / 1000))
      lastTime = time
      nx += (targetNx - nx) * (reducedMotion ? 0.025 : 0.055)
      ny += (targetNy - ny) * (reducedMotion ? 0.025 : 0.055)

      const instantSpeed = Math.hypot(pointerX - pointerLastX, pointerY - pointerLastY) / Math.max(dt, 0.001)
      pointerSpeed = lerp(pointerSpeed, Math.min(1200, instantSpeed), 0.08)
      pointerLastX = pointerX
      pointerLastY = pointerY

      const earth = getEarthState()
      const age = (time - startedAt) / 1000
      const formation = smoothstep(1.25, 2.55, age)
      const exitP = exitStartedAt ? clamp((time - exitStartedAt) / (reducedMotion ? 420 : 1120), 0, 1) : 0
      const pathSpeed = reducedMotion ? 0.006 : 0.052
      const t = ((time - startedAt) * 0.001 * pathSpeed + 0.04) % 1
      const p = samplePath(t)
      const next = samplePath(t + 0.0035)
      const pathScale = earth.radius * (mobile ? 1.30 : 1.47)
      const baseX = earth.x + p.x * pathScale
      const baseY = earth.y + p.y * pathScale
      const tangent = Math.atan2(next.y - p.y, next.x - p.x)
      const floatY = reducedMotion ? 0 : Math.sin(time * 0.00095) * (mobile ? 4 : 8)

      const distToWhale = Math.hypot(pointerX - baseX, pointerY - baseY)
      const interactRadius = mobile ? 130 : 210
      const hover = Math.pow(1 - clamp(distToWhale / interactRadius, 0, 1), 2)
      const distToEarth = Math.hypot(pointerX - earth.x, pointerY - earth.y)
      const earthInfluence = Math.pow(1 - clamp(distToEarth / (earth.radius * 1.35), 0, 1), 2)

      const attractionX = nx * (mobile ? 12 : 28) + (pointerX - baseX) * hover * 0.045 - p.x * earth.radius * earthInfluence * 0.06
      const attractionY = ny * (mobile ? 8 : 18) + (pointerY - baseY) * hover * 0.035 - p.y * earth.radius * earthInfluence * 0.06
      whaleOffsetX += (attractionX - whaleOffsetX) * (reducedMotion ? 0.025 : 0.048)
      whaleOffsetY += (attractionY - whaleOffsetY) * (reducedMotion ? 0.025 : 0.048)

      const leap = easeOut(clamp((exitP - 0.08) / 0.34, 0, 1))
      const cx = baseX + whaleOffsetX + leap * (mobile ? 18 : 32)
      const cy = baseY + whaleOffsetY + floatY - leap * (mobile ? 12 : 22)
      const rotation = tangent - 0.07 - leap * 0.10 + (reducedMotion ? 0 : Math.sin(time * 0.00055) * 0.018)
      const unit = earth.radius * (mobile ? 1.07 : 1.28) * (1 + leap * 0.035)
      const depth = Math.sin(t * Math.PI * 2 - 0.8)
      const depthAlpha = depth < -0.22 ? 0.44 : 1

      const tailPoint = worldFromLocal(cx, cy, rotation, unit, -0.63, 0.025)
      const trailBoost = 1 + clamp(pointerSpeed / 900, 0, 1) * 0.75 + smoothstep(0.30, 0.72, exitP) * 1.8
      if (formation > 0.5 && exitP < 0.9) emitTrail(tailPoint, time, trailBoost)
      updateTrail(dt, exitP)

      ctx.clearRect(0, 0, width, height)
      drawTrail(exitP)
      drawWhale(cx, cy, rotation, unit, formation, hover, depthAlpha, exitP, time)

      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove', onPointerMove, true)
    entry.addEventListener('pointerup', onPointerUp, true)
    entry.addEventListener('keydown', onKeydown, true)
    window.addEventListener('resize', resize, { passive: true })

    resize()
    raf = requestAnimationFrame(frame)
  }
}
