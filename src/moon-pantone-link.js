const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('moon-pantone-link-style')) {
  const moon = entry.querySelector('.system-moon')
  if (moon) {
    const style = document.createElement('style')
    style.id = 'moon-pantone-link-style'
    style.textContent = `
      #png-cutout-entry .system-moon{pointer-events:auto!important;cursor:pointer!important;outline:none;transition:opacity .45s ease,box-shadow .55s ease,filter .55s ease!important}
      #png-cutout-entry .system-moon:hover,#png-cutout-entry .system-moon:focus-visible{box-shadow:0 0 0 1px rgba(183,255,42,.26),0 0 28px rgba(183,255,42,.12),0 0 40px rgba(255,255,255,.06)!important;filter:brightness(1.14)}
      #png-cutout-entry .system-moon:focus-visible{outline:1px solid #b7ff2a;outline-offset:6px}
      #png-cutout-entry .system-moon:after{content:"02 / PANTONE MATCH";position:absolute;left:150%;top:calc(50% + 13px);white-space:nowrap;color:rgba(183,255,42,.68);font:6px/1.2 "SFMono-Regular",Consolas,monospace;letter-spacing:.13em;text-transform:uppercase;opacity:.62;pointer-events:none}
      #png-cutout-entry .system-moon.moon-link-activate{filter:brightness(1.34);box-shadow:0 0 0 1px rgba(183,255,42,.5),0 0 40px rgba(183,255,42,.20)!important}
      @media(max-width:700px){#png-cutout-entry .system-moon:after{display:none}}
    `
    document.head.appendChild(style)

    moon.setAttribute('role', 'button')
    moon.setAttribute('tabindex', '0')
    moon.setAttribute('aria-label', 'Open Pantone Match color inspector')
    const label = moon.querySelector('span')
    if (label) label.textContent = 'MOON / PANTONE'

    let navigating = false
    function openPantone(event) {
      if (navigating) return
      navigating = true
      event?.preventDefault?.()
      event?.stopPropagation?.()
      event?.stopImmediatePropagation?.()
      moon.classList.add('moon-link-activate')
      setTimeout(() => { window.location.href = '/pantone' }, 140)
    }

    function onPointerUp(event) {
      if (event.target?.closest?.('.system-moon') !== moon) return
      openPantone(event)
    }

    function onKeyDown(event) {
      if (document.activeElement !== moon) return
      if (event.key === 'Enter' || event.key === ' ') openPantone(event)
    }

    // Window capture runs before the intro's own capture handlers, so Moon never triggers the PNG exit transition.
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('keydown', onKeyDown, true)

    const cleanup = new MutationObserver(() => {
      if (!entry.isConnected) {
        window.removeEventListener('pointerup', onPointerUp, true)
        window.removeEventListener('keydown', onKeyDown, true)
        cleanup.disconnect()
      }
    })
    cleanup.observe(document.documentElement, { childList: true, subtree: true })
  }
}
