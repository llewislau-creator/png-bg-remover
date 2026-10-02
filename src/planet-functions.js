const entry = document.getElementById('png-cutout-entry')

if (entry && !document.getElementById('planet-function-style')) {
  const style = document.createElement('style')
  style.id = 'planet-function-style'
  style.textContent = `
    #png-cutout-entry .planet-function-layer{position:absolute;inset:0;z-index:10;pointer-events:none;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
    #png-cutout-entry .function-orbit{position:absolute;left:50%;top:46%;border:1px solid rgba(255,255,255,.055);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}
    #png-cutout-entry .function-orbit:nth-child(1){width:min(74vw,930px);height:min(28vw,350px)}
    #png-cutout-entry .function-orbit:nth-child(2){width:min(88vw,1120px);height:min(38vw,470px);border-color:rgba(183,255,42,.045)}
    #png-cutout-entry .function-orbit:nth-child(3){width:min(104vw,1320px);height:min(48vw,590px)}
    #png-cutout-entry .function-planet{position:absolute;left:50%;top:50%;width:var(--size);height:var(--size);margin-left:calc(var(--size) / -2);margin-top:calc(var(--size) / -2);border-radius:50%;border:1px solid rgba(255,255,255,.20);background:radial-gradient(circle at 34% 30%,rgba(255,255,255,.26),rgba(255,255,255,.075) 34%,rgba(255,255,255,.018) 68%,rgba(0,0,0,.16) 72%);box-shadow:0 0 20px rgba(255,255,255,.035);pointer-events:auto;cursor:pointer;transform:translate3d(var(--x),var(--y),0);transition:border-color .28s ease,box-shadow .28s ease,transform .5s cubic-bezier(.22,1,.36,1),opacity .35s ease;will-change:transform}
    #png-cutout-entry .function-planet:before{content:"";position:absolute;inset:-8px;border:1px solid transparent;border-radius:50%;transition:border-color .28s ease}
    #png-cutout-entry .function-planet[data-status="active"]{border-color:rgba(183,255,42,.40);box-shadow:0 0 0 1px rgba(183,255,42,.05),0 0 22px rgba(183,255,42,.055)}
    #png-cutout-entry .function-planet[data-status="future"]{opacity:.48;cursor:default}
    #png-cutout-entry .function-planet:hover[data-status="active"],#png-cutout-entry .function-planet:focus-visible[data-status="active"]{border-color:#b7ff2a;box-shadow:0 0 0 1px rgba(183,255,42,.10),0 0 30px rgba(183,255,42,.10);outline:none}
    #png-cutout-entry .function-planet:hover[data-status="active"]:before,#png-cutout-entry .function-planet:focus-visible[data-status="active"]:before{border-color:rgba(183,255,42,.18)}
    #png-cutout-entry .function-planet .planet-label{position:absolute;left:50%;top:calc(100% + 10px);transform:translateX(-50%);display:grid;gap:3px;width:max-content;max-width:170px;text-align:center;white-space:nowrap;pointer-events:none;text-transform:uppercase}
    #png-cutout-entry .function-planet .planet-label b{font-size:7px;line-height:1;color:rgba(255,255,255,.88);font-weight:600;letter-spacing:.14em}
    #png-cutout-entry .function-planet .planet-label span{font-size:6px;line-height:1.25;color:rgba(255,255,255,.32);letter-spacing:.11em}
    #png-cutout-entry .function-planet[data-status="active"] .planet-label span{color:rgba(183,255,42,.55)}
    #png-cutout-entry .earth-function{position:absolute;left:50%;top:32.5%;width:min(26vw,270px);height:min(26vw,270px);transform:translate(-50%,-50%);border:0;background:transparent;border-radius:50%;pointer-events:auto;cursor:pointer}
    #png-cutout-entry .earth-function:focus-visible{outline:1px solid #b7ff2a;outline-offset:8px}
    #png-cutout-entry .earth-function-label{position:absolute;left:50%;top:calc(100% + 8px);transform:translateX(-50%);display:grid;gap:4px;white-space:nowrap;text-transform:uppercase;text-align:center}
    #png-cutout-entry .earth-function-label b{font-size:8px;letter-spacing:.16em;font-weight:600;color:#fff}
    #png-cutout-entry .earth-function-label span{font-size:6px;letter-spacing:.12em;color:rgba(183,255,42,.62)}
    #png-cutout-entry .function-panel{position:absolute;left:28px;top:50%;transform:translateY(-50%);width:min(300px,32vw);padding:14px 14px 13px;border:1px solid rgba(255,255,255,.11);background:rgba(3,5,4,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);pointer-events:none;opacity:0;transition:opacity .3s ease,transform .3s ease;z-index:12}
    #png-cutout-entry .function-panel.is-open{opacity:1;transform:translateY(-50%) translateX(0)}
    #png-cutout-entry .function-panel small{display:block;margin-bottom:9px;color:rgba(183,255,42,.68);font-size:7px;letter-spacing:.15em;text-transform:uppercase}
    #png-cutout-entry .function-panel strong{display:block;margin-bottom:7px;color:#fff;font:600 13px/1.15 Arial,sans-serif;letter-spacing:-.01em}
    #png-cutout-entry .function-panel p{margin:0;color:rgba(255,255,255,.54);font-size:8px;line-height:1.65;letter-spacing:.015em}
    #png-cutout-entry .function-key{position:absolute;right:28px;bottom:72px;display:grid;gap:6px;text-align:right;pointer-events:none;text-transform:uppercase;color:rgba(255,255,255,.25);font-size:6px;letter-spacing:.13em}
    #png-cutout-entry .function-key b{font-weight:500;color:rgba(255,255,255,.62)}
    #png-cutout-entry .function-key i{display:inline-block;width:7px;height:7px;margin-right:6px;border:1px solid rgba(183,255,42,.48);border-radius:50%;vertical-align:-1px}
    #png-cutout-entry .entry-top-meta{right:124px!important}
    @media(max-width:980px){
      #png-cutout-entry .function-panel{left:18px;width:230px}
      #png-cutout-entry .earth-function{width:min(34vw,250px);height:min(34vw,250px)}
      #png-cutout-entry .function-planet .planet-label span{display:none}
    }
    @media(max-width:700px){
      #png-cutout-entry .planet-function-layer{z-index:9}
      #png-cutout-entry .function-orbit:nth-child(1){width:96vw;height:41vw}
      #png-cutout-entry .function-orbit:nth-child(2){width:118vw;height:57vw}
      #png-cutout-entry .function-orbit:nth-child(3){width:142vw;height:74vw}
      #png-cutout-entry .function-planet{--size:14px!important}
      #png-cutout-entry .function-planet .planet-label{display:none}
      #png-cutout-entry .earth-function{top:35%;width:54vw;height:54vw}
      #png-cutout-entry .earth-function-label{top:calc(100% + 4px)}
      #png-cutout-entry .function-panel{left:14px;right:14px;top:auto;bottom:112px;width:auto;transform:none}
      #png-cutout-entry .function-panel.is-open{transform:none}
      #png-cutout-entry .function-key{display:none}
    }
    @media(prefers-reduced-motion:reduce){#png-cutout-entry .function-planet{transition:none}}
  `
  document.head.appendChild(style)

  const functions = [
    { planet:'EARTH', title:'PNG CUTOUT', status:'active', desc:'上傳 JPG / PNG / WEBP 等圖片，移除背景並輸出透明 PNG。', earth:true },
    { planet:'MERCURY', title:'PANTONE MATCH', status:'active', desc:'上傳圖片後分析主色，作為 Pantone 色彩比對及設計參考。' },
    { planet:'VENUS', title:'PDF TARGET SIZE', status:'active', desc:'上傳多張 JPG / PNG，按需要控制輸出 PDF 的目標容量。' },
    { planet:'MARS', title:'PROMPT EXTRACTOR', status:'active', desc:'分析上傳圖片，整理可重用的詳細 Prompt，包括主體、構圖、材質、光線及顏色。' },
    { planet:'JUPITER', title:'FUTURE TOOL 05', status:'future', desc:'Reserved for the next design utility.' },
    { planet:'SATURN', title:'FUTURE TOOL 06', status:'future', desc:'Reserved for the next design utility.' },
    { planet:'URANUS', title:'FUTURE TOOL 07', status:'future', desc:'Reserved for the next design utility.' },
    { planet:'NEPTUNE', title:'FUTURE TOOL 08', status:'future', desc:'Reserved for the next design utility.' },
    { planet:'PLUTO', title:'FUTURE TOOL 09', status:'future', desc:'Reserved for the next design utility.' },
  ]

  const layer = document.createElement('div')
  layer.className = 'planet-function-layer'
  layer.innerHTML = `
    <div class="function-orbit"></div><div class="function-orbit"></div><div class="function-orbit"></div>
    <button class="earth-function" type="button" aria-label="Open PNG Cutout">
      <span class="earth-function-label"><b>01 / PNG CUTOUT</b><span>EARTH · OPEN TOOL</span></span>
    </button>
    <div class="function-panel" aria-live="polite"><small></small><strong></strong><p></p></div>
    <div class="function-key"><b>9 PLANETS / 9 DESIGN UTILITIES</b><span><i></i>01—04 CURRENT MODULES · 05—09 RESERVED</span></div>
  `

  const ui = entry.querySelector('.entry-ui')
  entry.insertBefore(layer, ui || null)
  const panel = layer.querySelector('.function-panel')
  const earthButton = layer.querySelector('.earth-function')

  const orbitDefs = [
    {x:-34,y:-4,size:17},{x:31,y:-11,size:20},{x:-43,y:18,size:18},{x:42,y:18,size:30},
    {x:-50,y:-20,size:27},{x:51,y:-25,size:21},{x:-55,y:34,size:19},{x:54,y:36,size:15},
  ]

  functions.slice(1).forEach((item,i)=>{
    const d = orbitDefs[i]
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'function-planet'
    btn.dataset.status = item.status
    btn.dataset.index = String(i+2).padStart(2,'0')
    btn.style.setProperty('--size', `${d.size}px`)
    btn.style.setProperty('--x', `${d.x}vw`)
    btn.style.setProperty('--y', `${d.y}vh`)
    btn.setAttribute('aria-label', `${item.planet}: ${item.title}`)
    btn.innerHTML = `<span class="planet-label"><b>${String(i+2).padStart(2,'0')} / ${item.title}</b><span>${item.planet} · ${item.status==='active'?'CURRENT':'RESERVED'}</span></span>`
    if(item.planet==='SATURN') btn.style.boxShadow = '0 0 0 6px rgba(255,255,255,.035),0 0 22px rgba(255,255,255,.035)'
    layer.appendChild(btn)
    btn.addEventListener('click', (e)=>{
      e.stopPropagation()
      showPanel(item, i+2)
    })
  })

  function showPanel(item,index){
    panel.querySelector('small').textContent = `${String(index).padStart(2,'0')} / ${item.planet} · ${item.status==='active'?'CURRENT MODULE':'RESERVED'}`
    panel.querySelector('strong').textContent = item.title
    panel.querySelector('p').textContent = item.desc
    panel.classList.add('is-open')
    clearTimeout(showPanel.t)
    showPanel.t = setTimeout(()=>panel.classList.remove('is-open'), 3600)
  }

  earthButton.addEventListener('click',(e)=>{
    e.stopPropagation()
    const enter = entry.querySelector('.entry-enter')
    if(enter) enter.click()
  })

  const topMeta = entry.querySelector('.entry-top-meta')
  if(topMeta) topMeta.textContent = 'SOLAR TOOL SYSTEM · 09 FUNCTION PLANETS'
  const enterSub = entry.querySelector('.entry-enter span')
  if(enterSub) enterSub.textContent = 'EARTH = PNG CUTOUT · EXPLORE THE ORBIT'

  let raf = 0
  const start = performance.now()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const planets = [...layer.querySelectorAll('.function-planet')]
  function frame(time){
    if(!entry.isConnected){cancelAnimationFrame(raf);style.remove();return}
    if(!reduced){
      const t=(time-start)*0.000035
      planets.forEach((p,i)=>{
        const d=orbitDefs[i]
        const amp=i%2===0?1.15:.85
        const x=d.x+Math.cos(t*(1+i*.07)+i)*amp
        const y=d.y+Math.sin(t*(.82+i*.05)+i*1.4)*amp*.55
        p.style.setProperty('--x',`${x.toFixed(2)}vw`)
        p.style.setProperty('--y',`${y.toFixed(2)}vh`)
      })
    }
    raf=requestAnimationFrame(frame)
  }
  raf=requestAnimationFrame(frame)
}
