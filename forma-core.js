/* FORMA Design Engine — portable core v1.0.0
 * Usage: <link rel="stylesheet" href="design-engine.css">
 *        <script src="forma-core.js"></script>
 *        <script>FORMA.init({ panel: true });</script>
 */
(function (window, document) {
  'use strict';
  const palettes = [
    { id:'violet', name:'Electric Violet', a:'#9b83ff', b:'#50e3d2', bg:'#090b13', surface:'#121626', text:'#f4f6ff', muted:'#929bb2' },
    { id:'blue', name:'Arctic Blue', a:'#69a9ff', b:'#79e5ee', bg:'#08111d', surface:'#101e30', text:'#f4f8ff', muted:'#9aabc0' },
    { id:'emerald', name:'Emerald Aura', a:'#4ed6a0', b:'#b4e77b', bg:'#07140f', surface:'#102219', text:'#f0fff7', muted:'#9bb9a8' },
    { id:'rose', name:'Rose Quartz', a:'#f28ab8', b:'#b69aff', bg:'#170d18', surface:'#251626', text:'#fff3fa', muted:'#bda4b8' },
    { id:'ocean', name:'Ocean Depth', a:'#3dcae8', b:'#657dff', bg:'#071018', surface:'#0e1c29', text:'#effaff', muted:'#91aebd' },
    { id:'mono', name:'Mono Chrome', a:'#d4d9e8', b:'#858da5', bg:'#0c0e13', surface:'#171a22', text:'#f4f5fa', muted:'#a0a5b4' }
  ];
  const defaults = { palette:'violet', mode:'dark', radius:20, glow:22, font:'modern', buttons:'rounded', motion:true };
  let state = { ...defaults }, options = {}, root = document.documentElement, panel, overlay, trigger;
  let storageKey = 'forma:' + location.host + location.pathname;
  const clamp = (n,min,max) => Math.min(max,Math.max(min,Number(n)||min));
  const allowed = key => !Array.isArray(options.allowedControls) || options.allowedControls.includes(key);
  const notify = () => { if (typeof options.onChange === 'function') options.onChange(getSettings()); };
  function persist(){ try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch(e) { console.warn('[FORMA] Storage unavailable',e); } }
  function load(){ try { const saved=JSON.parse(localStorage.getItem(storageKey)||'{}'); if(saved&&typeof saved==='object') state={...defaults,...saved}; } catch(e) {} }
  function apply(){
    const p=palettes.find(x=>x.id===state.palette)||palettes[0], light=state.mode==='light';
    root.style.setProperty('--a',p.a); root.style.setProperty('--b',p.b);
    root.style.setProperty('--bg',light?'#f4f6fb':p.bg);
    root.style.setProperty('--surface',light?'#ffffff':p.surface);
    root.style.setProperty('--surface2',light?'#e9edf7':(p.surface2||p.surface));
    root.style.setProperty('--text',light?'#171b29':p.text);
    root.style.setProperty('--muted',light?'#667087':p.muted);
    root.style.setProperty('--glow',`color-mix(in srgb, ${p.a} ${state.glow}%, transparent)`);
    root.style.setProperty('--ui-radius',state.radius+'px');
    root.style.setProperty('--forma-glow-opacity',(state.glow/100).toFixed(2));
    document.body.classList.toggle('forma-light',light);
    document.body.classList.toggle('forma-motion-off',!state.motion);
    document.body.classList.toggle('forma-font-editorial',state.font==='editorial');
    document.body.classList.toggle('forma-font-geometric',state.font==='geometric');
    document.body.classList.toggle('forma-buttons-pill',state.buttons==='pill');
    document.body.classList.toggle('forma-buttons-sharp',state.buttons==='sharp');
    if(panel) syncPanel();
    persist(); notify();
  }
  function el(tag,attrs={},children=[]){ const node=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{if(k==='class')node.className=v;else if(k==='text')node.textContent=v;else node.setAttribute(k,v)}); children.forEach(c=>node.append(c)); return node; }
  function control(label,key,type,extra={}) {
    const wrap=el('label',{class:'forma-control'}), title=el('span',{text:label});
    let input;
    if(type==='range'){ input=el('input',{type:'range',min:extra.min,max:extra.max,step:extra.step||1}); input.value=state[key]; input.addEventListener('input',()=>{state[key]=clamp(input.value,Number(extra.min),Number(extra.max));apply()}); }
    else { input=el('select'); extra.items.forEach(([value,text])=>input.append(el('option',{value,text}))); input.value=state[key]; input.addEventListener('change',()=>{state[key]=input.value;apply()}); }
    wrap.append(title,input); return wrap;
  }
  function syncPanel(){
    if(!panel)return;
    panel.querySelectorAll('[data-forma-key]').forEach(input=>{const k=input.dataset.formaKey;if(document.activeElement!==input)input.value=state[k]});
    const mode=panel.querySelector('[data-forma-mode]'); if(mode)mode.textContent=state.mode==='dark'?'Светлая тема':'Тёмная тема';
    panel.querySelectorAll('[data-forma-palette]').forEach(b=>b.classList.toggle('is-active',b.dataset.formaPalette===state.palette));
    const motion=panel.querySelector('[data-forma-motion]'); if(motion)motion.setAttribute('aria-pressed',String(state.motion));
  }
  function open(){panel?.classList.add('is-open');overlay?.classList.add('is-open');panel?.setAttribute('aria-hidden','false');panel?.querySelector('button')?.focus();}
  function close(){panel?.classList.remove('is-open');overlay?.classList.remove('is-open');panel?.setAttribute('aria-hidden','true');trigger?.focus();}
  function buildPanel(){
    if(options.panel===false || document.querySelector('.forma-settings-panel'))return;
    overlay=el('div',{class:'forma-settings-overlay'}); panel=el('aside',{class:'forma-settings-panel',role:'dialog','aria-modal':'true','aria-label':'Настройки внешнего вида','aria-hidden':'true'});
    const head=el('div',{class:'forma-panel-head'},[el('strong',{text:'Настройки дизайна'}),el('button',{type:'button','aria-label':'Закрыть',text:'×'})]);
    head.lastChild.addEventListener('click',close);
    panel.append(head,el('p',{class:'forma-panel-copy',text:'Настрой внешний вид сайта. Изменения сохраняются на этом устройстве.'}));
    if(allowed('palette')){const group=el('div',{class:'forma-palette-list'});palettes.forEach(p=>{const b=el('button',{type:'button',class:'forma-palette-chip','data-forma-palette':p.id,text:p.name});b.addEventListener('click',()=>{state.palette=p.id;apply()});group.append(b)});panel.append(el('h3',{class:'forma-group-title',text:'Цветовая система'}),group);}
    if(allowed('mode')){const b=el('button',{type:'button',class:'forma-mode-button','data-forma-mode':'',text:'Светлая тема'});b.addEventListener('click',()=>{state.mode=state.mode==='dark'?'light':'dark';apply()});panel.append(b);}
    if(allowed('radius'))panel.append(control('Скругление','radius','range',{min:6,max:32}));
    if(allowed('glow'))panel.append(control('Интенсивность свечения','glow','range',{min:0,max:55}));
    if(allowed('font'))panel.append(control('Типографика','font','select',{items:[['modern','Modern'],['geometric','Geometric'],['editorial','Editorial']]}));
    if(allowed('buttons'))panel.append(control('Форма кнопок','buttons','select',{items:[['rounded','Rounded'],['pill','Pill'],['sharp','Sharp']]}));
    if(allowed('motion')){const b=el('button',{type:'button',class:'forma-mode-button','data-forma-motion':'','aria-pressed':String(state.motion),text:'Анимации: включены'});b.addEventListener('click',()=>{state.motion=!state.motion;apply();b.textContent='Анимации: '+(state.motion?'включены':'выключены')});panel.append(b);}
    const actions=el('div',{class:'forma-panel-actions'});
    const reset=el('button',{type:'button',text:'Сбросить'});reset.addEventListener('click',()=>{state={...defaults};apply()});
    const done=el('button',{type:'button',text:'Готово'});done.addEventListener('click',close);actions.append(reset,done);panel.append(actions);
    document.body.append(overlay,panel);
    overlay.addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    trigger=el('button',{type:'button',class:'forma-settings-trigger','aria-label':'Открыть настройки дизайна',text:'⚙ Дизайн'});trigger.addEventListener('click',open);
    const target=typeof options.target==='string'?document.querySelector(options.target):options.target;
    (target||document.body).append(trigger);
  }
  function init(opts={}){
    options={...opts}; storageKey=opts.storageKey||storageKey;
    state={...defaults,...(opts.defaultSettings||{})}; load();
    if(opts.palette&&palettes.some(p=>p.id===opts.palette))state.palette=opts.palette;
    if(opts.mode==='light'||opts.mode==='dark')state.mode=opts.mode;
    buildPanel(); apply(); return api;
  }
  function setSettings(partial={}){state={...state,...partial};apply();return getSettings();}
  function getSettings(){return {...state};}
  function reset(){state={...defaults};apply();return getSettings();}
  function destroy(){panel?.remove();overlay?.remove();trigger?.remove();panel=overlay=trigger=null;document.body.classList.remove('forma-light','forma-motion-off','forma-font-editorial','forma-font-geometric','forma-buttons-pill','forma-buttons-sharp');}
  const api={version:'1.0.0',init,getSettings,setSettings,reset,destroy,palettes:palettes.map(({id,name})=>({id,name}))};
  window.FORMA=Object.assign(window.FORMA||{},api);
})(window,document);
