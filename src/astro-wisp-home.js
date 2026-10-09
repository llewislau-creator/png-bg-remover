import { openPortraitStudio } from './portrait-studio.js';
import { openLayerStudio } from './layer-studio.js';
import { openPromptStudio } from './prompt-extractor.js';
import { openImageToPdf } from './image-to-pdf.js';
import { openPrintStudio } from './print-studio.js';
import { openPresentationStudio } from './presentation-studio.js';
import { openFontStudio } from './font-studio.js';
import { openColorStudio } from './color-studio.js';
import { openVectorStudio } from './vector-studio.js';
import './astro-wisp-home.css';

(function bootstrapAstroWisp() {
  if (document.getElementById('pixora-universe-home')) return;

  const tools = [
    { id: 'earth', icon: '✦', zh: 'AI 圖片去背', en: 'AI Background Removal', zhSub: '移除背景・透明 PNG', enSub: 'Transparent PNG cutouts' },
    { id: 'uranus', icon: '▤', zh: 'JPG 轉 PDF', en: 'Images to PDF', zhSub: '合併・排序・輸出', enSub: 'Combine and arrange files' },
    { id: 'venus', icon: '◉', zh: '圖片色彩分析', en: 'Color Analyzer', zhSub: '擷取色票及色碼', enSub: 'Extract colors and HEX' },
    { id: 'pantone', icon: '▧', zh: 'Pantone 近似查色', en: 'Pantone Approximation', zhSub: '尋找最接近的色票', enSub: 'Find closest color matches' },
    { id: 'mercury', icon: '✧', zh: '圖片 Prompt', en: 'Image Prompt', zhSub: '分析與整理提示詞', enSub: 'Compose image prompts' },
    { id: 'moon', icon: '⌁', zh: '圖片轉 SVG', en: 'Image to SVG', zhSub: '向量描繪', enSub: 'Trace to vector shapes' },
    { id: 'mars', icon: '◌', zh: '人像修飾', en: 'Portrait Retouch', zhSub: '局部修飾・調色', enSub: 'Retouch and recolor' },
    { id: 'saturn', icon: '▱', zh: '圖片圖層', en: 'Image Layers', zhSub: '拆分・移動圖層', enSub: 'Split and edit layers' },
    { id: 'jupiter', icon: 'Aa', zh: '文字特效', en: 'Text Effects', zhSub: '文字造型・透明 PNG', enSub: 'Stylized typography' },
    { id: 'neptune', icon: '▣', zh: '簡報製作', en: 'Presentation Studio', zhSub: '版面與 PPTX 匯出', enSub: 'Create and export PPTX' },
    { id: 'pluto', icon: '▦', zh: '印刷排版', en: 'Print Layout', zhSub: '出血・安全邊界・PDF', enSub: 'Bleed, margins, print PDF' }
  ];

  const dictionaries = {
    zh: {
      eyebrow: 'MEET ASTRO WISP · PIXORA AI COMPANION',
      headlineA: '每張圖片，',
      headlineB: '都有更多可能。',
      lead: '把圖片交給 Astro Wisp，去背、轉檔、找色彩與整理創作素材，從這裡輕鬆開始。',
      dropTitle: '把圖片交給 Wisp',
      dropSubtitle: '點擊選擇圖片，或直接拖放到這裡。支援 PNG、JPG、WEBP，單檔最大 20 MB。',
      choose: '上傳圖片',
      launch: '開始 AI 去背',
      replace: '更換圖片',
      cutout: '直接使用去背工具',
      trust: ['核心去背在瀏覽器處理', '不須註冊', 'AI 雲端功能會另外說明資料處理'],
      idle: '嗨！把圖片交給我吧。',
      curious: '我在這裡，需要幫忙嗎？',
      ready: '收到圖片！準備好了。',
      working: '正為你開啟圖片工作區…',
      error: '這個檔案暫時無法使用。',
      titleTools: '探索圖片工具',
      toolsLead: '直接開啟工具，不需要先和角色互動。',
      allTools: 'ALL TOOLS',
      navTools: '所有工具',
      media: '影音工具 ↗',
      footer: 'Astro Wisp 是操作引導角色。各工具的 AI 功能與資料處理方式以該工具說明為準。',
      dropOverlay: '把圖片交給 Astro Wisp ✦',
      invalid: '請選擇 PNG、JPG 或 WEBP 圖片。',
      tooLarge: '圖片超過 20 MB，請選擇較小的檔案。',
      empty: '請先選擇圖片。',
      selectFail: '無法交接檔案。已開啟去背工具，請在工具內重新選圖。',
      updated: '已選取：',
      processingLabel: 'Astro Wisp 正在準備工作區',
      characterName: 'Astro Wisp · 星際影像助手'
    },
    en: {
      eyebrow: 'MEET ASTRO WISP · PIXORA AI COMPANION',
      headlineA: 'More possibilities,',
      headlineB: 'for every image.',
      lead: 'Give your image to Astro Wisp. Remove backgrounds, combine files, explore colors and keep creating — all in one space.',
      dropTitle: 'Share an image with Wisp',
      dropSubtitle: 'Choose an image or drop it here. PNG, JPG or WEBP. Maximum 20 MB per file.',
      choose: 'Upload image',
      launch: 'Remove background',
      replace: 'Change image',
      cutout: 'Open the cutout tool',
      trust: ['Core cutout runs in your browser', 'No account needed', 'Cloud AI features disclose data use separately'],
      idle: 'Hi! Your image adventure starts here.',
      curious: 'Need a hand? I am here.',
      ready: 'Image received. Ready when you are.',
      working: 'Opening your image workspace…',
      error: 'This file cannot be used right now.',
      titleTools: 'Explore image tools',
      toolsLead: 'Jump straight into any tool. The character never slows you down.',
      allTools: 'ALL TOOLS',
      navTools: 'All tools',
      media: 'Media tools ↗',
      footer: 'Astro Wisp is an interface guide. AI capabilities and data handling vary by tool.',
      dropOverlay: 'Drop your image to Astro Wisp ✦',
      invalid: 'Please use a PNG, JPG or WEBP image.',
      tooLarge: 'Images must be 20 MB or smaller.',
      empty: 'Choose an image first.',
      selectFail: 'Could not transfer the file. The cutout workspace is open; choose your image there.',
      updated: 'Selected: ',
      processingLabel: 'Astro Wisp is preparing your workspace',
      characterName: 'Astro Wisp · your visual companion'
    }
  };

  // Single-body, footless, tailless pearl-metal character. This is an interactive
  // SVG presentation asset, not a rigged 3D model or simulated AI inference.
  const wisp = `<svg class="aw-wisp" viewBox="0 0 520 510" role="img" aria-label="Astro Wisp — floating pearl-metal AI character">
    <defs>
      <linearGradient id="aw-shell" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".22" stop-color="#eef2ff"/>
        <stop offset=".49" stop-color="#b6bde9"/>
        <stop offset=".7" stop-color="#a5abde"/>
        <stop offset=".9" stop-color="#f5e2ff"/>
        <stop offset="1" stop-color="#9eb8ee"/>
      </linearGradient>
      <radialGradient id="aw-pearl" cx=".33" cy=".22" r=".82">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".97"/>
        <stop offset=".37" stop-color="#fcf9ff" stop-opacity=".32"/>
        <stop offset=".72" stop-color="#9887de" stop-opacity=".08"/>
        <stop offset="1" stop-color="#7875c8" stop-opacity=".23"/>
      </radialGradient>
      <linearGradient id="aw-trim" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#83e1fa"/><stop offset=".38" stop-color="#c7a9ff"/><stop offset=".68" stop-color="#f0a6e2"/><stop offset="1" stop-color="#83cff9"/>
      </linearGradient>
      <radialGradient id="aw-eye" cx=".3" cy=".2" r=".88">
        <stop stop-color="#3d4cb0"/><stop offset=".5" stop-color="#171a55"/><stop offset="1" stop-color="#070f2b"/>
      </radialGradient>
      <filter id="aw-halo" x="-40%" y="-140%" width="180%" height="400%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
      <filter id="aw-body-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="12"/>
      </filter>
    </defs>
    <ellipse cx="255" cy="245" rx="187" ry="100" fill="#8585fc" opacity=".18" filter="url(#aw-body-glow)"/>
    <g class="aw-orbit">
      <ellipse cx="261" cy="271" rx="222" ry="84" transform="rotate(-17 261 271)" fill="none" stroke="#968aff" stroke-width="10" opacity=".18" filter="url(#aw-halo)"/>
      <ellipse cx="261" cy="271" rx="222" ry="84" transform="rotate(-17 261 271)" fill="none" stroke="url(#aw-trim)" stroke-width="3" opacity=".83"/>
      <circle cx="58" cy="343" r="3" fill="#f5c9ff"/><circle cx="452" cy="202" r="4" fill="#8be7ff"/>
    </g>
    <path d="M135 161 Q131 133 148 103 Q157 90 172 106 L190 120 Q259 88 326 120 L347 104 Q361 89 372 105 Q388 130 381 160 C423 195 435 255 419 323 C401 399 346 435 259 439 C166 439 108 402 93 327 C79 264 97 198 135 161 Z" fill="url(#aw-shell)" stroke="url(#aw-trim)" stroke-width="4"/>
    <path d="M135 161 Q131 133 148 103 Q157 90 172 106 L190 120 Q259 88 326 120 L347 104 Q361 89 372 105 Q388 130 381 160 C423 195 435 255 419 323 C401 399 346 435 259 439 C166 439 108 402 93 327 C79 264 97 198 135 161 Z" fill="url(#aw-pearl)"/>
    <path d="M144 173 C154 127 218 112 272 119" fill="none" stroke="white" stroke-opacity=".75" stroke-width="10" stroke-linecap="round"/>
    <path d="M127 318 Q142 410 237 422" fill="none" stroke="#d5c7ff" stroke-opacity=".38" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="122" cy="312" rx="41" ry="33" transform="rotate(-27 122 312)" fill="url(#aw-shell)" stroke="#c1baff" stroke-width="3"/>
    <ellipse cx="397" cy="305" rx="41" ry="33" transform="rotate(30 397 305)" fill="url(#aw-shell)" stroke="#c1baff" stroke-width="3"/>
    <ellipse cx="155" cy="262" rx="25" ry="10" fill="#f4a1df" opacity=".16"/>
    <ellipse cx="368" cy="260" rx="25" ry="10" fill="#f4a1df" opacity=".13"/>
    <g class="aw-pupils">
      <ellipse cx="208" cy="252" rx="13" ry="16" fill="url(#aw-eye)"/>
      <ellipse cx="306" cy="252" rx="13" ry="16" fill="url(#aw-eye)"/>
      <circle cx="213" cy="247" r="4" fill="#ffffff"/>
      <circle cx="311" cy="247" r="4" fill="#ffffff"/>
    </g>
    <path class="aw-smile" d="M252 273 Q260 280 268 272" fill="none" stroke="#525899" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 329 C129 389 379 394 460 204" fill="none" stroke="#8b8ffe" stroke-width="10" opacity=".2" filter="url(#aw-halo)"/>
    <path d="M62 329 C129 389 379 394 460 204" fill="none" stroke="url(#aw-trim)" stroke-width="3" opacity=".95"/>
  </svg>`;

  const home = document.createElement('section');
  home.id = 'pixora-universe-home';
  home.setAttribute('aria-label', 'Pixora Astro Wisp homepage');
  home.innerHTML = `<div class="aw-space-stars" aria-hidden="true"></div>
    <div class="aw-container">
      <header class="aw-header">
        <a class="aw-logo" href="/" aria-label="Pixora homepage"><span class="aw-logo-symbol" aria-hidden="true">✦</span><span><span class="aw-logo-name">PIXORA</span><span class="aw-logo-sub">CREATIVE SPACE</span></span></a>
        <nav class="aw-nav" aria-label="Primary navigation">
          <button type="button" class="aw-nav-link aw-go-tools"></button>
          <a class="aw-nav-link aw-media" href="/media"></a>
          <div class="aw-lang" role="group" aria-label="Language">
            <button type="button" data-lang="zh" aria-pressed="true">繁中</button><button type="button" data-lang="en" aria-pressed="false">EN</button>
          </div>
        </nav>
      </header>
      <main>
        <section class="aw-hero" aria-labelledby="aw-title">
          <div class="aw-copy">
            <div class="aw-eyebrow"></div>
            <h1 id="aw-title" class="aw-title"><span class="aw-title-a"></span><br><em class="aw-title-b"></em></h1>
            <p class="aw-lead"></p>
            <div class="aw-upload">
              <div class="aw-upload-top"><div class="aw-upload-icon" aria-hidden="true">⇧</div><div><b class="aw-drop-title"></b><p class="aw-drop-description"></p></div></div>
              <input class="aw-file" id="aw-file" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp">
              <div class="aw-preview" hidden><img class="aw-thumbnail" alt=""><div><strong class="aw-filename"></strong><small class="aw-filesize"></small></div></div>
              <div class="aw-upload-acts">
                <button type="button" class="aw-button aw-button-primary aw-choose"></button>
                <button type="button" class="aw-button aw-button-primary aw-start" hidden></button>
                <button type="button" class="aw-button aw-button-outline aw-replace" hidden></button>
              </div>
              <span class="aw-status" aria-live="polite"></span>
            </div>
            <div class="aw-trust" aria-label="Privacy and service details"><span></span><span></span><span></span></div>
          </div>
          <div class="aw-stage" data-agent="idle" aria-label="Astro Wisp interactive guide">
            <div class="aw-bubble aw-bubble-left" aria-hidden="true"><i>✦</i><span>PNG · CUTOUT</span></div>
            <div class="aw-wisp-wrap">${wisp}</div>
            <div class="aw-bubble aw-bubble-right" aria-hidden="true"><i>◈</i><span>PDF · COLORS</span></div>
            <span class="aw-label"></span>
          </div>
        </section>
        <section id="aw-tools-section" aria-labelledby="aw-tools-heading">
          <div class="aw-sec-head"><div><span class="aw-section-label"></span><h2 id="aw-tools-heading"></h2></div><p class="aw-tools-lead"></p></div>
          <div class="aw-tools"></div>
        </section>
      </main>
      <footer class="aw-footer"><span>© PIXORA · YOUR CREATIVE SPACE</span><span class="aw-footer-note"></span></footer>
    </div>
    <div class="aw-drop-veil" aria-hidden="true"><strong></strong></div>`;
  document.body.append(home);
  document.documentElement.classList.add('pxu-open');
  document.body.classList.add('pxu-open');

  let lang = 'zh';
  try { lang = localStorage.getItem('pixora-lang') === 'en' ? 'en' : 'zh'; } catch {}
  let selectedFile = null;
  let fileUrl = null;
  let dragDepth = 0;
  let returningFocus = null;
  const $ = selector => home.querySelector(selector);
  const t = () => dictionaries[lang];
  const stage = $('.aw-stage');
  const fileInput = $('.aw-file');

  function setAgent(next, label) {
    stage.dataset.agent = next;
    $('.aw-label').textContent = label || t()[next] || t().idle;
  }
  function say(value) { $('.aw-status').textContent = value; }

  function selectFile(file) {
    if (!file) return;
    const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isImage) { setAgent('error'); say(t().invalid); return; }
    if (file.size > 20 * 1024 * 1024) { setAgent('error'); say(t().tooLarge); return; }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    selectedFile = file;
    fileUrl = URL.createObjectURL(file);
    $('.aw-thumbnail').src = fileUrl;
    $('.aw-filename').textContent = file.name;
    $('.aw-filesize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    $('.aw-preview').hidden = false;
    $('.aw-choose').hidden = true;
    $('.aw-start').hidden = false;
    $('.aw-replace').hidden = false;
    say(t().updated + file.name);
    setAgent('ready');
  }

  function clearSelection() {
    selectedFile = null;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    fileUrl = null;
    $('.aw-preview').hidden = true;
    $('.aw-choose').hidden = false;
    $('.aw-start').hidden = true;
    $('.aw-replace').hidden = true;
    fileInput.value = '';
    say('');
    setAgent('idle');
  }

  function renderLanguage() {
    const d = t();
    $('.aw-eyebrow').textContent = d.eyebrow;
    $('.aw-title-a').textContent = d.headlineA;
    $('.aw-title-b').textContent = d.headlineB;
    $('.aw-lead').textContent = d.lead;
    $('.aw-drop-title').textContent = d.dropTitle;
    $('.aw-drop-description').textContent = d.dropSubtitle;
    $('.aw-choose').textContent = d.choose;
    $('.aw-start').textContent = d.launch;
    $('.aw-replace').textContent = d.replace;
    $('.aw-go-tools').textContent = d.navTools;
    $('.aw-media').textContent = d.media;
    $('.aw-section-label').textContent = d.allTools;
    $('#aw-tools-heading').textContent = d.titleTools;
    $('.aw-tools-lead').textContent = d.toolsLead;
    $('.aw-footer-note').textContent = d.footer;
    $('.aw-drop-veil strong').textContent = d.dropOverlay;
    $('.aw-trust').querySelectorAll('span').forEach((span,i) => span.textContent = d.trust[i]);
    $('.aw-tools').replaceChildren(...tools.map(tool => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aw-tool';
      btn.dataset.tool = tool.id;
      const icon = document.createElement('span');
      icon.className = 'aw-tool-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = tool.icon;
      const name = document.createElement('strong');
      name.textContent = lang === 'zh' ? tool.zh : tool.en;
      const description = document.createElement('small');
      description.textContent = lang === 'zh' ? tool.zhSub : tool.enSub;
      btn.append(icon,name,description);
      btn.addEventListener('click', () => openTool(tool.id,btn));
      return btn;
    }));
    home.querySelectorAll('[data-lang]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));
    setAgent(stage.dataset.agent === 'error' ? 'error' : selectedFile ? 'ready' : 'idle');
    if (selectedFile) say(d.updated + selectedFile.name);
  }

  function leaveHomepage(file) {
    home.remove();
    document.documentElement.classList.remove('pxu-open');
    document.body.classList.remove('pxu-open');
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    fileUrl = null;
    const target = document.getElementById('fileInput');
    const idle = document.getElementById('idle');
    idle?.scrollIntoView({behavior:'instant',block:'start'});
    if (file && target) {
      try {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        target.files = transfer.files;
        target.dispatchEvent(new Event('change',{bubbles:true}));
        return;
      } catch (error) {
        console.warn('Astro Wisp file handoff needs user selection:', error);
        document.getElementById('idleError').textContent = t().selectFail;
        target.click();
        return;
      }
    }
    target?.focus({preventScroll:true});
  }

  function openTool(id, button) {
    returningFocus = button || $('.aw-start');
    if (id === 'earth') { setAgent('handoff'); leaveHomepage(selectedFile); return; }
    if (id === 'pantone') { window.location.assign('/pantone'); return; }
    const callback = () => { returningFocus?.focus({preventScroll:true}); if (selectedFile) setAgent('ready'); else setAgent('idle'); };
    const entry = {
      mars: openPortraitStudio,
      saturn: openLayerStudio,
      mercury: openPromptStudio,
      moon: openVectorStudio,
      venus: openColorStudio,
      jupiter: openFontStudio,
      neptune: openPresentationStudio,
      pluto: openPrintStudio,
      uranus: openImageToPdf
    }[id];
    if (entry) {
      setAgent('working');
      try { entry(callback); }
      catch (error) { console.error('Could not open tool',error); home.inert=false; setAgent('error'); say(t().error); }
    }
  }

  $('.aw-go-tools').addEventListener('click', () => $('#aw-tools-section').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
  $('.aw-choose').addEventListener('click', () => fileInput.click());
  $('.aw-replace').addEventListener('click', () => fileInput.click());
  $('.aw-start').addEventListener('click', () => selectedFile ? openTool('earth',$('.aw-start')) : say(t().empty));
  fileInput.addEventListener('change', event => selectFile(event.target.files?.[0]));

  // Drag / drop works over the whole viewport, with no intermediate splash.
  home.addEventListener('dragenter', event => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    dragDepth += 1;
    $('.aw-drop-veil').classList.add('active');
    $('.aw-upload').classList.add('dragging');
    setAgent('curious');
  });
  home.addEventListener('dragover', event => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  home.addEventListener('dragleave', event => {
    event.preventDefault();
    dragDepth = Math.max(0,dragDepth - 1);
    if (!dragDepth) resetDrag();
  });
  home.addEventListener('drop', event => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    resetDrag();
    selectFile(file);
  });
  function resetDrag() {
    dragDepth = 0;
    $('.aw-drop-veil').classList.remove('active');
    $('.aw-upload').classList.remove('dragging');
    if (stage.dataset.agent === 'curious') setAgent(selectedFile ? 'ready' : 'idle');
  }
  home.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = stage.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) return;
    const x = (event.clientX - (r.left + r.width/2)) / r.width;
    const y = (event.clientY - (r.top + r.height/2)) / r.height;
    stage.style.setProperty('--aw-look-x', (Math.max(-1,Math.min(1,x))*6).toFixed(2) + 'px');
    stage.style.setProperty('--aw-look-y', (Math.max(-1,Math.min(1,y))*4).toFixed(2) + 'px');
  });
  stage.addEventListener('pointerleave',() => {
    stage.style.setProperty('--aw-look-x','0px');
    stage.style.setProperty('--aw-look-y','0px');
  });
  $('.aw-upload').addEventListener('pointerenter',() => { if (!selectedFile && stage.dataset.agent === 'idle') setAgent('curious'); });
  $('.aw-upload').addEventListener('pointerleave',() => { if (!selectedFile && stage.dataset.agent === 'curious' && !dragDepth) setAgent('idle'); });
  home.addEventListener('keydown',event => {
    if (event.key === 'Escape' && dragDepth) resetDrag();
  });
  home.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click',()=>{
    lang = btn.dataset.lang;
    try { localStorage.setItem('pixora-lang',lang); } catch {}
    renderLanguage();
  }));
  renderLanguage();
})();
