const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('png-cutout-system-style')) {
  const globeCanvas = entry.querySelector('.globe-canvas')
  if (globeCanvas) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minZoom = mobile ? 0.84 : 0.74
    const maxZoom = mobile ? 1.28 : 1.44
    const startedAt = performance.now()
    const ACID_RGB = '183,255,42'

    const style = document.createElement('style')
    style.id = 'png-cutout-system-style'
    style.textContent = `
      #png-cutout-entry .globe-canvas{transform-origin:50% 46.5%;will-change:transform;backface-visibility:hidden}
      #png-cutout-entry .entry-system-layer{position:absolute;inset:0;z-index:8;overflow:hidden;pointer-events:none;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
      #png-cutout-entry .system-sun{position:absolute;left:84%;top:17%;width:122px;height:122px;transform:translate(-50%,-50%);opacity:0;transition:opacity 2.2s cubic-bezier(.22,1,.36,1);will-change:left,top,transform,opacity}
      #png-cutout-entry.is-ready .system-sun{opacity:.82}
      #png-cutout-entry .system-sun:before,#png-cutout-entry .system-sun:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
      #png-cutout-entry .system-sun:before{inset:-88%;background:radial-gradient(circle,rgba(255,255,255,.055) 0,rgba(${ACID_RGB},.022) 18%,rgba(${ACID_RGB},.006) 42%,transparent 69%)}
      #png-cutout-entry .system-sun:after{inset:12%;border:1px solid rgba(255,255,255,.055);box-shadow:0 0 0 12px rgba(255,255,255,.012),0 0 0 26px rgba(${ACID_RGB},.008)}
      #png-cutout-entry .system-sun-core{position:absolute;inset:34%;border-radius:50%;background:radial-gradient(circle at 38% 35%,rgba(255,255,255,.24),rgba(255,255,255,.055) 34%,rgba(255,255,255,.018) 68%,transparent 72%);border:1px solid rgba(${ACID_RGB},.12);box-shadow:0 0 28px rgba(${ACID_RGB},.045)}
      #png-cutout-entry .system-sun span,#png-cutout-entry .system-moon span{position:absolute;color:rgba(255,255,255,.48);font-size:7px;letter-spacing:.15em;white-space:nowrap;text-transform:uppercase}
      #png-cutout-entry .system-sun span{left:78%;top:50%;transform:translateY(-50%)}
      #png-cutout-entry .system-moon-orbit{position:absolute;left:50%;top:46.5%;width:600px;height:250px;border:1px solid rgba(255,255,255,.055);border-radius:50%;transform:translate(-50%,-50%) rotate(2deg);opacity:0;transition:opacity 2s ease .45s;will-change:left,top,width,height,transform;box-shadow:inset 0 0 30px rgba(${ACID_RGB},.006)}
      #png-cutout-entry.is-ready .system-moon-orbit{opacity:1}
      #png-cutout-entry .system-moon{position:absolute;left:68%;top:42%;width:30px;height:30px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.96) 0 8%,rgba(221,229,223,.86) 10% 40%,rgba(127,139,131,.72) 76%,rgba(55,66,58,.86) 100%);border:1px solid rgba(255,255,255,.22);box-shadow:0 0 0 1px rgba(${ACID_RGB},.06),0 0 22px rgba(255,255,255,.08);opacity:0;transition:opacity 1.8s ease .65s;will-change:left,top,width,height,opacity;z-index:3}
      #png-cutout-entry.is-ready .system-moon{opacity:1}
      #png-cutout-entry .system-moon:before,#png-cutout-entry .system-moon:after{content:"";position:absolute;border-radius:50%;background:rgba(20,28,22,.31);box-shadow:inset 0 0 2px rgba(255,255,255,.10)}
      #png-cutout-entry .system-moon:before{width:27%;height:27%;left:18%;top:22%}
      #png-cutout-entry .system-moon:after{width:17%;height:17%;right:18%;bottom:18%;opacity:.82}
      #png-cutout-entry .system-moon span{left:150%;top:50%;transform:translateY(-50%);text-shadow:0 0 12px rgba(0,0,0,.9)}
      #png-cutout-entry .system-zoom-hint{position:absolute;right:28px;bottom:26px;display:grid;gap:5px;text-align:right;color:rgba(255,255,255,.30);font-size:7px;line-height:1.4;letter-spacing:.14em;text-transform:uppercase;opacity:0;transition:opacity 1.6s ease 1.3s}
      #png-cutout-entry.is-ready .system-zoom-hint{opacity:1}
      #png-cutout-entry .system-zoom-hint b{position:relative;color:rgba(255,255,255,.74);font-size:8px;font-weight:500;letter-spacing:.18em}
      #png-cutout-entry .system-zoom-hint b:before{content:"";display:inline-block;width:18px;height:1px;margin:0 8px 2px 0;background:rgba(${ACID_RGB},.45)}
      @media(max-width:700px){
        #png-cutout-entry .system-sun{width:82px;height:82px;left:82%;top:18%}
        #png-cutout-entry .system-zoom-hint{right:14px;bottom:14px}
        #png-cutout-entry .system-moon{width:23px;height:23px}
        #png-cutout-entry .system-moon span,#png-cutout-entry .system-sun span{display:none}
      }
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .system-sun,#png-cutout-entry .system-moon,#png-cutout-entry .system-moon-orbit{transition:opacity .3s linear}}
    `
    document.head.appendChild(style)

    const layer = document.createElement('div')
    layer.className = 'entry-system-layer'
    layer.setAttribute('aria-hidden', 'true')
    layer.innerHTML = `
      <div class="system-sun"><i class="system-sun-core"></i><span>SUN / DISTANT</span></div>
      <div class="system-moon-orbit"></div>
      <div class="system-moon"><span>MOON / 01</span></div>
      <div class="system-zoom-hint"><b>100%</b><span>${mobile ? 'PINCH · MOVE FIELD' : 'SCROLL · MOVE FIELD'}</span></div>
    `
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(layer, ui || null)

    const sun = layer.querySelector('.system-sun')
    const moon = layer.querySelector('.system-moon')
    const moonOrbit = layer.querySelector('.system-moon-orbit')
    const zoomLabel = layer.querySelector('.system-zoom-hint b')
    const enterCopy = entry.querySelector('.entry-enter span')
    const topMeta = entry.querySelector('.entry-top-meta')
    if (enterCopy) enterCopy.textContent = mobile ? 'MOVE · PINCH · ENTER THE FIELD' : 'MOVE · SCROLL · ENTER THE FIELD'
    if (topMeta) topMeta.textContent = 'EARTH FIELD · LUNAR ORBIT · SOLAR VECTOR'

    let width = Math.max(1, window.innerWidth)
    let height = Math.max(1, window.innerHeight)
    let nx = 0
    let ny = 0
    let targetNx = 0
    let targetNy = 0
    let zoom = 1
    let targetZoom = 1
    let raf = 0
    const pointers = new Map()
    let pinchActive = false
    let pinchStartDistance = 0
    let pinchStartZoom = 1

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

    entry.__cosmicState = {
      earthX: width * .5,
      earthY: height * .325,
      earthRadius: 1,
      zoom: 1,
      nx: 0,
      ny: 0,
      moonX: width * .68,
      moonY: height * .36,
      sunX: width * .84,
      sunY: height * .17,
      time: startedAt,
    }

    function pointerDistance() {
      const p = [...pointers.values()]
      if (p.length < 2) return 0
      return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
    }

    function setPointer(x, y) {
      targetNx = clamp((x / width - 0.5) * 2, -1, 1)
      targetNy = clamp((y / height - 0.5) * 2, -1, 1)
    }

    function onPointerDown(event) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size === 2) {
        pinchActive = true
        pinchStartDistance = Math.max(1, pointerDistance())
        pinchStartZoom = targetZoom
      }
    }

    function onPointerMove(event) {
      setPointer(event.clientX, event.clientY)
      if (!pointers.has(event.pointerId)) return
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size >= 2) {
        pinchActive = true
        targetZoom = clamp(pinchStartZoom * (pointerDistance() / Math.max(1, pinchStartDistance)), minZoom, maxZoom)
      }
    }

    function onPointerUp(event) {
      const blockIntroClick = pinchActive
      pointers.delete(event.pointerId)
      if (pointers.size < 2) pinchActive = false
      if (blockIntroClick) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
    }

    function onPointerCancel(event) {
      pointers.delete(event.pointerId)
      if (pointers.size < 2) pinchActive = false
    }

    function onWheel(event) {
      if (!entry.isConnected) return
      event.preventDefault()
      const sensitivity = event.ctrlKey ? 0.00155 : 0.00082
      targetZoom = clamp(targetZoom - event.deltaY * sensitivity, minZoom, maxZoom)
      setPointer(event.clientX, event.clientY)
    }

    function onKeydown(event) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        event.stopImmediatePropagation()
        targetZoom = clamp(targetZoom + 0.075, minZoom, maxZoom)
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        event.stopImmediatePropagation()
        targetZoom = clamp(targetZoom - 0.075, minZoom, maxZoom)
      } else if (event.key === '0') {
        event.preventDefault()
        event.stopImmediatePropagation()
        targetZoom = 1
      }
    }

    function onResize() {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
    }

    function frame(time) {
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        delete entry.__cosmicState
        style.remove()
        return
      }

      const response = reduceMotion ? 0.028 : 0.062
      nx += (targetNx - nx) * response
      ny += (targetNy - ny) * response
      zoom += (targetZoom - zoom) * (reduceMotion ? 0.075 : 0.095)

      const earthShiftY = -height * (mobile ? 0.10 : 0.14)
      globeCanvas.style.transform = `translate3d(0,${earthShiftY.toFixed(2)}px,0) scale(${zoom.toFixed(4)})`
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`

      const earthRadius = Math.min(width, height) * (mobile ? 0.235 : width < 1200 ? 0.25 : 0.268) * zoom
      const earthX = width * 0.5 + nx * (mobile ? 6 : 13)
      const earthY = height * 0.465 + earthShiftY + ny * (mobile ? 4 : 8)

      const elapsed = Math.max(0, time - startedAt)
      const moonAngle = reduceMotion ? -0.58 : -0.58 + elapsed * 0.000020
      const moonOrbitRadius = earthRadius * (mobile ? 1.34 : 1.43)
      const moonX = earthX + Math.cos(moonAngle) * moonOrbitRadius + nx * (mobile ? 2 : 5)
      const moonY = earthY + Math.sin(moonAngle) * moonOrbitRadius * 0.50 + ny * (mobile ? 2 : 4)
      const moonSize = Math.max(mobile ? 23 : 28, earthRadius * (mobile ? 0.082 : 0.091))
      moon.style.left = `${moonX}px`
      moon.style.top = `${moonY}px`
      moon.style.width = `${moonSize}px`
      moon.style.height = `${moonSize}px`
      moon.style.opacity = `${0.88 + (Math.sin(moonAngle) + 1) * 0.04}`

      moonOrbit.style.left = `${earthX}px`
      moonOrbit.style.top = `${earthY}px`
      moonOrbit.style.width = `${moonOrbitRadius * 2}px`
      moonOrbit.style.height = `${moonOrbitRadius}px`
      moonOrbit.style.transform = `translate(-50%,-50%) rotate(${1.8 + nx * 1.35}deg)`

      const sunX = width * (mobile ? 0.82 : 0.84) + nx * (mobile ? 3 : 7) + (earthX - width * 0.5) * 0.11
      const sunY = height * (mobile ? 0.18 : 0.17) + ny * (mobile ? 2 : 4)
      const sunScale = 1 + (zoom - 1) * 0.035
      sun.style.left = `${sunX}px`
      sun.style.top = `${sunY}px`
      sun.style.transform = `translate(-50%,-50%) scale(${sunScale.toFixed(3)})`

      Object.assign(entry.__cosmicState, {
        earthX, earthY, earthRadius, zoom, nx, ny,
        moonX, moonY, sunX, sunY, time,
      })

      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('wheel', onWheel, { passive: false, capture: true })
    entry.addEventListener('pointerdown', onPointerDown, true)
    entry.addEventListener('pointermove', onPointerMove, true)
    entry.addEventListener('pointerup', onPointerUp, true)
    entry.addEventListener('pointercancel', onPointerCancel, true)
    entry.addEventListener('keydown', onKeydown, true)
    window.addEventListener('resize', onResize, { passive: true })
    raf = requestAnimationFrame(frame)
  }
}
