(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const sysReduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let calm=sysReduce||document.documentElement.classList.contains('calm');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
const NAMES=['ORIGIN','THE MIND','THE PATH','THE SYSTEM','ARTIFACTS','THE SIGNAL'];
const el={xy:$('#xy'),cursor:$('#cursor'),sector:$('#sector'),time:$('#time'),loader:$('#loader'),flash:$('#sceneFlash'),sound:$('#sound'),soundState:$('#sound b'),skillTitle:$('#skillTitle'),skillDesc:$('#skillDesc')};
const sections=$$('.screen'),navLinks=$$('nav a'),portals=$$('.portal'),nodes=$$('.node');
let activeScene=0,sceneBusy=false;

/* ---------- Loader (never waits on the CDN forever) ---------- */
const hideLoader=()=>el.loader.classList.add('done');
addEventListener('load',()=>setTimeout(hideLoader,700));
setTimeout(hideLoader,2500);

/* ---------- Three.js background (start/stop so Calm mode can switch it off) ---------- */
const canvas=$('#space');
let renderer=null,scene,camera,points,core,ring,clock,frame=0,raf=0,built=false,failed=false;
const mouse={x:0,y:0},target={x:0,y:0};
function build3D(){
 const small=Math.min(innerWidth,innerHeight)<700||matchMedia('(pointer:coarse)').matches;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);camera.position.z=28;
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!small});
 renderer.setPixelRatio(Math.min(devicePixelRatio,small?1.25:1.75));
 renderer.setSize(innerWidth,innerHeight);
 const n=small?1100:2000,pos=new Float32Array(n*3),col=new Float32Array(n*3);
 for(let i=0;i<n;i++){
  pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=(Math.random()-.5)*75;pos[i*3+2]=(Math.random()-.5)*120;
  const r=Math.random()<.2;col[i*3]=r?1:.65;col[i*3+1]=r?.12:.6;col[i*3+2]=r?.25:.75;
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 points=new THREE.Points(geo,new THREE.PointsMaterial({size:.11,vertexColors:true,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}));
 scene.add(points);
 core=new THREE.Mesh(new THREE.IcosahedronGeometry(4,2),new THREE.MeshBasicMaterial({color:0x8d1935,wireframe:true,transparent:true,opacity:.18}));
 core.position.z=-8;scene.add(core);
 ring=new THREE.Mesh(new THREE.TorusGeometry(6,.015,8,200),new THREE.MeshBasicMaterial({color:0xc52c4b,transparent:true,opacity:.3}));
 ring.position.z=-8;ring.rotation.x=.8;scene.add(ring);
 clock=new THREE.Clock();
 camera.lookAt(0,0,0);
 built=true;
}
function loop(){
 raf=requestAnimationFrame(loop);
 if(document.hidden)return;
 // Outside the hero the background is only ambience: render at half rate.
 if(activeScene!==0&&(frame++&1))return;
 const t=clock.getElapsedTime();
 points.rotation.y=t*.008+mouse.x*.12;points.rotation.x=mouse.y*.05;
 core.rotation.x=t*.12;core.rotation.y=t*.09;ring.rotation.z=-t*.04;
 camera.position.x+=(target.x-camera.position.x)*.025;
 camera.position.y+=(target.y-camera.position.y)*.025;
 camera.lookAt(0,0,0);
 renderer.render(scene,camera);
}
function start3D(){
 if(failed||!window.THREE)return;
 try{if(!built)build3D();canvas.style.display='';if(!raf)loop()}
 catch(err){failed=true;renderer=null;canvas.style.display='none';console.warn('3D background disabled:',err)}
}
function stop3D(){if(raf){cancelAnimationFrame(raf);raf=0}canvas.style.display='none'}
let resizeT;
addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(()=>{
 if(renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
 evalLayout();
},120)},{passive:true});

/* ---------- Pointer: one rAF-throttled handler, cached nodes ---------- */
let px=0,py=0,pending=false;
function paintPointer(){
 pending=false;
 mouse.x=px/innerWidth-.5;mouse.y=py/innerHeight-.5;
 target.x=mouse.x*2.5;target.y=-mouse.y*1.8;
 el.xy.textContent=`X ${String(px).padStart(3,'0')} / Y ${String(py).padStart(3,'0')}`;
 if(el.cursor){el.cursor.style.left=px+'px';el.cursor.style.top=py+'px'}
}
if(finePointer){
 addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;if(!pending){pending=true;requestAnimationFrame(paintPointer)}},{passive:true});
 document.addEventListener('mouseover',e=>{if(e.target.closest('a,button'))el.cursor?.classList.add('hover')});
 document.addEventListener('mouseout',e=>{if(e.target.closest('a,button'))el.cursor?.classList.remove('hover')});
}

/* ---------- Clock ---------- */
function tick(){if(!document.hidden)el.time.textContent=new Date().toLocaleTimeString('en-GB',{hour12:false})}
tick();setInterval(tick,1000);

/* ---------- Skills: selection, links to projects ---------- */
const projects=$$('.project'),usedEl=$('#skillUsed'),litNote=$('#litNote'),litName=$('#litName');
let selected=null;
const DEFAULT_TITLE=el.skillTitle.textContent,DEFAULT_DESC=el.skillDesc.textContent;
function setUsed(matches){
 usedEl.textContent='';
 const label=document.createElement('span');
 if(!matches.length){
  const a=document.createElement('a');a.href='https://github.com/Adel06Galal';a.target='_blank';a.rel='noopener noreferrer';a.textContent='GITHUB ↗';
  label.textContent='MORE ON ';usedEl.append(label,a);return;
 }
 label.textContent='USED IN ';usedEl.append(label);
 matches.forEach((p,i)=>{
  if(i)usedEl.append(' · ');
  const a=document.createElement('a');a.href=p.getAttribute('href');a.textContent=p.querySelector('h3').textContent.toUpperCase();usedEl.append(a);
 });
}
function clearSelection(){
 selected=null;
 nodes.forEach(n=>{n.classList.remove('selected');n.setAttribute('aria-pressed','false')});
 el.skillTitle.textContent=DEFAULT_TITLE;el.skillDesc.textContent=DEFAULT_DESC;usedEl.textContent='';
 projects.forEach(p=>p.classList.remove('lit'));litNote.hidden=true;
}
function selectNode(b){
 if(selected===b){clearSelection();return}
 clearSelection();selected=b;
 b.classList.add('selected');b.setAttribute('aria-pressed','true');
 el.skillTitle.textContent=b.dataset.title.replace(/&amp;/g,'&');el.skillDesc.textContent=b.dataset.desc;
 const key=b.dataset.key;
 const matches=projects.filter(p=>(p.dataset.skills||'').split(' ').includes(key));
 setUsed(matches);
 matches.forEach(p=>p.classList.add('lit'));
 if(matches.length){litName.textContent=b.dataset.title.replace(/&amp;/g,'&');litNote.hidden=false}
}
nodes.forEach(b=>b.addEventListener('click',()=>selectNode(b)));
$('#litClear').addEventListener('click',clearSelection);

/* ---------- Orbiting orbs ---------- */
// Rest positions (x%,y% of each orbit box) of the desktop layout. They were chosen so that no two orbs
// ever touch during a full revolution; smaller screens keep the static layout from the HTML.
const SLOTS={cpp:[86.1,15.4],py:[81.6,88.8],dsa:[40.4,.9],web:[51.5,100],cv:[99.2,40.9],ml:[87.3,83.3],java:[36,2],sql:[24.8,93.2],creative:[57.6,.6]};
const orbNodes=$$('.orbit .node'),con=$('.constellation');
orbNodes.forEach(n=>{n.dataset.x0=n.style.getPropertyValue('--x');n.dataset.y0=n.style.getPropertyValue('--y')});
const OMEGA=2*Math.PI/160;            // one revolution per 160 s
let motionLayout=false,phase=0,orbRaf=0,orbLast=0,orbVisible=false,orbPaused=false;
const dims=new Map();
function measure(){orbNodes.forEach(n=>{const o=n.parentElement;dims.set(o,[o.offsetWidth,o.offsetHeight])})}
function evalLayout(){
 const want=innerWidth>=901&&con.offsetWidth>=540&&con.offsetHeight>=440;
 if(want===motionLayout){if(want)measure();return}
 motionLayout=want;phase=0;
 orbNodes.forEach(n=>{
  n.style.removeProperty('--dx');n.style.removeProperty('--dy');
  if(want){const [x,y]=SLOTS[n.dataset.key];n.style.setProperty('--x',x+'%');n.style.setProperty('--y',y+'%');n._t=Math.atan2((y-50)/50,(x-50)/50)}
  else{n.style.setProperty('--x',n.dataset.x0);n.style.setProperty('--y',n.dataset.y0)}
 });
 if(want)measure();
 syncOrbit();
}
function applyPhase(){
 orbNodes.forEach(n=>{
  const [W,H]=dims.get(n.parentElement),t=n._t+phase;
  n.style.setProperty('--dx',(W*(Math.cos(t)-Math.cos(n._t))/2).toFixed(2)+'px');
  n.style.setProperty('--dy',(H*(Math.sin(t)-Math.sin(n._t))/2).toFixed(2)+'px');
 });
}
function orbTick(ts){
 orbRaf=requestAnimationFrame(orbTick);
 const dt=Math.min((ts-orbLast)/1000,.1);orbLast=ts;
 if(document.hidden||orbPaused)return;
 phase+=OMEGA*dt;applyPhase();
}
function syncOrbit(){
 const run=!calm&&motionLayout&&orbVisible;
 if(run&&!orbRaf){orbLast=performance.now();orbRaf=requestAnimationFrame(orbTick)}
 else if(!run&&orbRaf){cancelAnimationFrame(orbRaf);orbRaf=0}
}
// Orbs hold still while you point at or focus one, so they are easy to hit.
con.addEventListener('mouseover',e=>{if(e.target.closest('.node'))orbPaused=true});
con.addEventListener('mouseout',e=>{if(e.target.closest('.node'))orbPaused=false});
con.addEventListener('focusin',e=>{if(e.target.closest('.node'))orbPaused=true});
con.addEventListener('focusout',()=>{orbPaused=false});
new IntersectionObserver(es=>es.forEach(e=>{orbVisible=e.isIntersecting;syncOrbit()})).observe($('#skills'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected)clearSelection()});

/* ---------- Calm mode ---------- */
const calmBtn=$('#calm'),calmState=$('#calm b');
function applyCalm(on,persist){
 calm=on;
 document.documentElement.classList.toggle('calm',on);
 calmBtn.setAttribute('aria-pressed',on);calmState.textContent=on?'ON':'OFF';
 if(on)stop3D();else start3D();
 syncOrbit();
 if(persist){try{localStorage.setItem('calm',on?'1':'0')}catch(e){}}
}
if(sysReduce){calmBtn.setAttribute('aria-disabled','true');calmBtn.title='Your device is set to reduce motion'}
calmBtn.addEventListener('click',()=>{if(!sysReduce)applyCalm(!calm,true)});

/* ---------- Sound ---------- */
let audio=null,osc=null,on=false;
el.sound.addEventListener('click',()=>{
 on=!on;el.soundState.textContent=on?'ON':'OFF';el.sound.setAttribute('aria-pressed',on);
 if(on){
  audio=audio||new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  osc=audio.createOscillator();const gain=audio.createGain();
  osc.type='sine';osc.frequency.value=55;gain.gain.value=.008;
  osc.connect(gain);gain.connect(audio.destination);osc.start();
 }else if(osc){osc.stop();osc=null}
});

/* ---------- Scene navigation ---------- */
const behavior=()=>calm?'auto':'smooth';
function setActive(i){
 activeScene=i;
 navLinks.forEach((a,k)=>{const on=k===i;a.classList.toggle('active',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
 portals.forEach((b,k)=>{const on=k===i;b.classList.toggle('active',on);on?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
 el.sector.innerHTML=`SECTOR ${String(i).padStart(2,'0')}<span class="sname"> / ${NAMES[i]}</span>`;
 document.body.classList.toggle('away',i!==0);
}
function goScene(n){
 n=Math.max(0,Math.min(sections.length-1,n));
 if(sceneBusy||n===activeScene)return;
 sceneBusy=true;setActive(n);
 if(!calm)el.flash.animate([{opacity:0},{opacity:.12},{opacity:0}],{duration:520,easing:'ease-out'});
 sections[n].scrollIntoView({behavior:behavior(),block:'start'});
 if(!calm){sections[n].classList.remove('scene-enter');void sections[n].offsetWidth;sections[n].classList.add('scene-enter')}
 setTimeout(()=>{sceneBusy=false;syncFromScroll()},calm?0:1000);
}
portals.forEach(b=>b.addEventListener('click',()=>goScene(Number(b.dataset.scene))));
navLinks.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();goScene(i)}));
$('#enter').addEventListener('click',()=>goScene(1));
// Only ← → jump between scenes; ↑ ↓ PageUp PageDown keep native scrolling.
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('input,textarea,select'))return;
 if(e.key==='ArrowRight'){e.preventDefault();goScene(activeScene+1)}
 else if(e.key==='ArrowLeft'){e.preventDefault();goScene(activeScene-1)}
});
// Find the section nearest the viewport centre (used after a programmatic jump).
function syncFromScroll(){
 const mid=innerHeight/2;let best=0,dist=Infinity;
 sections.forEach((s,i)=>{const r=s.getBoundingClientRect();const d=Math.abs((r.top+r.bottom)/2-mid);if(d<dist){dist=d;best=i}});
 if(best!==activeScene)setActive(best);
}
// One observer drives nav, portals and HUD while scrolling.
const io=new IntersectionObserver(es=>es.forEach(e=>{
 if(e.isIntersecting&&!sceneBusy){const i=sections.indexOf(e.target);if(i>=0&&i!==activeScene)setActive(i)}
}),{rootMargin:'-50% 0px -50% 0px',threshold:0});
sections.forEach(s=>io.observe(s));

/* ---------- Boot ---------- */
evalLayout();
applyCalm(calm,false);
})();
