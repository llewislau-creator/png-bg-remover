const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('png-cutout-system-style')) {
  const globeCanvas = entry.querySelector('.globe-canvas')
  if (globeCanvas) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minZoom = mobile ? 0.82 : 0.72
    const maxZoom = mobile ? 1.30 : 1.48

    const style = document.createElement('style')
    style.id = 'png-cutout-system-style'
    style.textContent = `
      #png-cutout-entry .globe-canvas{transform-origin:50% 46.5%;will-change:transform}
      #png-cutout-entry .entry-system-layer{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
      #png-cutout-entry .system-sun{position:absolute;left:84%;top:18%;width:118px;height:118px;transform:translate(-50%,-50%);opacity:0;transition:opacity 1.8s ease;will-change:left,top,transform}
      #png-cutout-entry.is-ready .system-sun{opacity:1}
      #png-cutout-entry .system-sun-core{position:absolute;inset:25%;border-radius:50%;background:rgba(255,255,255,.075);border:1px solid rgba(201,255,57,.10);box-shadow:0 0 28px rgba(201,255,57,.05),0 0 90px rgba(201,255,57,.035)}
      #png-cutout-entry .system-sun:before{content:"";position:absolute;inset:-72%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.07) 0,rgba(201,255,57,.03) 19%,rgba(201,255,57,.009) 43%,transparent 70%)}
      #png-cutout-entry .system-sun span,#png-cutout-entry .system-moon span{position:absolute;color:rgba(255,255,255,.34);font-size:7px;letter-spacing:.12em;white-space:nowrap;text-transform:uppercase}
      #png-cutout-entry .system-sun span{left:86%;top:50%;transform:translateY(-50%)}
      #png-cutout-entry .system-moon-orbit{position:absolute;left:50%;top:46.5%;width:600px;height:250px;border:1px solid rgba(255,255,255,.032);border-radius:50%;transform:translate(-50%,-50%) rotate(2deg);opacity:0;transition:opacity 1.8s ease 1s;will-change:left,top,width,height,transform}
      #png-cutout-entry.is-ready .system-moon-orbit{opacity:1}
      #png-cutout-entry .system-moon{position:absolute;left:68%;top:42%;width:24px;height:24px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(222,230,224,.76);border:1px solid rgba(201,255,57,.13);box-shadow:0 0 22px rgba(255,255,255,.06),0 0 40px rgba(201,255,57,.025);opacity:0;transition:opacity 1.8s ease 1.3s;will-change:left,top,width,height}
      #png-cutout-entry.is-ready .system-moon{opacity:1}
      #png-cutout-entry .system-moon:before,#png-cutout-entry .system-moon:after{content:"";position:absolute;border-radius:50%;background:rgba(14,22,16,.30)}
      #png-cutout-entry .system-moon:before{width:27%;height:27%;left:19%;top:23%}
      #png-cutout-entry .system-moon:after{width:17%;height:17%;right:18%;bottom:19%;opacity:.78}
      #png-cutout-entry .system-moon span{left:145%;top:50%;transform:translateY(-50%)}
      #png-cutout-entry .system-zoom-hint{position:absolute;right:28px;bottom:26px;display:grid;gap:4px;text-align:right;color:rgba(255,255,255,.32);font-size:7px;line-height:1.4;letter-spacing:.11em;text-transform:uppercase;opacity:0;transition:opacity 1.4s ease 1.2s}
      #png-cutout-entry.is-ready .system-zoom-hint{opacity:1}
      #png-cutout-entry .system-zoom-hint b{color:rgba(255,255,255,.72);font-size:8px;font-weight:500}
      @media(max-width:700px){#png-cutout-entry .system-sun{width:78px;height:78px;left:82%;top:20%}#png-cutout-entry .system-zoom-hint{right:14px;bottom:14px}#png-cutout-entry .system-moon span,#png-cutout-entry .system-sun span{display:none}}
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .system-sun,#png-cutout-entry .system-moon,#png-cutout-entry .system-moon-orbit{transition:opacity .3s linear}}
    `
    document.head.appendChild(style)

    const layer = document.createElement('div')
    layer.className = 'entry-system-layer'
    layer.setAttribute('aria-hidden', 'true')
    layer.innerHTML = `
      <div class="system-sun"><i class="system-sun-core"></i><span>SUN</span></div>
      <div class="system-moon-orbit"></div>
      <div class="system-moon"><span>MOON</span></div>
      <div class="system-zoom-hint"><b>100%</b><span>${mobile ? 'PINCH TO ZOOM' : 'SCROLL TO ZOOM · +/-'}</span></div>
    `
    const ui = entry.querySelector('.entry-ui')
    entry.insertBefore(layer, ui || null)

    const sun = layer.querySelector('.system-sun')
    const moon = layer.querySelector('.system-moon')
    const moonOrbit = layer.querySelector('.system-moon-orbit')
    const zoomLabel = layer.querySelector('.system-zoom-hint b')
    const enterCopy = entry.querySelector('.entry-enter span')
    const topMeta = entry.querySelector('.entry-top-meta')
    if (enterCopy) enterCopy.textContent = mobile ? 'MOVE · PINCH · ENTER THE TOOL' : 'MOVE THE SYSTEM · SCROLL TO ZOOM · ENTER'
    if (topMeta) topMeta.textContent = 'EARTH / MOON / SUN · 07 CONTINENTS'

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
      const sensitivity = event.ctrlKey ? 0.0017 : 0.0009
      targetZoom = clamp(targetZoom - event.deltaY * sensitivity, minZoom, maxZoom)
      setPointer(event.clientX, event.clientY)
    }

    function onKeydown(event) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        event.stopImmediatePropagation()
        targetZoom = clamp(targetZoom + 0.08, minZoom, maxZoom)
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        event.stopImmediatePropagation()
        targetZoom = clamp(targetZoom - 0.08, minZoom, maxZoom)
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
        style.remove()
        return
      }

      const response = reduceMotion ? 0.035 : 0.075
      nx += (targetNx - nx) * response
      ny += (targetNy - ny) * response
      zoom += (targetZoom - zoom) * (reduceMotion ? 0.08 : 0.11)

      globeCanvas.style.transform = `scale(${zoom.toFixed(4)})`
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`

      const earthRadius = Math.min(width, height) * (mobile ? 0.235 : width < 1200 ? 0.25 : 0.268) * zoom
      const earthX = width * 0.5 + nx * (mobile ? 7 : 15)
      const earthY = height * 0.465 + ny * (mobile ? 5 : 10)

      const moonAngle = reduceMotion ? 0.92 : time * 0.000055 + 0.92
      const moonOrbitRadius = earthRadius * (mobile ? 1.46 : 1.58)
      const moonX = earthX + Math.cos(moonAngle) * moonOrbitRadius + nx * (mobile ? 2 : 7)
      const moonY = earthY + Math.sin(moonAngle) * moonOrbitRadius * 0.42 + ny * (mobile ? 2 : 5)
      const moonSize = Math.max(mobile ? 10 : 13, earthRadius * (mobile ? 0.055 : 0.062))
      moon.style.left = `${moonX}px`
      moon.style.top = `${moonY}px`
      moon.style.width = `${moonSize}px`
      moon.style.height = `${moonSize}px`
      moon.style.opacity = `${0.58 + (Math.sin(moonAngle) + 1) * 0.12}`

      moonOrbit.style.left = `${earthX}px`
      moonOrbit.style.top = `${earthY}px`
      moonOrbit.style.width = `${moonOrbitRadius * 2}px`
      moonOrbit.style.height = `${moonOrbitRadius * 0.84}px`
      moonOrbit.style.transform = `translate(-50%,-50%) rotate(${2 + nx * 1.8}deg)`

      const sunX = width * (mobile ? 0.82 : 0.84) + nx * (mobile ? 4 : 10) + (earthX - width * 0.5) * 0.16
      const sunY = height * (mobile ? 0.20 : 0.18) + ny * (mobile ? 3 : 7) + (earthY - height * 0.465) * 0.14
      const sunScale = 1 + (zoom - 1) * 0.05
      sun.style.left = `${sunX}px`
      sun.style.top = `${sunY}px`
      sun.style.transform = `translate(-50%,-50%) scale(${sunScale.toFixed(3)})`

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
