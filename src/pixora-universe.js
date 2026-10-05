const shell = document.querySelector('.shell');

if (!document.getElementById('pixora-universe-home')) {
  const style = document.createElement('style');
  style.id = 'pixora-universe-home-style';
  style.textContent = `
    html.pxu-open,body.pxu-open{overflow:hidden;background:#030408}
    body.pxu-open .shell,body.pxu-open #mobileBar,body.pxu-open #shortcutModal{visibility:hidden!important}
    #pixora-universe-home{position:fixed;inset:0;z-index:9999;overflow:hidden;background:#030408;color:#f7f7fb;font-family:Inter,Arial,"Noto Sans TC",sans-serif;isolation:isolate}
    #pixora-universe-home *{box-sizing:border-box}
    .pxu-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0}
    .pxu-vignette{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 72% 46%,transparent 0 24%,rgba(3,4,8,.08) 43%,rgba(3,4,8,.54) 79%,#030408 100%)}
    .pxu-grain{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:.16;background-image:radial-gradient(rgba(255,255,255,.32) .45px,transparent .45px);background-size:4px 4px;mix-blend-mode:soft-light}
    .pxu-header{position:absolute;left:0;right:0;top:0;height:78px;z-index:6;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(22px,4vw,64px)}
    .pxu-brand{font-weight:900;font-size:19px;letter-spacing:-.045em}.pxu-brand small{display:block;margin-top:4px;font:600 7px/1.1 "SFMono-Regular",Consolas,monospace;letter-spacing:.2em;color:rgba(255,255,255,.34)}
    .pxu-header-right{display:flex;align-items:center;gap:18px}.pxu-signal{display:flex;align-items:center;gap:8px;font:600 7px "SFMono-Regular",Consolas,monospace;letter-spacing:.13em;color:rgba(255,255,255,.34)}.pxu-signal i{width:5px;height:5px;border-radius:50%;background:#8e82ff;box-shadow:0 0 18px #8e82ff}
    .pxu-lang{display:flex;border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(12px)}.pxu-lang button{border:0;background:transparent;color:rgba(255,255,255,.46);padding:8px 10px;font:700 8px "SFMono-Regular",Consolas,monospace;cursor:pointer}.pxu-lang button.active{background:#f7f7fb;color:#05060a}
    .pxu-copy{position:absolute;left:clamp(22px,5.6vw,88px);top:50%;transform:translateY(-48%);z-index:6;width:min(390px,34vw)}
    .pxu-kicker{margin-bottom:18px;font:700 8px/1.2 "SFMono-Regular",Consolas,monospace;letter-spacing:.23em;color:#9186ff}
    .pxu-title{margin:0;font-size:clamp(52px,7vw,108px);font-weight:820;line-height:.8;letter-spacing:-.07em;text-wrap:balance}
    .pxu-desc{margin:24px 0 28px;max-width:340px;color:rgba(247,247,251,.52);font-size:12px;line-height:1.75}
    .pxu-enter{display:inline-flex;align-items:center;gap:14px;border:1px solid rgba(255,255,255,.24);background:rgba(6,7,13,.34);color:white;padding:14px 16px;font:800 8px "SFMono-Regular",Consolas,monospace;letter-spacing:.16em;cursor:pointer;backdrop-filter:blur(14px);transition:.25s ease}.pxu-enter:after{content:'↗';font-size:12px}.pxu-enter:hover{border-color:#9186ff;background:rgba(126,108,255,.17);transform:translateX(3px)}
    .pxu-side-index{position:absolute;right:clamp(20px,3vw,46px);top:50%;transform:translateY(-50%);z-index:6;display:grid;gap:10px;justify-items:center}
    .pxu-side-index button{width:6px;height:6px;border-radius:50%;border:1px solid rgba(255,255,255,.27);background:transparent;padding:0;cursor:pointer;transition:.3s ease}.pxu-side-index button.active{height:34px;border-radius:999px;border-color:#8e82ff;background:linear-gradient(#8e82ff,#66e5ff)}
    .pxu-footer{position:absolute;left:clamp(22px,4vw,64px);right:clamp(22px,4vw,64px);bottom:24px;z-index:6;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}
    .pxu-meta{font:600 7px/1.7 "SFMono-Regular",Consolas,monospace;letter-spacing:.12em;color:rgba(255,255,255,.26)}
    .pxu-worldline{display:flex;align-items:center;gap:8px}.pxu-worldline span{font:700 8px "SFMono-Regular",Consolas,monospace;letter-spacing:.12em;color:rgba(255,255,255,.42)}.pxu-worldline b{font:700 8px "SFMono-Regular",Consolas,monospace;letter-spacing:.12em;color:#fff}
    .pxu-progress{width:150px;height:1px;background:rgba(255,255,255,.15);position:relative;overflow:hidden}.pxu-progress i{display:block;height:100%;background:linear-gradient(90deg,#8e82ff,#66e5ff);transition:width .35s cubic-bezier(.22,1,.36,1)}
    .pxu-ringlabel{position:absolute;left:50%;top:22%;z-index:3;font:600 7px "SFMono-Regular",Consolas,monospace;letter-spacing:.19em;color:rgba(255,255,255,.18);pointer-events:none}
    @media(max-width:760px){.pxu-header{height:64px;padding:0 18px}.pxu-signal{display:none}.pxu-copy{left:18px;right:18px;top:auto;bottom:86px;transform:none;width:auto}.pxu-title{font-size:48px}.pxu-desc{margin:12px 0 16px;max-width:290px;font-size:10px}.pxu-side-index{right:16px;top:38%}.pxu-footer{left:18px;right:18px;bottom:20px}.pxu-meta{display:none}.pxu-ringlabel{display:none}}
    @media(prefers-reduced-motion:reduce){.pxu-enter,.pxu-side-index button,.pxu-progress i{transition:none}}
  `;
  document.head.appendChild(style);

  const worlds = [
    {id:'cutout', zh:['去背','保留主體，移除不需要的背景。'], en:['CUTOUT','Keep the subject. Remove everything else.'], kind:'mesh', active:true},
    {id:'refine', zh:['精修','還原、擦除並修正細節邊緣。'], en:['REFINE','Restore, erase and rebuild precise edges.'], kind:'halo'},
    {id:'background', zh:['背景','替換透明、純色或自訂背景。'], en:['BACKGROUND','Transform the space behind your subject.'], kind:'flow'},
    {id:'canvas', zh:['畫布','重排、縮放並適配不同版型。'], en:['CANVAS','Resize, reposition and compose for any format.'], kind:'rings'},
    {id:'commerce', zh:['電商','快速整理乾淨一致的商品圖。'], en:['COMMERCE','Build clean product imagery for marketplaces.'], kind:'grid'},
    {id:'batch', zh:['批次','把多張圖片放進同一處理流程。'], en:['BATCH','Move many images through one coordinated flow.'], kind:'bands'},
    {id:'portrait', zh:['人物','處理人物背景與標準比例。'], en:['PORTRAIT','Background color and standard ratios for people.'], kind:'soft'},
    {id:'export', zh:['匯出','輸出 PNG、JPG、WebP 與透明素材。'], en:['EXPORT','Deliver PNG, JPG and WebP without leaving the flow.'], kind:'burst'}
  ];

  const home = document.createElement('section');
  home.id = 'pixora-universe-home';
  home.innerHTML = `
    <canvas class="pxu-canvas" aria-hidden="true"></canvas>
    <div class="pxu-vignette" aria-hidden="true"></div><div class="pxu-grain" aria-hidden="true"></div>
    <header class="pxu-header"><div class="pxu-brand">PIXORA<small>UNIVERSE / LOCAL IMAGE TOOLS</small></div><div class="pxu-header-right"><div class="pxu-signal"><i></i>LOCAL PROCESSING</div><div class="pxu-lang"><button data-lang="zh">繁中</button><button data-lang="en">EN</button></div></div></header>
    <div class="pxu-copy"><div class="pxu-kicker"></div><h1 class="pxu-title"></h1><p class="pxu-desc"></p><button class="pxu-enter" type="button"></button></div>
    <div class="pxu-side-index"></div><div class="pxu-ringlabel">ORBITAL TOOL SYSTEM / 08 WORLDS</div>
    <footer class="pxu-footer"><div class="pxu-worldline"><span class="pxu-current"></span><div class="pxu-progress"><i></i></div><b class="pxu-name"></b></div><div class="pxu-meta">SCROLL / SWIPE TO NAVIGATE<br>SELECT A WORLD TO ENTER</div></footer>
  `;
  document.body.appendChild(home);
  document.documentElement.classList.add('pxu-open');
  document.body.classList.add('pxu-open');

  let lang = 'zh';
  try { lang = localStorage.getItem('pixora-lang') || (navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch {}
  let active = 0;
  let targetActive = 0;
  let wheelLock = 0;

  const side = home.querySelector('.pxu-side-index');
  worlds.forEach((world,i)=>{const b=document.createElement('button');b.type='button';b.title=world.en[0];b.setAttribute('aria-label',world.en[0]);b.onclick=()=>selectWorld(i);side.appendChild(b)});

  function selectWorld(i){targetActive=(i+worlds.length)%worlds.length;active=targetActive;renderUI();}
  function renderUI(){
    const world=worlds[active],text=world[lang==='zh'?'zh':'en'];
    home.querySelector('.pxu-kicker').textContent=`${String(active+1).padStart(2,'0')} / PIXORA UNIVERSE`;
    home.querySelector('.pxu-title').textContent=text[0];
    home.querySelector('.pxu-desc').textContent=text[1];
    home.querySelector('.pxu-enter').textContent=world.active?(lang==='zh'?'進入工具':'ENTER TOOL'):(lang==='zh'?'探索此世界':'EXPLORE WORLD');
    home.querySelector('.pxu-current').textContent=`${String(active+1).padStart(2,'0')} / ${String(worlds.length).padStart(2,'0')}`;
    home.querySelector('.pxu-name').textContent=text[0];
    home.querySelector('.pxu-progress i').style.width=`${((active+1)/worlds.length)*100}%`;
    [...side.children].forEach((b,i)=>b.classList.toggle('active',i===active));
    home.querySelectorAll('.pxu-lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  }

  home.querySelectorAll('.pxu-lang button').forEach(btn=>btn.onclick=()=>{lang=btn.dataset.lang;try{localStorage.setItem('pixora-lang',lang)}catch{}renderUI()});
  home.querySelector('.pxu-enter').onclick=()=>{
    if(!worlds[active].active)return;
    home.style.transition='opacity .42s ease,transform .55s cubic-bezier(.22,1,.36,1)';
    home.style.opacity='0';home.style.transform='scale(1.025)';
    setTimeout(()=>{home.remove();document.documentElement.classList.remove('pxu-open');document.body.classList.remove('pxu-open');if(shell)shell.style.visibility='';document.getElementById('idle')?.scrollIntoView({behavior:'smooth',block:'start'})},420);
  };

  home.addEventListener('wheel',e=>{const now=performance.now();if(now-wheelLock<360||Math.abs(e.deltaY)<8)return;wheelLock=now;selectWorld(active+(e.deltaY>0?1:-1))},{passive:true});
  let touchY=null;home.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});home.addEventListener('touchend',e=>{if(touchY==null)return;const y=e.changedTouches[0]?.clientY??touchY;const d=touchY-y;if(Math.abs(d)>40)selectWorld(active+(d>0?1:-1));touchY=null},{passive:true});

  const canvas=home.querySelector('.pxu-canvas'),ctx=canvas.getContext('2d');
  let w=0,h=0,dpr=Math.min(devicePixelRatio||1,2),mx=0,my=0;
  function resize(){w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}resize();addEventListener('resize',resize);
  home.addEventListener('pointermove',e=>{mx=e.clientX/w-.5;my=e.clientY/h-.5});
  const rand=s=>{const x=Math.sin(s*9283.113)*43758.5453;return x-Math.floor(x)};

  function drawPlanet(cx,cy,r,kind,t,alpha,index,detail=1){
    ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=alpha;
    const rgb=index%3===0?'114,225,255':index%3===1?'143,126,255':'218,223,255';
    const pts=Math.floor(Math.max(120,r*2.4)*detail);
    for(let i=0;i<pts;i++){
      const u=rand(i+index*61),v=rand(i*4.31+index*13),th=u*Math.PI*2+t*.000035*(index%2?1:-1),ph=Math.acos(2*v-1);
      let x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th);
      if(kind==='flow')x+=Math.sin(y*13+t*.001)*.08;if(kind==='bands')y=Math.round(y*12)/12;if(kind==='soft'&&rand(i*7)<.12)continue;
      const depth=.78+.22*z,px=x*r*depth,py=y*r*.94*depth;
      ctx.fillStyle=z>-0.25?`rgba(${rgb},${.15+.55*(z+1)/2})`:'rgba(255,255,255,.06)';ctx.beginPath();ctx.arc(px,py,z>.35?1.25:.65,0,Math.PI*2);ctx.fill();
      if(i%11===0&&z>.12){ctx.strokeStyle=`rgba(${rgb},.10)`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+x*(10+rand(i)*16),py+y*(8+rand(i+2)*13));ctx.stroke()}
    }
    ctx.strokeStyle=`rgba(${rgb},.18)`;ctx.lineWidth=.65;
    if(kind==='rings'||kind==='halo')for(let k=0;k<(kind==='rings'?4:2);k++){ctx.beginPath();ctx.ellipse(0,0,r*(1.18+k*.16),r*(.19+k*.035),-.2+k*.09,0,Math.PI*2);ctx.stroke()}
    if(kind==='grid')for(let k=-2;k<=2;k++){ctx.beginPath();ctx.ellipse(0,k*r*.22,r*Math.sqrt(Math.max(.05,1-k*k*.05)),r*.075,0,0,Math.PI*2);ctx.stroke()}
    if(kind==='burst')for(let k=0;k<24;k++){const a=k/24*Math.PI*2+t*.00003;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.78,Math.sin(a)*r*.78);ctx.lineTo(Math.cos(a)*r*(1.12+rand(k)*.48),Math.sin(a)*r*(1.12+rand(k)*.48));ctx.stroke()}
    ctx.restore();
  }

  function frame(t){
    ctx.clearRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.72,h*.47,0,w*.72,h*.47,Math.max(w,h)*.62);glow.addColorStop(0,'rgba(71,61,155,.17)');glow.addColorStop(.42,'rgba(23,24,52,.08)');glow.addColorStop(1,'rgba(3,4,8,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    for(let i=0;i<150;i++){const x=(rand(i*1.9)*w+mx*(i%4)*7+w)%w,y=rand(i*5.7)*h;ctx.fillStyle=`rgba(255,255,255,${.025+rand(i*7.7)*.12})`;ctx.fillRect(x,y,.65,.65)}
    const mobile=w<760,mainX=w*(mobile?.64:.72)+mx*14,mainY=h*(mobile?.34:.49)+my*10,mainR=Math.min(w,h)*(mobile?.21:.285);
    drawPlanet(mainX,mainY,mainR,worlds[active].kind,t,1,active,1.25);
    ctx.save();ctx.strokeStyle='rgba(143,126,255,.11)';ctx.setLineDash([2,11]);ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(mainX,mainY,mainR*1.52,mainR*.42,-.18,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    [-2,-1,1,2].forEach((offset,j)=>{let idx=(active+offset+worlds.length)%worlds.length;const a=-.55+((j)/3)*1.08+(t*.000012*(offset>0?1:-1));const rr=mainR*(1.63+Math.abs(offset)*.23);const cx=mainX+Math.cos(a)*rr,cy=mainY+Math.sin(a)*rr*.46;const r=mainR*(Math.abs(offset)===1?.16:.09);drawPlanet(cx,cy,r,worlds[idx].kind,t,.28+(Math.abs(offset)===1?.16:0),idx,.55)});
    requestAnimationFrame(frame);
  }
  renderUI();requestAnimationFrame(frame);
}
