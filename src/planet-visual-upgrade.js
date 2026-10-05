const entry=document.getElementById('png-cutout-entry');
if(entry&&!document.getElementById('planet-visual-upgrade-style')){
 const s=document.createElement('style');s.id='planet-visual-upgrade-style';s.textContent=`
 #png-cutout-entry .function-planet{--planet-scale:1;transform:translate3d(var(--x),var(--y),0) scale(var(--planet-scale))!important;transform-origin:center;box-shadow:inset -5px -7px 12px rgba(0,0,0,.28),inset 4px 4px 8px rgba(255,255,255,.13),0 0 24px rgba(255,255,255,.08)!important;transition:transform .42s cubic-bezier(.2,.8,.2,1),filter .42s ease,box-shadow .42s ease!important}
 #png-cutout-entry .function-planet:hover,#png-cutout-entry .function-planet:focus-visible{--planet-scale:1.15;z-index:20;filter:saturate(1.18) brightness(1.12);border-color:rgba(201,255,57,.62)!important;box-shadow:inset -6px -8px 14px rgba(0,0,0,.24),inset 5px 5px 10px rgba(255,255,255,.16),0 0 34px rgba(201,255,57,.16)!important;outline:none}
 #png-cutout-entry .function-planet[data-status="future"]{opacity:.66!important;cursor:pointer!important}#png-cutout-entry .function-planet[data-status="future"]:hover{opacity:.92!important}
 #png-cutout-entry .function-planet[data-planet="MERCURY"]{background:radial-gradient(circle at 30% 25%,#f0e7da,#9b9086 34%,#554e49 68%,#252220 100%)}
 #png-cutout-entry .function-planet[data-planet="VENUS"]{background:radial-gradient(circle at 30% 25%,#fff0c8,#d6a55e 34%,#9b6237 68%,#422d24 100%)}
 #png-cutout-entry .function-planet[data-planet="MARS"]{background:radial-gradient(circle at 30% 25%,#ffd0ae,#c5724e 34%,#8b3e2e 68%,#38201e 100%)}
 #png-cutout-entry .function-planet[data-planet="JUPITER"]{background:repeating-linear-gradient(178deg,#dcc5a9 0 12%,#a96e50 12% 22%,#ead8c5 22% 34%,#8c5947 34% 43%,#d7b18a 43% 58%,#77483c 58% 66%,#d6c4b0 66% 100%)}
 #png-cutout-entry .function-planet[data-planet="SATURN"]{background:radial-gradient(circle at 30% 25%,#fff0be,#d7bd7d 38%,#9b8053 70%,#4e432f 100%)}
 #png-cutout-entry .function-planet[data-planet="URANUS"]{background:radial-gradient(circle at 30% 25%,#e9ffff,#9bd8dd 38%,#65aeb8 70%,#315b69 100%)}
 #png-cutout-entry .function-planet[data-planet="NEPTUNE"]{background:radial-gradient(circle at 30% 25%,#d9e4ff,#6b8dd8 38%,#3559a8 70%,#1a2e61 100%)}
 #png-cutout-entry .function-planet[data-planet="PLUTO"]{background:radial-gradient(circle at 30% 25%,#e7d8c9,#a78975 38%,#705746 70%,#342b28 100%)}
 #png-cutout-entry .earth-function{transition:transform .42s cubic-bezier(.2,.8,.2,1),filter .42s ease}#png-cutout-entry .earth-function:hover,#png-cutout-entry .earth-function:focus-visible{transform:translate(-50%,-50%) scale(1.12);filter:drop-shadow(0 0 24px rgba(201,255,57,.22))}
 #png-cutout-entry .globe-canvas{scale:1;transition:scale .42s cubic-bezier(.2,.8,.2,1),filter .42s ease}#png-cutout-entry.earth-hover .globe-canvas{scale:1.12;filter:drop-shadow(0 0 26px rgba(201,255,57,.15))}
 @media(max-width:700px){#png-cutout-entry .function-planet{--size:20px!important}#png-cutout-entry .function-planet:active{--planet-scale:1.14}}
 `;document.head.appendChild(s);
 entry.querySelectorAll('.function-planet').forEach(p=>{const a=p.getAttribute('aria-label')||'';p.dataset.planet=a.split(':')[0].trim().toUpperCase()});
 const earth=entry.querySelector('.earth-function');if(earth){earth.onmouseenter=()=>entry.classList.add('earth-hover');earth.onmouseleave=()=>entry.classList.remove('earth-hover');earth.onfocus=()=>entry.classList.add('earth-hover');earth.onblur=()=>entry.classList.remove('earth-hover')}
}
