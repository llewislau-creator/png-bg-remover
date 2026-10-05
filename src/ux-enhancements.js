const UX_STYLE_ID = 'png-cutout-ux-enhancements'

if (!document.getElementById(UX_STYLE_ID)) {
  const style = document.createElement('style')
  style.id = UX_STYLE_ID
  style.textContent = `
    :root{font-size:18px}
    body{font-size:18px;line-height:1.6}
    .brand{font-size:20px}.brand small{font-size:11px}
    .header-note{font-size:11px}.lang button{font-size:12px;min-height:38px;padding:8px 11px}
    .intro p{font-size:17px;line-height:1.72}.eyebrow{font-size:12px}.metric small{font-size:10px}.metric b{font-size:17px}
    .tool-head{font-size:11px;min-height:54px;height:auto}.tool-head strong{font-size:12px}.tiny-btn{font-size:11px;min-height:38px;padding:8px 10px}
    .drop-content p{font-size:14px;line-height:1.75}.primary,.secondary,.ghost{font-size:13px;min-height:46px;padding:13px 18px}
    .spec{font-size:12px;line-height:1.7}.spec b{font-size:12px}.spec strong{font-size:20px}
    .file-meta strong{font-size:12px}.file-meta span{font-size:11px}.head-btn{font-size:12px;min-height:40px;padding:8px 11px}
    .tag{font-size:10px}.processing p,.error-overlay p{font-size:12px}.progress-meta{font-size:11px}
    .viewer-group button,.zoom-value{font-size:11px}.viewer-group button{min-height:38px}.compare-range label,.compare-range output{font-size:10px}
    .inspector-head b{font-size:15px}.inspector-head span{font-size:10px}.panel-title b{font-size:12px}.panel-title span{font-size:10px}
    .segmented button{font-size:10px;min-height:42px}.slider-row label,.check-row,.select-row label{font-size:10px}.slider-row output{font-size:10px}.select-row select{font-size:11px;min-height:40px}
    .info-grid small{font-size:9px}.info-grid b{font-size:11px}.copy-btn,.download-btn{font-size:13px;min-height:46px}.action-msg,.inspector-foot{font-size:10px}
    .note-block small{font-size:10px}.note-block p{font-size:15px}.footer-copy{font-size:10px}
    .start-screen-btn{margin-left:12px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);min-height:38px;padding:8px 12px;font:700 12px/1.1 var(--mono);letter-spacing:.02em;white-space:nowrap}
    .start-screen-btn:hover,.start-screen-btn:focus-visible{background:var(--acid);color:var(--ink);outline:2px solid var(--ink);outline-offset:2px}
    #png-cutout-entry .entry-brand strong{font-size:17px!important}
    #png-cutout-entry .entry-brand span{font-size:10px!important}
    #png-cutout-entry .entry-top-meta,#png-cutout-entry .entry-left-meta{font-size:10px!important}
    #png-cutout-entry .entry-enter strong{font-size:15px!important}
    #png-cutout-entry .entry-enter span{font-size:10px!important}
    #png-cutout-entry .entry-skip{font-size:11px!important;min-height:38px!important;padding:9px 12px!important}
    #png-cutout-entry .function-planet .planet-label b{font-size:10px!important}
    #png-cutout-entry .function-planet .planet-label span{font-size:8px!important}
    #png-cutout-entry .earth-function-label b{font-size:11px!important}
    #png-cutout-entry .earth-function-label span{font-size:8px!important}
    #png-cutout-entry .function-panel small{font-size:9px!important}
    #png-cutout-entry .function-panel strong{font-size:17px!important}
    #png-cutout-entry .function-panel p{font-size:11px!important}
    #png-cutout-entry .function-key{font-size:8px!important}
    @media(max-width:700px){
      :root{font-size:17px}body{font-size:17px}
      .topbar{grid-template-columns:1fr auto auto!important;min-height:64px;height:auto!important}.top-cell{padding:8px 10px}.brand{font-size:18px}.brand small{display:none}.start-screen-btn{margin-left:0;padding:8px 9px;font-size:11px}
      .intro h1{font-size:clamp(42px,12vw,56px)!important;line-height:1}.intro p{font-size:17px}.eyebrow{font-size:11px}.metric b{font-size:15px}
      .drop-content h2{font-size:clamp(42px,12vw,58px)!important}.drop-content p{font-size:14px}.primary,.secondary,.ghost{font-size:13px;min-height:48px}
      #png-cutout-entry .entry-brand strong{font-size:15px!important}#png-cutout-entry .entry-left-meta{font-size:9px!important}#png-cutout-entry .entry-enter strong{font-size:14px!important}#png-cutout-entry .entry-enter span{font-size:9px!important}
    }
  `
  document.head.appendChild(style)
}

function addStartScreenButton() {
  if (document.querySelector('.start-screen-btn')) return
  const topbar = document.querySelector('.topbar')
  if (!topbar) return
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'start-screen-btn'
  button.textContent = '← 回到起始畫面'
  button.setAttribute('aria-label', '回到起始畫面')
  button.addEventListener('click', () => {
    window.location.reload()
  })
  const firstCell = topbar.querySelector('.top-cell')
  if (firstCell) firstCell.appendChild(button)
  else topbar.prepend(button)
}

addStartScreenButton()
