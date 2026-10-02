const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('orbit-depth-style')) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = matchMedia('(max-width: 700px)').matches

  const style = document.createElement('style')
  style.id = 'orbit-depth-style'
  style.textContent = `
    #png-cutout-entry .orbit-depth-layer{
      position:absolute;inset:-8%;z-index:4;pointer-events:none;overflow:hidden;
      opacity:0;transition:opacity 2.8s cubic-bezier(.22,1,.36,1);
      will-change:transform,opacity;
      -webkit-mask-image:radial-gradient(circle at 50% 34%,transparent 0 16%,rgba(0,0,0,.12) 21%,#000 29% 100%);
      mask-image:radial-gradient(circle at 50% 34%,transparent 0 16%,rgba(0,0,0,.12) 21%,#000 29% 100%);
    }
    #png-cutout-entry.motion-v2-ready .orbit-depth-layer{opacity:1}
    #png-cutout-entry.motion-v2-exiting .orbit-depth-layer{opacity:0!important;transition:opacity 1.35s cubic-bezier(.22,1,.36,1)!important}
    #png-cutout-entry .orbit-depth-svg{width:100%;height:100%;display:block;overflow:visible}
    #png-cutout-entry .orbital-line{fill:none;vector-effect:non-scaling-stroke;stroke-linecap:round}
    #png-cutout-entry .orbital-line.o1{stroke:rgba(255,255,255,.090);stroke-width:.65;stroke-dasharray:2 13;animation:orbitDashA 76s linear infinite}
    #png-cutout-entry .orbital-line.o2{stroke:rgba(255,255,255,.055);stroke-width:.52;stroke-dasharray:86 18 8 22;animation:orbitDashB 104s linear infinite reverse}
    #png-cutout-entry .orbital-line.o3{stroke:rgba(183,255,42,.075);stroke-width:.56;stroke-dasharray:5 24 68 31;animation:orbitDashA 118s linear infinite}
    #png-cutout-entry .orbital-line.o4{stroke:rgba(255,255,255,.040);stroke-width:.48;stroke-dasharray:1 17;animation:orbitDashB 132s linear infinite}
    #png-cutout-entry .orbital-line.o5{stroke:rgba(255,255,255,.070);stroke-width:.58;stroke-dasharray:150 34 4 28;animation:orbitDashA 146s linear infinite reverse}
    #png-cutout-entry .orbital-line.o6{stroke:rgba(255,255,255,.032);stroke-width:.45;stroke-dasharray:3 26;animation:orbitDashB 164s linear infinite}
    #png-cutout-entry .orbit-node{fill:#fff;opacity:.22}
    #png-cutout-entry .orbit-node.acid{fill:#b7ff2a;opacity:.45;filter:drop-shadow(0 0 4px rgba(183,255,42,.22))}
    #png-cutout-entry .orbit-tick{stroke:rgba(255,255,255,.12);stroke-width:.55;vector-effect:non-scaling-stroke}
    #png-cutout-entry .orbit-faint{opacity:.75;animation:orbitBreath 11s ease-in-out infinite}
    #png-cutout-entry .orbit-faint.delay{animation-delay:-4.3s}
    @keyframes orbitDashA{to{stroke-dashoffset:-220}}
    @keyframes orbitDashB{to{stroke-dashoffset:180}}
    @keyframes orbitBreath{0%,100%{opacity:.55}50%{opacity:.9}}
    @media(max-width:700px){
      #png-cutout-entry .orbit-depth-layer{inset:-12%;-webkit-mask-image:radial-gradient(circle at 50% 36%,transparent 0 23%,rgba(0,0,0,.16) 29%,#000 39% 100%);mask-image:radial-gradient(circle at 50% 36%,transparent 0 23%,rgba(0,0,0,.16) 29%,#000 39% 100%)}
      #png-cutout-entry .orbital-line.o2,#png-cutout-entry .orbital-line.o4,#png-cutout-entry .orbit-tick:nth-of-type(n+5){display:none}
      #png-cutout-entry .orbital-line{opacity:.78}
    }
    @media(prefers-reduced-motion:reduce){
      #png-cutout-entry .orbital-line,#png-cutout-entry .orbit-faint{animation:none!important}
      #png-cutout-entry .orbit-depth-layer{transition-duration:.35s}
    }
  `
  document.head.appendChild(style)

  const layer = document.createElement('div')
  layer.className = 'orbit-depth-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.innerHTML = `
    <svg class="orbit-depth-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g class="orbit-faint">
        <ellipse class="orbital-line o1" cx="800" cy="390" rx="720" ry="238" transform="rotate(-8 800 390)"/>
        <ellipse class="orbital-line o2" cx="800" cy="410" rx="900" ry="300" transform="rotate(11 800 410)"/>
        <ellipse class="orbital-line o3" cx="800" cy="420" rx="1080" ry="385" transform="rotate(-18 800 420)"/>
      </g>
      <g class="orbit-faint delay">
        <ellipse class="orbital-line o4" cx="800" cy="405" rx="1240" ry="510" transform="rotate(6 800 405)"/>
        <ellipse class="orbital-line o5" cx="810" cy="395" rx="570" ry="670" transform="rotate(38 810 395)"/>
        <ellipse class="orbital-line o6" cx="790" cy="400" rx="690" ry="820" transform="rotate(-31 790 400)"/>
      </g>
      <g>
        <circle class="orbit-node" cx="1468" cy="292" r="1.35"/>
        <circle class="orbit-node acid" cx="1325" cy="665" r="1.65"/>
        <circle class="orbit-node" cx="238" cy="594" r="1.2"/>
        <circle class="orbit-node" cx="1160" cy="126" r="1.1"/>
        <circle class="orbit-node acid" cx="420" cy="182" r="1.25"/>
        <line class="orbit-tick" x1="1460" y1="283" x2="1477" y2="300"/>
        <line class="orbit-tick" x1="1313" y1="675" x2="1333" y2="656"/>
        <line class="orbit-tick" x1="228" y1="584" x2="246" y2="602"/>
        <line class="orbit-tick" x1="1152" y1="116" x2="1168" y2="135"/>
        <line class="orbit-tick" x1="410" y1="173" x2="428" y2="190"/>
      </g>
    </svg>
  `

  const globe = entry.querySelector('.globe-canvas')
  entry.insertBefore(layer, globe ? globe.nextSibling : entry.firstChild)

  let x = 0
  let y = 0
  let raf = 0
  let startedAt = performance.now()

  function frame(time) {
    if (!entry.isConnected) {
      cancelAnimationFrame(raf)
      style.remove()
      return
    }
    const state = entry.__cosmicState || {}
    const targetX = (state.nx || 0) * (mobile ? 3 : 7)
    const targetY = (state.ny || 0) * (mobile ? 2 : 4)
    x += (targetX - x) * (reduced ? .018 : .024)
    y += (targetY - y) * (reduced ? .018 : .024)
    const driftY = reduced ? 0 : Math.sin((time - startedAt) * .000105) * (mobile ? .6 : 1.2)
    layer.style.transform = `translate3d(${x.toFixed(2)}px,${(y + driftY).toFixed(2)}px,0)`
    raf = requestAnimationFrame(frame)
  }

  raf = requestAnimationFrame(frame)
}
