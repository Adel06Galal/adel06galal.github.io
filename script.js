(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
const NAMES=['ORIGIN','THE MIND','THE SYSTEM','ARTIFACTS','THE SIGNAL'];
const el={xy:$('#xy'),cursor:$('#cursor'),sector:$('#sector'),time:$('#time'),loader:$('#loader'),flash:$('#sceneFlash'),sound:$('#sound'),soundState:$('#sound b'),skillTitle:$('#skillTitle'),skillDesc:$('#skillDesc')};
const sections=$$('.screen'),navLinks=$$('nav a'),portals=$$('.portal'),nodes=$$('.node');
let activeScene=0,sceneBusy=false;

/* ---------- Loader (never waits on the CDN forever) ---------- */
const hideLoader=()=>el.loader.classList.add('done');
addEventListener('load',()=>setTimeout(hideLoader,700));
setTimeout(hideLoader,2500);

/* ---------- Three.js background ---------- */
const canvas=$('#space');
let renderer,scene,camera,points,core,ring,clock,frame=0;
const mouse={x:0,y:0},target={x:0,y:0};
function init3D(){
 if(!window.THREE)return;
 const small=innerWidth<700;
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
 if(reduce){renderer.render(scene,camera);return}
 (function animate(){
  requestAnimationFrame(animate);
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
 })();
}
try{init3D()}catch(err){renderer=null;canvas.style.display='none';console.warn('3D background disabled:',err)}
let resizeT;
addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(()=>{
 if(!renderer)return;
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
 if(reduce)renderer.render(scene,camera);
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

/* ---------- Skills ---------- */
nodes.forEach(b=>b.addEventListener('click',()=>{
 nodes.forEach(n=>n.classList.remove('selected'));b.classList.add('selected');
 el.skillTitle.textContent=b.dataset.title;el.skillDesc.textContent=b.dataset.desc;
}));

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
const behavior=reduce?'auto':'smooth';
function setActive(i){
 activeScene=i;
 navLinks.forEach((a,k)=>{const on=k===i;a.classList.toggle('active',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
 portals.forEach((b,k)=>{const on=k===i;b.classList.toggle('active',on);on?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
 el.sector.textContent=`SECTOR ${String(i).padStart(2,'0')} / ${NAMES[i]}`;
}
function goScene(n){
 n=Math.max(0,Math.min(sections.length-1,n));
 if(sceneBusy||n===activeScene)return;
 sceneBusy=true;setActive(n);
 if(!reduce)el.flash.animate([{opacity:0},{opacity:.12},{opacity:0}],{duration:520,easing:'ease-out'});
 sections[n].scrollIntoView({behavior,block:'start'});
 if(!reduce){sections[n].classList.remove('scene-enter');void sections[n].offsetWidth;sections[n].classList.add('scene-enter')}
 setTimeout(()=>{sceneBusy=false;syncFromScroll()},reduce?0:1000);
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
}),{threshold:.55});
sections.forEach(s=>io.observe(s));
})();
