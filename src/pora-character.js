// PIXORA PORA home character. The illustration is a self-contained SVG: no network or AI call is needed to switch shapes.
import './pora-character.css'

const MODES = [
  { id: 'base', icon: '✧', zh: '原形波拉', en: 'PORA', zhDescription: '小小的陪伴，讓日常發光。', enDescription: 'Your gentle creative companion.' },
  { id: 'star', icon: '★', zh: '星星波拉', en: 'Star', zhDescription: '把微小的靈感變成星光。', enDescription: 'A tiny spark of inspiration.' },
  { id: 'speech', icon: '▢', zh: '對話波拉', en: 'Chat', zhDescription: '陪你說出每一個新想法。', enDescription: 'Every thought deserves a voice.' },
  { id: 'cloud', icon: '☁', zh: '夢雲波拉', en: 'Dream Cloud', zhDescription: '在柔軟的雲裡休息一下。', enDescription: 'Rest in a softer little world.' }
]

const SVG = String.raw`<svg class="pora-svg" viewBox="0 0 640 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="pora-soft" cx="29%" cy="20%" r="83%">
      <stop offset="0" stop-color="#fffefb"/><stop offset=".38" stop-color="#fff4ee"/>
      <stop offset=".66" stop-color="#f2e3f5"/><stop offset=".86" stop-color="#c3c8fa"/><stop offset="1" stop-color="#abb6ee"/>
    </radialGradient>
    <radialGradient id="pora-ear" cx="20%" cy="10%" r="110%">
      <stop offset="0" stop-color="#ffe5d9"/><stop offset=".4" stop-color="#f4c8df"/><stop offset=".77" stop-color="#aab9f8"/><stop offset="1" stop-color="#92a9ec"/>
    </radialGradient>
    <linearGradient id="pora-shine" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#fff6dc"/><stop offset=".45" stop-color="#fcecff"/><stop offset=".75" stop-color="#bedfff"/><stop offset="1" stop-color="#c9bafa"/>
    </linearGradient>
    <radialGradient id="pora-cloud" cx="35%" cy="28%" r="86%"><stop stop-color="#fff8ed"/><stop offset=".55" stop-color="#eee3ff"/><stop offset="1" stop-color="#b4cef7"/></radialGradient>
    <linearGradient id="pora-pixel" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#e0ecff"/><stop offset=".45" stop-color="#cfb8ff"/><stop offset="1" stop-color="#8fdff6"/></linearGradient>
    <radialGradient id="pora-blush"><stop stop-color="#f7a9bc" stop-opacity=".73"/><stop offset="1" stop-color="#f7a9bc" stop-opacity="0"/></radialGradient>
    <filter id="pora-ground-blur" x="-30%" y="-100%" width="160%" height="320%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="pora-star-glow" x="-75%" y="-75%" width="250%" height="250%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="pora-soft-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  <ellipse cx="320" cy="439" rx="226" ry="24" fill="#9f98dc" opacity=".23" filter="url(#pora-ground-blur)"/>
  <g class="pora-outer-orbit" fill="none" stroke-linecap="round">
    <ellipse cx="321" cy="292" rx="272" ry="106" transform="rotate(-12 321 292)" stroke="#8dddf8" stroke-width="3.8" opacity=".3"/>
    <ellipse cx="321" cy="292" rx="279" ry="110" transform="rotate(-12 321 292)" stroke="#d7b4ff" stroke-width="1.6" opacity=".43" stroke-dasharray="5 16"/>
  </g>

  <g class="pora-art" data-pora-art="base">
    <path d="M505 331 Q557 288 573 341 Q588 404 540 416 Q517 419 490 399Z" fill="url(#pora-ear)" stroke="#ebe3ff" stroke-width="2"/>
    <ellipse cx="210" cy="229" rx="64" ry="78" transform="rotate(-22 210 229)" fill="url(#pora-ear)" stroke="#fff4f9" stroke-width="3"/>
    <ellipse cx="428" cy="202" rx="67" ry="77" transform="rotate(17 428 202)" fill="url(#pora-ear)" stroke="#e9e6ff" stroke-width="3"/>
    <path d="M108 338 C106 248 183 190 297 183 C427 163 518 230 544 316 C566 397 511 433 377 437 C278 443 156 443 120 406 C108 393 103 369 108 338Z"
      fill="url(#pora-soft)" stroke="#fff5fb" stroke-width="3"/>
    <path d="M157 286 C187 225 252 212 293 211" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".2"/>
    <ellipse cx="214" cy="408" rx="43" ry="27" fill="#ffefe8" opacity=".97"/>
    <ellipse cx="437" cy="403" rx="44" ry="28" fill="#eddef7" opacity=".98"/>
    <ellipse cx="199" cy="340" rx="39" ry="23" fill="url(#pora-blush)"/>
    <ellipse cx="464" cy="338" rx="39" ry="23" fill="url(#pora-blush)"/>
    <g class="aw-eyes">
      <ellipse cx="260" cy="325" rx="11" ry="16" fill="#382a36"/><ellipse cx="390" cy="320" rx="11" ry="16" fill="#382a36"/>
      <ellipse cx="257" cy="318" rx="3" ry="4.2" fill="#fff" opacity=".87"/><ellipse cx="387" cy="313" rx="3" ry="4.2" fill="#fff" opacity=".87"/>
    </g>
    <rect x="318" y="325" width="26" height="5.4" rx="2.7" fill="#4b3541" transform="rotate(-3 331 328)"/>
    <g transform="translate(450 243) scale(1.12)"><path d="M0-21 Q4-22 8-12 L12-7 L22-6 Q27-5 22 2 L14 9 L16 19 Q16 27 8 22 L0 17 L-9 22 Q-17 25-16 17 L-14 8 L-22 2 Q-27-5-20-7 L-10-9 L-6-19 Q-3-24 0-21Z" fill="#ffe3a3" stroke="#fff4ce" stroke-width="3"/></g>
    <path d="M495 337v20h18v18h19" fill="none" stroke="#a6deff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".38"/>
    <g class="pora-pixels" fill="#94d9ff" opacity=".62"><rect x="492" y="320" width="12" height="12" rx="3"/><rect x="515" y="346" width="10" height="10" rx="2"/><rect x="536" y="363" width="7" height="7" rx="2"/></g>
  </g>

  <g class="pora-art" data-pora-art="star">
    <path d="M320 128 Q333 125 346 169 L379 224 L447 236 Q490 239 467 270 L420 319 L431 394 Q439 443 391 424 L322 391 L248 424 Q204 446 212 396 L225 319 L174 270 Q150 238 193 234 L262 223 L294 168 Q307 130 320 128Z"
      fill="url(#pora-shine)" stroke="#fff7f1" stroke-width="5" stroke-linejoin="round"/>
    <path d="M273 209Q294 182 308 164" stroke="#fff" stroke-width="11" opacity=".54" stroke-linecap="round"/>
    <ellipse cx="265" cy="303" rx="30" ry="18" fill="url(#pora-blush)"/>
    <ellipse cx="378" cy="303" rx="30" ry="18" fill="url(#pora-blush)"/>
    <g class="aw-eyes"><ellipse cx="296" cy="294" rx="9" ry="13" fill="#412f41"/><ellipse cx="348" cy="294" rx="9" ry="13" fill="#412f41"/></g>
    <path d="M315 316Q321 322 327 316" fill="none" stroke="#564356" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(409 242) scale(.65)"><path d="M0-21L8-8L23-5L12 7L15 22L0 14L-15 22L-12 7L-23-5L-8-8Z" fill="#ffd987" stroke="#fff5da" stroke-width="3"/></g>
  </g>

  <g class="pora-art" data-pora-art="speech">
    <path d="M144 219Q144 165 202 161L434 161Q493 161 503 223L503 338Q503 392 446 396L289 396L236 442Q217 456 221 420L224 396L200 396Q144 396 144 337Z" fill="url(#pora-shine)" stroke="#f6f4ff" stroke-width="5"/>
    <path d="M183 213Q189 189 221 186L421 186" fill="none" stroke="#fff" stroke-width="11" opacity=".55" stroke-linecap="round"/>
    <ellipse cx="237" cy="314" rx="32" ry="19" fill="url(#pora-blush)"/><ellipse cx="417" cy="314" rx="32" ry="19" fill="url(#pora-blush)"/>
    <g class="aw-eyes"><ellipse cx="279" cy="302" rx="10" ry="13.5" fill="#3c2e45"/><ellipse cx="373" cy="302" rx="10" ry="13.5" fill="#3c2e45"/></g>
    <path d="M319 327Q327 334 335 327" fill="none" stroke="#55435f" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(450 197) scale(.73)"><path d="M0-21L7-8L22-5L11 7L14 22L0 14L-14 22L-11 7L-22-5L-7-8Z" fill="#ffe3a3" stroke="#fff3dc" stroke-width="3"/></g>
  </g>

  <g class="pora-art" data-pora-art="cloud">
    <circle cx="208" cy="307" r="90" fill="url(#pora-cloud)" stroke="#f5e9ff" stroke-width="4"/>
    <circle cx="296" cy="254" r="119" fill="url(#pora-cloud)" stroke="#f5e9ff" stroke-width="4"/>
    <circle cx="423" cy="294" r="97" fill="url(#pora-cloud)" stroke="#f5e9ff" stroke-width="4"/>
    <path d="M159 322 Q166 269 221 288 Q255 237 305 271 Q370 241 404 289 Q477 273 492 344 Q510 414 448 423 L203 423 Q141 420 159 322Z" fill="url(#pora-soft)" stroke="#fff4fc" stroke-width="4"/>
    <ellipse cx="258" cy="361" rx="34" ry="21" fill="url(#pora-blush)"/><ellipse cx="388" cy="359" rx="34" ry="21" fill="url(#pora-blush)"/>
    <g class="aw-eyes"><path d="M272 350q12 13 24 0M343 349q12 13 24 0" fill="none" stroke="#66536a" stroke-width="5" stroke-linecap="round"/></g>
    <path d="M316 366q6 5 12 0" fill="none" stroke="#66536a" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M449 154A34 34 0 1 0 481 201A30 30 0 1 1 449 154Z" fill="#ffe5ab" stroke="#fff7d8" stroke-width="3"/>
    <g transform="translate(388 241) scale(.78)"><path d="M0-21L8-8L23-5L12 7L15 22L0 14L-15 22L-12 7L-23-5L-8-8Z" fill="#ffe3a3" stroke="#fff5d9" stroke-width="3"/></g>
  </g>

  <g class="pora-float-cube">
    <path d="M309 84L347 62L385 84L347 108Z" fill="#eee1ff" stroke="#f3f6ff" stroke-width="3"/>
    <path d="M309 84V125L347 148V108Z" fill="#b8bcfb" stroke="#eff1ff" stroke-width="3"/>
    <path d="M385 84V125L347 148V108Z" fill="#9adff3" stroke="#f3f6ff" stroke-width="3"/>
    <path d="M347 62V148M309 84L385 125M385 84L309 125" fill="none" stroke="#fff" stroke-width="2.2" opacity=".58"/>
    <rect x="298" y="150" width="12" height="12" rx="2" fill="#b7daff" opacity=".85"/>
    <rect x="394" y="69" width="12" height="12" rx="2" fill="#dcc8ff" opacity=".85"/>
  </g>
  <g class="pora-tiny-stars" fill="#fff0bd" opacity=".88">
    <path d="M145 133l5 13 13 5-13 5-5 13-5-13-13-5 13-5Z"/>
    <path d="M507 174l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/>
    <circle cx="530" cy="266" r="3"/>
  </g>
</svg>`

/**
 * Replace the old Astro Wisp artwork only; all existing toolkit and upload handlers remain in place.
 * Returns a locale adapter to be called from the parent homepage paint().
 */
export function mountPora(home) {
  const visual = home.querySelector('#aw-visual')
  const figure = visual?.querySelector('.aw-character')
  if (!visual || !figure) return { setLanguage() {} }

  figure.innerHTML = SVG
  figure.classList.add('pora-character')
  figure.dataset.poraForm = 'base'
  figure.setAttribute('role', 'img')
  visual.classList.add('pora-visual')
  visual.querySelectorAll('.aw-float-card').forEach(el => el.remove())

  const switcher = document.createElement('div')
  switcher.className = 'pora-switcher'
  switcher.innerHTML = [
    '<span class="pora-switcher-label" id="pora-switcher-label"></span>',
    '<div class="pora-switcher-buttons" role="group" aria-labelledby="pora-switcher-label">',
    MODES.map(mode => '<button type="button" class="pora-form-button" data-pora-choice="' + mode.id + '" aria-pressed="' + (mode.id === 'base' ? 'true' : 'false') + '"><span aria-hidden="true">' + mode.icon + '</span><span class="pora-button-label"></span></button>').join(''),
    '</div>',
    '<p class="pora-mode-caption" id="pora-mode-caption" role="status" aria-live="polite"></p>'
  ].join('')
  visual.append(switcher)

  let language = 'zh'
  let active = 'base'
  function repaint() {
    const chinese = language === 'zh'
    const mode = MODES.find(item => item.id === active) || MODES[0]
    switcher.querySelector('#pora-switcher-label').textContent = chinese ? 'PORA 變形形態' : 'PORA SHAPES'
    switcher.querySelector('#pora-mode-caption').textContent = chinese ? mode.zhDescription : mode.enDescription
    switcher.querySelectorAll('[data-pora-choice]').forEach(button => {
      const option = MODES.find(item => item.id === button.dataset.poraChoice)
      const selected = button.dataset.poraChoice === active
      button.setAttribute('aria-pressed', String(selected))
      button.classList.toggle('is-active', selected)
      button.querySelector('.pora-button-label').textContent = chinese ? option.zh : option.en
      button.setAttribute('aria-label', (chinese ? '切換成' : 'Switch to ') + (chinese ? option.zh : option.en))
    })
    figure.setAttribute('aria-label', chinese ? 'PORA 波拉：' + mode.zh + '，柔軟的 AI 科技陪伴角色' : 'PORA: ' + mode.en + ', a gentle AI creative companion')
  }
  switcher.addEventListener('click', event => {
    const button = event.target.closest('[data-pora-choice]')
    if (!button) return
    const next = button.dataset.poraChoice
    if (!MODES.some(mode => mode.id === next)) return
    active = next
    figure.dataset.poraForm = active
    repaint()
  })
  repaint()
  return {
    setLanguage(next) {
      language = next === 'en' ? 'en' : 'zh'
      repaint()
    }
  }
}
