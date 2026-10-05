import pptxgen from 'pptxgenjs'
import './presentation-studio.css'

const THEMES = {
  cosmos:{name:'Cosmos',bg:'050806',panel:'101713',text:'F7F8F7',muted:'AEB8B0',accent:'B7FF2A'},
  paper:{name:'Paper',bg:'F2EFE7',panel:'E6E0D5',text:'151614',muted:'686B65',accent:'2E6BFF'},
  ocean:{name:'Ocean',bg:'071728',panel:'0D263D',text:'F1F8FF',muted:'9CB1C3',accent:'5AD7FF'},
  ember:{name:'Ember',bg:'1A0D0A',panel:'321812',text:'FFF5EF',muted:'C7A99B',accent:'FF875C'},
  mono:{name:'Mono',bg:'111214',panel:'202226',text:'FAFAFA',muted:'A6A8AC',accent:'FFFFFF'}
}

const FRAMEWORKS = {
  business:['Executive summary','Problem / opportunity','Audience & insight','Proposed direction','Solution structure','Value & impact','Roadmap','Next steps'],
  report:['Executive summary','Background & scope','Key findings','Data signals','What changed','Implications','Recommendations','Next steps'],
  pitch:['Vision','Problem','Why now','Solution','How it works','Market / audience','Business model','Roadmap','Ask / next step'],
  education:['Learning goal','Context','Core concept','Key framework','Example / case','Practice','Summary','Next lesson'],
  proposal:['Objective','Current situation','Design principles','Recommended approach','Workstreams','Timeline','Success measures','Decision required']
}

const LAYOUTS = ['cover','bullets','split','section','stats','chart','quote']
let studio = null
let toastTimer = 0

const state = {
  topic:'',
  framework:'business',
  count:8,
  theme:'cosmos',
  selected:0,
  fileName:'presentation-studio',
  slides:[]
}

function escText(v=''){return String(v).replace(/\r/g,'').trim()}
function safeName(v='presentation-studio'){return (v||'presentation-studio').replace(/[\\/:*?"<>|]+/g,'-').trim()||'presentation-studio'}
function bodyLines(body=''){return escText(body).split('\n').map(s=>s.trim()).filter(Boolean).map(s=>s.replace(/^[-•*]\s*/,''))}
function parseStats(body=''){
  const out=[]
  bodyLines(body).forEach((line,i)=>{
    const m=line.match(/^(.{1,36}?)[\s|:：-]+([\d,.]+%?|\$?[\d,.]+[KMB]?)$/i)
    if(m) out.push({label:m[1].trim(),value:m[2].trim()})
    else if(i<3) out.push({label:line.slice(0,28),value:String((i+1)*25)+'%'})
  })
  while(out.length<3) out.push({label:['Reach','Efficiency','Impact'][out.length],value:['72%','1.8×','+34%'][out.length]})
  return out.slice(0,3)
}
function parseChart(body=''){
  const rows=[]
  bodyLines(body).forEach((line,i)=>{
    const m=line.match(/^(.{1,32}?)[\s|:：-]+([\d,.]+)$/)
    if(m) rows.push({label:m[1].trim(),value:Number(m[2].replace(/,/g,''))||0})
    else if(i<5) rows.push({label:line.slice(0,18),value:30+i*14})
  })
  if(!rows.length) return [{label:'A',value:46},{label:'B',value:72},{label:'C',value:58},{label:'D',value:88}]
  return rows.slice(0,6)
}
function defaultBody(title,topic,index){
  const t=topic||'your presentation'
  const samples={
    'Executive summary':`Clarify the decision this presentation should enable.\nSummarize the strongest signal around ${t}.\nDefine the recommended direction in one sentence.`,
    'Problem / opportunity':`State the friction or unmet need clearly.\nQuantify why it matters now.\nShow what becomes possible if the issue is solved.`,
    'Audience & insight':`Primary audience and context.\nObserved behaviour or constraint.\nDesign implication for ${t}.`,
    'Proposed direction':`Focus on one coherent direction.\nPrioritize clarity over feature count.\nConnect every element to the intended outcome.`,
    'Solution structure':`Core experience / offer.\nSupporting system or workflow.\nHow the parts reinforce each other.`,
    'Value & impact':`Reach 72%\nEfficiency 1.8\nImpact 34`,
    'Roadmap':`Phase 1 — validate the core.\nPhase 2 — expand the system.\nPhase 3 — optimize and scale.`,
    'Next steps':`Confirm the decision owner.\nLock the first milestone.\nAssign next actions and review date.`
  }
  return samples[title]||`Frame ${title.toLowerCase()} around ${t}.\nUse one strong claim and two supporting points.\nKeep the slide focused on a single message (${index+1}).`
}
function layoutFor(title,index,count){
  if(index===0) return 'cover'
  if(index===count-1) return 'quote'
  const s=title.toLowerCase()
  if(s.includes('data')||s.includes('signal')||s.includes('finding')) return 'chart'
  if(s.includes('value')||s.includes('impact')||s.includes('measure')) return 'stats'
  if(s.includes('roadmap')||s.includes('structure')||s.includes('approach')) return 'split'
  if(index===Math.floor(count/2)) return 'section'
  return 'bullets'
}
function makeDeck(topic,count,framework){
  const clean=escText(topic)||'Untitled Presentation'
  const core=FRAMEWORKS[framework]||FRAMEWORKS.business
  const wanted=Math.max(4,Math.min(14,Number(count)||8))
  const slides=[{title:clean,body:`A focused presentation draft · ${new Date().toLocaleDateString()}`,layout:'cover',kicker:'PRESENTATION STUDIO',image:null}]
  const middle=wanted-2
  for(let i=0;i<middle;i++){
    const title=core[i%core.length]
    slides.push({title,body:defaultBody(title,clean,i),layout:layoutFor(title,i+1,wanted),kicker:`${String(i+2).padStart(2,'0')} / ${clean}`,image:null})
  }
  slides.push({title:'Make the next decision clear.',body:`${clean}\nThank you.`,layout:'quote',kicker:'CLOSING',image:null})
  return slides
}
function parseImportedText(text){
  const src=String(text||'').replace(/\r/g,'').trim()
  if(!src) return []
  const blocks=src.split(/\n\s*\n+/).map(x=>x.trim()).filter(Boolean)
  let slides=[]
  for(const block of blocks){
    const lines=block.split('\n').map(x=>x.trim()).filter(Boolean)
    if(!lines.length) continue
    let title=lines[0].replace(/^#{1,6}\s*/,'').slice(0,90)
    let body=lines.slice(1).join('\n')
    if(!body && title.length>90){body=title;title='Key point'}
    slides.push({title,body:body||'Add supporting detail here.',layout:'bullets',kicker:'IMPORTED CONTENT',image:null})
  }
  if(slides.length===1 && src.length>550){
    const sentences=src.match(/[^.!?。！？]+[.!?。！？]?/g)||[src]
    slides=[]
    for(let i=0;i<sentences.length;i+=3){
      const chunk=sentences.slice(i,i+3).join(' ').trim()
      if(chunk) slides.push({title:`Section ${slides.length+1}`,body:chunk,layout:'bullets',kicker:'IMPORTED CONTENT',image:null})
    }
  }
  slides=slides.slice(0,20)
  slides.forEach((s,i)=>s.layout=layoutFor(s.title,i,slides.length))
  return slides
}
function themeCss(theme){return `--ps-bg:#${theme.bg};--ps-panel:#${theme.panel};--ps-text:#${theme.text};--ps-muted:#${theme.muted};--ps-accent:#${theme.accent}`}
function showToast(msg){
  const el=document.querySelector('.ps-toast');if(!el)return
  el.textContent=msg;el.classList.add('is-on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-on'),1800)
}
function openStudio(){
  if(studio){studio.style.display='grid';document.body.style.overflow='hidden';renderAll();return}
  studio=document.createElement('div')
  studio.id='presentation-studio'
  studio.innerHTML=`
    <header class="ps-topbar">
      <button class="ps-back" type="button">← 回到行星選單</button>
      <div class="ps-brand"><b>JUPITER / PRESENTATION STUDIO</b><span>Generate · Style · Arrange · Export PPTX</span></div>
      <button class="ps-export" type="button">DOWNLOAD .PPTX</button>
    </header>
    <div class="ps-shell">
      <aside class="ps-sidebar">
        <section class="ps-section"><h3>Smart draft</h3><textarea class="ps-topic" placeholder="輸入簡報主題，例如：2027 香港零售品牌增長策略"></textarea><div class="ps-row"><div class="ps-field"><label>Structure</label><select class="ps-framework"><option value="business">Business</option><option value="report">Report</option><option value="pitch">Pitch</option><option value="education">Education</option><option value="proposal">Proposal</option></select></div><div class="ps-field"><label>Slides</label><select class="ps-count">${[5,6,7,8,9,10,12].map(n=>`<option value="${n}" ${n===8?'selected':''}>${n}</option>`).join('')}</select></div></div><div class="ps-stack"><button class="ps-btn acid ps-generate" type="button">GENERATE DECK</button><button class="ps-btn ps-import-trigger" type="button">IMPORT TEXT / MARKDOWN</button><input class="ps-import" type="file" accept=".txt,.md,.markdown,.csv" hidden></div><p class="ps-help">產生的是可編輯草稿。內容留在瀏覽器，之後可逐頁改寫、換版式與匯出。</p></section>
        <section class="ps-section"><h3>Theme library</h3><div class="ps-theme-grid"></div></section>
        <section class="ps-section"><h3>Quick insert</h3><div class="ps-icons">${['●','→','✓','★','▲','◆','◉','∞','＋','01'].map(x=>`<button class="ps-icon" type="button" data-icon="${x}">${x}</button>`).join('')}</div><p class="ps-help">選擇符號可插入目前頁面的內容欄。</p></section>
        <section class="ps-section"><h3>File</h3><div class="ps-field"><label>PowerPoint filename</label><input class="ps-filename" value="presentation-studio" maxlength="80"></div></section>
      </aside>
      <main class="ps-main">
        <div class="ps-toolbar"><button class="ps-btn small ps-polish" type="button">AUTO POLISH</button><button class="ps-btn small ps-add" type="button">+ ADD SLIDE</button><span class="ps-spacer"></span><span class="ps-status"><strong>LOCAL</strong> · browser generated PPTX</span></div>
        <div class="ps-canvas-wrap"><div class="ps-canvas"><div class="ps-empty"><div><b>Start with a topic</b>Generate a deck or import text to begin.</div></div></div></div>
      </main>
      <aside class="ps-inspector"><section class="ps-section"><h3>Slides</h3><div class="ps-slide-list"></div></section><section class="ps-editor"></section></aside>
    </div>
    <div class="ps-toast" role="status"></div>`
  document.body.appendChild(studio);document.body.style.overflow='hidden'
  bindStudio();renderThemes();renderAll()
}
function closeStudio(){if(!studio)return;studio.style.display='none';document.body.style.overflow=''}
function bindStudio(){
  studio.querySelector('.ps-back').addEventListener('click',closeStudio)
  studio.querySelector('.ps-export').addEventListener('click',exportPptx)
  studio.querySelector('.ps-generate').addEventListener('click',()=>{
    state.topic=studio.querySelector('.ps-topic').value
    state.framework=studio.querySelector('.ps-framework').value
    state.count=Number(studio.querySelector('.ps-count').value)
    state.slides=makeDeck(state.topic,state.count,state.framework);state.selected=0;renderAll();showToast(`${state.slides.length} slides generated`)
  })
  studio.querySelector('.ps-import-trigger').addEventListener('click',()=>studio.querySelector('.ps-import').click())
  studio.querySelector('.ps-import').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return
    const text=await file.text();const slides=parseImportedText(text)
    if(!slides.length){showToast('No usable text found');return}
    state.slides=slides;state.selected=0;state.topic=file.name.replace(/\.[^.]+$/,'');studio.querySelector('.ps-topic').value=state.topic;renderAll();showToast(`${slides.length} slides imported`);e.target.value=''
  })
  studio.querySelector('.ps-filename').addEventListener('input',e=>state.fileName=e.target.value)
  studio.querySelector('.ps-polish').addEventListener('click',()=>{
    if(!state.slides.length)return showToast('Generate or import a deck first')
    state.slides.forEach((s,i)=>{s.layout=layoutFor(s.title,i,state.slides.length);s.kicker=s.kicker||`SLIDE ${String(i+1).padStart(2,'0')}`});renderAll();showToast('Deck layout polished')
  })
  studio.querySelector('.ps-add').addEventListener('click',()=>{
    state.slides.push({title:'New slide',body:'Add your message here.',layout:'bullets',kicker:'NEW SLIDE',image:null});state.selected=state.slides.length-1;renderAll()
  })
  studio.querySelectorAll('.ps-icon').forEach(btn=>btn.addEventListener('click',()=>{
    const s=state.slides[state.selected];if(!s)return
    s.body=(s.body?s.body+'\n':'')+btn.dataset.icon+' ';renderAll()
  }))
}
function renderThemes(){
  const box=studio.querySelector('.ps-theme-grid');box.innerHTML=''
  Object.entries(THEMES).forEach(([key,t])=>{
    const b=document.createElement('button');b.type='button';b.className='ps-theme'+(state.theme===key?' is-active':'');b.dataset.theme=key
    b.innerHTML=`<div class="ps-theme-swatch" style="--a:#${t.accent};--b:#${t.bg}"></div><b>${t.name}</b>`
    b.addEventListener('click',()=>{state.theme=key;renderThemes();renderPreview();showToast(`${t.name} theme applied`)})
    box.appendChild(b)
  })
}
function renderAll(){renderSlideList();renderEditor();renderPreview()}
function renderSlideList(){
  const list=studio.querySelector('.ps-slide-list');list.innerHTML=''
  state.slides.forEach((s,i)=>{
    const item=document.createElement('div');item.className='ps-slide-item'+(i===state.selected?' is-active':'')
    item.innerHTML=`<button class="ps-slide-num" type="button">${String(i+1).padStart(2,'0')}</button><div class="ps-slide-meta"><b></b><span>${s.layout}</span></div><div class="ps-mini-actions"><button data-a="up" title="Move up">↑</button><button data-a="down" title="Move down">↓</button><button data-a="dup" title="Duplicate">＋</button></div>`
    item.querySelector('.ps-slide-meta b').textContent=s.title||'Untitled'
    item.querySelector('.ps-slide-num').addEventListener('click',()=>{state.selected=i;renderAll()})
    item.querySelectorAll('.ps-mini-actions button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();moveSlide(i,b.dataset.a)}))
    list.appendChild(item)
  })
}
function moveSlide(i,action){
  if(action==='up'&&i>0){[state.slides[i-1],state.slides[i]]=[state.slides[i],state.slides[i-1]];state.selected=i-1}
  if(action==='down'&&i<state.slides.length-1){[state.slides[i+1],state.slides[i]]=[state.slides[i],state.slides[i+1]];state.selected=i+1}
  if(action==='dup'){state.slides.splice(i+1,0,{...state.slides[i]});state.selected=i+1}
  renderAll()
}
function renderEditor(){
  const root=studio.querySelector('.ps-editor');root.innerHTML=''
  const s=state.slides[state.selected];if(!s)return
  root.innerHTML=`<section class="ps-section"><h3>Selected slide</h3><div class="ps-field"><label>Kicker</label><input class="ps-edit-kicker"></div><div class="ps-field"><label>Title</label><textarea class="ps-edit-title"></textarea></div><div class="ps-field"><label>Body / data</label><textarea class="ps-edit-body"></textarea></div><div class="ps-field"><label>Layout</label><div class="ps-layout-grid"></div></div><div class="ps-field"><label>Image</label><div class="ps-image-preview">No image</div><div class="ps-image-actions"><button class="ps-btn small ps-image-add" type="button">ADD / REPLACE IMAGE</button><button class="ps-btn small ps-image-remove" type="button">×</button><input class="ps-image-file" type="file" accept="image/*" hidden></div></div><div class="ps-stack"><button class="ps-btn ghost ps-delete" type="button">DELETE SLIDE</button></div></section>`
  const kicker=root.querySelector('.ps-edit-kicker'),title=root.querySelector('.ps-edit-title'),body=root.querySelector('.ps-edit-body')
  kicker.value=s.kicker||'';title.value=s.title||'';body.value=s.body||''
  ;[[kicker,'kicker'],[title,'title'],[body,'body']].forEach(([el,key])=>el.addEventListener('input',()=>{s[key]=el.value;renderPreview();renderSlideList()}))
  const grid=root.querySelector('.ps-layout-grid');LAYOUTS.forEach(layout=>{
    const b=document.createElement('button');b.type='button';b.className='ps-layout'+(s.layout===layout?' is-active':'');b.textContent=layout.toUpperCase();b.addEventListener('click',()=>{s.layout=layout;renderEditor();renderPreview();renderSlideList()});grid.appendChild(b)
  })
  const imgBox=root.querySelector('.ps-image-preview');if(s.image){imgBox.innerHTML='';const img=document.createElement('img');img.src=s.image.data;imgBox.appendChild(img)}
  root.querySelector('.ps-image-add').addEventListener('click',()=>root.querySelector('.ps-image-file').click())
  root.querySelector('.ps-image-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;s.image=await loadImageFile(f);renderEditor();renderPreview()})
  root.querySelector('.ps-image-remove').addEventListener('click',()=>{s.image=null;renderEditor();renderPreview()})
  root.querySelector('.ps-delete').addEventListener('click',()=>{state.slides.splice(state.selected,1);state.selected=Math.max(0,Math.min(state.selected,state.slides.length-1));renderAll()})
}
function loadImageFile(file){
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const img=new Image();img.onload=()=>resolve({data:r.result,width:img.naturalWidth,height:img.naturalHeight,name:file.name});img.onerror=reject;img.src=r.result};r.readAsDataURL(file)})
}
function renderPreview(){
  const canvas=studio.querySelector('.ps-canvas');canvas.innerHTML=''
  const s=state.slides[state.selected];if(!s){canvas.innerHTML='<div class="ps-empty"><div><b>Start with a topic</b>Generate a deck or import text to begin.</div></div>';return}
  const t=THEMES[state.theme]
  const preview=document.createElement('div');preview.className=`ps-slide-preview layout-${s.layout}`;preview.style.cssText=themeCss(t);preview.dataset.number=`${String(state.selected+1).padStart(2,'0')} / ${String(state.slides.length).padStart(2,'0')}`
  const copy=document.createElement('div');copy.className='ps-copy';const k=document.createElement('div');k.className='ps-preview-kicker';k.textContent=s.kicker||'PRESENTATION STUDIO';const line=document.createElement('div');line.className='ps-accent-line';const h=document.createElement('h2');h.className='ps-preview-title';h.textContent=s.title||'Untitled';const p=document.createElement('p');p.className='ps-preview-body';p.textContent=s.body||'';copy.append(k,line,h,p)
  if(s.layout==='split'){preview.append(copy);const m=document.createElement('div');m.className='ps-media-box';if(s.image){const img=document.createElement('img');img.src=s.image.data;m.appendChild(img)}else m.textContent='IMAGE / VISUAL';preview.append(m)}
  else if(s.layout==='stats'){preview.append(copy);p.remove();const grid=document.createElement('div');grid.className='ps-stat-grid';parseStats(s.body).forEach(x=>{const d=document.createElement('div');d.className='ps-stat';const b=document.createElement('b');b.textContent=x.value;const sp=document.createElement('span');sp.textContent=x.label;d.append(b,sp);grid.appendChild(d)});preview.append(grid)}
  else if(s.layout==='chart'){preview.append(copy);p.remove();const bars=document.createElement('div');bars.className='ps-bars';const data=parseChart(s.body),max=Math.max(...data.map(x=>x.value),1);data.forEach(x=>{const row=document.createElement('div');row.className='ps-bar-row';const a=document.createElement('span');a.textContent=x.label;const track=document.createElement('div');track.className='ps-bar-track';const fill=document.createElement('div');fill.className='ps-bar-fill';fill.style.width=`${Math.max(3,x.value/max*100)}%`;track.appendChild(fill);const val=document.createElement('b');val.textContent=String(x.value);row.append(a,track,val);bars.appendChild(row)});preview.append(bars)}
  else {preview.append(copy);if(s.image&&s.layout!=='cover'&&s.layout!=='quote'){const m=document.createElement('div');m.className='ps-media-box';const img=document.createElement('img');img.src=s.image.data;m.appendChild(img);preview.append(m)}}
  canvas.appendChild(preview)
}
function addImageContained(slide,img,x,y,w,h){
  if(!img?.data)return
  const ratio=(img.width||1)/(img.height||1),box=w/h;let iw=w,ih=h,ix=x,iy=y
  if(ratio>box){ih=w/ratio;iy=y+(h-ih)/2}else{iw=h*ratio;ix=x+(w-iw)/2}
  slide.addImage({data:img.data,x:ix,y:iy,w:iw,h:ih})
}
function addBase(slide,t,index,total,kicker){
  slide.background={color:t.bg};slide.addShape(pptxgen.ShapeType.rect,{x:0,y:0,w:13.333,h:.08,fill:{color:t.accent},line:{color:t.accent}})
  slide.addText(kicker||'PRESENTATION STUDIO',{x:.8,y:.5,w:8.5,h:.28,fontFace:'Aptos',fontSize:10,bold:true,color:t.accent,charSpacing:1.4,margin:0})
  slide.addText(`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,{x:11.4,y:7.08,w:1.1,h:.2,fontFace:'Aptos',fontSize:8,bold:true,color:t.muted,align:'right',margin:0})
}
function addTitle(slide,text,t,y=.95,size=30,w=10.9){slide.addText(text||'Untitled',{x:.8,y,w,h:1.1,fontFace:'Aptos Display',fontSize:size,bold:true,color:t.text,breakLine:false,margin:0,fit:'shrink'})}
function addBody(slide,body,t,x=.82,y=2.3,w=7.8,h=3.5){const lines=bodyLines(body);slide.addText(lines.map(x=>'• '+x).join('\n'),{x,y,w,h,fontFace:'Aptos',fontSize:18,color:t.muted,breakLine:false,margin:0,paraSpaceAfterPt:12,fit:'shrink',valign:'top'})}
async function exportPptx(){
  if(!state.slides.length)return showToast('Generate or import a deck first')
  const button=studio.querySelector('.ps-export');button.disabled=true;button.textContent='BUILDING…'
  try{
    const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author='Solar Tool System';pptx.company='Solar Tool System';pptx.subject='Presentation Studio export';pptx.title=state.topic||state.slides[0]?.title||'Presentation';pptx.lang='zh-TW'
    const t=THEMES[state.theme]
    state.slides.forEach((s,i)=>{
      const slide=pptx.addSlide();addBase(slide,t,i,state.slides.length,s.kicker)
      if(s.layout==='cover'){
        slide.addShape(pptxgen.ShapeType.rect,{x:8.75,y:.75,w:3.8,h:5.95,fill:{color:t.panel,transparency:5},line:{color:t.accent,transparency:72,width:1}})
        addTitle(slide,s.title,t,1.45,38,7.3);slide.addShape(pptxgen.ShapeType.rect,{x:.82,y:2.86,w:.72,h:.07,fill:{color:t.accent},line:{color:t.accent}});slide.addText(s.body||'',{x:.82,y:3.18,w:6.7,h:1.3,fontFace:'Aptos',fontSize:18,color:t.muted,margin:0,fit:'shrink'})
        if(s.image)addImageContained(slide,s.image,8.95,1.0,3.4,5.45)
      } else if(s.layout==='section'){
        slide.addText(String(i+1).padStart(2,'0'),{x:.8,y:1.15,w:1.5,h:.65,fontFace:'Aptos Display',fontSize:34,bold:true,color:t.accent,margin:0});addTitle(slide,s.title,t,3.25,42,10.8);slide.addText(s.body||'',{x:.82,y:4.75,w:8.6,h:1.1,fontFace:'Aptos',fontSize:17,color:t.muted,margin:0,fit:'shrink'})
      } else if(s.layout==='quote'){
        slide.addShape(pptxgen.ShapeType.rect,{x:1.0,y:1.1,w:.09,h:4.9,fill:{color:t.accent},line:{color:t.accent}});slide.addText(s.title||'',{x:1.55,y:1.45,w:10.1,h:2.2,fontFace:'Aptos Display',fontSize:34,bold:true,color:t.text,margin:0,align:'center',valign:'mid',fit:'shrink'});slide.addText(s.body||'',{x:2.2,y:4.25,w:8.8,h:1.0,fontFace:'Aptos',fontSize:17,color:t.muted,align:'center',margin:0,fit:'shrink'})
      } else if(s.layout==='split'){
        addTitle(slide,s.title,t,1.0,28,6.1);addBody(slide,s.body,t,.82,2.25,5.7,3.9);slide.addShape(pptxgen.ShapeType.roundRect,{x:7.15,y:1.05,w:5.15,h:5.55,rectRadius:.08,fill:{color:t.panel},line:{color:t.accent,transparency:70,width:1}});if(s.image)addImageContained(slide,s.image,7.42,1.32,4.61,5.0);else slide.addText('IMAGE / VISUAL',{x:7.65,y:3.52,w:4.0,h:.35,fontFace:'Aptos',fontSize:12,bold:true,color:t.muted,align:'center',margin:0})
      } else if(s.layout==='stats'){
        addTitle(slide,s.title,t,1.0,28,10.6);const stats=parseStats(s.body);stats.forEach((x,j)=>{const xx=.82+j*4.05;slide.addShape(pptxgen.ShapeType.roundRect,{x:xx,y:2.45,w:3.6,h:2.8,fill:{color:t.panel},line:{color:t.accent,transparency:70,width:1}});slide.addText(x.value,{x:xx+.25,y:2.9,w:3.05,h:.7,fontFace:'Aptos Display',fontSize:32,bold:true,color:t.accent,margin:0,align:'center'});slide.addText(x.label,{x:xx+.3,y:3.85,w:3.0,h:.7,fontFace:'Aptos',fontSize:15,color:t.muted,margin:0,align:'center',fit:'shrink'})})
      } else if(s.layout==='chart'){
        addTitle(slide,s.title,t,1.0,28,10.6);const data=parseChart(s.body),max=Math.max(...data.map(x=>x.value),1);data.forEach((x,j)=>{const yy=2.25+j*.68;slide.addText(x.label,{x:.82,y:yy,w:2.05,h:.26,fontFace:'Aptos',fontSize:11,color:t.muted,margin:0,fit:'shrink'});slide.addShape(pptxgen.ShapeType.rect,{x:3.0,y:yy+.02,w:7.6,h:.19,fill:{color:t.panel},line:{color:t.panel}});slide.addShape(pptxgen.ShapeType.rect,{x:3.0,y:yy+.02,w:Math.max(.12,7.6*x.value/max),h:.19,fill:{color:t.accent},line:{color:t.accent}});slide.addText(String(x.value),{x:10.85,y:yy,w:.85,h:.22,fontFace:'Aptos',fontSize:10,bold:true,color:t.text,align:'right',margin:0})})
      } else {
        addTitle(slide,s.title,t,1.0,28,10.8);slide.addShape(pptxgen.ShapeType.rect,{x:.82,y:2.08,w:.65,h:.06,fill:{color:t.accent},line:{color:t.accent}});addBody(slide,s.body,t,.82,2.45,s.image?6.4:10.2,3.75);if(s.image){slide.addShape(pptxgen.ShapeType.roundRect,{x:7.8,y:2.1,w:4.45,h:3.95,fill:{color:t.panel},line:{color:t.accent,transparency:76,width:1}});addImageContained(slide,s.image,8.0,2.3,4.05,3.55)}
      }
    })
    await pptx.writeFile({fileName:safeName(state.fileName||state.topic)+'.pptx'});showToast('PowerPoint downloaded')
  }catch(err){console.error(err);showToast('PPTX export failed — check browser console')}
  finally{button.disabled=false;button.textContent='DOWNLOAD .PPTX'}
}

function wireJupiter(){
  const entry=document.getElementById('png-cutout-entry');if(!entry)return
  const jupiter=[...entry.querySelectorAll('.function-planet')].find(p=>(p.getAttribute('aria-label')||'').toUpperCase().startsWith('JUPITER:'))
  if(!jupiter)return
  jupiter.dataset.status='active';jupiter.setAttribute('aria-label','JUPITER: PRESENTATION STUDIO')
  const title=jupiter.querySelector('.planet-label b'),meta=jupiter.querySelector('.planet-label span');if(title)title.textContent='05 / PRESENTATION STUDIO';if(meta)meta.textContent='JUPITER · CURRENT'
  jupiter.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openStudio()},true)
}

wireJupiter()
