/* FORMA Studio 4.0 — visual editing, sections, responsive preview and history */
(() => {
  "use strict";
  if (!window.FORMA) return;
  const $=(s,r=document)=>r.querySelector(s);
  const el=(tag,attrs={},text="")=>{const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;};
  let selected=null, editing=false, history=[], future=[], cssText="", panel=null, styleNode=null, preview=null;
  const main=$("main")||document.body;
  const snapshot=()=>({html:main.innerHTML,settings:FORMA.getSettings(),css:cssText});
  const remember=()=>{history.push(snapshot());if(history.length>40)history.shift();future=[];syncHistory();};
  const restore=s=>{main.innerHTML=s.html;FORMA.setSettings(s.settings||{});cssText=s.css||"";applyCss();selected=null;syncHistory();};
  const syncHistory=()=>{if(!panel)return;$("#forma-undo",panel).disabled=!history.length;$("#forma-redo",panel).disabled=!future.length;};
  const applyCss=()=>{if(!styleNode){styleNode=el("style",{"data-forma-custom":""});document.head.append(styleNode);}styleNode.textContent=cssText;};
  const field=(label,node)=>{const w=el("label",{class:"f4-field"});w.append(el("span",{},label),node);return w;};
  const button=(label,fn,cls="")=>{const b=el("button",{type:"button",class:cls},label);b.addEventListener("click",fn);return b;};
  const input=(type,value)=>{const n=el("input",{type,value});return n;};
  function build(){
    if($("[data-forma4-ui]"))return;
    const css=el("style",{},`
      [data-forma4-ui]{font:14px/1.45 system-ui,sans-serif;color:#f5f6ff}
      .f4-launch{position:fixed;right:22px;bottom:78px;z-index:2147483000;border:1px solid #ffffff35;border-radius:999px;padding:12px 17px;background:#171d2c;color:white;font-weight:700;box-shadow:0 8px 30px #0005;cursor:pointer}
      .f4-panel{position:fixed;z-index:2147483004;right:16px;top:16px;bottom:16px;width:min(410px,calc(100vw - 32px));overflow:auto;padding:20px;border:1px solid #ffffff20;border-radius:20px;background:#111827;color:#f4f6ff;box-shadow:0 25px 90px #0009;transform:translateX(calc(100% + 25px));transition:transform .3s}
      .f4-panel.open{transform:none}.f4-panel h2{margin:0 0 8px;font-size:22px}.f4-panel p{opacity:.7;font-size:12px}
      .f4-field{display:grid;gap:6px;margin:13px 0}.f4-field span{font-size:12px;opacity:.75}.f4-field input,.f4-field select,.f4-field textarea{width:100%;box-sizing:border-box;padding:9px;border-radius:9px;border:1px solid #ffffff30;background:#0b1020;color:white}
      .f4-field textarea{min-height:130px;font:12px/1.5 ui-monospace,monospace}.f4-row{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.f4-row button{flex:1}
      .f4-panel button{border:1px solid #ffffff2b;border-radius:9px;padding:9px 11px;background:#ffffff0c;color:inherit;cursor:pointer}.f4-panel button:disabled{opacity:.35;cursor:not-allowed}
      .f4-panel button.primary{background:var(--forma-accent);border-color:transparent}.f4-title{font-size:11px;letter-spacing:.13em;text-transform:uppercase;opacity:.6;border-top:1px solid #ffffff20;padding-top:15px;margin-top:18px}
      .f4-selected{outline:2px solid #a78bfa!important;outline-offset:3px;cursor:crosshair!important}
      .f4-device{margin:12px auto;border:7px solid #30394c;border-radius:20px;overflow:auto;max-width:100%;transition:width .25s;height:auto;min-height:150px}
      .f4-device.mobile{width:390px}.f4-device.tablet{width:768px}.f4-device.desktop{width:100%}
      .f4-hint{font-size:11px;opacity:.65}
      @media(prefers-reduced-motion:reduce){.f4-panel{transition:none}}
    `);
    document.head.append(css);
    const launch=el("button",{class:"f4-launch","data-forma4-ui":"launch"},"✦ FORMA 4.0");
    panel=el("aside",{class:"f4-panel","data-forma4-ui":"panel","aria-label":"FORMA 4 Studio"});
    panel.append(el("h2",{},"FORMA Studio 4.0"),el("p",{},"Визуальный редактор, секции, адаптивность и история изменений."));
    const hist=el("div",{class:"f4-row"});
    hist.append(button("↶ Отменить",()=>{if(!history.length)return;future.push(snapshot());restore(history.pop());}),button("↷ Повторить",()=>{if(!future.length)return;history.push(snapshot());restore(future.pop());}));
    hist.children[0].id="forma-undo";hist.children[1].id="forma-redo";panel.append(hist);
    panel.append(el("div",{class:"f4-title"},"Visual Editor"));
    const toggle=button("Включить выбор элементов",()=>{editing=!editing;toggle.textContent=editing?"Завершить выбор элементов":"Включить выбор элементов";document.body.classList.toggle("forma4-picking",editing);});
    panel.append(toggle);
    const selectedLabel=el("p",{},"Элемент не выбран — включи режим и нажми на элемент страницы.");selectedLabel.id="f4-selected-label";panel.append(selectedLabel);
    const textEdit=el("textarea",{placeholder:"Текст выбранного элемента"});textEdit.addEventListener("change",()=>{if(!selected)return;remember();selected.textContent=textEdit.value;});
    panel.append(field("Текст элемента",textEdit));
    const color=input("color","#8f7cff");color.addEventListener("input",()=>{if(selected)selected.style.color=color.value;});
    color.addEventListener("change",remember);panel.append(field("Цвет текста",color));
    const bg=input("color","#111827");bg.addEventListener("input",()=>{if(selected)selected.style.backgroundColor=bg.value;});bg.addEventListener("change",remember);panel.append(field("Цвет фона элемента",bg));
    const radius=input("range","18");radius.min=0;radius.max=60;radius.addEventListener("input",()=>{if(selected)selected.style.borderRadius=radius.value+"px";});radius.addEventListener("change",remember);panel.append(field("Скругление",radius));
    panel.append(el("div",{class:"f4-title"},"Section Builder"));
    const sections=el("div",{class:"f4-row"});
    [["Hero","hero"],["Features","features"],["Pricing","pricing"],["FAQ","faq"],["Отзывы","testimonials"]].forEach(([label,type])=>sections.append(button("+ "+label,()=>addSection(type))));
    panel.append(sections);
    panel.append(el("p",{class:"f4-hint"},"Новые секции добавляются в конец основного содержимого."));
    panel.append(el("div",{class:"f4-title"},"Responsive Studio"));
    const device=el("select");[["desktop","Desktop"],["tablet","Tablet"],["mobile","Mobile"]].forEach(([v,t])=>device.append(el("option",{value:v},t)));
    preview=el("div",{class:"f4-device desktop"});device.addEventListener("change",()=>{preview.className="f4-device "+device.value;});
    const refresh=button("Обновить предпросмотр",()=>{if(!preview.isConnected)return;const clone=main.cloneNode(true);clone.querySelectorAll("[data-forma-ui],[data-forma4-ui]").forEach(n=>n.remove());preview.replaceChildren(clone);});
    panel.append(field("Размер экрана",device),refresh,preview);
    panel.append(el("div",{class:"f4-title"},"Custom CSS Editor"));
    const editor=el("textarea",{placeholder:".hero h1 { letter-spacing: -0.06em; }"});editor.value=cssText;
    panel.append(field("Дополнительные CSS-правила",editor));
    panel.append(button("Применить CSS",()=>{remember();cssText=editor.value;applyCss();},"primary"));
    panel.append(el("div",{class:"f4-title"},"Theme Export"));
    panel.append(button("Экспорт темы (.json)",()=>{const data={version:4,settings:FORMA.getSettings(),customCss:cssText,html:main.innerHTML};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=el("a",{href:URL.createObjectURL(blob),download:"forma-theme-v4.json"});a.click();URL.revokeObjectURL(a.href);}));
    const importFile=input("file","");importFile.accept="application/json";importFile.addEventListener("change",async()=>{try{const d=JSON.parse(await importFile.files[0].text());remember();if(d.settings)FORMA.setSettings(d.settings);if(typeof d.customCss==="string"){cssText=d.customCss;editor.value=cssText;applyCss();}if(typeof d.html==="string")main.innerHTML=d.html;selected=null;}catch(e){alert("Не удалось импортировать тему.");}importFile.value="";});
    panel.append(field("Импорт темы",importFile));
    panel.append(button("Закрыть",()=>panel.classList.remove("open")));
    document.body.append(launch,panel);
    launch.addEventListener("click",()=>{panel.classList.toggle("open");refresh.click();});
    document.addEventListener("click",e=>{if(!editing||panel.contains(e.target)||e.target===launch)return;const target=e.target.closest("main *");if(!target)return;e.preventDefault();e.stopPropagation();if(selected)selected.classList.remove("f4-selected");selected=target;selected.classList.add("f4-selected");selectedLabel.textContent="Выбран: "+target.tagName.toLowerCase()+"."+[...target.classList].join(".");textEdit.value=target.children.length?"(Содержит вложенные элементы — текстовая замена отключена)":target.textContent;color.value=rgbToHex(getComputedStyle(target).color)||"#ffffff";bg.value=rgbToHex(getComputedStyle(target).backgroundColor)||"#111827";radius.value=parseInt(getComputedStyle(target).borderRadius)||0;},true);
    syncHistory();
  }
  function rgbToHex(v){const m=v.match(/\d+/g);if(!m||m.length<3)return null;return "#"+m.slice(0,3).map(x=>Number(x).toString(16).padStart(2,"0")).join("");}
  function addSection(type){
    remember();const section=el("section",{class:"forma-section forma-card"});section.style.cssText="padding:48px 28px;margin:28px 0;text-align:center";
    const content={
      hero:["A new beginning","A bold headline for your next big idea.","Get started"],
      features:["Everything you need","A clear set of benefits designed around your audience.","01 · Design   02 · Speed   03 · Growth"],
      pricing:["Simple pricing","Choose a plan that works for you.","Starter · Pro · Business"],
      faq:["Frequently asked questions","Answers to the questions your customers ask most.","How does it work? · What is included? · Can I cancel?"],
      testimonials:["Loved by customers","“A beautiful experience from start to finish.”","★★★★★"]
    }[type];
    section.append(el("h2",{},content[0]),el("p",{},content[1]),el("p",{},content[2]));main.append(section);section.scrollIntoView({behavior:"smooth",block:"center"});
  }
  window.FORMA4={open(){panel?.classList.add("open");},close(){panel?.classList.remove("open");},undo(){if(history.length){future.push(snapshot());restore(history.pop());}},redo(){if(future.length){history.push(snapshot());restore(future.pop());}}};
  const start=()=>build();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();