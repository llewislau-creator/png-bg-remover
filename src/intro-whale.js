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
      #png-cutout-entry .whale-canvas{position:absolute;inset:0;z-index:7;width:100%;height:100%;display:block;pointer-events:none}
      #png-cutout-entry .whale-caption{position:absolute;left:50%;top:88%;z-index:9;transform:translate(-50%,-50%);pointer-events:none;font:7px/1.4 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.26);opacity:0;transition:opacity 1.8s ease 1.8s;white-space:nowrap}
      #png-cutout-entry.is-ready .whale-caption{opacity:1}
      #png-cutout-entry .whale-caption:before,#png-cutout-entry .whale-caption:after{content:"";display:inline-block;width:28px;height:1px;margin:0 10px 2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.22))}
      #png-cutout-entry .whale-caption:after{background:linear-gradient(90deg,rgba(255,255,255,.22),rgba(255,255,255,0))}
      @media(max-width:700px){#png-cutout-entry .whale-caption{top:84%;font-size:6px}}
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
    caption.textContent = 'CELESTIAL GUIDE / EARTH FIELD'
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(caption, ui || null)

    const topMeta = entry.querySelector('.entry-top-meta')
    const enterCopy = entry.querySelector('.entry-enter span')
    if (topMeta) topMeta.textContent = 'EARTH / MOON / SUN / WHALE · ORBIT FIELD'
    if (enterCopy) enterCopy.textContent = mobile ? 'MOVE · PINCH · ENTER THE FIELD' : 'MOVE · SCROLL TO ZOOM · ENTER THE FIELD'

    const ctx = canvas.getContext('2d')
    let width = Math.max(1, window.innerWidth)
    let height = Math.max(1, window.innerHeight)
    let pointerX = width * 0.5
    let pointerY = height * 0.5
    let pointerNX = 0
    let pointerNY = 0
    let smoothNX = 0
    let smoothNY = 0
    let lastPointerX = pointerX
    let lastPointerY = pointerY
    let pointerSpeed = 0
    let lastTime = performance.now()
    const startedAt = lastTime
    let exitStartedAt = 0
    let raf = 0
    let lastTrailEmit = 0
    const trail = []
    const splash = []

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const smoothstep = (a, b, x) => {
      const t = clamp((x - a) / Math.max(0.0001, b - a), 0, 1)
      return t * t * (3 - 2 * t)
    }
    const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
    const hash = (n) => {
      const x = Math.sin(n * 73.173 + 17.91) * 43758.5453
      return x - Math.floor(x)
    }

    const bodyParticles = Array.from({ length: mobile ? 72 : 168 }, (_, i) => {
      const x = -0.46 + hash(i * 3.17) * 0.98
      const taper = Math.max(0.08, Math.sqrt(Math.max(0, 1 - Math.pow((x + 0.02) / 0.55, 2))))
      const y = (hash(i * 5.23) - 0.5) * taper * 0.28
      return {
        x,
        y,
        size: 0.35 + hash(i * 7.9) * 1.15,
        alpha: 0.11 + hash(i * 9.11) * 0.46,
        phase: hash(i * 12.37) * Math.PI * 2,
        green: hash(i * 14.13) > 0.976,
      }
    })

    const constellationSeeds = [
      [-0.33, 0.50, 0], [0.34, 0.45, 1], [-0.38, 0.72, 2], [0.31, 0.74, 3],
    ]

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

    function drawConstellations(formation, fade) {
      const a = 0.14 * formation * fade
      ctx.save()
      ctx.lineWidth = 0.55
      for (const [sx, sy, seed] of constellationSeeds) {
        const cx = width * (0.5 + sx)
        const cy = height * sy
        const pts = []
        for (let i = 0; i < 5; i++) {
          pts.push({
            x: cx + (hash(seed * 31 + i * 7.1) - 0.5) * (mobile ? 65 : 105),
            y: cy + (hash(seed * 47 + i * 9.3) - 0.5) * (mobile ? 55 : 88),
          })
        }
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.strokeStyle = `rgba(255,255,255,${a})`
        ctx.stroke()
        for (let i = 0; i < pts.length; i++) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${a * (i === 0 ? 4 : 2.2)})`
          ctx.arc(pts[i].x, pts[i].y, i === 0 ? 1.35 : 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
    }

    function drawPortal(time, cx, cy, unit, formation, fade, exitP) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.00055) * 0.018
      const leapGlow = 1 + easeOut(clamp(exitP / 0.45, 0, 1)) * 0.8
      const rx = unit * 0.72 * pulse
      const ry = unit * 0.17 * pulse

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.035 + smoothNX * 0.025)
      ctx.globalAlpha = formation * fade

      const glow = ctx.createRadialGradient(0, 0, unit * 0.08, 0, 0, unit * 0.82)
      glow.addColorStop(0, `rgba(255,255,255,${0.11 * leapGlow})`)
      glow.addColorStop(0.24, `rgba(255,255,255,${0.045 * leapGlow})`)
      glow.addColorStop(0.55, 'rgba(201,255,57,.008)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.15, ry * 2.7, 0, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < 7; i++) {
        const k = 0.60 + i * 0.095
        const wobble = reducedMotion ? 0 : Math.sin(time * 0.00035 + i * 1.73) * 0.018
        ctx.beginPath()
        ctx.ellipse(0, 0, rx * k, ry * (0.78 + i * 0.07), wobble, Math.PI * (0.08 + i * 0.025), Math.PI * (1.90 - i * 0.018))
        ctx.strokeStyle = i === 2
          ? `rgba(255,255,255,${0.46 * leapGlow})`
          : `rgba(255,255,255,${0.075 + i * 0.018})`
        ctx.lineWidth = i === 2 ? 1.25 : 0.55
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 0.73, ry * 0.94, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${0.88 * leapGlow})`
      ctx.lineWidth = 1.25
      ctx.shadowColor = 'rgba(255,255,255,.42)'
      ctx.shadowBlur = 18 * leapGlow
      ctx.stroke()
      ctx.shadowBlur = 0

      for (let i = 0; i < 22; i++) {
        const angle = hash(i * 9.13) * Math.PI * 2
        const r = rx * (0.58 + hash(i * 5.71) * 0.47)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * ry * (0.72 + hash(i * 4.81) * 0.55)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${0.18 + hash(i * 7.17) * 0.35})`
        ctx.arc(x, y, 0.55 + hash(i * 3.3) * 1.05, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    function emitSplash(cx, cy, unit, time, intensity = 1) {
      const interval = mobile ? 95 : 68
      if (time - lastTrailEmit < interval / Math.max(1, intensity)) return
      lastTrailEmit = time
      const count = intensity > 1.5 ? 5 : 3
      for (let i = 0; i < count; i++) {
        const seed = time * 0.001 + i * 17.3
        const angle = -Math.PI * (0.10 + hash(seed * 2.1) * 0.80)
        splash.push({
          x: cx + (hash(seed * 5.2) - 0.5) * unit * 0.46,
          y: cy + (hash(seed * 7.7) - 0.5) * 10,
          vx: Math.cos(angle) * (8 + hash(seed * 11.2) * 22),
          vy: -16 - hash(seed * 13.4) * 42,
          life: 1,
          size: 0.4 + hash(seed * 17.7) * 1.5,
          green: hash(seed * 23.9) > 0.97,
        })
      }
      while (splash.length > (mobile ? 38 : 82)) splash.shift()
    }

    function updateSplash(dt) {
      for (const p of splash) {
        p.life -= dt * 0.55
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 13 * dt
      }
      for (let i = splash.length - 1; i >= 0; i--) if (splash[i].life <= 0) splash.splice(i, 1)
    }

    function drawSplash(fade) {
      for (const p of splash) {
        const a = p.life * p.life * fade
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(201,255,57,${a * 0.45})` : `rgba(255,255,255,${a * 0.58})`
        ctx.arc(p.x, p.y, p.size * (0.7 + p.life), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function emitTrail(tail, time, intensity) {
      const every = (mobile ? 72 : 48) / Math.max(1, intensity)
      if (time - lastTrailEmit < every) return
      lastTrailEmit = time
      const count = intensity > 1.6 ? 4 : intensity > 1.1 ? 2 : 1
      for (let i = 0; i < count; i++) {
        const seed = time * 0.001 + i * 13.7
        trail.push({
          x: tail.x + (hash(seed * 7.1) - 0.5) * 10,
          y: tail.y + (hash(seed * 11.3) - 0.5) * 10,
          life: 1,
          size: 0.55 + hash(seed * 17.9) * 1.8,
          green: hash(seed * 23.7) > 0.965,
          phase: hash(seed * 31.1) * Math.PI * 2,
        })
      }
      while (trail.length > (mobile ? 34 : 64)) trail.shift()
    }

    function updateTrail(dt, exitP) {
      const decay = (reducedMotion ? 1.7 : exitP > 0 ? 0.60 : 0.76) * dt
      for (const p of trail) p.life -= decay
      while (trail.length && trail[0].life <= 0) trail.shift()
    }

    function drawTrail(exitP, fade) {
      for (const p of trail) {
        const age = 1 - p.life
        const a = p.life * p.life * (exitP > 0 ? 0.82 : 0.42) * fade
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(201,255,57,${a * 0.55})` : `rgba(255,255,255,${a})`
        ctx.arc(p.x - age * 15, p.y + Math.sin(p.phase + age * 4) * 2.5, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function worldPoint(cx, cy, rotation, unit, x, y) {
      const c = Math.cos(rotation)
      const s = Math.sin(rotation)
      return { x: cx + (x * c - y * s) * unit, y: cy + (x * s + y * c) * unit }
    }

    function drawWhale(time, cx, cy, rotation, unit, formation, hover, fade, exitP) {
      const dissolve = smoothstep(0.43, 0.94, exitP)
      const leap = easeOut(clamp((exitP - 0.06) / 0.36, 0, 1))
      const visible = formation * (1 - dissolve) * fade
      if (visible <= 0.004) return

      const tailWave = reducedMotion ? 0 : Math.sin(time * 0.00165) * (0.050 + hover * 0.025)
      const finWave = reducedMotion ? 0 : Math.sin(time * 0.00115 + 1.1) * 0.025
      const lineAlpha = (0.80 + hover * 0.14 + leap * 0.06) * visible

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.scale(unit, unit)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = `rgba(255,255,255,${0.16 + hover * 0.08 + leap * 0.10})`
      ctx.shadowBlur = 8 + hover * 7 + leap * 8
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
      ctx.lineWidth = 1.4 / unit

      // Main humpback silhouette: long head, arched back, tapered tail stock.
      ctx.beginPath()
      ctx.moveTo(0.53, -0.035)
      ctx.bezierCurveTo(0.47, -0.115, 0.30, -0.155, 0.05, -0.165)
      ctx.bezierCurveTo(-0.14, -0.17, -0.31, -0.135, -0.43, -0.085)
      ctx.bezierCurveTo(-0.51, -0.052, -0.55, -0.018, -0.51, 0.014)
      ctx.bezierCurveTo(-0.43, 0.08, -0.24, 0.135, 0.02, 0.14)
      ctx.bezierCurveTo(0.24, 0.143, 0.42, 0.095, 0.51, 0.035)
      ctx.bezierCurveTo(0.55, 0.010, 0.56, -0.010, 0.53, -0.035)
      ctx.stroke()

      ctx.shadowBlur = 0
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.78})`
      ctx.lineWidth = 0.92 / unit

      // Mouth / jaw contour.
      ctx.beginPath()
      ctx.moveTo(0.51, 0.010)
      ctx.bezierCurveTo(0.35, 0.035, 0.17, 0.065, -0.08, 0.078)
      ctx.bezierCurveTo(-0.23, 0.084, -0.34, 0.075, -0.43, 0.050)
      ctx.stroke()

      // Throat grooves inspired by the references.
      for (let i = 0; i < 10; i++) {
        const k = i / 9
        ctx.beginPath()
        ctx.moveTo(0.46 - k * 0.025, 0.028 + k * 0.004)
        ctx.bezierCurveTo(0.28 - k * 0.06, 0.072 + k * 0.012, 0.05 - k * 0.085, 0.112 + k * 0.008, -0.31 - k * 0.045, 0.073 + k * 0.018)
        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * (0.22 + k * 0.025)})`
        ctx.lineWidth = 0.54 / unit
        ctx.stroke()
      }

      // Back contour accents.
      ctx.beginPath()
      ctx.moveTo(0.38, -0.092)
      ctx.bezierCurveTo(0.16, -0.126, -0.08, -0.126, -0.31, -0.073)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.28})`
      ctx.stroke()

      // Pectoral fin.
      ctx.save()
      ctx.translate(0.06, 0.105)
      ctx.rotate(finWave)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(0.015, 0.10, -0.005, 0.25, -0.085, 0.36)
      ctx.bezierCurveTo(-0.012, 0.33, 0.09, 0.21, 0.16, 0.075)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.62})`
      ctx.lineWidth = 0.88 / unit
      ctx.stroke()
      ctx.restore()

      // Far pectoral fin.
      ctx.beginPath()
      ctx.moveTo(-0.02, 0.095)
      ctx.bezierCurveTo(-0.11, 0.16, -0.20, 0.205, -0.28, 0.225)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.24})`
      ctx.stroke()

      // Tail flukes.
      ctx.save()
      ctx.translate(-0.50, -0.012)
      ctx.rotate(tailWave)
      ctx.beginPath()
      ctx.moveTo(0.01, 0)
      ctx.bezierCurveTo(-0.06, -0.038, -0.14, -0.11, -0.235, -0.11)
      ctx.bezierCurveTo(-0.20, -0.038, -0.12, 0.008, -0.01, 0.025)
      ctx.bezierCurveTo(-0.10, 0.038, -0.19, 0.10, -0.25, 0.158)
      ctx.bezierCurveTo(-0.15, 0.17, -0.055, 0.10, 0.012, 0.032)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.82})`
      ctx.lineWidth = 0.92 / unit
      ctx.stroke()
      ctx.restore()

      // Eye + short orbital data tick.
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${visible * 0.94})`
      ctx.arc(0.405, -0.062, 1.6 / unit, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.strokeStyle = `rgba(201,255,57,${visible * (0.26 + hover * 0.28)})`
      ctx.lineWidth = 0.55 / unit
      ctx.arc(0.405, -0.062, 5 / unit, 0, Math.PI * 2)
      ctx.stroke()

      // Particle / star field inside the whale body.
      for (let i = 0; i < bodyParticles.length; i++) {
        const p = bodyParticles[i]
        const pulse = 0.72 + Math.sin(time * 0.00085 + p.phase) * 0.28
        const j = reducedMotion ? 0 : hover * 0.010
        const px = p.x + Math.sin(time * 0.0007 + p.phase) * j
        const py = p.y + Math.cos(time * 0.00075 + p.phase) * j
        const a = p.alpha * visible * (0.58 + hover * 0.42) * pulse
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(201,255,57,${a * 0.60})` : `rgba(255,255,255,${a})`
        ctx.arc(px, py, p.size / unit, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    function beginExit() {
      if (!exitStartedAt) exitStartedAt = performance.now()
    }

    function onPointerMove(e) {
      pointerX = e.clientX
      pointerY = e.clientY
      pointerNX = clamp((pointerX / width - 0.5) * 2, -1, 1)
      pointerNY = clamp((pointerY / height - 0.5) * 2, -1, 1)
    }

    function onPointerUp() { beginExit() }
    function onKeydown(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') beginExit() }

    function frame(time) {
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        style.remove()
        return
      }

      const dt = Math.min(0.033, Math.max(0.001, (time - lastTime) / 1000))
      lastTime = time
      const dxp = pointerX - lastPointerX
      const dyp = pointerY - lastPointerY
      pointerSpeed += (Math.min(1100, Math.hypot(dxp, dyp) / Math.max(dt, 0.001)) - pointerSpeed) * 0.10
      lastPointerX = pointerX
      lastPointerY = pointerY
      smoothNX += (pointerNX - smoothNX) * (reducedMotion ? 0.025 : 0.055)
      smoothNY += (pointerNY - smoothNY) * (reducedMotion ? 0.025 : 0.055)

      const age = (time - startedAt) / 1000
      const formation = smoothstep(1.0, 2.7, age)
      const exitP = exitStartedAt ? clamp((time - exitStartedAt) / 1180, 0, 1) : 0
      const fade = 1 - smoothstep(0.58, 1, exitP)
      const leap = easeOut(clamp((exitP - 0.06) / 0.36, 0, 1))
      const zoom = getZoom()

      const earthY = height * (mobile ? 0.355 : 0.325)
      const earthX = width * 0.5 + smoothNX * (mobile ? 6 : 12)
      const portalX = width * 0.5 + smoothNX * (mobile ? 10 : 24)
      const portalY = height * (mobile ? 0.695 : 0.715) + smoothNY * (mobile ? 7 : 14)
      const unit = Math.min(width, height) * (mobile ? 0.39 : width < 1200 ? 0.43 : 0.46) * (0.94 + (zoom - 1) * 0.42)

      // The reference-led composition: Earth above, a large breaching whale below, luminous orbital basin beneath.
      const baseRotation = mobile ? -1.78 : -1.92
      const rotation = baseRotation + smoothNX * 0.055 + (reducedMotion ? 0 : Math.sin(time * 0.00032) * 0.018) - leap * 0.10
      const whaleX = width * 0.50 + smoothNX * (mobile ? 14 : 32) - leap * (mobile ? 8 : 22)
      const whaleY = height * (mobile ? 0.565 : 0.56) + smoothNY * (mobile ? 9 : 18) - leap * (mobile ? 28 : 54)

      const pointerDistance = Math.hypot(pointerX - whaleX, pointerY - whaleY)
      const hoverRadius = unit * 0.58
      const hover = clamp(1 - pointerDistance / Math.max(1, hoverRadius), 0, 1)

      const tail = worldPoint(whaleX, whaleY, rotation, unit, -0.62, 0.015)
      emitTrail(tail, time, 1 + hover * 1.2 + clamp(pointerSpeed / 1200, 0, 0.8) + leap * 1.3)
      emitSplash(portalX, portalY, unit, time, 1 + hover * 0.6 + leap * 1.8)
      updateTrail(dt, exitP)
      updateSplash(dt)

      ctx.clearRect(0, 0, width, height)
      drawConstellations(formation, fade)

      // Fine axial data line from Earth through the portal, similar to the reference layout.
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(earthX, earthY + 20)
      ctx.lineTo(portalX, Math.min(height * 0.91, portalY + unit * 0.46))
      ctx.setLineDash([2, 7])
      ctx.strokeStyle = `rgba(255,255,255,${0.095 * formation * fade})`
      ctx.lineWidth = 0.55
      ctx.stroke()
      ctx.setLineDash([])
      for (let i = 0; i < 5; i++) {
        const y = earthY + (portalY - earthY) * (0.15 + i * 0.19)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${0.20 * formation * fade})`
        ctx.arc(earthX + (i % 2 ? 1.5 : -1.5), y, i === 2 ? 1.6 : 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      drawPortal(time, portalX, portalY, unit, formation, fade, exitP)
      drawTrail(exitP, fade)
      drawSplash(fade)
      drawWhale(time, whaleX, whaleY, rotation, unit, formation, hover, fade, exitP)

      // Small technical rings under the portal to echo the supplied references without overtaking the Earth.
      ctx.save()
      ctx.translate(portalX, portalY + unit * 0.43)
      ctx.globalAlpha = formation * fade
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(0, 0, unit * (0.055 + i * 0.025), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${0.18 - i * 0.028})`
        ctx.lineWidth = 0.55
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.fillStyle = 'rgba(255,255,255,.72)'
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove', onPointerMove, { passive: true })
    entry.addEventListener('pointerup', onPointerUp, true)
    entry.addEventListener('keydown', onKeydown, true)
    window.addEventListener('resize', resize, { passive: true })
    resize()
    raf = requestAnimationFrame(frame)
  }
}
