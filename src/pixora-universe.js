const shell = document.querySelector('.shell');
if (!document.getElementById('pixora-universe-home')) {
  const style = document.createElement('style');
  style.id = 'pixora-universe-home-style';
  style.textContent = `
    html.px-universe-open, body.px-universe-open { overflow:hidden; background:#05060a; }
    body.px-universe-open .shell,
    body.px-universe-open #mobileBar,
    body.px-universe-open #shortcutModal { visibility:hidden !important; }
    #pixora-universe-home { position:fixed; inset:0; z-index:9999; overflow:hidden; background:#05060a; color:#f6f7ff; font-family:Inter,Arial,"Noto Sans TC",sans-serif; }
    #pixora-universe-home * { box-sizing:border-box; }
    .pxu-canvas { position:absolute; inset:0; width:100%; height:100%; }
    .pxu-noise { position:absolute; inset:0; pointer-events:none; opacity:.18; background-image:radial-gradient(rgba(255,255,255,.25) .55px,transparent .55px); background-size:5px 5px; mix-blend-mode:soft-light; }
    .pxu-top { position:absolute; left:0; right:0; top:0; height:76px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(20px,4vw,58px); border-bottom:1px solid rgba(255,255,255,.1); z-index:4; }
    .pxu-brand { font-weight:900; letter-spacing:-.04em; font-size:20px; }
    .pxu-brand small { display:block; margin-top:3px; font:600 8px/1.2 "SFMono-Regular",Consolas,monospace; letter-spacing:.18em; color:rgba(255,255,255,.36); }
    .pxu-top-right { display:flex; gap:8px; align-items:center; }
    .pxu-lang { display:flex; border:1px solid rgba(255,255,255,.18); }
    .pxu-lang button { border:0; background:transparent; color:rgba(255,255,255,.5); padding:8px 10px; font:700 9px "SFMono-Regular",Consolas,monospace; cursor:pointer; }
    .pxu-lang button.active { background:#f6f7ff; color:#070812; }
    .pxu-hud { position:absolute; left:clamp(20px,5vw,74px); top:50%; transform:translateY(-48%); z-index:4; width:min(420px,38vw); }
    .pxu-index { margin-bottom:16px; color:#9186ff; font:700 9px/1.2 "SFMono-Regular",Consolas,monospace; letter-spacing:.18em; }
    .pxu-hud h1 { margin:0; font-size:clamp(46px,7vw,104px); line-height:.82; letter-spacing:-.065em; font-weight:820; }
    .pxu-hud p { margin:22px 0 26px; max-width:360px; font-size:12px; line-height:1.75; color:rgba(246,247,255,.56); }
    .pxu-enter { border:1px solid rgba(145,134,255,.72); background:rgba(9,10,18,.55); color:#fff; padding:14px 18px; font:800 9px/1 "SFMono-Regular",Consolas,monospace; letter-spacing:.14em; cursor:pointer; backdrop-filter:blur(12px); }
    .pxu-enter:hover { background:#7867ff; }
    .pxu-rail { position:absolute; left:50%; bottom:28px; transform:translateX(-50%); display:flex; align-items:center; gap:8px; z-index:5; max-width:90vw; }
    .pxu-dot { width:9px; height:9px; border-radius:999px; border:1px solid rgba(255,255,255,.3); background:transparent; padding:0; cursor:pointer; transition:.3s ease; }
    .pxu-dot.active { width:38px; border-color:#9186ff; background:linear-gradient(90deg,#7867ff,#63e6ff); }
    .pxu-name { margin-left:8px; min-width:150px; font:700 8px/1 "SFMono-Regular",Consolas,monospace; letter-spacing:.12em; color:rgba(255,255,255,.48); }
    .pxu-help { position:absolute; right:clamp(18px,3vw,44px); bottom:30px; z-index:4; font:600 7px/1.4 "SFMono-Regular",Consolas,monospace; letter-spacing:.13em; color:rgba(255,255,255,.28); }
    .pxu-orbit-label { position:absolute; right:clamp(22px,4vw,58px); top:50%; transform:translateY(-50%); z-index:4; writing-mode:vertical-rl; font:700 8px/1 "SFMono-Regular",Consolas,monospace; letter-spacing:.22em; color:rgba(255,255,255,.22); }
    @media (max-width:760px) {
      .pxu-top { height:64px; padding:0 18px; }
      .pxu-hud { left:18px; right:18px; top:auto; bottom:78px; transform:none; width:auto; }
      .pxu-hud h1 { font-size:46px; }
      .pxu-hud p { margin:12px 0 16px; font-size:10px; max-width:280px; }
      .pxu-rail { left:18px; bottom:22px; transform:none; }
      .pxu-name,.pxu-help,.pxu-orbit-label { display:none; }
    }
    @media (prefers-reduced-motion:reduce) { .pxu-dot { transition:none; } }
  `;
  document.head.appendChild(style);

  const worlds = [
    { id:'cutout', en:['CUTOUT','Remove anything. Keep what matters.'], zh:['去背','AI 辨識主體，留下真正重要的部分。'], kind:'earth', active:true },
    { id:'refine', en:['REFINE','Erase, restore and rebuild edges with precision.'], zh:['精修','擦除、還原與精準重建圖片邊緣。'], kind:'moon' },
    { id:'background', en:['BACKGROUND','Transform the space behind your subject.'], zh:['背景','透明、純色與自訂圖片背景。'], kind:'flow' },
    { id:'canvas', en:['CANVAS','Resize, reposition and compose for every format.'], zh:['畫布','調整尺寸、位置與畫布比例。'], kind:'rings' },
    { id:'commerce', en:['COMMERCE','Build clean product imagery for every marketplace.'], zh:['電商圖片','建立乾淨、一致的商品圖片。'], kind:'grid' },
    { id:'batch', en:['BATCH','Turn many images into one coordinated workflow.'], zh:['批次處理','讓大量圖片進入同一套處理流程。'], kind:'bands' },
    { id:'portrait', en:['PORTRAIT','Background color and standard ratios for people.'], zh:['人物／證件','換底色並裁切成標準人物比例。'], kind:'halo' },
    { id:'export', en:['EXPORT','Deliver PNG, JPG and WebP without leaving the flow.'], zh:['匯出','輸出 PNG、JPG、WebP 與透明圖片。'], kind:'burst' }
  ];

  const home = document.createElement('section');
  home.id = 'pixora-universe-home';
  home.innerHTML = `
    <canvas class="pxu-canvas" aria-hidden="true"></canvas>
    <div class="pxu-noise" aria-hidden="true"></div>
    <div class="pxu-top">
      <div class="pxu-brand">PIXORA<small>UNIVERSE / LOCAL IMAGE TOOLS</small></div>
      <div class="pxu-top-right"><div class="pxu-lang"><button data-lang="zh">繁中</button><button data-lang="en">EN</button></div></div>
    </div>
    <div class="pxu-hud">
      <div class="pxu-index"></div>
      <h1></h1>
      <p></p>
      <button class="pxu-enter" type="button"></button>
    </div>
    <div class="pxu-rail"></div>
    <div class="pxu-help"></div>
    <div class="pxu-orbit-label">POINT / LINE / PARTICLE NAVIGATION</div>
  `;
  document.body.appendChild(home);
  document.documentElement.classList.add('px-universe-open');
  document.body.classList.add('px-universe-open');

  let lang = 'zh';
  try { lang = localStorage.getItem('pixora-lang') || (navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch {}
  let active = 0;
  let wheelLock = 0;
  const rail = home.querySelector('.pxu-rail');
  worlds.forEach((world, i) => {
    const b = document.createElement('button');
    b.className = 'pxu-dot';
    b.type = 'button';
    b.title = world.en[0];
    b.setAttribute('aria-label', world.en[0]);
    b.addEventListener('click', () => { active = i; renderUI(); });
    rail.appendChild(b);
  });
  const railName = document.createElement('span');
  railName.className = 'pxu-name';
  rail.appendChild(railName);

  function renderUI() {
    const world = worlds[active];
    const text = world[lang === 'zh' ? 'zh' : 'en'];
    home.querySelector('.pxu-index').textContent = `${String(active + 1).padStart(2,'0')} / PIXORA UNIVERSE`;
    home.querySelector('h1').textContent = text[0];
    home.querySelector('.pxu-hud p').textContent = text[1];
    home.querySelector('.pxu-enter').textContent = world.active ? (lang === 'zh' ? '進入工具 ↗' : 'ENTER TOOL ↗') : (lang === 'zh' ? '探索此世界' : 'EXPLORE WORLD');
    home.querySelector('.pxu-help').textContent = lang === 'zh' ? '滾動探索 · 點擊節點切換' : 'SCROLL TO EXPLORE · SELECT A NODE';
    railName.textContent = `${String(active + 1).padStart(2,'0')} · ${text[0]}`;
    [...rail.querySelectorAll('.pxu-dot')].forEach((b,i) => b.classList.toggle('active', i === active));
    home.querySelectorAll('.pxu-lang button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  }

  home.querySelectorAll('.pxu-lang button').forEach(btn => btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    try { localStorage.setItem('pixora-lang', lang); } catch {}
    renderUI();
  }));

  function enterTool() {
    const world = worlds[active];
    if (!world.active) return;
    home.style.opacity = '0';
    home.style.transition = 'opacity .28s ease';
    setTimeout(() => {
      home.remove();
      document.documentElement.classList.remove('px-universe-open');
      document.body.classList.remove('px-universe-open');
      if (shell) shell.style.visibility = '';
      const idle = document.getElementById('idle');
      if (idle) idle.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 280);
  }
  home.querySelector('.pxu-enter').addEventListener('click', enterTool);

  home.addEventListener('wheel', e => {
    const now = performance.now();
    if (now - wheelLock < 320 || Math.abs(e.deltaY) < 8) return;
    wheelLock = now;
    active = (active + (e.deltaY > 0 ? 1 : -1) + worlds.length) % worlds.length;
    renderUI();
  }, { passive:true });

  const canvas = home.querySelector('.pxu-canvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x:0, y:0 };
  function resize() {
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  addEventListener('resize', resize);
  home.addEventListener('pointermove', e => { mouse.x = e.clientX / w - .5; mouse.y = e.clientY / h - .5; });

  function rand(seed) { const x = Math.sin(seed * 999.31) * 43758.5453; return x - Math.floor(x); }
  function sphere(cx, cy, r, kind, time, alpha, index) {
    ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = alpha;
    const accent = index % 3 === 0 ? '99,230,255' : index % 3 === 1 ? '141,130,255' : '220,226,255';
    const n = Math.max(100, Math.floor(r * 1.8));
    for (let i=0;i<n;i++) {
      const u = rand(i + index*71), v = rand(i*3.7 + index*19);
      const th = Math.PI*2*u, ph = Math.acos(2*v-1), spin = time*.00005*(kind === 'bands' ? 1.5 : 1);
      let x = Math.sin(ph)*Math.cos(th+spin), y = Math.cos(ph), z = Math.sin(ph)*Math.sin(th+spin);
      if (kind === 'moon' && rand(i*9) < .18) continue;
      if (kind === 'flow') x += Math.sin(y*12 + time*.001)*.1;
      if (kind === 'bands') y = Math.round(y*10)/10;
      const s = .78 + .22*z, px = x*r*s, py = y*r*.9*s;
      ctx.fillStyle = z > -.25 ? `rgba(${accent},${.22 + .48*(z+1)/2})` : 'rgba(255,255,255,.10)';
      ctx.beginPath(); ctx.arc(px,py,z>.3?1.2:.65,0,Math.PI*2); ctx.fill();
      if (i % 13 === 0 && z > .05) {
        ctx.strokeStyle = `rgba(${accent},.12)`; ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+x*12,py+y*10); ctx.stroke();
      }
    }
    ctx.strokeStyle = `rgba(${accent},.24)`; ctx.lineWidth=.65;
    if (kind === 'rings' || kind === 'halo') for (let k=0;k<(kind==='rings'?4:2);k++) { ctx.beginPath(); ctx.ellipse(0,0,r*(1.22+k*.17),r*(.22+k*.04),-.24+k*.11,0,Math.PI*2); ctx.stroke(); }
    if (kind === 'burst') for (let k=0;k<20;k++) { const a=k/20*Math.PI*2+time*.00004; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72); ctx.lineTo(Math.cos(a)*r*(1.2+rand(k)*.5),Math.sin(a)*r*(1.2+rand(k)*.5)); ctx.stroke(); }
    if (kind === 'grid') for (let k=-2;k<=2;k++) { ctx.beginPath(); ctx.ellipse(0,k*r*.22,r*Math.sqrt(Math.max(.05,1-k*k*.045)),r*.08,0,0,Math.PI*2); ctx.stroke(); }
    ctx.restore();
  }

  function frame(t) {
    ctx.clearRect(0,0,w,h);
    const bg = ctx.createRadialGradient(w*.68,h*.46,0,w*.68,h*.46,Math.max(w,h)*.72);
    bg.addColorStop(0,'rgba(66,56,150,.22)'); bg.addColorStop(1,'rgba(2,3,8,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    for (let i=0;i<120;i++) { const x=(rand(i)*w+mouse.x*12*(i%3))%w, y=rand(i*5.1)*h; ctx.fillStyle=`rgba(255,255,255,${.05+rand(i*8)*.15})`; ctx.fillRect(x,y,.75,.75); }
    const mobile = w < 760, baseX = w*(mobile?.58:.70), baseY = h*(mobile?.31:.49);
    worlds.forEach((world,i) => {
      let d=i-active; if (d>4) d-=8; if (d<-4) d+=8;
      const depth=Math.abs(d); let cx,cy,r,a;
      if (depth===0) { cx=baseX; cy=baseY; r=Math.min(w,h)*(mobile?.18:.20); a=1; }
      else if (depth===1) { cx=baseX+d*w*(mobile?.29:.22); cy=baseY+(d>0?-.13:.15)*h; r=Math.min(w,h)*(mobile?.085:.095); a=.68; }
      else if (depth===2) { cx=baseX+d*w*(mobile?.20:.17); cy=baseY+(d>0?.23:-.25)*h; r=Math.min(w,h)*(mobile?.055:.065); a=.42; }
      else { cx=baseX+d*w*.13; cy=baseY+Math.sin(i*1.7)*h*.34; r=Math.min(w,h)*.04; a=.25; }
      cx += mouse.x*(depth?5:12); cy += mouse.y*(depth?3:7);
      sphere(cx,cy,r,world.kind,t,a,i);
      if (depth<=2) { ctx.strokeStyle=`rgba(141,130,255,${depth===0?.14:depth===1?.075:.04})`; ctx.setLineDash([2,12]); ctx.beginPath(); ctx.moveTo(baseX,baseY); ctx.quadraticCurveTo((baseX+cx)/2,cy-h*.08,cx,cy); ctx.stroke(); ctx.setLineDash([]); }
    });
    requestAnimationFrame(frame);
  }
  renderUI();
  requestAnimationFrame(frame);
}
