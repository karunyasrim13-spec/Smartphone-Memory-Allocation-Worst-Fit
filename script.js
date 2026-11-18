const TOTAL=8192;
const COLORS=['#2f7de1','#e0457b','#16a37f','#c77d0a','#7b5cd6','#d1463d','#0f8fa8','#6b8f1f'];
const PRESET=[['WhatsApp',300],['Instagram',650],['Camera',450],['YouTube',800],['Maps',700],['Chrome',1100],['Game',1800],['Notes',120]];
let mem,log,ci,sizeOf;
function init(){
  ci=0;
  mem=[];
  const seed=[['os','System',1536],['free','',1800],['app','Spotify',400],['free','',900],['app','Chrome',1100],['free','',1200],['app','Maps',700],['free','',556]];
  seed.forEach(s=>mem.push({t:s[0],n:s[1],s:s[2],c:s[0]=='app'?COLORS[ci++%COLORS.length]:null}));
  log=[];say('RAM ready. Open an app to see Worst Fit pick the largest hole.');
  render();
}
function say(t,bad){log.unshift({t,bad});if(log.length>30)log.pop()}
function holes(){return mem.map((b,i)=>({b,i})).filter(x=>x.b.t==='free')}
function merge(){
  for(let i=mem.length-2;i>=0;i--){
    if(mem[i].t==='free'&&mem[i+1].t==='free'){mem[i].s+=mem[i+1].s;mem.splice(i+1,1)}
  }
}
function launch(name,size){
  size=Math.round(size);
  if(!name||!(size>0)){say('Enter an app name and a size in MB.',true);return render()}
  if(size>TOTAL){say('That size is more than the phone’s total RAM.',true);return render()}
  const h=holes();
  const totalFree=h.reduce((a,x)=>a+x.b.s,0);
  if(!h.length||Math.max(...h.map(x=>x.b.s))<size){
    say(totalFree>=size
      ?`Can’t open ${name} (${size} MB). ${totalFree} MB is free in total, but the largest hole is only ${Math.max(0,...h.map(x=>x.b.s))} MB. Close an app to merge holes.`
      :`Can’t open ${name} (${size} MB). Only ${totalFree} MB of RAM is free. Close an app first.`,true);
    return render();
  }
  const win=h.reduce((a,x)=>x.b.s>a.b.s?x:a);
  const list=h.map(x=>x.b.s+' MB').join(', ');
  const left=win.b.s-size;
  const blk={t:'app',n:name,s:size,c:COLORS[ci++%COLORS.length]};
  mem.splice(win.i,1,...(left>0?[blk,{t:'free',n:'',s:left}]:[blk]));
  say(`${name} needs ${size} MB. Holes: ${list}. Worst Fit picks the largest, ${win.b.s} MB, leaving ${left} MB free.`);
  render(win.i,h.map(x=>x.i>win.i&&left>0?x.i+1:x.i));
}
function closeApp(i){
  const b=mem[i];say(`${b.n} closed. Its ${b.s} MB is free again.`);
  mem[i]={t:'free',n:'',s:b.s};merge();render();
}
function render(winIdx,cands){
  const ram=document.getElementById('ram');ram.innerHTML='';
  mem.forEach((b,i)=>{
    const d=document.createElement('div');
    d.className='blk '+b.t;
    d.style.height=Math.max(30,Math.round(b.s/TOTAL*560))+'px';
    if(b.t==='app')d.style.background=b.c;
    const l=document.createElement('span');
    l.textContent=(b.t==='free'?'Free':b.n)+' · '+b.s+' MB';
    d.appendChild(l);
    if(b.t==='app'){const x=document.createElement('button');x.type='button';x.textContent='Close';x.setAttribute('aria-label','Close '+b.n);x.onclick=()=>closeApp(i);d.appendChild(x)}
    ram.appendChild(d);
  });
  const h=holes(),free=h.reduce((a,x)=>a+x.b.s,0);
  sFree.textContent=free;sBig.textContent=Math.max(0,...h.map(x=>x.b.s));sHoles.textContent=h.length;
  used.textContent=(TOTAL-free)+' MB used';
  if(cands){const kids=ram.children;
    cands.forEach(i=>{if(kids[i]&&mem[i]&&mem[i].t==='free')kids[i].classList.add('cand')});
    const f=winIdx+1;if(kids[f]&&mem[f]&&mem[f].t==='free')kids[f].classList.add('win');
  }
  const L=document.getElementById('log');L.innerHTML='';
  log.forEach(e=>{const li=document.createElement('li');li.textContent=e.t;if(e.bad)li.className='bad';L.appendChild(li)});
}
PRESET.forEach(([n,s])=>{
  const b=document.createElement('button');b.type='button';b.className='app';
  b.innerHTML='<b></b><span></span>';b.firstChild.textContent=n;b.lastChild.textContent=s+' MB';
  b.onclick=()=>launch(n,s);document.getElementById('apps').appendChild(b);
});
document.getElementById('add').onclick=()=>{launch(cn.value.trim(),+cs.value);cn.value='';cs.value=''};
document.getElementById('reset').onclick=init;
document.getElementById('theme').onclick=()=>{
  const r=document.documentElement,dark=matchMedia('(prefers-color-scheme:dark)').matches;
  const cur=r.dataset.theme||(dark?'dark':'light');
  r.dataset.theme=cur==='dark'?'light':'dark';
};
init();