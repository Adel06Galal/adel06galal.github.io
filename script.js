const canvas=document.querySelector('#space');
let scene,camera,renderer,points,clock,mouse={x:0,y:0},target={x:0,y:0};
function init(){
 if(!window.THREE)return;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);camera.position.z=28;
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
 const n=2400,pos=new Float32Array(n*3),col=new Float32Array(n*3);
 for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*120;pos[i*3+1]=(Math.random()-.5)*75;pos[i*3+2]=(Math.random()-.5)*120;let r=Math.random()<.2;col[i*3]=r?1:.65;col[i*3+1]=r?.12:.6;col[i*3+2]=r?.25:.75}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 points=new THREE.Points(geo,new THREE.PointsMaterial({size:.11,vertexColors:true,transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(points);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(4,2),new THREE.MeshBasicMaterial({color:0x8d1935,wireframe:true,transparent:true,opacity:.18}));core.position.z=-8;scene.add(core);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(6,.015,8,200),new THREE.MeshBasicMaterial({color:0xc52c4b,transparent:true,opacity:.3}));ring.position.z=-8;ring.rotation.x=.8;scene.add(ring);
 clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();points.rotation.y=t*.008+mouse.x*.12;points.rotation.x=mouse.y*.05;core.rotation.x=t*.12;core.rotation.y=t*.09;ring.rotation.z=-t*.04;camera.position.x+=(target.x-camera.position.x)*.025;camera.position.y+=(target.y-camera.position.y)*.025;camera.lookAt(0,0,0);renderer.render(scene,camera)}animate();
}
init();addEventListener('resize',()=>{if(camera&&renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}});
addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth-.5;mouse.y=e.clientY/innerHeight-.5;target.x=mouse.x*2.5;target.y=-mouse.y*1.8;document.querySelector('#xy').textContent=`X ${String(e.clientX).padStart(3,'0')} / Y ${String(e.clientY).padStart(3,'0')}`;let c=document.querySelector('#cursor');if(c){c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'}});
const cur=document.querySelector('#cursor');document.querySelectorAll('a,button').forEach(el=>{el.onmouseenter=()=>cur?.classList.add('hover');el.onmouseleave=()=>cur?.classList.remove('hover')});
addEventListener('load',()=>setTimeout(()=>document.querySelector('#loader').classList.add('done'),1100));
const links=[...document.querySelectorAll('nav a')];const secs=[...document.querySelectorAll('.screen')];new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{threshold:.45}).observe;secs.forEach(s=>new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{threshold:.45}).observe(s));
document.querySelector('#enter').onclick=()=>document.querySelector('#about').scrollIntoView({behavior:'smooth'});
document.querySelectorAll('.node').forEach(b=>b.onclick=()=>{document.querySelectorAll('.node').forEach(n=>n.classList.remove('selected'));b.classList.add('selected');document.querySelector('#skillTitle').textContent=b.dataset.title;document.querySelector('#skillDesc').textContent=b.dataset.desc});
const tm=document.querySelector('#time');function tick(){tm.textContent=new Date().toLocaleTimeString('en-GB',{hour12:false})}tick();setInterval(tick,1000);
let audio=null,osc=null,gain=null,on=false;document.querySelector('#sound').onclick=()=>{on=!on;document.querySelector('#sound b').textContent=on?'ON':'OFF';if(on){audio=audio||new (window.AudioContext||window.webkitAudioContext)();osc=audio.createOscillator();gain=audio.createGain();osc.type='sine';osc.frequency.value=55;gain.gain.value=.008;osc.connect(gain);gain.connect(audio.destination);osc.start()}else if(osc){osc.stop();osc=null}};
