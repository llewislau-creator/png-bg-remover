const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('award-choreography-style')) {
  const whale = entry.querySelector('.whale-art')
  const whaleLayer = entry.querySelector('.whale-art-layer')
  if (whale && whaleLayer) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const style = document.createElement('style')
    style.id = 'award-choreography-style'
    style.textContent = `
      #png-cutout-entry .award-lens{position:absolute;left:50%;top:56%;width:min(54vw,660px);aspect-ratio:1/1.12;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:6;opacity:0;transition:opacity 2.2s cubic-bezier(.22,1,.36,1);background:radial-gradient(ellipse at 50% 55%,rgba(255,255,255,.024) 0,rgba(183,255,42,.010) 25%,rgba(255,255,255,.006) 45%,transparent 72%);filter:blur(1px)}
      #png-cutout-entry.is-ready .award-lens{opacity:1}
      #png-cutout-entry .award-axis{position:absolute;left:50%;top:12%;bottom:10%;width:1px;z-index:6;pointer-events:none;opacity:0;transition:opacity 2s ease 1.3s;background:linear-gradient(transparent,rgba(255,255,255,.032) 18%,rgba(255,255,255,.07) 51%,rgba(255,255,255,.028) 80%,transparent)}
      #png-cutout-entry.is-ready .award-axis{opacity:1}
      #png-cutout-entry .award-scene-label{position:absolute;z-index:9;left:calc(50% + min(24vw,310px));top:54%;display:grid;gap:5px;pointer-events:none;opacity:0;transition:opacity 1.6s ease 2s;font:6px/1.35 "SFMono-Regular",Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.24)}
      #png-cutout-entry.is-ready .award-scene-label{opacity:1}
      #png-cutout-entry .award-scene-label b{font-weight:500;color:rgba(255,255,255,.52)}
      #png-cutout-entry .award-scene-label i{display:block;width:28px;height:1px;background:linear-gradient(90deg,rgba(183,255,42,.58),transparent)}
      #png-cutout-entry .award-fx{position:absolute;inset:0;z-index:9;width:100%;height:100%;pointer-events:none}
      #png-cutout-entry .whale-art{will-change:transform,filter,opacity;backface-visibility:hidden;transform-origin:52% 61%!important}
      @media(max-width:980px){#png-cutout-entry .award-lens{width:min(66vw,560px)}#png-cutout-entry .award-scene-label{left:auto;right:20px;top:55%}}
      @media(max-width:700px){#png-cutout-entry .award-lens{top:58%;width:82vw}#png-cutout-entry .award-scene-label{display:none}#png-cutout-entry .award-axis{top:14%;bottom:16%}}
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .award-lens,#png-cutout-entry .award-axis,#png-cutout-entry .award-scene-label{transition-duration:.3s}}
    `
    document.head.appendChild(style)

    const lens = document.createElement('div')
    lens.className = 'award-lens'
    const axis = document.createElement('div')
    axis.className = 'award-axis'
    const label = document.createElement('div')
    label.className = 'award-scene-label'
    label.innerHTML = '<i></i><b>CELESTIAL GUIDE</b><span>ORBIT / 01</span>'
    const canvas = document.createElement('canvas')
    canvas.className = 'award-fx'
    canvas.setAttribute('aria-hidden', 'true')

    entry.insertBefore(lens, whaleLayer)
    entry.insertBefore(axis, whaleLayer)
    whaleLayer.appendChild(canvas)
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(label, ui || null)

    const ctx = canvas.getContext('2d')
    let width = Math.max(1, innerWidth)
    let height = Math.max(1, innerHeight)
    let pointerX = width * .5
    let pointerY = height * .5
    let px = 0
    let py = 0
    let tx = 0
    let ty = 0
    let hover = 0
    let exitAt = 0
    let raf = 0
    let last = performance.now()
    const dust = Array.from({length: mobile ? 18 : 34}, (_, i) => ({
      phase: i * 2.399,
      radius: .12 + ((i * 17) % 23) / 100,
      speed: .000035 + ((i * 7) % 11) * .000004,
      alpha: .035 + ((i * 13) % 17) / 500,
      size: .45 + ((i * 5) % 7) * .12,
    }))

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const smoothstep = (a, b, x) => {
      const t = clamp((x - a) / Math.max(.0001, b - a), 0, 1)
      return t * t * (3 - 2 * t)
    }
    const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3)

    function resize() {
      width = Math.max(1, innerWidth)
      height = Math.max(1, innerHeight)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function onMove(e) {
      pointerX = e.clientX
      pointerY = e.clientY
      tx = clamp((pointerX / width - .5) * 2, -1, 1)
      ty = clamp((pointerY / height - .5) * 2, -1, 1)
    }

    function beginExit() {
      if (!exitAt) exitAt = performance.now()
    }

    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') beginExit()
    }

    function drawBracket(x, y, radius, alpha) {
      const r = radius
      const l = Math.max(7, r * .12)
      ctx.save()
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`
      ctx.lineWidth = .55
      ctx.beginPath()
      ctx.moveTo(x-r, y-r+l); ctx.lineTo(x-r, y-r); ctx.lineTo(x-r+l, y-r)
      ctx.moveTo(x+r-l, y-r); ctx.lineTo(x+r, y-r); ctx.lineTo(x+r, y-r+l)
      ctx.moveTo(x-r, y+r-l); ctx.lineTo(x-r, y+r); ctx.lineTo(x-r+l, y+r)
      ctx.moveTo(x+r-l, y+r); ctx.lineTo(x+r, y+r); ctx.lineTo(x+r, y+r-l)
      ctx.stroke()
      ctx.restore()
    }

    function drawArc(cx, cy, rx, ry, start, end, alpha, accent = false) {
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, start, end)
      ctx.strokeStyle = accent ? `rgba(183,255,42,${alpha})` : `rgba(255,255,255,${alpha})`
      ctx.lineWidth = accent ? .7 : .5
      ctx.stroke()
    }

    function frame(time) {
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        style.remove()
        return
      }

      const dt = Math.min(.033, Math.max(.001, (time - last) / 1000))
      last = time
      px += (tx - px) * (reduced ? .025 : .050)
      py += (ty - py) * (reduced ? .025 : .050)

      const state = entry.__cosmicState || {}
      const earthX = state.earthX || width * .5
      const earthY = state.earthY || height * .325
      const earthR = state.earthRadius || Math.min(width, height) * .26
      const zoom = state.zoom || 1

      const whaleWidth = Math.min(width * (mobile ? .61 : width < 980 ? .45 : .35), mobile ? 326 : 410)
      const whaleY = height * (mobile ? .585 : .575)
      const whaleX = width * .5
      const dist = Math.hypot(pointerX - whaleX, pointerY - whaleY)
      const targetHover = clamp(1 - dist / Math.max(170, whaleWidth * .82), 0, 1)
      hover += (targetHover - hover) * .075

      const exitP = exitAt ? clamp((time - exitAt) / 1240, 0, 1) : 0
      const leap = easeOut(clamp((exitP - .05) / .42, 0, 1))
      const dissolve = smoothstep(.54, 1, exitP)
      const fade = 1 - dissolve
      const float = reduced ? 0 : Math.sin(time * .00042) * 3.5
      const driftX = px * (mobile ? 11 : 24)
      const driftY = py * (mobile ? 6 : 12)
      const scale = (1 + (zoom - 1) * .18) * (1 + hover * .012 + leap * .025)
      const rotate = (-.9 + px * 1.25 - leap * 2.2)
      const lift = leap * (mobile ? 38 : 66)

      whale.style.width = `${whaleWidth}px`
      whale.style.left = `${whaleX}px`
      whale.style.top = `${whaleY}px`
      whale.style.transform = `translate(calc(-50% + ${driftX.toFixed(2)}px),calc(-50% + ${(driftY + float - lift).toFixed(2)}px)) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`
      whale.style.opacity = `${(.90 * fade).toFixed(3)}`
      whale.style.filter = `contrast(${(1.16 + hover * .06).toFixed(3)}) brightness(${(1.02 + hover * .045 + leap * .10).toFixed(3)}) drop-shadow(0 0 ${(10 + hover * 9 + leap * 15).toFixed(1)}px rgba(255,255,255,${(.085 + hover * .055 + leap * .08).toFixed(3)}))`

      lens.style.left = `${(whaleX + driftX * .35).toFixed(1)}px`
      lens.style.top = `${(whaleY + driftY * .25).toFixed(1)}px`
      lens.style.transform = `translate(-50%,-50%) scale(${(1 + hover * .025).toFixed(4)})`
      label.style.opacity = `${(entry.classList.contains('is-ready') ? .92 * fade : 0).toFixed(3)}`

      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.globalAlpha = fade

      // One coherent axis: Earth -> whale -> portal. It keeps the composition intentional.
      const portalY = height * (mobile ? .74 : .735)
      ctx.beginPath()
      ctx.moveTo(earthX, earthY + earthR * .46)
      ctx.bezierCurveTo(earthX + px * 8, height * .44, whaleX - px * 7, height * .61, whaleX, portalY)
      ctx.setLineDash([1.5, 8])
      ctx.strokeStyle = `rgba(255,255,255,${.052 + hover * .015})`
      ctx.lineWidth = .55
      ctx.stroke()
      ctx.setLineDash([])

      // Earth stays the primary focus; the bracket is brighter than whale framing.
      drawBracket(earthX, earthY, earthR * .68, .09)
      drawArc(earthX, earthY, earthR * 1.08, earthR * .42, Math.PI * .08, Math.PI * .56, .08)
      drawArc(earthX, earthY, earthR * 1.16, earthR * .48, Math.PI * 1.08, Math.PI * 1.42, .13, true)

      // Secondary whale field: broken arcs, never a complete ring.
      const whaleFieldY = whaleY + driftY * .35
      drawArc(whaleX + driftX * .2, whaleFieldY, whaleWidth * .50, whaleWidth * .13, Math.PI * .03, Math.PI * .72, .052)
      drawArc(whaleX + driftX * .2, whaleFieldY, whaleWidth * .58, whaleWidth * .17, Math.PI * 1.02, Math.PI * 1.72, .033)

      // Very sparse orbit dust provides depth without becoming a starfield texture.
      for (let i = 0; i < dust.length; i++) {
        const p = dust[i]
        const a = p.phase + time * p.speed
        const r = whaleWidth * (.56 + p.radius)
        const x = whaleX + Math.cos(a) * r + driftX * .16
        const y = whaleFieldY + Math.sin(a) * r * .30 + float * .2
        ctx.beginPath()
        ctx.fillStyle = i % 13 === 0 ? `rgba(183,255,42,${p.alpha * .75})` : `rgba(255,255,255,${p.alpha})`
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Exit cue: a restrained white pulse travelling upward through the axis.
      if (exitP > .08) {
        const p = clamp((exitP - .08) / .54, 0, 1)
        const y = portalY + (earthY - portalY) * easeOut(p)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${(1-p) * .62})`
        ctx.shadowColor = 'rgba(183,255,42,.28)'
        ctx.shadowBlur = 14
        ctx.arc(whaleX, y, 1.8 + p * 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.restore()
      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove', onMove, {passive:true})
    entry.addEventListener('pointerup', beginExit, true)
    entry.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', resize, {passive:true})
    resize()
    raf = requestAnimationFrame(frame)
  }
}
