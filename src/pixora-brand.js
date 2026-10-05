const BRAND = 'Pixora';
const SITE = 'https://usepixora.vercel.app/';
const description = 'Pixora is an AI image workspace for background removal, precision cleanup, background replacement, resizing, product photos, portrait formats, and PNG/JPG/WebP export.';

function meta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement('meta'); el.setAttribute(property ? 'property' : 'name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

document.title = 'Pixora — AI Image Studio for Cutout, Background & Export';
meta('description', description);
meta('theme-color', '#07090d');
meta('og:type', 'website', true);
meta('og:title', 'Pixora — AI Image Studio', true);
meta('og:description', description, true);
meta('og:url', SITE, true);
meta('twitter:card', 'summary_large_image');
meta('twitter:title', 'Pixora — AI Image Studio');
meta('twitter:description', description);
let canonical = document.head.querySelector('link[rel="canonical"]');
if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
canonical.href = SITE;

const replacements = [
  [/PNG\s*\/\s*CUTOUT/gi, 'Pixora'],
  [/Designer background removal utility/gi, 'AI Image Studio'],
  [/background removal utility/gi, 'AI image workspace'],
  [/去背小工具/g, 'AI 圖片工作台']
];
function rebrandText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (node.parentElement?.closest('script,style')) continue;
    let value = node.nodeValue;
    for (const [from,to] of replacements) value = value.replace(from,to);
    node.nodeValue = value;
  }
}

function productMap() {
  if (document.querySelector('.px-product-map')) return;
  const host = document.querySelector('.intro') || document.querySelector('main') || document.body.firstElementChild;
  if (!host) return;
  const section = document.createElement('section');
  section.className = 'px-product-map';
  section.innerHTML = `
    <div class="px-product-map__head">
      <div><small>Pixora Image Workflow</small><h2>One workspace. Every image step.</h2></div>
      <p>From AI cutout to final delivery, Pixora keeps cleanup, backgrounds, sizing, product imagery and export in one consistent workflow.</p>
    </div>
    <div class="px-product-grid">
      <div class="px-product-card"><span>01 · AI CUTOUT</span><b>Background Removal</b><p>Detect the subject automatically and create a clean transparent result.</p></div>
      <div class="px-product-card"><span>02 · REFINE</span><b>Erase & Restore</b><p>Cleanup edges, restore details, crop and trim with precision controls.</p></div>
      <div class="px-product-card"><span>03 · BACKGROUND</span><b>Background Studio</b><p>Use transparency, solid colors or custom image backgrounds, ready for AI backgrounds later.</p></div>
      <div class="px-product-card"><span>04 · EDIT</span><b>Image & Canvas</b><p>Adjust size, position, zoom, canvas ratio and final output dimensions.</p></div>
      <div class="px-product-card"><span>05 · COMMERCE</span><b>Product Photos</b><p>Create white-background listings, hero product images and marketplace-ready sizes.</p></div>
      <div class="px-product-card"><span>06 · PORTRAIT</span><b>ID & People</b><p>Replace background colors and crop portraits to standard photo ratios.</p></div>
      <div class="px-product-card"><span>07 · EXPORT</span><b>Format & Delivery</b><p>Export PNG, JPG or WebP, copy transparent PNG, download, and prepare for batch output.</p></div>
      <div class="px-product-card"><span>08 · WORKFLOW</span><b>Designed as a Studio</b><p>A coherent production flow rather than a single-purpose remove-and-download tool.</p></div>
    </div>
    <div class="px-workflow"><strong>WORKFLOW</strong><i>→</i>Upload<i>→</i>AI Processing<i>→</i>Edit<i>→</i>Background<i>→</i>Resize<i>→</i>Export</div>`;
  host.insertAdjacentElement('afterend', section);
}

function updateBrandUI() {
  rebrandText();
  document.querySelectorAll('.brand').forEach(el => {
    const small = el.querySelector('small');
    el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) n.nodeValue = 'PIXORA '; });
    if (small) small.textContent = 'AI IMAGE STUDIO';
  });
  const introH1 = document.querySelector('.intro h1');
  if (introH1 && /background|remove|cutout|去背/i.test(introH1.textContent)) introH1.textContent = 'Create better images, end to end.';
  const introP = document.querySelector('.intro p');
  if (introP) introP.textContent = 'AI-powered cutout, precision cleanup, backgrounds, resizing, product imagery and export — built as one focused image workflow.';
  productMap();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateBrandUI); else updateBrandUI();
new MutationObserver(() => rebrandText()).observe(document.documentElement, {subtree:true, childList:true});
