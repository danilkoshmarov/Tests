const palettes=[
{name:'Electric Violet',sub:'bold · futuristic',a:'#9b83ff',b:'#50e3d2',bg:'#090b13',surface:'#121626',surface2:'#1a2033',glow:'rgba(155,131,255,.23)'},
{name:'Arctic Blue',sub:'clean · focused',a:'#69a9ff',b:'#79e5ee',bg:'#08111d',surface:'#101e30',surface2:'#172a40',glow:'rgba(105,169,255,.24)'},
{name:'Solar Flare',sub:'warm · energetic',a:'#ff8b61',b:'#ffd36e',bg:'#160d0c',surface:'#241613',surface2:'#352018',glow:'rgba(255,139,97,.22)'},
{name:'Emerald Aura',sub:'natural · premium',a:'#4ed6a0',b:'#b4e77b',bg:'#07140f',surface:'#102219',surface2:'#183326',glow:'rgba(78,214,160,.22)'},
{name:'Rose Quartz',sub:'soft · elegant',a:'#f28ab8',b:'#b69aff',bg:'#170d18',surface:'#251626',surface2:'#35203a',glow:'rgba(242,138,184,.22)'},
{name:'Cyber Lime',sub:'sharp · digital',a:'#c4f46b',b:'#52dfc0',bg:'#0d120b',surface:'#192015',surface2:'#26321d',glow:'rgba(196,244,107,.2)'},
{name:'Crimson Noir',sub:'dramatic · bold',a:'#ff5c78',b:'#ffad72',bg:'#150a11',surface:'#24121d',surface2:'#351927',glow:'rgba(255,92,120,.23)'},
{name:'Ocean Depth',sub:'calm · immersive',a:'#3dcae8',b:'#657dff',bg:'#071018',surface:'#0e1c29',surface2:'#142b3c',glow:'rgba(61,202,232,.22)'},
{name:'Golden Hour',sub:'rich · refined',a:'#e9bd69',b:'#f18b70',bg:'#15110b',surface:'#241d12',surface2:'#342918',glow:'rgba(233,189,105,.2)'},
{name:'Mono Chrome',sub:'minimal · timeless',a:'#d4d9e8',b:'#858da5',bg:'#0c0e13',surface:'#171a22',surface2:'#222632',glow:'rgba(190,200,225,.17)'}
];
let selected=localStorage.getItem('forma-palette')||'Electric Violet';let light=false;
const root=document.documentElement;
function applyPalette(p){selected=p.name;root.style.setProperty('--a',p.a);root.style.setProperty('--b',p.b);root.style.setProperty('--bg',light?'#f3f5fb':p.bg);root.style.setProperty('--surface',light?'#ffffff':p.surface);root.style.setProperty('--surface2',light?'#e9edf7':p.surface2);root.style.setProperty('--glow',p.glow);root.style.setProperty('--grad',`linear-gradient(125deg,${p.a},${p.b})`);document.body.style.color=light?'#171b29':'var(--text)';document.body.style.setProperty('--text',light?'#171b29':'#f4f6ff');document.body.style.setProperty('--muted',light?'#667087':'#929bb2');document.body.style.setProperty('--line',light?'rgba(25,35,60,.12)':'rgba(255,255,255,.09)');localStorage.setItem('forma-palette',p.name);renderPalettes()}
function renderPalettes(){document.getElementById('paletteGrid').innerHTML=palettes.map(p=>`<button class="palette ${p.name===selected?'active':''}" data-palette="${p.name}"><span class="check">✓</span><span class="swatches"><i style="background:${p.bg}"></i><i style="background:${p.surface}"></i><i style="background:${p.a}"></i><i style="background:${p.b}"></i></span><b>${p.name}</b><small>${p.sub}</small></button>`).join('')}
document.getElementById('paletteGrid').addEventListener('click',e=>{const b=e.target.closest('[data-palette]');if(!b)return;applyPalette(palettes.find(p=>p.name===b.dataset.palette));applyDesignSettings();toast('Палитра «'+selected+'» применена')});
document.getElementById('modeBtn').addEventListener('click',()=>{light=!light;applyPalette(palettes.find(p=>p.name===selected));applyDesignSettings();document.getElementById('modeBtn').textContent=light?'☾':'☼';toast(light?'Светлая тема':'Тёмная тема')});
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=document.createElement('span');r.className='ripple';const rect=b.getBoundingClientRect(),size=Math.max(rect.width,rect.height);r.style.width=r.style.height=size+'px';r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';b.appendChild(r);setTimeout(()=>r.remove(),600)});
document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
document.getElementById('toggle').addEventListener('click',e=>{const on=e.currentTarget.classList.toggle('on');document.getElementById('toggleText').textContent=on?'Переключатель включён':'Переключатель выключен';toast(on?'Режим активирован':'Режим отключён')});
document.getElementById('shakeBtn').addEventListener('click',e=>{e.currentTarget.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(0)'}],{duration:350});toast('Вот так работает feedback')});
document.getElementById('intensity').addEventListener('input',e=>{const v=e.target.value;document.getElementById('intensityValue').textContent=v+'%';const p=palettes.find(x=>x.name===selected);root.style.setProperty('--glow',p.glow.replace(/\.\d+\)/, (v/100).toFixed(2)+')'))});
const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');observer.unobserve(x.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const glow=document.getElementById('cursorGlow');
// Cursor glow: coalesce pointer events and cap JS updates at 244 FPS.
// requestAnimationFrame remains synced to the monitor refresh rate (60/120/144/240 Hz).
const MAX_FPS=244,FRAME_MS=1000/MAX_FPS;let pointerX=-1000,pointerY=-1000,lastGlowFrame=0,glowFramePending=false;
window.addEventListener('pointermove',e=>{pointerX=e.clientX;pointerY=e.clientY;if(!glowFramePending){glowFramePending=true;requestAnimationFrame(updateCursorGlow)}},{passive:true});
function updateCursorGlow(timestamp){glowFramePending=false;if(timestamp-lastGlowFrame<FRAME_MS){glowFramePending=true;requestAnimationFrame(updateCursorGlow);return}lastGlowFrame=timestamp;glow.style.transform=`translate3d(${pointerX-130}px,${pointerY-130}px,0)`;}
applyPalette(palettes.find(p=>p.name===selected)||palettes[0]);

const settingsPanel=document.getElementById('settingsPanel'),settingsOverlay=document.getElementById('settingsOverlay');
function openSettings(){settingsPanel.classList.add('open');settingsOverlay.classList.add('open');settingsPanel.setAttribute('aria-hidden','false')}
function closeSettings(){settingsPanel.classList.remove('open');settingsOverlay.classList.remove('open');settingsPanel.setAttribute('aria-hidden','true')}
document.getElementById('settingsOpen').addEventListener('click',openSettings);
document.getElementById('settingsClose').addEventListener('click',closeSettings);
document.getElementById('settingsDone').addEventListener('click',closeSettings);
settingsOverlay.addEventListener('click',closeSettings);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});
const settingDefaults={radius:20,blur:24,glow:22,cursor:true,motion:true,font:'modern',button:'rounded',density:76,animation:'balanced',shadow:true,grid:false,tilt:false,magnetic:false,aurora:false,particles:false};
const stylePresets={
 signature:{radius:20,blur:24,glow:22,font:'modern',button:'rounded',density:76,animation:'balanced',shadow:true,grid:false},
 minimal:{radius:12,blur:8,glow:10,font:'geometric',button:'sharp',density:58,animation:'snappy',shadow:false,grid:false},
 soft:{radius:28,blur:34,glow:35,font:'modern',button:'pill',density:92,animation:'soft',shadow:true,grid:false},
 bold:{radius:14,blur:14,glow:48,font:'geometric',button:'rounded',density:68,animation:'cinematic',shadow:true,grid:true}
};
function readSettings(){try{return {...settingDefaults,...JSON.parse(localStorage.getItem('forma-design-settings')||'{}')}}catch{return {...settingDefaults}}}
let designSettings=readSettings();
function saveSettings(){localStorage.setItem('forma-design-settings',JSON.stringify(designSettings))}
function setSwitch(id,on){const el=document.getElementById(id);el.classList.toggle('on',on);el.setAttribute('aria-pressed',String(on))}
function applyDesignSettings(){
 root.style.setProperty('--ui-radius',designSettings.radius+'px');
 root.style.setProperty('--glass-blur',designSettings.blur+'px');
 root.style.setProperty('--section-space',designSettings.density+'px');
 document.body.classList.toggle('font-editorial',designSettings.font==='editorial');
 document.body.classList.toggle('font-geometric',designSettings.font==='geometric');
 document.body.classList.toggle('buttons-pill',designSettings.button==='pill');
 document.body.classList.toggle('buttons-sharp',designSettings.button==='sharp');
 document.body.classList.toggle('shadow-off',!designSettings.shadow);
 document.body.classList.toggle('bg-grid',designSettings.grid);
 ['soft','snappy','cinematic'].forEach(v=>document.body.classList.toggle('motion-'+v,designSettings.animation===v));
 document.getElementById('fontControl').value=designSettings.font;
 document.getElementById('buttonControl').value=designSettings.button;
 document.getElementById('densityControl').value=designSettings.density;
 document.getElementById('densityValue').textContent=designSettings.density+' px';
 document.getElementById('animationControl').value=designSettings.animation;
 setSwitch('shadowSwitch',designSettings.shadow);setSwitch('gridSwitch',designSettings.grid);
 setSwitch('tiltSwitch',designSettings.tilt);setSwitch('magneticSwitch',designSettings.magnetic);setSwitch('auroraSwitch',designSettings.aurora);setSwitch('particlesSwitch',designSettings.particles);
 document.body.classList.toggle('tilt-enabled',designSettings.tilt);document.body.classList.toggle('magnetic-enabled',designSettings.magnetic);document.body.classList.toggle('aurora-on',designSettings.aurora);
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===window.activeDesignPreset));
 const p=palettes.find(x=>x.name===selected)||palettes[0];
 const alpha=(designSettings.glow/100).toFixed(2);
 root.style.setProperty('--glow',p.glow.replace(/\.\d+\)/,alpha+')'));
 document.getElementById('radiusControl').value=designSettings.radius;
 document.getElementById('radiusValue').textContent=designSettings.radius+' px';
 document.getElementById('blurControl').value=designSettings.blur;
 document.getElementById('blurValue').textContent=designSettings.blur+' px';
 document.getElementById('glowControl').value=designSettings.glow;
 document.getElementById('glowValue').textContent=designSettings.glow+'%';
 document.body.classList.toggle('no-cursor-glow',!designSettings.cursor);
 document.body.classList.toggle('motion-off',!designSettings.motion);
 setSwitch('cursorSwitch',designSettings.cursor);setSwitch('motionSwitch',designSettings.motion);
}
[['radiusControl','radius','radiusValue',' px'],['blurControl','blur','blurValue',' px'],['glowControl','glow','glowValue','%']].forEach(([id,key,label,unit])=>{
 document.getElementById(id).addEventListener('input',e=>{designSettings[key]=Number(e.target.value);document.getElementById(label).textContent=designSettings[key]+unit;applyDesignSettings();saveSettings()});
});
document.getElementById('cursorSwitch').addEventListener('click',()=>{designSettings.cursor=!designSettings.cursor;applyDesignSettings();saveSettings()});
document.getElementById('motionSwitch').addEventListener('click',()=>{designSettings.motion=!designSettings.motion;applyDesignSettings();saveSettings()});
document.getElementById('settingsReset').addEventListener('click',()=>{designSettings={...settingDefaults};window.activeDesignPreset='signature';applyDesignSettings();saveSettings();toast('Настройки сброшены')});
[['fontControl','font'],['buttonControl','button'],['animationControl','animation']].forEach(([id,key])=>document.getElementById(id).addEventListener('change',e=>{designSettings[key]=e.target.value;window.activeDesignPreset=null;applyDesignSettings();saveSettings()}));
document.getElementById('densityControl').addEventListener('input',e=>{designSettings.density=Number(e.target.value);window.activeDesignPreset=null;applyDesignSettings();saveSettings()});
['shadow','grid'].forEach(key=>document.getElementById(key+'Switch').addEventListener('click',()=>{designSettings[key]=!designSettings[key];window.activeDesignPreset=null;applyDesignSettings();saveSettings()}));
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{window.activeDesignPreset=b.dataset.preset;designSettings={...designSettings,...stylePresets[b.dataset.preset]};applyDesignSettings();saveSettings();toast('Стиль '+b.textContent.trim()+' применён')}));


/* Advanced effects: only run on pointer devices and respect reduced-motion. */
const motionAllowed=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function bindEffectSwitch(id,key,after){document.getElementById(id).addEventListener('click',()=>{designSettings[key]=!designSettings[key];window.activeDesignPreset=null;applyDesignSettings();saveSettings();if(after)after();});}
bindEffectSwitch('tiltSwitch','tilt',setupTilt);
bindEffectSwitch('magneticSwitch','magnetic',setupMagnetic);
bindEffectSwitch('auroraSwitch','aurora');
bindEffectSwitch('particlesSwitch','particles',setupParticles);
let tiltBound=false;
function setupTilt(){
 if(!designSettings.tilt||!motionAllowed||!finePointer||tiltBound)return;
 tiltBound=true;
 document.querySelectorAll('.panel,.feature,.glass-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(!designSettings.tilt)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*6}deg) translateY(-2px)`;});
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
}
function setupMagnetic(){
 if(!designSettings.magnetic||!motionAllowed||!finePointer)return;
 document.querySelectorAll('.btn,.icon-btn').forEach(btn=>{
  if(btn.dataset.magneticBound)return;btn.dataset.magneticBound='1';
  btn.addEventListener('pointermove',e=>{if(!designSettings.magnetic)return;const r=btn.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);btn.style.transform=`translate3d(${dx*.10}px,${dy*.14}px,0)`;});
  btn.addEventListener('pointerleave',()=>btn.style.transform='');
 });
}
let particleCanvas,particleCtx,particleFrame=0,particlePoints=[];
function setupParticles(){
 if(!designSettings.particles){if(particleCanvas)particleCanvas.remove();particleCanvas=null;cancelAnimationFrame(particleFrame);return}
 if(!motionAllowed||document.hidden)return;
 if(!particleCanvas){particleCanvas=document.createElement('canvas');particleCanvas.id='particleCanvas';document.body.prepend(particleCanvas);particleCtx=particleCanvas.getContext('2d');}
 const dpr=Math.min(window.devicePixelRatio||1,1.5),w=innerWidth,h=innerHeight;
 particleCanvas.width=Math.round(w*dpr);particleCanvas.height=Math.round(h*dpr);particleCtx.setTransform(dpr,0,0,dpr,0,0);
 particlePoints=Array.from({length:Math.min(46,Math.floor(w/28))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.5+.5}));
 cancelAnimationFrame(particleFrame);
 const draw=()=>{if(!designSettings.particles||document.hidden)return;particleCtx.clearRect(0,0,w,h);particleCtx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--a').trim()||'#9b83ff';
  particlePoints.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;particleCtx.globalAlpha=.28;particleCtx.beginPath();particleCtx.arc(p.x,p.y,p.r,0,Math.PI*2);particleCtx.fill();});particleFrame=requestAnimationFrame(draw);};
 particleFrame=requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(particleFrame);else if(designSettings.particles)setupParticles()});
window.addEventListener('resize',()=>{if(designSettings.particles)setupParticles()},{passive:true});
function exportProfile(){const blob=new Blob([JSON.stringify({version:1,settings:designSettings,palette:selected},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='forma-design-profile.json';a.click();URL.revokeObjectURL(a.href);toast('Профиль экспортирован');}
document.getElementById('exportSettings').addEventListener('click',exportProfile);
document.getElementById('importSettings').addEventListener('click',()=>document.getElementById('importSettingsFile').click());
document.getElementById('importSettingsFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text()),incoming=data.settings||data;if(!incoming||typeof incoming!=='object')throw new Error();designSettings={...settingDefaults,...incoming};if(data.palette&&palettes.some(p=>p.name===data.palette))applyPalette(palettes.find(p=>p.name===data.palette));window.activeDesignPreset=null;applyDesignSettings();saveSettings();setupTilt();setupMagnetic();setupParticles();toast('Профиль импортирован');}catch{toast('Не удалось прочитать профиль JSON')}e.target.value='';});

applyDesignSettings();setupTilt();setupMagnetic();setupParticles();
