/* FORMA Design Engine 2.0 — portable, dependency-free core */
(() => {
  "use strict";
  const palettes = {
    violet:["#8f7cff","#55dfd0"], blue:["#5b9dff","#69e1e8"], emerald:["#35c995","#b5e77b"],
    rose:["#ef83b5","#a58bff"], amber:["#f0b65e","#ff826f"], mono:["#d7dbea","#858da5"]
  };
  const defaults = {palette:"violet",mode:"dark",accent:"#8f7cff",accent2:"#55dfd0",radius:18,contentWidth:1120,spacing:72,glow:22,font:"modern",buttons:"rounded",background:"aurora",motion:"smooth"};
  let state=null, root=null, panel=null, trigger=null, style=null, storageKey=null, opts={}, listeners=[];
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
  const validHex=v=>/^#[0-9a-f]{6}$/i.test(v);
  function emit(){ if(opts.onChange) opts.onChange(getSettings()); window.dispatchEvent(new CustomEvent("forma:change",{detail:getSettings()})); }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(e){}}
  function apply(){
    if(!root||!state)return;
    const s=state, light=s.mode==="light";
    root.style.setProperty("--forma-accent",s.accent);
    root.style.setProperty("--forma-accent-2",s.accent2);
    root.style.setProperty("--forma-radius",s.radius+"px");
    root.style.setProperty("--forma-content-width",s.contentWidth+"px");
    root.style.setProperty("--forma-section-space",s.spacing+"px");
    root.style.setProperty("--forma-glow",s.glow/100);
    root.style.setProperty("--forma-bg",light?"#f5f7fc":"#090d17");
    root.style.setProperty("--forma-surface",light?"#ffffff":"#111827");
    root.style.setProperty("--forma-text",light?"#171c2a":"#f3f5fb");
    root.dataset.formaMode=s.mode; root.dataset.formaFont=s.font; root.dataset.formaButtons=s.buttons;
    root.dataset.formaBackground=s.background; root.dataset.formaMotion=s.motion;
    if(panel) syncControls();
  }
  function getSettings(){return state?{...state}:null;}
  function setSettings(partial={}) {
    if(!state)return;
    const next={...state,...partial};
    if(!["dark","light"].includes(next.mode))next.mode="dark";
    if(!validHex(next.accent))next.accent=state.accent;
    if(!validHex(next.accent2))next.accent2=state.accent2;
    next.radius=clamp(next.radius,0,40); next.contentWidth=clamp(next.contentWidth,680,1600);
    next.spacing=clamp(next.spacing,24,140); next.glow=clamp(next.glow,0,60);
    state=next;apply();persist();emit();
  }
  function el(tag,attrs={},html=""){const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>k==="class"?n.className=v:k==="text"?n.textContent=v:n.setAttribute(k,v));if(html)n.innerHTML=html;return n;}
  function control(label,id,type,value,min,max){
    const wrap=el("label",{class:"forma-control"});wrap.append(el("span",{text:label}));
    const input=el("input",{id,type,value});if(min!==undefined){input.min=min;input.max=max;input.step=type==="range"?1:undefined;}
    wrap.append(input);return {wrap,input};
  }
  function selectControl(label,id,items,value){
    const wrap=el("label",{class:"forma-control"});wrap.append(el("span",{text:label}));
    const select=el("select",{id});items.forEach(([v,t])=>select.append(el("option",{value:v,text:t})));
    select.value=value;wrap.append(select);return {wrap,input:select};
  }
  function createPanel(){
    if(!opts.panel||document.querySelector("[data-forma-ui]"))return;
    style=el("style",{"data-forma-style":""},`
      [data-forma-ui]{font:14px/1.45 system-ui,sans-serif;color:#f4f6ff}
      .forma-trigger{position:fixed;right:22px;bottom:22px;z-index:2147483000;border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(120deg,var(--forma-accent),var(--forma-accent-2));color:white;font-weight:700;box-shadow:0 8px 32px #0004;cursor:pointer}
      .forma-backdrop{position:fixed;inset:0;background:#05091499;backdrop-filter:blur(5px);z-index:2147483001;opacity:0;visibility:hidden;transition:.25s}
      .forma-drawer{position:fixed;z-index:2147483002;right:0;top:0;height:100dvh;width:min(390px,100%);overflow:auto;padding:24px;background:var(--forma-surface);color:var(--forma-text);box-shadow:-20px 0 70px #0005;transform:translateX(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
      .forma-backdrop.open{opacity:1;visibility:visible}.forma-drawer.open{transform:none}
      .forma-drawer header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.forma-drawer h2{font-size:21px;margin:0}.forma-close{background:transparent;border:0;color:inherit;font-size:23px;cursor:pointer}
      .forma-control{display:grid;gap:8px;margin:17px 0}.forma-control span{font-size:12px;opacity:.75}.forma-control input[type=range]{width:100%;accent-color:var(--forma-accent)}.forma-control input[type=color]{width:100%;height:38px;border:0;background:transparent}.forma-control select,.forma-control input[type=text]{width:100%;padding:10px;border:1px solid #8885;border-radius:10px;background:transparent;color:inherit}
      .forma-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.forma-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.forma-actions button,.forma-preset{border:1px solid #8886;background:transparent;color:inherit;border-radius:10px;padding:10px;cursor:pointer}.forma-actions .primary{background:var(--forma-accent);border-color:transparent;color:white}
      .forma-swatches{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.forma-swatch{border:1px solid #8885;border-radius:10px;padding:9px 5px;background:transparent;color:inherit;cursor:pointer}.forma-swatch:before{content:"";display:block;height:20px;border-radius:6px;margin-bottom:6px;background:linear-gradient(120deg,var(--c1),var(--c2))}
      .forma-divider{border-top:1px solid #8884;margin:20px 0 12px;padding-top:14px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.65}
      [data-forma-mode=light] .forma-drawer{color:#171c2a}
      @media(max-width:520px){.forma-drawer{width:100%;padding:20px}.forma-trigger{right:14px;bottom:14px}}
      @media(prefers-reduced-motion:reduce){.forma-drawer,.forma-backdrop{transition:none}}
    `);
    document.head.append(style);
    const host=opts.target instanceof Element?opts.target:document.querySelector(opts.target||"body")||document.body;
    trigger=el("button",{class:"forma-trigger","aria-label":"Настроить внешний вид", "data-forma-ui":"trigger",text:"✦ Настроить"});
    const backdrop=el("div",{class:"forma-backdrop","data-forma-ui":"backdrop"});
    panel=el("aside",{class:"forma-drawer","data-forma-ui":"panel","aria-label":"Настройки внешнего вида"});
    const head=el("header");head.append(el("h2",{text:"FORMA Studio"}));
    const close=el("button",{class:"forma-close","aria-label":"Закрыть",text:"×"});head.append(close);panel.append(head);
    panel.append(el("p",{text:"Персонализируй интерфейс. Изменения применяются мгновенно и сохраняются только в этом браузере."}));
    const section=(title)=>panel.append(el("div",{class:"forma-divider",text:title}));
    section("Цветовая система");
    const swatches=el("div",{class:"forma-swatches"});
    Object.entries(palettes).forEach(([name,c])=>{const b=el("button",{class:"forma-swatch",text:name});b.style.setProperty("--c1",c[0]);b.style.setProperty("--c2",c[1]);b.addEventListener("click",()=>setSettings({palette:name,accent:c[0],accent2:c[1]}));swatches.append(b);});
    panel.append(swatches);
    const mode=selectControl("Цветовая тема","forma-mode",[["dark","Тёмная"],["light","Светлая"]],state.mode);mode.input.addEventListener("change",()=>setSettings({mode:mode.input.value}));panel.append(mode.wrap);
    const colors=el("div",{class:"forma-row"});
    const c1=control("Основной цвет","forma-accent","color",state.accent),c2=control("Второй цвет","forma-accent2","color",state.accent2);
    c1.input.addEventListener("input",()=>setSettings({accent:c1.input.value}));c2.input.addEventListener("input",()=>setSettings({accent2:c2.input.value}));colors.append(c1.wrap,c2.wrap);panel.append(colors);
    section("Композиция");
    [["Скругление","radius",0,40],["Ширина контента","contentWidth",680,1600],["Отступы секций","spacing",24,140],["Интенсивность свечения","glow",0,60]].forEach(([label,key,min,max])=>{const c=control(label,"forma-"+key,"range",state[key],min,max);c.input.addEventListener("input",()=>setSettings({[key]:Number(c.input.value)}));panel.append(c.wrap);});
    section("Атмосфера");
    const font=selectControl("Типографика","forma-font",[["modern","Modern"],["editorial","Editorial"],["geometric","Geometric"]],state.font);
    font.input.addEventListener("change",()=>setSettings({font:font.input.value}));panel.append(font.wrap);
    const buttons=selectControl("Форма кнопок","forma-buttons",[["rounded","Rounded"],["pill","Pill"],["sharp","Sharp"]],state.buttons);
    buttons.input.addEventListener("change",()=>setSettings({buttons:buttons.input.value}));panel.append(buttons.wrap);
    const bg=selectControl("Фон","forma-background",[["aurora","Aurora"],["plain","Минимализм"],["grid","Сетка"]],state.background);
    bg.input.addEventListener("change",()=>setSettings({background:bg.input.value}));panel.append(bg.wrap);
    const motion=selectControl("Движение","forma-motion",[["smooth","Плавное"],["snappy","Быстрое"],["off","Отключено"]],state.motion);
    motion.input.addEventListener("change",()=>setSettings({motion:motion.input.value}));panel.append(motion.wrap);
    section("Сохранённые стили");
    const presets=el("div",{class:"forma-actions"});
    ["Signature","Minimal","Soft","Bold"].forEach(name=>{const b=el("button",{class:"forma-preset",text:name});b.addEventListener("click",()=>{const p={Signature:{radius:18,spacing:72,glow:22,background:"aurora",motion:"smooth"},Minimal:{radius:8,spacing:52,glow:0,background:"plain",motion:"snappy"},Soft:{radius:30,spacing:100,glow:38,background:"aurora",motion:"smooth"},Bold:{radius:12,spacing:60,glow:52,background:"grid",motion:"snappy"}}[name];setSettings(p);});presets.append(b);});panel.append(presets);
    const actions=el("div",{class:"forma-actions"});
    const save=el("button",{class:"primary",text:"Сохранить стиль"}),reset=el("button",{text:"Сбросить"}),exportBtn=el("button",{text:"Экспорт JSON"}),importBtn=el("button",{text:"Импорт JSON"});
    const file=el("input",{type:"file",accept:"application/json",hidden:""});
    save.addEventListener("click",()=>{try{localStorage.setItem(storageKey+":saved",JSON.stringify(state));notify("Стиль сохранён");}catch(e){}});
    reset.addEventListener("click",()=>{state={...defaults,...opts.defaultSettings};apply();persist();emit();});
    exportBtn.addEventListener("click",()=>{const a=el("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({version:2,settings:state},null,2)],{type:"application/json"}));a.download="forma-profile.json";a.click();URL.revokeObjectURL(a.href);});
    importBtn.addEventListener("click",()=>file.click());file.addEventListener("change",async()=>{try{const d=JSON.parse(await file.files[0].text());setSettings(d.settings||d);}catch(e){notify("Не удалось импортировать профиль");}file.value="";});
    actions.append(save,reset,exportBtn,importBtn,file);panel.append(actions);
    const saved=el("button",{class:"forma-preset",text:"Загрузить сохранённый стиль"});saved.addEventListener("click",()=>{try{const d=JSON.parse(localStorage.getItem(storageKey+":saved")||"null");if(d)setSettings(d);else notify("Сохранённого стиля пока нет");}catch(e){}});panel.append(saved);
    document.body.append(backdrop,panel);host.append(trigger);
    const open=()=>{panel.classList.add("open");backdrop.classList.add("open");panel.setAttribute("aria-hidden","false");};
    const shut=()=>{panel.classList.remove("open");backdrop.classList.remove("open");panel.setAttribute("aria-hidden","true");};
    trigger.addEventListener("click",open);close.addEventListener("click",shut);backdrop.addEventListener("click",shut);
    document.addEventListener("keydown",e=>{if(e.key==="Escape")shut();});
    syncControls();
  }
  function syncControls(){if(!panel)return;const map={mode:"forma-mode",accent:"forma-accent",accent2:"forma-accent2",radius:"forma-radius",contentWidth:"forma-contentWidth",spacing:"forma-spacing",glow:"forma-glow",font:"forma-font",buttons:"forma-buttons",background:"forma-background",motion:"forma-motion"};Object.entries(map).forEach(([k,id])=>{const n=panel.querySelector("#"+id);if(n&&document.activeElement!==n)n.value=state[k];});}
  function notify(message){let n=document.querySelector("[data-forma-toast]");if(!n){n=el("div",{"data-forma-toast":"",text:message});Object.assign(n.style,{position:"fixed",left:"50%",bottom:"22px",transform:"translateX(-50%)",zIndex:"2147483003",background:"#151b2a",color:"white",padding:"10px 15px",borderRadius:"12px",boxShadow:"0 5px 25px #0005"});document.body.append(n);}n.textContent=message;clearTimeout(n._timer);n._timer=setTimeout(()=>n.remove(),2200);}
  function init(options={}) {
    if(state)destroy();
    opts={panel:true,...options};root=opts.target instanceof Element?opts.target:document.documentElement;
    storageKey=opts.storageKey||("forma:v2:"+location.host+location.pathname);
    let stored={};try{stored=JSON.parse(localStorage.getItem(storageKey)||"{}")||{};}catch(e){}
    state={...defaults,...stored,...(opts.defaultSettings||{})};
    const c=palettes[state.palette];if(c&&!stored.accent&&!opts.defaultSettings?.accent){state.accent=c[0];state.accent2=c[1];}
    apply();createPanel();return api;
  }
  function reset(){setSettings({...defaults,...opts.defaultSettings});}
  function destroy(){document.querySelectorAll("[data-forma-ui]").forEach(n=>n.remove());if(style)style.remove();panel=trigger=style=null;state=null;root=null;}
  const api={init,getSettings,setSettings,reset,destroy};
  window.FORMA=api;
  if(document.currentScript?.dataset.autoinit==="true"){const start=()=>init({panel:true});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();}
})();