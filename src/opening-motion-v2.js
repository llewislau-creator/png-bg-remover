const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('opening-motion-v2-style')) {
  const globe = entry.querySelector('.globe-canvas')
  const space = entry.querySelector('.space-canvas')
  const enter = entry.querySelector('.entry-enter')
  const skip = entry.querySelector('.entry-skip')
  const planetLayer = entry.querySelector('.planet-function-layer')
  const moon = entry.querySelector('.system-moon')
  const moonOrbit = entry.querySelector('.system-moon-orbit')
  const sun = entry.querySelector('.system-sun')
  const ui = entry.querySelector('.entry-ui')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = matchMedia('(max-width: 700px)').matches

  if (globe && enter) {
    const style = document.createElement('style')
    style.id = 'opening-motion-v2-style'
    style.textContent = `
      #png-cutout-entry .entry-click-ring{display:none!important}
      #png-cutout-entry .globe-canvas{opacity:0;transition:opacity 3.8s cubic-bezier(.22,1,.36,1);will-change:translate,opacity}
      #png-cutout-entry.motion-v2-ready .globe-canvas{opacity:1}
      #png-cutout-entry .planet-function-layer{opacity:0;transition:opacity 2.8s cubic-bezier(.22,1,.36,1);will-change:opacity}
      #png-cutout-entry.motion-v2-ready .planet-function-layer{opacity:1}
      #png-cutout-entry .function-orbit{transition:opacity 1.1s ease,border-color 1.1s ease}
      #png-cutout-entry .function-planet{transition:border-color .45s ease,box-shadow .45s ease,transform 1s cubic-bezier(.22,1,.36,1),opacity .8s ease!important}
      #png-cutout-entry.motion-v2-exiting .entry-enter{opacity:0!important;transition:opacity .38s ease!important}
      #png-cutout-entry.motion-v2-exiting .entry-top-meta,
      #png-cutout-entry.motion-v2-exiting .entry-left-meta,
      #png-cutout-entry.motion-v2-exiting .entry-brand{opacity:.35!important;transition:opacity .48s ease!important}
      #png-cutout-entry .motion-v2-earth-freeze{position:absolute;inset:0;z-index:5;width:100%;height:100%;pointer-events:none;opacity:1;will-change:opacity,translate,transform;transition:opacity .85s cubic-bezier(.22,1,.36,1),filter .85s ease}
      #png-cutout-entry.motion-v2-exiting .motion-v2-earth-freeze{filter:brightness(1.06)}
      @media(prefers-reduced-motion:reduce){
        #png-cutout-entry .globe-canvas,#png-cutout-entry .planet-function-layer{transition-duration:.35s}
        #png-cutout-entry .function-planet{transition:none!important}
      }
    `
    document.head.appendChild(style)

    let width = Math.max(1, innerWidth)
    let height = Math.max(1, innerHeight)
    let pointerNX = 0
    let pointerNY = 0
    let targetNX = 0
    let targetNY = 0
    let earthOffsetX = 0
    let earthOffsetY = 0
    let fastNX = 0
    let fastNY = 0
    let exitAt = 0
    let raf = 0
    let last = performance.now()
    let nativeRelease = false
    let freeze = null

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const smoothstep = (a, b, x) => {
      const t = clamp((x - a) / Math.max(.0001, b - a), 0, 1)
      return t * t * (3 - 2 * t)
    }

    const planetBase = [
      {x:-34,y:-4,ax:1,ay:2,cycle:17,phase:.2},
      {x:31,y:-11,ax:1.5,ay:3,cycle:21,phase:1.2},
      {x:-43,y:18,ax:1.5,ay:3,cycle:19,phase:2.1},
      {x:42,y:18,ax:2,ay:4,cycle:25,phase:2.9},
      {x:-50,y:-20,ax:1.5,ay:3,cycle:27,phase:3.8},
      {x:51,y:-25,ax:1,ay:2.5,cycle:23,phase:4.6},
      {x:-55,y:34,ax:1,ay:3,cycle:29,phase:5.2},
      {x:54,y:36,ax:.8,ay:2,cycle:31,phase:5.8},
    ]
    const planets = [...entry.querySelectorAll('.function-planet')]
    const orbits = [...entry.querySelectorAll('.function-orbit')]

    function resize(){
      width = Math.max(1, innerWidth)
      height = Math.max(1, innerHeight)
    }

    function onMove(e){
      targetNX = clamp((e.clientX / width - .5) * 2, -1, 1)
      targetNY = clamp((e.clientY / height - .5) * 2, -1, 1)
    }

    function onLeave(){
      targetNX = 0
      targetNY = 0
    }

    function freezeEarth(){
      if (freeze || !globe.isConnected) return
      try {
        freeze = document.createElement('canvas')
        freeze.className = 'motion-v2-earth-freeze'
        freeze.width = globe.width
        freeze.height = globe.height
        const c = freeze.getContext('2d')
        c.drawImage(globe, 0, 0)
        freeze.style.transform = globe.style.transform
        freeze.style.translate = globe.style.translate || '0px 0px'
        freeze.style.transformOrigin = getComputedStyle(globe).transformOrigin
        const vignette = entry.querySelector('.entry-vignette')
        entry.insertBefore(freeze, vignette || ui || null)
        globe.style.visibility = 'hidden'
      } catch {}
    }

    function beginV2Exit(){
      if (exitAt) return
      exitAt = performance.now()
      freezeEarth()
      entry.classList.add('motion-v2-exiting')
      if (reduced) {
        setTimeout(() => {
          nativeRelease = true
          enter.click()
          nativeRelease = false
        }, 80)
      } else {
        setTimeout(() => {
          nativeRelease = true
          enter.click()
          nativeRelease = false
        }, 450)
      }
    }

    function onPointerUpCapture(e){
      if (nativeRelease) return
      const button = e.target.closest?.('button')
      if (button) return
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      beginV2Exit()
    }

    function onClickCapture(e){
      if (nativeRelease) return
      const targetEnter = e.target.closest?.('.entry-enter,.earth-function')
      if (!targetEnter) return
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      beginV2Exit()
    }

    function onKeyCapture(e){
      if (nativeRelease || e.key === 'Escape') return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        beginV2Exit()
      }
    }

    function frame(time){
      if (!entry.isConnected) {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        entry.removeEventListener('pointermove', onMove, true)
        entry.removeEventListener('pointerleave', onLeave, true)
        entry.removeEventListener('pointerup', onPointerUpCapture, true)
        entry.removeEventListener('click', onClickCapture, true)
        entry.removeEventListener('keydown', onKeyCapture, true)
        style.remove()
        return
      }

      const dt = Math.min(.033, Math.max(.001, (time - last) / 1000))
      last = time

      // Match the original fast centre shift, then counter it so the visible Earth follows our slower rhythm.
      fastNX += (targetNX - fastNX) * (reduced ? .025 : .072)
      fastNY += (targetNY - fastNY) * (reduced ? .025 : .072)
      pointerNX += (targetNX - pointerNX) * (reduced ? .018 : .028)
      pointerNY += (targetNY - pointerNY) * (reduced ? .018 : .028)

      const pointerScaleX = mobile ? 8 : 18
      const pointerScaleY = mobile ? 5 : 10
      earthOffsetX += (pointerNX * pointerScaleX - earthOffsetX) * (reduced ? .02 : .028)
      earthOffsetY += (pointerNY * pointerScaleY - earthOffsetY) * (reduced ? .02 : .028)

      const floatStrength = reduced ? 0 : 1
      const floatX = (Math.sin(time * .00018) * 4 + Math.sin(time * .000073 + 1.4) * 2) * floatStrength
      const floatY = (Math.sin(time * .00022 + .8) * 5 + Math.sin(time * .000091) * 2) * floatStrength
      const compensationX = -fastNX * (mobile ? 7 : 15)
      const compensationY = -fastNY * (mobile ? 5 : 10)
      const movementFactor = exitAt ? 1 - smoothstep(0, .55, (time - exitAt) / 1950) * .72 : 1
      const earthX = (earthOffsetX + floatX + compensationX) * movementFactor
      const earthY = (earthOffsetY + floatY + compensationY) * movementFactor

      if (!exitAt) globe.style.translate = `${earthX.toFixed(2)}px ${earthY.toFixed(2)}px`

      // Depth hierarchy: Earth 100%, Moon 20%, orbit 7%, Sun 4%.
      if (moon) moon.style.translate = `${(earthX * .20).toFixed(2)}px ${(earthY * .12).toFixed(2)}px`
      if (moonOrbit) moonOrbit.style.translate = `${(earthX * .07).toFixed(2)}px ${(earthY * .05).toFixed(2)}px`
      if (sun) sun.style.translate = `${(earthX * .04).toFixed(2)}px ${(earthY * .03).toFixed(2)}px`

      // Small, independent amplitudes create a synchronized swimming rhythm instead of obvious orbiting.
      if (!reduced) {
        planets.forEach((p, i) => {
          const d = planetBase[i]
          if (!d) return
          const phase = time / 1000 / d.cycle * Math.PI * 2 + d.phase
          const slow = exitAt ? Math.max(.2, 1 - smoothstep(0, .44, (time - exitAt) / 1950) * .8) : 1
          const dx = Math.cos(phase * .63) * d.ax * slow
          const dy = Math.sin(phase) * d.ay * slow
          p.style.setProperty('--x', `${(d.x + dx / width * 100).toFixed(4)}vw`)
          p.style.setProperty('--y', `${(d.y + dy / height * 100).toFixed(4)}vh`)
        })
        orbits.forEach((o, i) => {
          const a = .78 + Math.sin(time * .00011 + i * 1.7) * .12
          o.style.opacity = `${a.toFixed(3)}`
        })
      }

      if (exitAt) {
        const p = clamp((time - exitAt) / (reduced ? 360 : 1950), 0, 1)
        const planetsFade = 1 - smoothstep(.20, .76, p)
        const celestialFade = 1 - smoothstep(.34, .82, p)
        const earthFade = 1 - smoothstep(.48, .94, p)
        const starsFade = 1 - smoothstep(.58, 1, p) * .82

        if (planetLayer) planetLayer.style.opacity = `${planetsFade.toFixed(3)}`
        if (moon) moon.style.opacity = `${celestialFade.toFixed(3)}`
        if (moonOrbit) moonOrbit.style.opacity = `${(celestialFade * .85).toFixed(3)}`
        if (sun) sun.style.opacity = `${(celestialFade * .82).toFixed(3)}`
        if (space) space.style.opacity = `${starsFade.toFixed(3)}`
        if (freeze) {
          freeze.style.opacity = `${earthFade.toFixed(3)}`
          const settleX = earthX * (1 - smoothstep(.1, .65, p))
          const settleY = earthY * (1 - smoothstep(.1, .65, p))
          freeze.style.translate = `${settleX.toFixed(2)}px ${settleY.toFixed(2)}px`
        }
      }

      raf = requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove', onMove, true)
    entry.addEventListener('pointerleave', onLeave, true)
    entry.addEventListener('pointerup', onPointerUpCapture, true)
    entry.addEventListener('click', onClickCapture, true)
    entry.addEventListener('keydown', onKeyCapture, true)
    window.addEventListener('resize', resize, {passive:true})

    requestAnimationFrame(() => entry.classList.add('motion-v2-ready'))
    raf = requestAnimationFrame(frame)
  }
}
