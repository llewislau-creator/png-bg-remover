const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('intro-v4-style')) {
  const sourceWhale = entry.querySelector('.whale-art')
  const enterButton = entry.querySelector('.entry-enter')
  if (sourceWhale && enterButton) {
    const mobile = window.matchMedia('(max-width: 700px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5)

    const style = document.createElement('style')
    style.id = 'intro-v4-style'
    style.textContent = `
      #png-cutout-entry .globe-canvas{opacity:0!important}
      #png-cutout-entry .whale-art-layer .whale-art,
      #png-cutout-entry .whale-art-layer .whale-fx-canvas,
      #png-cutout-entry .whale-art-layer .whale-caption,
      #png-cutout-entry .award-fx,
      #png-cutout-entry .award-lens,
      #png-cutout-entry .award-axis,
      #png-cutout-entry .award-scene-label{opacity:0!important;visibility:hidden!important}
      #png-cutout-entry .v4-earth-canvas{position:absolute;inset:0;z-index:5;width:100%;height:100%;pointer-events:none}
      #png-cutout-entry .v4-whale{position:absolute;z-index:7;left:50%;top:59%;pointer-events:none;mix-blend-mode:screen;transform-origin:50% 48%;will-change:transform,opacity,filter;opacity:0;transition:opacity 2.1s cubic-bezier(.22,1,.36,1) 1.05s;filter:contrast(1.08) brightness(.98) drop-shadow(0 0 12px rgba(255,255,255,.08));-webkit-mask-image:radial-gradient(ellipse 68% 78% at 50% 50%,#000 54%,rgba(0,0,0,.96) 69%,transparent 100%);mask-image:radial-gradient(ellipse 68% 78% at 50% 50%,#000 54%,rgba(0,0,0,.96) 69%,transparent 100%)}
      #png-cutout-entry.is-ready .v4-whale{opacity:.88}
      #png-cutout-entry .v4-whale-base,#png-cutout-entry .v4-whale-seg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none}
      #png-cutout-entry .v4-whale-base{opacity:.20;filter:blur(.25px)}
      #png-cutout-entry .v4-whale-seg{opacity:.88;will-change:transform}
      #png-cutout-entry .v4-fx{position:absolute;inset:0;z-index:8;width:100%;height:100%;pointer-events:none}
      #png-cutout-entry .v4-caption{position:absolute;left:50%;top:84.8%;z-index:10;transform:translateX(-50%);font:6px/1.4 "SFMono-Regular",Consolas,monospace;letter-spacing:.19em;text-transform:uppercase;color:rgba(255,255,255,.24);pointer-events:none;opacity:0;transition:opacity 1.6s ease 2s;white-space:nowrap}
      #png-cutout-entry.is-ready .v4-caption{opacity:1}
      #png-cutout-entry .v4-caption:before{content:"";display:inline-block;width:24px;height:1px;margin:0 10px 2px 0;background:linear-gradient(90deg,transparent,rgba(183,255,42,.52))}
      #png-cutout-entry .entry-enter{transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1)!important}
      #png-cutout-entry.v4-prelude .entry-enter{opacity:0!important;transform:translateX(-50%) translateY(8px)!important;pointer-events:none!important}
      #png-cutout-entry.v4-prelude .entry-left-meta,#png-cutout-entry.v4-prelude .entry-top-meta,#png-cutout-entry.v4-prelude .system-zoom-hint{opacity:.12!important;transition:opacity .5s ease!important}
      @media(max-width:980px){#png-cutout-entry .v4-whale{top:60%}}
      @media(max-width:700px){#png-cutout-entry .v4-whale{top:60.5%}#png-cutout-entry .v4-caption{top:82.5%;font-size:5.5px;letter-spacing:.15em}}
      @media(prefers-reduced-motion:reduce){#png-cutout-entry .v4-whale,#png-cutout-entry .v4-caption{transition-duration:.3s}}
    `
    document.head.appendChild(style)

    const earthCanvas = document.createElement('canvas')
    earthCanvas.className = 'v4-earth-canvas'
    earthCanvas.setAttribute('aria-hidden', 'true')
    const fxCanvas = document.createElement('canvas')
    fxCanvas.className = 'v4-fx'
    fxCanvas.setAttribute('aria-hidden', 'true')
    const whaleWrap = document.createElement('div')
    whaleWrap.className = 'v4-whale'
    whaleWrap.setAttribute('aria-hidden', 'true')
    const caption = document.createElement('div')
    caption.className = 'v4-caption'
    caption.textContent = 'CELESTIAL GUIDE · EARTH FIELD'

    const baseImg = sourceWhale.cloneNode(false)
    baseImg.removeAttribute('class')
    baseImg.className = 'v4-whale-base'
    whaleWrap.appendChild(baseImg)

    const bands = [[0,17],[15,34],[32,52],[50,71],[69,87],[85,100]]
    const segs = bands.map(([a,b], i) => {
      const img = sourceWhale.cloneNode(false)
      img.removeAttribute('class')
      img.className = 'v4-whale-seg'
      img.dataset.band = String(i)
      img.style.clipPath = `inset(${a}% 0 ${100-b}% 0)`
      img.style.webkitClipPath = `inset(${a}% 0 ${100-b}% 0)`
      whaleWrap.appendChild(img)
      return img
    })

    const systemLayer = entry.querySelector('.entry-system-layer')
    entry.insertBefore(earthCanvas, systemLayer || entry.querySelector('.entry-ui'))
    entry.insertBefore(whaleWrap, systemLayer || entry.querySelector('.entry-ui'))
    entry.insertBefore(fxCanvas, systemLayer || entry.querySelector('.entry-ui'))
    entry.insertBefore(caption, entry.querySelector('.entry-ui') || null)

    const ectx = earthCanvas.getContext('2d')
    const fctx = fxCanvas.getContext('2d')
    let width = Math.max(1, innerWidth)
    let height = Math.max(1, innerHeight)
    let pointerX = width * .5
    let pointerY = height * .5
    let nx = 0
    let ny = 0
    let targetNx = 0
    let targetNy = 0
    let raf = 0
    let last = performance.now()
    let preludeAt = 0
    let releasing = false
    let releaseTimer = 0
    const startedAt = performance.now()

    const clamp = (v,a,b)=>Math.max(a,Math.min(b,v))
    const smoothstep=(a,b,x)=>{const t=clamp((x-a)/Math.max(.0001,b-a),0,1);return t*t*(3-2*t)}
    const easeInOut=t=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    const hash=n=>{const x=Math.sin(n*91.173+8.17)*43758.5453;return x-Math.floor(x)}

    const continents = [
      [[-168,72],[-145,70],[-128,58],[-122,50],[-108,48],[-94,52],[-78,50],[-60,44],[-66,31],[-82,24],[-97,16],[-112,24],[-124,38],[-135,53]],
      [[-81,12],[-69,10],[-57,8],[-44,-2],[-35,-18],[-46,-38],[-54,-55],[-66,-50],[-72,-35],[-78,-18]],
      [[-11,70],[12,72],[32,68],[43,58],[35,49],[25,43],[10,36],[-7,42],[-11,55]],
      [[-18,36],[2,38],[24,36],[42,31],[52,12],[44,-12],[34,-32],[18,-36],[3,-28],[-7,-8],[-16,12]],
      [[32,72],[63,78],[104,79],[142,72],[171,61],[160,43],[142,31],[123,17],[103,6],[80,9],[62,20],[47,38],[36,55]],
      [[111,-11],[126,-10],[145,-12],[155,-24],[151,-39],[132,-44],[115,-36],[108,-23]],
      [[-180,-69],[-120,-72],[-60,-70],[0,-74],[60,-70],[120,-72],[180,-69],[180,-86],[-180,-86]],
    ]

    function pointInPoly(lon,lat,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];const hit=((yi>lat)!=(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-9)+xi);if(hit)inside=!inside}return inside}
    function isLand(lon,lat){for(const p of continents)if(pointInPoly(lon,lat,p))return true;return false}
    const lights=[]
    for(let i=0;i<210;i++){
      const lon=-180+hash(i*3.17)*360
      const lat=-70+hash(i*5.73)*145
      if(isLand(lon,lat)) lights.push({lon,lat,a:.12+hash(i*9.21)*.36,s:.35+hash(i*11.4)*.9,g:hash(i*17.7)>.96})
      if(lights.length>90) break
    }

    function resize(){
      width=Math.max(1,innerWidth);height=Math.max(1,innerHeight)
      for(const c of [earthCanvas,fxCanvas]){c.width=Math.floor(width*DPR);c.height=Math.floor(height*DPR);c.style.width=`${width}px`;c.style.height=`${height}px`}
      ectx.setTransform(DPR,0,0,DPR,0,0);fctx.setTransform(DPR,0,0,DPR,0,0)
    }

    function project(lon,lat,cx,cy,r,rot){
      const la=lat*Math.PI/180,lo=(lon+rot)*Math.PI/180,c=Math.cos(la)
      const x=c*Math.sin(lo),y=-Math.sin(la),z=c*Math.cos(lo)
      return {x:cx+x*r,y:cy+y*r,z}
    }

    function drawEarth(time,state,preludeP){
      const cx=state.earthX||width*.5,cy=state.earthY||height*.325,r=(state.earthRadius||Math.min(width,height)*.26)*.96
      const rot=-18+(time-startedAt)*.0015
      ectx.clearRect(0,0,width,height)
      ectx.save()
      ectx.translate(0,-preludeP*r*.025)

      const aura=ectx.createRadialGradient(cx-r*.28,cy-r*.34,r*.08,cx,cy,r*1.18)
      aura.addColorStop(0,'rgba(18,34,22,.18)')
      aura.addColorStop(.58,'rgba(6,13,8,.72)')
      aura.addColorStop(.86,'rgba(0,0,0,.96)')
      aura.addColorStop(1,'rgba(0,0,0,0)')
      ectx.fillStyle=aura;ectx.beginPath();ectx.arc(cx,cy,r*1.12,0,Math.PI*2);ectx.fill()

      const sphere=ectx.createRadialGradient(cx-r*.34,cy-r*.36,r*.05,cx,cy,r)
      sphere.addColorStop(0,'rgba(16,29,19,.98)')
      sphere.addColorStop(.46,'rgba(5,10,6,1)')
      sphere.addColorStop(.82,'rgba(1,3,2,1)')
      sphere.addColorStop(1,'rgba(0,0,0,1)')
      ectx.fillStyle=sphere;ectx.beginPath();ectx.arc(cx,cy,r,0,Math.PI*2);ectx.fill()

      ectx.save();ectx.beginPath();ectx.arc(cx,cy,r*.995,0,Math.PI*2);ectx.clip()
      for(let k=0;k<continents.length;k++){
        const poly=continents[k],pts=poly.map(([lon,lat])=>project(lon,lat,cx,cy,r,rot))
        const front=pts.reduce((s,p)=>s+p.z,0)/pts.length
        if(front<-.18) continue
        ectx.beginPath();let started=false
        for(const p of pts){if(p.z<-.28)continue;if(!started){ectx.moveTo(p.x,p.y);started=true}else ectx.lineTo(p.x,p.y)}
        if(!started)continue
        ectx.closePath()
        ectx.fillStyle=`rgba(17,42,24,${.10+Math.max(0,front)*.06})`;ectx.fill()
        ectx.strokeStyle=`rgba(235,255,239,${.20+Math.max(0,front)*.34+preludeP*.10})`;ectx.lineWidth=.7;ectx.stroke()
      }
      for(const p of lights){const q=project(p.lon,p.lat,cx,cy,r,rot);if(q.z<.04)continue;const a=p.a*(.25+q.z*.75)*(1+preludeP*.7);ectx.beginPath();ectx.fillStyle=p.g?`rgba(183,255,42,${a*.66})`:`rgba(255,255,255,${a})`;ectx.arc(q.x,q.y,p.s,0,Math.PI*2);ectx.fill()}
      ectx.restore()

      ectx.beginPath();ectx.arc(cx,cy,r*1.003,0,Math.PI*2)
      ectx.strokeStyle=`rgba(255,255,255,${.18+preludeP*.22})`;ectx.lineWidth=.65
      ectx.shadowColor='rgba(183,255,42,.20)';ectx.shadowBlur=10+preludeP*14;ectx.stroke();ectx.shadowBlur=0

      ectx.beginPath();ectx.arc(cx,cy,r*1.055,Math.PI*1.12,Math.PI*1.72)
      ectx.strokeStyle=`rgba(183,255,42,${.12+preludeP*.14})`;ectx.lineWidth=.65;ectx.stroke()
      ectx.restore()
    }

    function beginPrelude(){
      if(releasing||preludeAt) return
      preludeAt=performance.now();entry.classList.add('v4-prelude')
      clearTimeout(releaseTimer)
      releaseTimer=setTimeout(()=>{releasing=true;enterButton.click()}, reduced?220:920)
    }

    function onPointerMove(e){pointerX=e.clientX;pointerY=e.clientY;targetNx=clamp((pointerX/width-.5)*2,-1,1);targetNy=clamp((pointerY/height-.5)*2,-1,1)}
    function onPointerUpCapture(e){if(releasing||e.target.closest('.entry-skip'))return;e.preventDefault();e.stopImmediatePropagation();beginPrelude()}
    function onClickCapture(e){if(releasing||e.target.closest('.entry-skip'))return;if(preludeAt||e.target.closest('.entry-enter')||e.target===entry){e.preventDefault();e.stopImmediatePropagation();beginPrelude()}}
    function onKeyCapture(e){if(releasing)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();beginPrelude()}}

    function drawFx(time,state,preludeP,whaleX,whaleY,whaleW){
      fctx.clearRect(0,0,width,height)
      const earthX=state.earthX||width*.5,earthY=state.earthY||height*.325,earthR=state.earthRadius||Math.min(width,height)*.26
      const portalY=height*(mobile?.735:.745)
      fctx.save()
      fctx.beginPath();fctx.moveTo(earthX,earthY+earthR*.55);fctx.bezierCurveTo(earthX,height*.46,whaleX,height*.61,whaleX,portalY)
      fctx.setLineDash([2,9]);fctx.strokeStyle=`rgba(255,255,255,${.038+preludeP*.05})`;fctx.lineWidth=.55;fctx.stroke();fctx.setLineDash([])

      for(let i=0;i<3;i++){
        const k=.70+i*.16+(preludeP*.10*i)
        fctx.beginPath();fctx.ellipse(whaleX,portalY,whaleW*k,whaleW*(.10+i*.025),-.03,Math.PI*.08,Math.PI*1.92)
        fctx.strokeStyle=`rgba(255,255,255,${.035+i*.025+preludeP*(.10-i*.02)})`;fctx.lineWidth=i===1?1:.55;fctx.stroke()
      }
      if(preludeP>0){
        const p=easeInOut(preludeP)
        const y=portalY+(earthY-portalY)*p
        fctx.beginPath();fctx.fillStyle=`rgba(255,255,255,${(1-p)*.72})`;fctx.shadowColor='rgba(183,255,42,.34)';fctx.shadowBlur=18;fctx.arc(whaleX,y,1.6+p*2.2,0,Math.PI*2);fctx.fill();fctx.shadowBlur=0
      }
      fctx.restore()
    }

    function frame(time){
      if(!entry.isConnected){cancelAnimationFrame(raf);clearTimeout(releaseTimer);style.remove();return}
      const dt=Math.min(.033,Math.max(.001,(time-last)/1000));last=time
      nx+=(targetNx-nx)*(reduced?.025:.045);ny+=(targetNy-ny)*(reduced?.025:.045)
      const state=entry.__cosmicState||{}
      const preludeP=preludeAt?clamp((time-preludeAt)/(reduced?220:920),0,1):0
      drawEarth(time,state,preludeP)

      const whaleW=Math.min(width*(mobile?.56:width<980?.40:.31),mobile?305:360)
      const ratio=(sourceWhale.naturalWidth&&sourceWhale.naturalHeight)?sourceWhale.naturalHeight/sourceWhale.naturalWidth:1.28
      const whaleH=whaleW*ratio*.82
      const whaleX=width*.5+nx*(mobile?9:20)+Math.sin(time*.00022)*5
      const whaleY=height*(mobile?.595:.585)+ny*(mobile?5:10)-easeInOut(preludeP)*(mobile?22:42)
      const zoom=state.zoom||1
      const wholeScale=(1+(zoom-1)*.12)*(1+preludeP*.028)
      const wholeRot=-3.5+nx*1.5-preludeP*3
      whaleWrap.style.width=`${whaleW}px`;whaleWrap.style.height=`${whaleH}px`;whaleWrap.style.left=`${whaleX}px`;whaleWrap.style.top=`${whaleY}px`
      whaleWrap.style.transform=`translate(-50%,-50%) rotate(${wholeRot.toFixed(2)}deg) scale(${wholeScale.toFixed(4)})`
      whaleWrap.style.filter=`contrast(${(1.08+preludeP*.07).toFixed(3)}) brightness(${(.98+preludeP*.12).toFixed(3)}) drop-shadow(0 0 ${(12+preludeP*15).toFixed(1)}px rgba(255,255,255,${(.08+preludeP*.08).toFixed(3)}))`

      for(let i=0;i<segs.length;i++){
        const weight=i/Math.max(1,segs.length-1)
        const phase=time*.00115-i*.48
        const wave=reduced?0:Math.sin(phase)*weight*(1.8+weight*3.3)
        const lift=reduced?0:Math.cos(phase*.83)*weight*1.3
        const bend=(reduced?0:Math.sin(phase+.7)*weight*.42)+(preludeP*weight*.75)
        segs[i].style.transform=`translate3d(${wave.toFixed(2)}px,${lift.toFixed(2)}px,0) rotate(${bend.toFixed(3)}deg)`
      }
      baseImg.style.transform=`translate3d(${(nx*1.5).toFixed(2)}px,0,0)`
      caption.style.opacity=`${entry.classList.contains('is-ready')?(1-preludeP)*.9:0}`
      drawFx(time,state,preludeP,whaleX,whaleY,whaleW)
      raf=requestAnimationFrame(frame)
    }

    entry.addEventListener('pointermove',onPointerMove,{passive:true})
    entry.addEventListener('pointerup',onPointerUpCapture,true)
    entry.addEventListener('click',onClickCapture,true)
    entry.addEventListener('keydown',onKeyCapture,true)
    window.addEventListener('resize',resize,{passive:true})
    resize();raf=requestAnimationFrame(frame)
  }
}
