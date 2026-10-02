const INTRO_ID = 'png-cutout-entry'

if (!document.getElementById(INTRO_ID)) {
  const ACID = '#c9ff39'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const medium = !mobile && window.matchMedia('(max-width: 1200px)').matches
  const tier = mobile ? 'mobile' : medium ? 'medium' : 'desktop'
  const config = {
    desktop: { ocean: 760, landStep: 2.55, stars: 86, arcs: 4, nodes: 6 },
    medium: { ocean: 520, landStep: 3.35, stars: 58, arcs: 4, nodes: 5 },
    mobile: { ocean: 260, landStep: 5.3, stars: 34, arcs: 3, nodes: 4 },
  }[tier]

  const style = document.createElement('style')
  style.id = `${INTRO_ID}-style`
  style.textContent = `
    html.entry-locked,html.entry-locked body{overflow:hidden!important;background:#030504!important}
    html.entry-locked .shell{opacity:0;transform:translateY(12px);filter:blur(3px)}
    html.entry-locked.entry-reveal .shell{opacity:1;transform:translateY(0);filter:blur(0);transition:opacity .95s cubic-bezier(.22,1,.36,1),transform .95s cubic-bezier(.22,1,.36,1),filter .95s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}{position:fixed;inset:0;z-index:9999;overflow:hidden;background:#030504;color:#fff;cursor:crosshair;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Arial,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;opacity:1;filter:blur(0);transition:opacity .95s cubic-bezier(.22,1,.36,1),filter .95s cubic-bezier(.22,1,.36,1)}
    #${INTRO_ID}.is-leaving{opacity:0;filter:blur(7px);pointer-events:none}
    #${INTRO_ID} canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #${INTRO_ID} .entry-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 46%,rgba(201,255,57,.026) 0,rgba(201,255,57,.008) 22%,transparent 44%),radial-gradient(circle at 50% 48%,transparent 0 38%,rgba(0,0,0,.16) 64%,rgba(0,0,0,.82) 100%)}
    #${INTRO_ID} .entry-grain{position:absolute;inset:-12%;pointer-events:none;opacity:.038;background-image:radial-gradient(rgba(255,255,255,.40) .45px,transparent .62px);background-size:4px 4px;mix-blend-mode:screen;animation:entryGrain 13s steps(9) infinite}
    #${INTRO_ID} .entry-ui{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1.45s ease}
    #${INTRO_ID}.is-ready .entry-ui{opacity:1}
    #${INTRO_ID} .entry-brand{position:absolute;left:28px;top:24px;display:grid;gap:5px;text-transform:uppercase}
    #${INTRO_ID} .entry-brand strong{font:900 13px/1 Arial,sans-serif;letter-spacing:.06em;color:#fff}
    #${INTRO_ID} .entry-brand span,#${INTRO_ID} .entry-top-meta,#${INTRO_ID} .entry-left-meta,#${INTRO_ID} .entry-skip,#${INTRO_ID} .entry-enter{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;text-transform:uppercase}
    #${INTRO_ID} .entry-brand span{font-size:8px;line-height:1.4;letter-spacing:.13em;color:rgba(255,255,255,.42)}
    #${INTRO_ID} .entry-top-meta{position:absolute;right:104px;top:25px;display:flex;align-items:center;gap:10px;font-size:8px;letter-spacing:.12em;color:rgba(255,255,255,.28)}
    #${INTRO_ID} .entry-top-meta:before{content:"";width:30px;height:1px;background:rgba(255,255,255,.14)}
    #${INTRO_ID} .entry-left-meta{position:absolute;left:28px;bottom:26px;display:grid;gap:5px;font-size:8px;line-height:1.45;letter-spacing:.09em;color:rgba(255,255,255,.46)}
    #${INTRO_ID} .entry-left-meta b{font-weight:500;color:${ACID}}
    #${INTRO_ID} .entry-enter{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);display:grid;gap:6px;min-width:240px;border:0;background:transparent;color:#fff;text-align:center;pointer-events:auto;cursor:pointer;padding:11px 14px}
    #${INTRO_ID} .entry-enter strong{font-size:11px;line-height:1;letter-spacing:.17em;font-weight:600}
    #${INTRO_ID} .entry-enter span{font-size:7px;line-height:1.4;letter-spacing:.13em;color:rgba(255,255,255,.36)}
    #${INTRO_ID} .entry-enter:before{content:"";position:absolute;left:50%;top:0;width:38px;height:1px;transform:translateX(-50%);background:${ACID};box-shadow:0 0 12px rgba(201,255,57,.28);animation:entryPulseLine 4.8s ease-in-out infinite}
    #${INTRO_ID} .entry-enter:hover strong{color:${ACID}}
    #${INTRO_ID} .entry-enter:hover span{color:rgba(255,255,255,.66)}
    #${INTRO_ID} .entry-skip{position:absolute;right:28px;top:17px;border:1px solid rgba(255,255,255,.13);background:rgba(3,5,4,.36);color:rgba(255,255,255,.42);font-size:8px;letter-spacing:.12em;padding:8px 10px;pointer-events:auto;cursor:pointer}
    #${INTRO_ID} .entry-skip:hover{border-color:${ACID};color:${ACID}}
    #${INTRO_ID} .entry-click-ring{position:absolute;width:10px;height:10px;border:1px solid ${ACID};border-radius:50%;transform:translate(-50%,-50%) scale(.15);opacity:0;pointer-events:none;box-shadow:0 0 18px rgba(201,255,57,.18)}
    #${INTRO_ID} .entry-click-ring.go{animation:entryClick .78s cubic-bezier(.22,1,.36,1) forwards}
    @keyframes entryClick{0%{transform:translate(-50%,-50%) scale(.15);opacity:.9}100%{transform:translate(-50%,-50%) scale(30);opacity:0}}
    @keyframes entryPulseLine{0%,100%{opacity:.28;transform:translateX(-50%) scaleX(.62)}50%{opacity:.9;transform:translateX(-50%) scaleX(1.12)}}
    @keyframes entryGrain{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-1.2%,.8%,0)}40%{transform:translate3d(.8%,-.5%,0)}60%{transform:translate3d(-.6%,1%,0)}80%{transform:translate3d(1%,-.7%,0)}}
    @media(max-width:700px){#${INTRO_ID} .entry-brand{left:14px;top:14px}#${INTRO_ID} .entry-top-meta{display:none}#${INTRO_ID} .entry-skip{right:14px;top:10px}#${INTRO_ID} .entry-left-meta{left:14px;bottom:14px;gap:4px}#${INTRO_ID} .entry-left-meta span:nth-child(3),#${INTRO_ID} .entry-left-meta span:nth-child(4){display:none}#${INTRO_ID} .entry-enter{bottom:67px;min-width:205px}#${INTRO_ID} .entry-enter strong{font-size:10px}}
    @media(prefers-reduced-motion:reduce){#${INTRO_ID}{transition:opacity .28s linear,filter .28s linear}#${INTRO_ID} .entry-grain,#${INTRO_ID} .entry-enter:before{animation:none}html.entry-locked.entry-reveal .shell{transition:opacity .3s linear}}
  `
  document.head.appendChild(style)

  document.documentElement.classList.add('entry-locked')
  const entry = document.createElement('div')
  entry.id = INTRO_ID
  entry.setAttribute('tabindex', '0')
  entry.setAttribute('aria-label', 'PNG Cutout opening screen')
  entry.innerHTML = `
    <canvas class="space-canvas" aria-hidden="true"></canvas>
    <canvas class="globe-canvas" aria-hidden="true"></canvas>
    <div class="entry-vignette" aria-hidden="true"></div>
    <div class="entry-grain" aria-hidden="true"></div>
    <div class="entry-ui">
      <div class="entry-brand"><strong>PNG / CUTOUT</strong><span>DESIGNER UTILITY</span></div>
      <div class="entry-top-meta">EARTH FIELD · 07 CONTINENTS</div>
      <div class="entry-left-meta"><span><b>●</b> LOCAL-FIRST</span><span>TRANSPARENT PNG</span><span>FREE CORE</span><span>FOR DESIGN WORKFLOWS</span></div>
      <button class="entry-enter" type="button"><strong>${mobile ? 'TAP TO ENTER' : 'CLICK TO ENTER'}</strong><span>MOVE THE EARTH · ENTER THE TOOL</span></button>
      <button class="entry-skip" type="button">SKIP</button>
    </div>
    <div class="entry-click-ring" aria-hidden="true"></div>
  `
  document.body.prepend(entry)

  const spaceCanvas = entry.querySelector('.space-canvas')
  const globeCanvas = entry.querySelector('.globe-canvas')
  const sctx = spaceCanvas.getContext('2d')
  const gctx = globeCanvas.getContext('2d')
  const enterButton = entry.querySelector('.entry-enter')
  const skipButton = entry.querySelector('.entry-skip')
  const clickRing = entry.querySelector('.entry-click-ring')
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75)

  const State = { ENTERING:'entering', IDLE:'idle', EXITING:'exiting', COMPLETE:'complete' }
  let phase = State.ENTERING
  let startedAt = performance.now()
  let exitStartedAt = 0
  let quickExit = false
  let raf = 0
  let lastFrame = startedAt
  let width = Math.max(1, window.innerWidth)
  let height = Math.max(1, window.innerHeight)
  let globeRadius = 1
  let rotX = -.12
  let rotY = -1.33
  let rotZ = .025

  const pointer = { x:width/2,y:height/2,targetX:width/2,targetY:height/2,lastX:width/2,lastY:height/2,vx:0,vy:0,speed:0,nx:0,ny:0 }
  const hash = (n) => { const x = Math.sin(n * 91.3458 + 12.17) * 47453.5453; return x - Math.floor(x) }
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v))
  const smoothstep = (a,b,x) => { const t = clamp((x-a)/Math.max(.0001,b-a),0,1); return t*t*(3-2*t) }
  const easeOut = (t) => 1-Math.pow(1-clamp(t,0,1),3)

  const stars = Array.from({length:config.stars},(_,i)=>({x:hash(i*1.73),y:hash(i*4.11),size:.35+hash(i*5.9)*1.05,alpha:.045+hash(i*2.7)*.13,phase:hash(i*7.1)*Math.PI*2,driftX:(hash(i*8.9)-.5)*.0023,driftY:(hash(i*10.3)-.5)*.0017,green:hash(i*12.7)>.91}))
  const orbitTemplates = [
    {cx:.50,cy:.47,rx:.55,ry:.17,rot:-.48,speed:.00095,alpha:.055,green:false},
    {cx:.49,cy:.47,rx:.44,ry:.29,rot:.38,speed:-.00072,alpha:.042,green:false},
    {cx:.53,cy:.45,rx:.67,ry:.34,rot:.11,speed:.00044,alpha:.034,green:true},
    {cx:.46,cy:.51,rx:.82,ry:.42,rot:-.18,speed:-.00028,alpha:.027,green:false},
  ].slice(0,config.arcs)
  const nodes = Array.from({length:config.nodes},(_,i)=>({orbit:i%orbitTemplates.length,angle:hash(i*9.7)*Math.PI*2,speed:(hash(i*3.4)>.5?1:-1)*(.014+hash(i*6.6)*.025),phase:hash(i*11.3)*Math.PI*2,free:i>=orbitTemplates.length,fx:hash(i*15.1),fy:hash(i*19.4)}))

  const continents = [
    {name:'NORTH AMERICA',label:[-104,46],poly:[[-168,72],[-145,70],[-128,58],[-122,50],[-108,48],[-94,52],[-78,50],[-60,44],[-66,31],[-82,24],[-97,16],[-112,24],[-124,38],[-135,53]]},
    {name:'SOUTH AMERICA',label:[-60,-17],poly:[[-81,12],[-69,10],[-57,8],[-44,-2],[-35,-18],[-46,-38],[-54,-55],[-66,-50],[-72,-35],[-78,-18]]},
    {name:'EUROPE',label:[16,52],poly:[[-11,70],[12,72],[32,68],[43,58],[35,49],[25,43],[10,36],[-7,42],[-11,55]]},
    {name:'AFRICA',label:[20,4],poly:[[-18,36],[2,38],[24,36],[42,31],[52,12],[44,-12],[34,-32],[18,-36],[3,-28],[-7,-8],[-16,12]]},
    {name:'ASIA',label:[92,43],poly:[[32,72],[63,78],[104,79],[142,72],[171,61],[160,43],[142,31],[123,17],[103,6],[80,9],[62,20],[47,38],[36,55]]},
    {name:'AUSTRALIA',label:[134,-27],poly:[[111,-11],[126,-10],[145,-12],[155,-24],[151,-39],[132,-44],[115,-36],[108,-23]]},
    {name:'ANTARCTICA',label:[0,-77],antarctica:true},
  ]

  function pointInPolygon(lon,lat,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];const hit=((yi>lat)!=(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-9)+xi);if(hit)inside=!inside}return inside}
  function continentFor(lon,lat){if(lat<-67)return continents[6];for(let i=0;i<6;i++)if(pointInPolygon(lon,lat,continents[i].poly))return continents[i];return null}
  function toSphere(lon,lat){const la=lat*Math.PI/180,lo=lon*Math.PI/180,c=Math.cos(la);return{x:c*Math.cos(lo),y:-Math.sin(la),z:c*Math.sin(lo)}}

  const oceanPoints = []
  const golden = Math.PI*(3-Math.sqrt(5))
  for(let i=0;i<config.ocean;i++){const y=1-(i/Math.max(1,config.ocean-1))*2,rr=Math.sqrt(Math.max(0,1-y*y)),theta=golden*i;oceanPoints.push({x:Math.cos(theta)*rr,y,z:Math.sin(theta)*rr,size:.32+hash(i*6.21)*.68,alpha:.12+hash(i*4.31)*.22,phase:hash(i*1.31)*Math.PI*2,scatterAngle:hash(i*12.13)*Math.PI*2,scatterSpeed:.65+hash(i*13.17)*1.55,entrance:.75+hash(i*15.9)*1.3})}

  const landPoints = []
  let landIndex=0
  for(let lat=-82;lat<=78;lat+=config.landStep){const lonStep=config.landStep/Math.max(.38,Math.cos(lat*Math.PI/180));for(let lon=-180;lon<180;lon+=lonStep){const c=continentFor(lon,lat);if(!c)continue;const jitterLon=(hash(landIndex*2.31)-.5)*config.landStep*.72,jitterLat=(hash(landIndex*4.17)-.5)*config.landStep*.58,p=toSphere(lon+jitterLon,lat+jitterLat);landPoints.push({...p,continent:c.name,size:.52+hash(landIndex*5.61)*.95,alpha:.58+hash(landIndex*3.47)*.4,accent:hash(landIndex*8.31)>.975,scatterAngle:hash(landIndex*12.13)*Math.PI*2,scatterSpeed:.7+hash(landIndex*13.17)*1.8,entrance:1.25+hash(landIndex*15.9)*1.65});landIndex++}}

  function resizeCanvas(canvas,ctx){canvas.width=Math.floor(width*DPR);canvas.height=Math.floor(height*DPR);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(DPR,0,0,DPR,0,0)}
  function resize(){width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);resizeCanvas(spaceCanvas,sctx);resizeCanvas(globeCanvas,gctx);globeRadius=Math.min(width,height)*(mobile?.235:medium?.25:.268);pointer.x=clamp(pointer.x,0,width);pointer.y=clamp(pointer.y,0,height);pointer.targetX=clamp(pointer.targetX,0,width);pointer.targetY=clamp(pointer.targetY,0,height)}
  function updatePointer(dt){const response=reduceMotion?.025:.072;pointer.x+=(pointer.targetX-pointer.x)*response;pointer.y+=(pointer.targetY-pointer.y)*response;pointer.vx=(pointer.x-pointer.lastX)/Math.max(.001,dt);pointer.vy=(pointer.y-pointer.lastY)/Math.max(.001,dt);pointer.lastX=pointer.x;pointer.lastY=pointer.y;const raw=Math.hypot(pointer.vx,pointer.vy);pointer.speed+=(Math.min(900,raw)-pointer.speed)*.08;pointer.nx=(pointer.x/width-.5)*2;pointer.ny=(pointer.y/height-.5)*2}
  function exitProgress(time){if(phase!==State.EXITING)return 0;const duration=quickExit||reduceMotion?400:1380;return clamp((time-exitStartedAt)/duration,0,1)}

  function drawSpace(timeMs){const t=timeMs*.001,age=(timeMs-startedAt)*.001,intro=smoothstep(.15,1.6,age),orbitIn=smoothstep(.8,2.7,age),exit=exitProgress(timeMs),fade=1-smoothstep(.18,.88,exit),px=reduceMotion?0:pointer.nx,py=reduceMotion?0:pointer.ny;sctx.clearRect(0,0,width,height);sctx.fillStyle='#030504';sctx.fillRect(0,0,width,height)
    for(const star of stars){const sx=((star.x+t*star.driftX)%1+1)%1,sy=((star.y+t*star.driftY)%1+1)%1,x=sx*width+px*2.2,y=sy*height+py*1.4,twinkle=reduceMotion?1:.9+Math.sin(t*.32+star.phase)*.1,a=star.alpha*twinkle*intro*fade;sctx.beginPath();sctx.fillStyle=star.green?`rgba(201,255,57,${a*.62})`:`rgba(255,255,255,${a})`;sctx.arc(x,y,star.size,0,Math.PI*2);sctx.fill()}
    const gx=px*4,gy=py*3,gridAlpha=.032*orbitIn*fade;sctx.save();sctx.translate(gx,gy);sctx.lineWidth=.5;sctx.strokeStyle=`rgba(255,255,255,${gridAlpha})`;sctx.fillStyle=`rgba(255,255,255,${gridAlpha*4})`;sctx.font='7px "SFMono-Regular",Consolas,monospace';sctx.textBaseline='middle';const horizontal=[height*.31,height*.72];for(const y of horizontal){sctx.beginPath();sctx.moveTo(0,y);sctx.lineTo(width,y);sctx.stroke();for(let x=28;x<width;x+=Math.max(68,width/15)){sctx.beginPath();sctx.moveTo(x,y-2.5);sctx.lineTo(x,y+2.5);sctx.stroke()}}const vx=width*.19;sctx.beginPath();sctx.moveTo(vx,0);sctx.lineTo(vx,height);sctx.stroke();sctx.fillText('EARTH FIELD 01',30,horizontal[0]-10);sctx.fillText('07 CONTINENTS',width*.74,horizontal[0]+10);sctx.fillText('LOCAL SIGNAL',vx+10,height*.18);sctx.restore()
    for(let i=0;i<orbitTemplates.length;i++){const o=orbitTemplates[i],cx=width*o.cx+px*9,cy=height*o.cy+py*6,rx=Math.max(width,height)*o.rx,ry=Math.min(width,height)*o.ry,rot=o.rot+(reduceMotion?0:t*o.speed);sctx.save();sctx.translate(cx,cy);sctx.rotate(rot);sctx.beginPath();sctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);sctx.strokeStyle=o.green?`rgba(201,255,57,${o.alpha*.62*orbitIn*fade})`:`rgba(255,255,255,${o.alpha*orbitIn*fade})`;sctx.lineWidth=i===0?.7:.5;sctx.stroke();sctx.restore()}
    for(let i=0;i<nodes.length;i++){const n=nodes[i];let x,y;if(n.free){x=n.fx*width+px*6;y=n.fy*height+py*4}else{const o=orbitTemplates[n.orbit],angle=n.angle+(reduceMotion?0:t*n.speed),rot=o.rot+(reduceMotion?0:t*o.speed),lx=Math.cos(angle)*Math.max(width,height)*o.rx,ly=Math.sin(angle)*Math.min(width,height)*o.ry,cr=Math.cos(rot),sr=Math.sin(rot);x=width*o.cx+lx*cr-ly*sr+px*9;y=height*o.cy+lx*sr+ly*cr+py*6}const pulse=reduceMotion?.66:.64+Math.sin(t*.72+n.phase)*.22,near=clamp(1-Math.hypot(x-pointer.x,y-pointer.y)/190,0,1),a=(.32+pulse*.34+near*.2)*orbitIn*fade;sctx.beginPath();sctx.fillStyle=`rgba(201,255,57,${a})`;sctx.arc(x,y,1.25+pulse*.55,0,Math.PI*2);sctx.fill();if(i<2){sctx.beginPath();sctx.strokeStyle=`rgba(201,255,57,${a*.13})`;sctx.lineWidth=.55;sctx.arc(x,y,5+pulse*2.5,0,Math.PI*2);sctx.stroke()}}
  }

  function updateRotation(t){const targetY=-1.33+(reduceMotion?0:pointer.nx*.17)+t*(reduceMotion?.0035:.012),targetX=-.12-(reduceMotion?0:pointer.ny*.09),targetZ=reduceMotion?.018:pointer.nx*.014;rotY+=(targetY-rotY)*.026;rotX+=(targetX-rotX)*.03;rotZ+=(targetZ-rotZ)*.022}
  function rotateXYZ(p){const cy=Math.cos(rotY),sy=Math.sin(rotY);let x=p.x*cy+p.z*sy,z=-p.x*sy+p.z*cy;const cx=Math.cos(rotX),sx=Math.sin(rotX);let y=p.y*cx-z*sx;z=p.y*sx+z*cx;const cz=Math.cos(rotZ),sz=Math.sin(rotZ);return[x*cz-y*sz,x*sz+y*cz,z]}
  function projectPoint(p,centerX,centerY,radius){const [x,y,z]=rotateXYZ(p),depth=clamp((z+1)*.5,0,1),projection=.845+depth*.17;return{x:centerX+x*radius*projection,y:centerY+y*radius*projection,z,depth}}

  function drawParticleSet(points,timeMs,centerX,centerY,radius,land=false){const age=(timeMs-startedAt)*.001,exit=exitProgress(timeMs),scatter=easeOut(exit),fade=1-smoothstep(.28,.96,exit),interactRadius=radius*(mobile?.34:.39);for(const p of points){const appear=smoothstep(p.entrance,p.entrance+(land?1.3:1.05),age),q=projectPoint(p,centerX,centerY,radius);let sx=q.x,sy=q.y;if(appear<1){const inv=1-appear;sx+=Math.cos(p.scatterAngle)*radius*inv*(1+p.scatterSpeed*.35);sy+=Math.sin(p.scatterAngle)*radius*inv*(1+p.scatterSpeed*.35)}if(!reduceMotion&&phase!==State.EXITING){const dx=sx-pointer.x,dy=sy-pointer.y,dist=Math.hypot(dx,dy);if(dist>1&&dist<interactRadius){const f=Math.pow(1-dist/interactRadius,2),force=f*(land?5.5:3.5);sx+=(dx/dist)*force;sy+=(dy/dist)*force}}if(scatter>0){const d=radius*p.scatterSpeed*1.38*scatter;sx+=Math.cos(p.scatterAngle)*d;sy+=Math.sin(p.scatterAngle)*d}const visibility=.14+q.depth*.86,alpha=p.alpha*visibility*appear*fade*(land?1:.72),size=p.size*(.62+q.depth*.72);gctx.beginPath();if(land)gctx.fillStyle=p.accent?`rgba(201,255,57,${alpha*.9})`:`rgba(255,255,255,${alpha})`;else gctx.fillStyle=`rgba(170,186,176,${alpha})`;gctx.arc(sx,sy,size,0,Math.PI*2);gctx.fill()}}

  function drawContinentLabels(timeMs,centerX,centerY,radius){const age=(timeMs-startedAt)*.001,exit=exitProgress(timeMs),labelIn=smoothstep(2.5,4.4,age),fade=(1-smoothstep(.12,.72,exit))*labelIn;if(fade<=.01)return;gctx.save();gctx.font=`${mobile?6:7}px "SFMono-Regular",Consolas,monospace`;gctx.textBaseline='middle';for(let i=0;i<continents.length;i++){const c=continents[i],p=toSphere(c.label[0],c.label[1]),q=projectPoint(p,centerX,centerY,radius);if(q.z<-.02)continue;const front=clamp((q.z+.05)/.45,0,1),a=fade*front*.62;if(a<.04)continue;gctx.beginPath();gctx.fillStyle=`rgba(201,255,57,${a*.9})`;gctx.arc(q.x,q.y,1.35,0,Math.PI*2);gctx.fill();gctx.strokeStyle=`rgba(201,255,57,${a*.34})`;gctx.lineWidth=.5;gctx.beginPath();gctx.moveTo(q.x+3,q.y);gctx.lineTo(q.x+10,q.y);gctx.stroke();gctx.fillStyle=`rgba(255,255,255,${a})`;gctx.fillText(c.name,q.x+13,q.y+.5)}gctx.restore()}

  function drawGlobe(timeMs){const t=timeMs*.001,age=(timeMs-startedAt)*.001,exit=exitProgress(timeMs),fade=1-smoothstep(.26,.96,exit),centerX=width*.5+(reduceMotion?0:pointer.nx*(mobile?7:15)),centerY=height*.465+(reduceMotion?0:pointer.ny*(mobile?5:10)),breathe=reduceMotion?1:1+Math.sin(t*.54)*.006,radius=globeRadius*breathe;updateRotation(t);gctx.clearRect(0,0,width,height)
    const ringIn=smoothstep(.9,2.5,age);gctx.beginPath();gctx.strokeStyle=`rgba(255,255,255,${.042*ringIn*fade})`;gctx.lineWidth=.55;gctx.arc(centerX,centerY,radius,0,Math.PI*2);gctx.stroke()
    drawParticleSet(oceanPoints,timeMs,centerX,centerY,radius,false);drawParticleSet(landPoints,timeMs,centerX,centerY,radius,true);drawContinentLabels(timeMs,centerX,centerY,radius)
  }

  function frame(timeMs){if(phase===State.COMPLETE||!entry.isConnected)return;const dt=Math.min(.033,Math.max(.001,(timeMs-lastFrame)/1000));lastFrame=timeMs;updatePointer(dt);if(phase===State.ENTERING&&timeMs-startedAt>4600)phase=State.IDLE;drawSpace(timeMs);drawGlobe(timeMs);if(phase===State.EXITING){const p=exitProgress(timeMs);if(!quickExit&&!reduceMotion&&p>.42&&!document.documentElement.classList.contains('entry-reveal'))document.documentElement.classList.add('entry-reveal');if((quickExit||reduceMotion)&&p>.16&&!document.documentElement.classList.contains('entry-reveal'))document.documentElement.classList.add('entry-reveal');if(p>=1)finish()}raf=requestAnimationFrame(frame)}
  function pulseAt(x,y){clickRing.style.left=`${x}px`;clickRing.style.top=`${y}px`;clickRing.classList.remove('go');void clickRing.offsetWidth;clickRing.classList.add('go')}
  function beginExit({quick=false,x=pointer.x,y=pointer.y}={}){if(phase===State.EXITING||phase===State.COMPLETE)return;quickExit=quick;phase=State.EXITING;exitStartedAt=performance.now();pulseAt(x,y);if(quick||reduceMotion){entry.style.transitionDuration='.3s';requestAnimationFrame(()=>entry.classList.add('is-leaving'))}else setTimeout(()=>entry.classList.add('is-leaving'),520)}
  function finish(){if(phase===State.COMPLETE)return;phase=State.COMPLETE;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);entry.removeEventListener('pointermove',onPointerMove);entry.removeEventListener('keydown',onKeydown);entry.removeEventListener('pointerup',onEntryPointerUp);enterButton.removeEventListener('click',onEnterClick);skipButton.removeEventListener('click',onSkipClick);entry.remove();style.remove();document.documentElement.classList.remove('entry-locked','entry-reveal');try{window.scrollTo({top:0,behavior:'instant'})}catch{window.scrollTo(0,0)}}
  function onPointerMove(e){if(phase===State.EXITING||phase===State.COMPLETE)return;pointer.targetX=e.clientX;pointer.targetY=e.clientY}
  function onEntryPointerUp(e){if(e.target.closest('button'))return;beginExit({x:e.clientX,y:e.clientY})}
  function onEnterClick(e){e.stopPropagation();const r=enterButton.getBoundingClientRect();beginExit({x:r.left+r.width/2,y:r.top})}
  function onSkipClick(e){e.stopPropagation();const r=skipButton.getBoundingClientRect();beginExit({quick:true,x:r.left+r.width/2,y:r.top+r.height/2})}
  function onKeydown(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();beginExit()}else if(e.key==='Escape'){e.preventDefault();beginExit({quick:true})}}

  entry.addEventListener('pointermove',onPointerMove)
  entry.addEventListener('pointerup',onEntryPointerUp)
  entry.addEventListener('keydown',onKeydown)
  enterButton.addEventListener('click',onEnterClick)
  skipButton.addEventListener('click',onSkipClick)
  window.addEventListener('resize',resize,{passive:true})
  resize();sctx.fillStyle='#030504';sctx.fillRect(0,0,width,height);setTimeout(()=>entry.classList.add('is-ready'),850);raf=requestAnimationFrame(frame);requestAnimationFrame(()=>entry.focus({preventScroll:true}))
}
