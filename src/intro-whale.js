const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('png-cutout-whale-style')) {
  const globeCanvas = entry.querySelector('.globe-canvas')
  if (globeCanvas) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio || 1, 1.75)
    const ACID_RGB = '183,255,42'

    const style = document.createElement('style')
    style.id = 'png-cutout-whale-style'
    style.textContent = `
      #png-cutout-entry .whale-canvas{position:absolute;inset:0;z-index:7;width:100%;height:100%;display:block;pointer-events:none;will-change:opacity;backface-visibility:hidden}
      #png-cutout-entry .whale-caption{position:absolute;left:50%;top:86.5%;z-index:9;transform:translate(-50%,-50%);pointer-events:none;display:flex;align-items:center;gap:12px;font:7px/1.4 "SFMono-Regular",Consolas,"Liberation Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.30);opacity:0;transition:opacity 1.8s cubic-bezier(.22,1,.36,1) 1.6s;white-space:nowrap}
      #png-cutout-entry.is-ready .whale-caption{opacity:1}
      #png-cutout-entry .whale-caption i{display:block;width:26px;height:1px;background:linear-gradient(90deg,rgba(${ACID_RGB},0),rgba(${ACID_RGB},.58));box-shadow:0 0 10px rgba(${ACID_RGB},.08)}
      #png-cutout-entry .whale-caption i:last-child{transform:scaleX(-1)}
      #png-cutout-entry .whale-index{position:absolute;left:24px;top:50%;z-index:9;transform:translateY(-50%);display:grid;gap:7px;pointer-events:none;font:7px/1.2 "SFMono-Regular",Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.20);opacity:0;transition:opacity 1.5s ease 2s}
      #png-cutout-entry.is-ready .whale-index{opacity:1}
      #png-cutout-entry .whale-index b{font-weight:500;color:rgba(255,255,255,.56)}
      #png-cutout-entry .whale-index:before{content:"";width:1px;height:32px;background:linear-gradient(rgba(${ACID_RGB},.46),rgba(${ACID_RGB},0))}
      #png-cutout-entry .entry-enter{transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .35s ease!important}
      #png-cutout-entry .entry-enter:hover{transform:translateX(-50%) translateY(-2px)!important}
      #png-cutout-entry .entry-enter strong{letter-spacing:.20em!important}
      @media(max-width:700px){
        #png-cutout-entry .whale-caption{top:84%;font-size:6px;gap:8px}
        #png-cutout-entry .whale-caption i{width:18px}
        #png-cutout-entry .whale-index{display:none}
      }
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .whale-caption,#png-cutout-entry .whale-index{transition:opacity .3s linear}}
    `
    document.head.appendChild(style)

    const canvas = document.createElement('canvas')
    canvas.className = 'whale-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    const systemLayer = entry.querySelector('.entry-system-layer')
    entry.insertBefore(canvas, systemLayer || entry.querySelector('.entry-ui') || null)

    const caption = document.createElement('div')
    caption.className = 'whale-caption'
    caption.innerHTML = '<i></i><span>CELESTIAL GUIDE · EARTH FIELD</span><i></i>'
    const index = document.createElement('div')
    index.className = 'whale-index'
    index.innerHTML = '<b>FIELD / 01</b><span>BREACH VECTOR</span><span>LIVE ORBIT</span>'
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(caption, ui || null)
    entry.insertBefore(index, ui || null)

    const topMeta = entry.querySelector('.entry-top-meta')
    const enterCopy = entry.querySelector('.entry-enter span')
    if (topMeta) topMeta.textContent = 'EARTH / MOON / SUN · CELESTIAL GUIDE'
    if (enterCopy) enterCopy.textContent = mobile ? 'MOVE · PINCH · ENTER' : 'MOVE · SCROLL · ENTER THE FIELD'

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
    let lastSplashEmit = 0
    const trail = []
    const splash = []
    const motes = []

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

    const bodyParticles = Array.from({ length: mobile ? 58 : 138 }, (_, i) => {
      const x = -0.48 + hash(i * 3.17) * 1.02
      const taper = Math.max(0.05, Math.sqrt(Math.max(0, 1 - Math.pow((x + 0.015) / 0.57, 2))))
      const y = (hash(i * 5.23) - 0.5) * taper * 0.27
      return {
        x,
        y,
        size: 0.35 + hash(i * 7.9) * 1.05,
        alpha: 0.10 + hash(i * 9.11) * 0.38,
        phase: hash(i * 12.37) * Math.PI * 2,
        green: hash(i * 14.13) > 0.982,
      }
    })

    const constellationSeeds = mobile
      ? [[-0.35, 0.49, 0], [0.35, 0.51, 1]]
      : [[-0.36, 0.48, 0], [0.36, 0.45, 1], [-0.40, 0.70, 2], [0.35, 0.73, 3]]

    function resize() {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      canvas.width = Math.floor(width * DPR)
      canvas.height = Math.floor(height * DPR)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    function sceneState() {
      const s = entry.__cosmicState
      if (s) return s
      const zoomMatch = globeCanvas.style.transform?.match(/scale\(([-\d.]+)\)/)
      const zoom = zoomMatch ? clamp(Number(zoomMatch[1]) || 1, 0.7, 1.5) : 1
      const shift = -height * (mobile ? .10 : .14)
      return {
        earthX: width * .5,
        earthY: height * .465 + shift,
        earthRadius: Math.min(width, height) * (mobile ? .235 : width < 1200 ? .25 : .268) * zoom,
        zoom,
        nx: smoothNX,
        ny: smoothNY,
      }
    }

    function worldPoint(cx, cy, rotation, unit, x, y) {
      const c = Math.cos(rotation)
      const s = Math.sin(rotation)
      return { x: cx + (x * c - y * s) * unit, y: cy + (x * s + y * c) * unit }
    }

    function drawConstellations(formation, fade, parallaxX, parallaxY) {
      const a = 0.11 * formation * fade
      ctx.save()
      ctx.translate(parallaxX * .25, parallaxY * .20)
      ctx.lineWidth = 0.5
      for (const [sx, sy, seed] of constellationSeeds) {
        const cx = width * (0.5 + sx)
        const cy = height * sy
        const pts = []
        for (let i = 0; i < 5; i++) {
          pts.push({
            x: cx + (hash(seed * 31 + i * 7.1) - 0.5) * (mobile ? 62 : 104),
            y: cy + (hash(seed * 47 + i * 9.3) - 0.5) * (mobile ? 48 : 78),
          })
        }
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.strokeStyle = `rgba(255,255,255,${a})`
        ctx.stroke()
        for (let i = 0; i < pts.length; i++) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${a * (i === 0 ? 3.5 : 1.9)})`
          ctx.arc(pts[i].x, pts[i].y, i === 0 ? 1.15 : 0.72, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
    }

    function drawPortal(time, cx, cy, unit, formation, fade, exitP, hover) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 0.00048) * 0.014
      const exitGlow = 1 + easeOut(clamp(exitP / 0.50, 0, 1)) * 0.72
      const hoverGlow = 1 + hover * .16
      const rx = unit * 0.73 * pulse
      const ry = unit * 0.165 * pulse

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.024 + smoothNX * 0.018)
      ctx.globalAlpha = formation * fade

      const glow = ctx.createRadialGradient(0, 0, unit * 0.05, 0, 0, unit * 0.88)
      glow.addColorStop(0, `rgba(255,255,255,${0.10 * exitGlow})`)
      glow.addColorStop(0.22, `rgba(255,255,255,${0.038 * hoverGlow})`)
      glow.addColorStop(0.52, `rgba(${ACID_RGB},.008)`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.2, ry * 2.8, 0, 0, Math.PI * 2)
      ctx.fill()

      for (let i = 0; i < 6; i++) {
        const k = .58 + i * .105
        const wobble = reducedMotion ? 0 : Math.sin(time * .00024 + i * 1.31) * .012
        const start = Math.PI * (.06 + i * .024)
        const end = Math.PI * (1.94 - i * .020)
        ctx.beginPath()
        ctx.ellipse(0, 0, rx * k, ry * (.78 + i * .065), wobble, start, end)
        ctx.strokeStyle = i === 2
          ? `rgba(255,255,255,${.38 * exitGlow})`
          : `rgba(255,255,255,${.055 + i * .015})`
        ctx.lineWidth = i === 2 ? 1.05 : .5
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.ellipse(0, 0, rx * .72, ry * .94, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${.78 * exitGlow})`
      ctx.lineWidth = 1.15
      ctx.shadowColor = `rgba(255,255,255,${.24 * hoverGlow})`
      ctx.shadowBlur = 14 * exitGlow
      ctx.stroke()
      ctx.shadowBlur = 0

      for (let i = 0; i < 18; i++) {
        const angle = hash(i * 9.13) * Math.PI * 2
        const r = rx * (.60 + hash(i * 5.71) * .43)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * ry * (.74 + hash(i * 4.81) * .48)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${.14 + hash(i * 7.17) * .28})`
        ctx.arc(x, y, .48 + hash(i * 3.3) * .86, 0, Math.PI * 2)
        ctx.fill()
      }

      // Broken technical tick ring: a restrained reference to instrument graphics.
      ctx.save()
      ctx.scale(1, ry / Math.max(1, rx))
      for (let i = 0; i < 24; i++) {
        if (i % 3 === 1) continue
        const angle = (i / 24) * Math.PI * 2
        const r0 = rx * 1.02
        const r1 = r0 + (i % 6 === 0 ? 8 : 4)
        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * r0, Math.sin(angle) * r0)
        ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1)
        ctx.strokeStyle = `rgba(255,255,255,${i % 6 === 0 ? .16 : .07})`
        ctx.lineWidth = .5
        ctx.stroke()
      }
      ctx.restore()
      ctx.restore()
    }

    function emitSplash(cx, cy, unit, time, intensity = 1) {
      const interval = (mobile ? 110 : 76) / Math.max(1, intensity)
      if (time - lastSplashEmit < interval) return
      lastSplashEmit = time
      const count = intensity > 1.6 ? 4 : 2
      for (let i = 0; i < count; i++) {
        const seed = time * 0.001 + i * 17.3
        const angle = -Math.PI * (.12 + hash(seed * 2.1) * .76)
        splash.push({
          x: cx + (hash(seed * 5.2) - .5) * unit * .42,
          y: cy + (hash(seed * 7.7) - .5) * 8,
          vx: Math.cos(angle) * (7 + hash(seed * 11.2) * 18),
          vy: -13 - hash(seed * 13.4) * 34,
          life: 1,
          size: .36 + hash(seed * 17.7) * 1.25,
          green: hash(seed * 23.9) > .985,
        })
      }
      while (splash.length > (mobile ? 30 : 62)) splash.shift()
    }

    function emitTrail(tail, time, intensity) {
      const every = (mobile ? 80 : 55) / Math.max(1, intensity)
      if (time - lastTrailEmit < every) return
      lastTrailEmit = time
      const count = intensity > 1.8 ? 3 : intensity > 1.15 ? 2 : 1
      for (let i = 0; i < count; i++) {
        const seed = time * .001 + i * 13.7
        trail.push({
          x: tail.x + (hash(seed * 7.1) - .5) * 9,
          y: tail.y + (hash(seed * 11.3) - .5) * 9,
          life: 1,
          size: .5 + hash(seed * 17.9) * 1.45,
          green: hash(seed * 23.7) > .982,
          phase: hash(seed * 31.1) * Math.PI * 2,
        })
      }
      while (trail.length > (mobile ? 28 : 52)) trail.shift()
    }

    function updateParticles(dt, exitP) {
      const trailDecay = (reducedMotion ? 1.8 : exitP > 0 ? .66 : .82) * dt
      for (const p of trail) p.life -= trailDecay
      for (let i = trail.length - 1; i >= 0; i--) if (trail[i].life <= 0) trail.splice(i, 1)

      for (const p of splash) {
        p.life -= dt * .62
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 11 * dt
      }
      for (let i = splash.length - 1; i >= 0; i--) if (splash[i].life <= 0) splash.splice(i, 1)

      for (const p of motes) {
        p.life -= dt * .5
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
      for (let i = motes.length - 1; i >= 0; i--) if (motes[i].life <= 0) motes.splice(i, 1)
    }

    function drawParticles(exitP, fade) {
      for (const p of trail) {
        const age = 1 - p.life
        const a = p.life * p.life * (exitP > 0 ? .76 : .36) * fade
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(${ACID_RGB},${a * .52})` : `rgba(255,255,255,${a})`
        ctx.arc(p.x - age * 12, p.y + Math.sin(p.phase + age * 4) * 2.1, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const p of splash) {
        const a = p.life * p.life * fade
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(${ACID_RGB},${a * .38})` : `rgba(255,255,255,${a * .48})`
        ctx.arc(p.x, p.y, p.size * (.72 + p.life), 0, Math.PI * 2)
        ctx.fill()
      }
      for (const p of motes) {
        const a = p.life * p.life * fade
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${a * .52})`
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function drawWhale(time, cx, cy, rotation, unit, formation, hover, fade, exitP) {
      const dissolve = smoothstep(.40, .92, exitP)
      const leap = easeOut(clamp((exitP - .04) / .36, 0, 1))
      const visible = formation * (1 - dissolve) * fade
      if (visible <= .004) return

      const tailWave = reducedMotion ? 0 : Math.sin(time * .00145) * (.042 + hover * .018)
      const finWave = reducedMotion ? 0 : Math.sin(time * .00105 + 1.1) * .022
      const lineAlpha = (.84 + hover * .10 + leap * .05) * visible

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.scale(unit, unit)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Low-opacity luminous underpass gives the silhouette depth without turning it into neon.
      ctx.shadowColor = `rgba(255,255,255,${.12 + hover * .05 + leap * .07})`
      ctx.shadowBlur = 8 + hover * 5 + leap * 6
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .72})`
      ctx.lineWidth = 1.55 / unit
      ctx.beginPath()
      ctx.moveTo(.54, -.034)
      ctx.bezierCurveTo(.47, -.116, .30, -.160, .05, -.168)
      ctx.bezierCurveTo(-.15, -.172, -.32, -.137, -.44, -.087)
      ctx.bezierCurveTo(-.52, -.052, -.56, -.018, -.52, .014)
      ctx.bezierCurveTo(-.44, .082, -.24, .138, .02, .143)
      ctx.bezierCurveTo(.25, .145, .43, .095, .52, .034)
      ctx.bezierCurveTo(.56, .008, .57, -.010, .54, -.034)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Crisp editorial silhouette pass.
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
      ctx.lineWidth = .88 / unit
      ctx.beginPath()
      ctx.moveTo(.54, -.034)
      ctx.bezierCurveTo(.47, -.116, .30, -.160, .05, -.168)
      ctx.bezierCurveTo(-.15, -.172, -.32, -.137, -.44, -.087)
      ctx.bezierCurveTo(-.52, -.052, -.56, -.018, -.52, .014)
      ctx.bezierCurveTo(-.44, .082, -.24, .138, .02, .143)
      ctx.bezierCurveTo(.25, .145, .43, .095, .52, .034)
      ctx.bezierCurveTo(.56, .008, .57, -.010, .54, -.034)
      ctx.stroke()

      // Jaw contour.
      ctx.beginPath()
      ctx.moveTo(.515, .008)
      ctx.bezierCurveTo(.35, .035, .17, .066, -.08, .080)
      ctx.bezierCurveTo(-.23, .087, -.35, .077, -.44, .052)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .70})`
      ctx.lineWidth = .72 / unit
      ctx.stroke()

      // Characteristic throat pleats, spaced progressively for a hand-drawn feel.
      for (let i = 0; i < 11; i++) {
        const k = i / 10
        ctx.beginPath()
        ctx.moveTo(.47 - k * .030, .030 + k * .004)
        ctx.bezierCurveTo(.29 - k * .060, .074 + k * .010, .05 - k * .082, .113 + k * .008, -.31 - k * .047, .073 + k * .018)
        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * (.16 + k * .016)})`
        ctx.lineWidth = .46 / unit
        ctx.stroke()
      }

      // Back contour accents.
      ctx.beginPath()
      ctx.moveTo(.38, -.096)
      ctx.bezierCurveTo(.17, -.129, -.08, -.128, -.32, -.073)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .22})`
      ctx.lineWidth = .5 / unit
      ctx.stroke()

      // Near pectoral fin.
      ctx.save()
      ctx.translate(.06, .107)
      ctx.rotate(finWave)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(.014, .10, -.008, .255, -.090, .365)
      ctx.bezierCurveTo(-.015, .335, .092, .21, .16, .074)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .66})`
      ctx.lineWidth = .72 / unit
      ctx.stroke()
      ctx.restore()

      // Far pectoral fin.
      ctx.beginPath()
      ctx.moveTo(-.02, .095)
      ctx.bezierCurveTo(-.11, .16, -.20, .206, -.28, .226)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .20})`
      ctx.stroke()

      // Tail flukes.
      ctx.save()
      ctx.translate(-.505, -.012)
      ctx.rotate(tailWave)
      ctx.beginPath()
      ctx.moveTo(.01, 0)
      ctx.bezierCurveTo(-.06, -.040, -.145, -.112, -.24, -.112)
      ctx.bezierCurveTo(-.205, -.040, -.122, .008, -.01, .025)
      ctx.bezierCurveTo(-.10, .040, -.19, .102, -.252, .160)
      ctx.bezierCurveTo(-.15, .171, -.055, .10, .012, .032)
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * .84})`
      ctx.lineWidth = .76 / unit
      ctx.stroke()
      ctx.restore()

      // Eye / signal point.
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${visible * .94})`
      ctx.arc(.405, -.062, 1.45 / unit, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.strokeStyle = `rgba(${ACID_RGB},${visible * (.22 + hover * .24)})`
      ctx.lineWidth = .48 / unit
      ctx.arc(.405, -.062, 4.8 / unit, 0, Math.PI * 2)
      ctx.stroke()

      // Particle field stays subordinate to the linework; nearby pointer gently disturbs it.
      const pointerLocalX = clamp((pointerX - cx) / Math.max(1, unit), -.8, .8)
      const pointerLocalY = clamp((pointerY - cy) / Math.max(1, unit), -.6, .6)
      for (const p of bodyParticles) {
        const pulse = .72 + Math.sin(time * .00078 + p.phase) * .28
        const dx = p.x - pointerLocalX
        const dy = p.y - pointerLocalY
        const d2 = dx * dx + dy * dy
        const repel = !reducedMotion && hover > 0 && d2 < .12 ? (1 - d2 / .12) * hover * .016 : 0
        const len = Math.max(.001, Math.hypot(dx, dy))
        const px = p.x + dx / len * repel
        const py = p.y + dy / len * repel
        const a = p.alpha * visible * (.54 + hover * .30) * pulse
        ctx.beginPath()
        ctx.fillStyle = p.green ? `rgba(${ACID_RGB},${a * .54})` : `rgba(255,255,255,${a})`
        ctx.arc(px, py, p.size / unit, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    function drawAxis(earthX, earthY, portalX, portalY, unit, formation, fade) {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(earthX, earthY + 18)
      ctx.lineTo(portalX, Math.min(height * .93, portalY + unit * .46))
      ctx.setLineDash([2, 8])
      ctx.strokeStyle = `rgba(255,255,255,${.070 * formation * fade})`
      ctx.lineWidth = .5
      ctx.stroke()
      ctx.setLineDash([])
      for (let i = 0; i < 6; i++) {
        const k = .12 + i * .155
        const y = earthY + (portalY - earthY) * k
        ctx.beginPath()
        ctx.fillStyle = i === 3
          ? `rgba(${ACID_RGB},${.24 * formation * fade})`
          : `rgba(255,255,255,${.15 * formation * fade})`
        ctx.arc(earthX + (i % 2 ? 1.4 : -1.4), y, i === 3 ? 1.45 : .78, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    function drawLowerInstrument(cx, cy, unit, formation, fade) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.globalAlpha = formation * fade
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(0, 0, unit * (.052 + i * .022), -Math.PI * .92, Math.PI * .78)
        ctx.strokeStyle = `rgba(255,255,255,${.16 - i * .026})`
        ctx.lineWidth = .5
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.fillStyle = 'rgba(255,255,255,.66)'
      ctx.arc(0, 0, 1.65, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.strokeStyle = `rgba(${ACID_RGB},.18)`
      ctx.arc(0, 0, unit * .028, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    function beginExit() {
      if (!exitStartedAt) exitStartedAt = performance.now()
    }

    function onPointerMove(e) {
      pointerX = e.clientX
      pointerY = e.clientY
      pointerNX = clamp((pointerX / width - .5) * 2, -1, 1)
      pointerNY = clamp((pointerY / height - .5) * 2, -1, 1)
    }

    function onPointerUp(e) {
      if (e.defaultPrevented) return
      beginExit()
    }
    function onKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') beginExit()
    }

    function frame(time) {
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        style.remove()
        return
      }

      if (!exitStartedAt && entry.classList.contains('is-leaving')) beginExit()

      const dt = Math.min(.033, Math.max(.001, (time - lastTime) / 1000))
      lastTime = time
      const dxp = pointerX - lastPointerX
      const dyp = pointerY - lastPointerY
      pointerSpeed += (Math.min(950, Math.hypot(dxp, dyp) / Math.max(dt, .001)) - pointerSpeed) * .085
      lastPointerX = pointerX
      lastPointerY = pointerY
      smoothNX += (pointerNX - smoothNX) * (reducedMotion ? .024 : .048)
      smoothNY += (pointerNY - smoothNY) * (reducedMotion ? .024 : .048)

      const age = (time - startedAt) / 1000
      const formation = smoothstep(.95, 2.75, age)
      const scene = sceneState()
      const exitP = exitStartedAt ? clamp((time - exitStartedAt) / 1220, 0, 1) : 0
      const fade = 1 - smoothstep(.58, 1, exitP)
      const leap = easeOut(clamp((exitP - .04) / .36, 0, 1))
      const zoom = scene.zoom || 1

      const earthX = scene.earthX ?? width * .5
      const earthY = scene.earthY ?? height * (mobile ? .365 : .325)
      const portalX = width * .5 + smoothNX * (mobile ? 8 : 20)
      const portalY = height * (mobile ? .705 : .72) + smoothNY * (mobile ? 5 : 11)
      const unit = Math.min(width, height) * (mobile ? .37 : width < 1200 ? .415 : .445) * (.95 + (zoom - 1) * .36)

      // Reference-led composition: the whale breaches upward through a luminous data basin while Earth remains the visual anchor above.
      const baseRotation = mobile ? -1.77 : -1.90
      const idleFloat = reducedMotion ? 0 : Math.sin(time * .00034) * 6
      const rotation = baseRotation + smoothNX * .042 + (reducedMotion ? 0 : Math.sin(time * .00027) * .014) - leap * .095
      const whaleX = width * .50 + smoothNX * (mobile ? 11 : 25) - leap * (mobile ? 7 : 18)
      const whaleY = height * (mobile ? .575 : .565) + smoothNY * (mobile ? 7 : 14) + idleFloat - leap * (mobile ? 26 : 48)

      const pointerDistance = Math.hypot(pointerX - whaleX, pointerY - whaleY)
      const hoverRadius = unit * .58
      const hover = clamp(1 - pointerDistance / Math.max(1, hoverRadius), 0, 1)

      const tail = worldPoint(whaleX, whaleY, rotation, unit, -.62, .015)
      emitTrail(tail, time, 1 + hover * .9 + clamp(pointerSpeed / 1150, 0, .55) + leap * 1.15)
      emitSplash(portalX, portalY, unit, time, 1 + hover * .45 + leap * 1.5)

      if (!reducedMotion && hover > .72 && motes.length < 16 && hash(time * .013) > .72) {
        motes.push({
          x: whaleX + (hash(time * .021) - .5) * unit * .75,
          y: whaleY + (hash(time * .037) - .5) * unit * .35,
          vx: (hash(time * .043) - .5) * 10,
          vy: -4 - hash(time * .051) * 9,
          life: 1,
          size: .45 + hash(time * .067),
        })
      }

      updateParticles(dt, exitP)
      ctx.clearRect(0, 0, width, height)

      drawConstellations(formation, fade, smoothNX * 9, smoothNY * 6)
      drawAxis(earthX, earthY, portalX, portalY, unit, formation, fade)
      drawPortal(time, portalX, portalY, unit, formation, fade, exitP, hover)
      drawParticles(exitP, fade)
      drawWhale(time, whaleX, whaleY, rotation, unit, formation, hover, fade, exitP)
      drawLowerInstrument(portalX, portalY + unit * .43, unit, formation, fade)

      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove', onPointerMove, { passive: true })
    entry.addEventListener('pointerup', onPointerUp)
    entry.addEventListener('keydown', onKeydown)
    window.addEventListener('resize', resize, { passive: true })
    resize()
    raf = requestAnimationFrame(frame)
  }
}
