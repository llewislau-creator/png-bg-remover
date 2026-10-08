export function setupFontWorkspace(panel){
 const aside=panel.querySelector('.fs-controls'),direction=aside.querySelector('.fs-direction'),local=document.createElement('div')
 local.className='fs-local-controls'
 let next=direction.nextElementSibling
 while(next){const following=next.nextElementSibling;local.append(next);next=following}
 aside.append(local)
 const styleList=local.querySelector('.fs-style-list');if(styleList){styleList.hidden=true;styleList.previousElementSibling.hidden=true}
 const hero=panel.querySelector('.fs-hero')
 hero.innerHTML='<div><small>PIXORA / TYPE STUDIO</small><h1>文字創作工作台</h1></div><p>排字、參考風格生成與透明 PNG 輸出。</p>'
 const nav=document.createElement('nav');nav.className='fs-workspace-nav';nav.setAttribute('aria-label','創作模式')
 const modes=[['ai','AI 參考生成'],['local','本機排字'],['history','生成記錄']]
 const description=document.createElement('p');description.className='fs-mode-description';local.before(description)
 function setMode(mode){
  panel.dataset.workspaceMode=mode
  nav.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)))
  local.hidden=mode!=='local'
  panel.querySelector('.fs-download').hidden=mode!=='local'
  description.textContent=mode==='local'?'選擇字體與風格，即時預覽。':'文字與方向會用於下一張 AI 生成圖片。'
  description.hidden=mode==='history'
  panel.querySelector('.fs-header small').textContent=mode==='local'?'木星 · 本機排字':'木星 · Grok 參考生成'
  panel.querySelector('.fs-main').scrollTop=0
 }
 for(const[mode,label]of modes){const button=document.createElement('button');button.type='button';button.dataset.mode=mode;button.textContent=label;button.onclick=()=>setMode(mode);nav.append(button)}
 hero.after(nav);setMode('ai')
}
