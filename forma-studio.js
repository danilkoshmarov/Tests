/* FORMA Studio 4.1 — compact tabbed editor */
(() => {
"use strict";
if(new URLSearchParams(location.search).has("formaPreview")) return;
const $=(s,r=document)=>r.querySelector(s);
const main=$("main")||$("body");
let panel,overlay,activeTab="elements",selected=null,picking=false,cssText="",undoStack=[],redoStack=[],previewFrame=null;
const make=(tag,attrs={},text)=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
const snapshot=()=>({html:main.innerHTML,css:cssText,settings:window.FORMA?.getSettings?.()||null});
const remember=()=>{undoStack.push(snapshot());if(undoStack.length>30)undoStack.shift();redoStack=[];syncHistory();};
function syncHistory(){const u=$("#f41-undo"),r=$("#f41-redo");if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;}
function applyCSS(){let s=$("[data-f41-custom]");if(!s){s=make("style",{"data-f41-custom":""});document.head.append(s);}s.textContent=cssText;}
function restore(s){main.innerHTML=s.html;cssText=s.css||"";applyCSS();if(s.settings&&window.FORMA?.setSettings)window.FORMA.setSettings(s.settings);selected=null;syncHistory();renderTab();}
function undo(){if(!undoStack.length)return;redoStack.push(snapshot());restore(undoStack.pop());}
function redo(){if(!redoStack.length)return;undoStack.push(snapshot());restore(redoStack.pop());}
const btn=(label,fn,cls="")=>{const b=make("button",{type:"button",class:cls},label);b.addEventListener("click",fn);return b;};
const field=(label,node)=>{const w=make("label",{class:"f41-field"});w.append(make("span",{},label),node);return w;};
const input=(type,value)=>make("input",{type,value});
const tabs=[["elements","Элементы"],["sections","Секции"],["responsive","Адаптив"],["css","CSS"],["export","Экспорт"]];
function build(){
 if($("[data-f41-panel]"))return;
 const style=make("style",{},`
 [data-f41-ui]{font:14px/1.45 system-ui,sans-serif;color:#f4f6ff}
 .f41-launch{border:1px solid #ffffff25;border-radius:12px;padding:10px 15px;background:#171d2c;color:#fff;font-weight:700;cursor:pointer}
 .f41-overlay{position:fixed;inset:0;background:#05091499;backdrop-filter:blur(4px);z-index:2147483001;opacity:0;visibility:hidden;transition:.22s}
 .f41-overlay.open{opacity:1;visibility:visible}
 .f41-panel{position:fixed;z-index:2147483002;right:0;top:0;height:100dvh;width:min(460px,100vw);display:flex;flex-direction:column;background:#111827;color:#f4f6ff;border-left:1px solid #ffffff20;box-shadow:-20px 0 70px #0006;transform:translateX(102%);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
 .f41-panel.open{transform:none}.f41-head{display:flex;align-items:center;justify-content:space-between;padding:17px 19px 12px;border-bottom:1px solid #ffffff18}
 .f41-brand{font-size:17px;font-weight:800;letter-spacing:-.03em}.f41-sub{font-size:11px;opacity:.58;margin-top:2px}
 .f41-head button,.f41-panel button{border:1px solid #ffffff25;border-radius:9px;background:#ffffff0b;color:inherit;padding:9px 11px;cursor:pointer}
 .f41-head button{font-size:18px;padding:5px 10px}.f41-history{display:flex;gap:7px;padding:9px 16px;border-bottom:1px solid #ffffff18}.f41-history button{flex:1}.f41-history button:disabled{opacity:.3;cursor:not-allowed}
 .f41-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px 10px;border-bottom:1px solid #ffffff18}
 .f41-tabs button{padding:9px 2px;font-size:11px;border:0;background:transparent;opacity:.62}.f41-tabs button.active{background:#ffffff14;opacity:1;color:#c4b5fd}
 .f41-body{padding:17px 18px 28px;overflow:auto;overscroll-behavior:contain;flex:1}
 .f41-body h3{font-size:15px;margin:0 0 7px}.f41-note{font-size:12px;line-height:1.55;opacity:.65;margin:0 0 15px}
 .f41-field{display:grid;gap:6px;margin:13px 0}.f41-field>span{font-size:12px;opacity:.75}.f41-field input:not([type=color]):not([type=range]),.f41-field select,.f41-field textarea{box-sizing:border-box;width:100%;border:1px solid #ffffff25;border-radius:9px;padding:10px;background:#0b1020;color:white}
 .f41-field input[type=color]{width:100%;height:38px;border:0;background:transparent}.f41-field input[type=range]{width:100%;accent-color:#a78bfa}.f41-field textarea{min-height:180px;resize:vertical;font:12px/1.55 ui-monospace,monospace}
 .f41-row{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.f41-row>*{flex:1;min-width:100px}.f41-primary{background:#8f7cff!important;border-color:transparent!important;color:white!important}
 .f41-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.f41-grid button{text-align:left;min-height:64px}
 .f41-selected{outline:2px solid #a78bfa!important;outline-offset:3px}
 .f41-preview-shell{overflow:auto;background:#080d18;border:1px solid #ffffff20;border-radius:12px;padding:10px;margin-top:12px}
 .f41-preview-frame{display:block;border:0;background:white;width:100%;height:430px;border-radius:6px}
 .f41-device{display:block;margin:0 auto;transition:width .2s}.f41-device.mobile{width:390px;max-width:none}.f41-device.tablet{width:768px;max-width:none}.f41-preview-shell{max-width:100%}
 .f41-status{font-size:11px;opacity:.6;margin-top:8px}.f41-divider{font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.5;margin:20px 0 8px}
 @media(max-width:520px){.f41-panel{width:100vw}.f41-tabs button{font-size:10px}.f41-body{padding:14px}}
 @media(prefers-reduced-motion:reduce){.f41-panel,.f41-overlay{transition:none}}
 `);
 document.head.append(style);
 overlay=make("div",{class:"f41-overlay","data-f41-ui":"overlay"});
 panel=make("aside",{class:"f41-panel","data-f41-panel":"","data-f41-ui":"panel","aria-label":"FORMA visual studio"});
 const head=make("div",{class:"f41-head"});const brand=make("div");brand.append(make("div",{class:"f41-brand"},"FORMA Studio 4.1"),make("div",{class:"f41-sub"},"Редактор · визуальная настройка сайта"));head.append(brand,btn("×",close));panel.append(head);
 const history=make("div",{class:"f41-history"});history.append(btn("↶ Отменить",undo),btn("↷ Повторить",redo));history.children[0].id="f41-undo";history.children[1].id="f41-redo";panel.append(history);
 const nav=make("div",{class:"f41-tabs"});tabs.forEach(([id,label])=>{const b=btn(label,()=>showTab(id));b.dataset.tab=id;nav.append(b);});panel.append(nav);
 const body=make("div",{class:"f41-body","data-f41-body":""});panel.append(body);
 document.body.append(overlay,panel);
 overlay.addEventListener("click",close);
 const topButton=$("#formaStudioOpen");
 if(topButton){topButton.addEventListener("click",open);}else{
  const launch=make("button",{class:"f41-launch","data-f41-ui":"launch"},"✦ Открыть редактор");launch.style.cssText="position:fixed;right:22px;bottom:22px;z-index:2147483000";document.body.append(launch);launch.addEventListener("click",open);
 }
 document.addEventListener("keydown",e=>{if(e.key==="Escape")close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}});
 document.addEventListener("click",e=>{if(!picking||panel.contains(e.target)||e.target.closest("[data-f41-ui]"))return;const target=e.target.closest("main *");if(!target)return;e.preventDefault();e.stopPropagation();if(selected)selected.classList.remove("f41-selected");selected=target;selected.classList.add("f41-selected");renderTab();},true);
 showTab("elements");syncHistory();
}
function open(){panel?.classList.add("open");overlay?.classList.add("open");}
function close(){panel?.classList.remove("open");overlay?.classList.remove("open");}
function showTab(id){activeTab=id;panel.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));renderTab();}
function renderTab(){
 const body=$("[data-f41-body]");if(!body)return;body.replaceChildren();
 if(activeTab==="elements"){
  body.append(make("h3",{},"Редактирование элементов"),make("p",{class:"f41-note"},"Нажми «Выбрать элемент», затем кликни по заголовку, карточке или кнопке на странице. Панель останется открытой."));
  const pick=btn(picking?"Завершить выбор":"✦ Выбрать элемент",()=>{picking=!picking;pick.textContent=picking?"Завершить выбор":"✦ Выбрать элемент";});pick.className="f41-primary";body.append(pick);
  const label=make("p",{class:"f41-status"},selected?"Выбран: "+selected.tagName.toLowerCase()+" · "+[...selected.classList].filter(x=>x!=="f41-selected").join("."):"Пока ничего не выбрано.");body.append(label);
  const text=make("textarea");text.value=selected&&!selected.children.length?selected.textContent:"";text.placeholder=selected?.children.length?"У выбранного блока есть вложенные элементы — выбери конкретный текстовый элемент.":"Сначала выбери элемент.";
  const saveText=btn("Применить текст",()=>{if(!selected||selected.children.length)return;remember();selected.textContent=text.value;});body.append(field("Текст (для текстовых элементов)",text),saveText);
  const color=input("color",selected?rgbHex(getComputedStyle(selected).color):"#ffffff");color.addEventListener("change",()=>{if(selected){remember();selected.style.color=color.value;}});body.append(field("Цвет текста",color));
  const bg=input("color",selected?rgbHex(getComputedStyle(selected).backgroundColor):"#111827");bg.addEventListener("change",()=>{if(selected){remember();selected.style.backgroundColor=bg.value;}});body.append(field("Цвет фона",bg));
  const rad=input("range",selected?parseInt(getComputedStyle(selected).borderRadius)||0:18);rad.min=0;rad.max=60;rad.addEventListener("change",()=>{if(selected){remember();selected.style.borderRadius=rad.value+"px";}});body.append(field("Скругление",rad));
  body.append(make("p",{class:"f41-note"},"Подсказка: для отмены используй кнопки сверху или Ctrl + Z."));
 }
 if(activeTab==="sections"){
  body.append(make("h3",{},"Конструктор секций"),make("p",{class:"f41-note"},"Добавляй готовые блоки в конец страницы. После добавления их можно стилизовать через CSS."));
  const grid=make("div",{class:"f41-grid"});
  [["Hero","hero"],["Преимущества","features"],["Тарифы","pricing"],["FAQ","faq"],["Отзывы","reviews"],["Контакты","contact"]].forEach(([name,type])=>grid.append(btn("+ "+name,()=>addSection(type))));
  body.append(grid);
 }
 if(activeTab==="responsive"){
  body.append(make("h3",{},"Адаптивный предпросмотр"),make("p",{class:"f41-note"},"Предпросмотр открывает копию текущей страницы в отдельном окне заданной ширины. Сам редактор не попадает внутрь предпросмотра."));
  const device=make("select");[["desktop","Desktop · 100%"],["tablet","Tablet · 768px"],["mobile","Mobile · 390px"]].forEach(([v,t])=>device.append(make("option",{value:v},t)));
  const shell=make("div",{class:"f41-preview-shell"}),frame=make("iframe",{class:"f41-preview-frame",title:"Адаптивный предпросмотр"});previewFrame=frame;shell.append(frame);body.append(field("Размер экрана",device),shell);
  const load=()=>{const url=new URL(location.href);url.searchParams.set("formaPreview","1");url.hash="";frame.src=url.toString();};device.addEventListener("change",()=>{frame.className="f41-preview-frame f41-device "+device.value;});frame.className="f41-preview-frame f41-device desktop";load();
  body.append(make("p",{class:"f41-status"},"Для проверки изменений обнови предпросмотр после редактирования."));
  body.append(btn("Обновить предпросмотр",load));
 }
 if(activeTab==="css"){
  body.append(make("h3",{},"Собственный CSS"),make("p",{class:"f41-note"},"Правила применяются к текущей странице. Используй классы из инспектора браузера или выбери элемент на вкладке «Элементы»."));
  const editor=make("textarea");editor.value=cssText;editor.placeholder=".hero h1 { letter-spacing: -0.06em; }\n.panel { border-radius: 24px; }";body.append(field("CSS-код",editor));
  body.append(btn("Применить CSS",()=>{remember();cssText=editor.value;applyCSS();},"f41-primary"),btn("Очистить CSS",()=>{remember();cssText="";editor.value="";applyCSS();}));
 }
 if(activeTab==="export"){
  body.append(make("h3",{},"Перенос дизайна"),make("p",{class:"f41-note"},"Сохраняет настройки FORMA, пользовательский CSS и HTML основного содержимого."));
  body.append(btn("↓ Экспортировать тему JSON",()=>{const data={version:"4.1",settings:window.FORMA?.getSettings?.()||null,customCss:cssText,html:main.innerHTML};download(JSON.stringify(data,null,2),"forma-theme-4.1.json","application/json");},"f41-primary"));
  const file=input("file","");file.accept=".json,application/json";file.addEventListener("change",async()=>{if(!file.files[0])return;try{const d=JSON.parse(await file.files[0].text());if(!confirm("Импорт заменит содержимое основной страницы. Продолжить?"))return;remember();if(d.settings&&window.FORMA?.setSettings)window.FORMA.setSettings(d.settings);if(typeof d.customCss==="string"){cssText=d.customCss;applyCSS();}if(typeof d.html==="string"){const parsed=new DOMParser().parseFromString(d.html,"text/html");parsed.querySelectorAll("script,iframe,object,embed").forEach(n=>n.remove());parsed.querySelectorAll("*").forEach(n=>[...n.attributes].forEach(a=>{if(a.name.startsWith("on"))n.removeAttribute(a.name);}));main.innerHTML=parsed.body.innerHTML;}selected=null;alert("Тема импортирована.");}catch(e){alert("Файл темы повреждён или имеет неверный формат.");}file.value="";});body.append(field("Импортировать JSON",file));
 }
 syncHistory();
}
function rgbHex(v){const m=v.match(/\d+/g);return m&&m.length>=3?"#"+m.slice(0,3).map(x=>Number(x).toString(16).padStart(2,"0")).join(""):"#ffffff";}
function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=make("a",{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function addSection(type){
 const templates={
 hero:["Ваша идея заслуживает внимания","Коротко расскажите, чем ваш продукт помогает клиентам.","Начать работу"],
 features:["Почему выбирают нас","Три причины, по которым клиенту стоит выбрать именно вас.","Качество · Скорость · Поддержка"],
 pricing:["Понятные тарифы","Выберите подходящий вариант для вашей задачи.","Базовый · Стандарт · Премиум"],
 faq:["Частые вопросы","Здесь собраны ответы на важные вопросы клиентов.","Как заказать? · Сколько стоит? · Какие сроки?"],
 reviews:["Что говорят клиенты","Реальные отзывы помогают новым клиентам принять решение.","★★★★★ · Спасибо за доверие"],
 contact:["Давайте обсудим проект","Оставьте заявку — мы свяжемся с вами.","Связаться с нами"]
 };
 const t=templates[type];if(!t)return;remember();
 const section=make("section",{class:"forma-section forma-card f41-generated"});section.style.cssText="padding:clamp(28px,5vw,64px);margin:28px 0;text-align:center;border-radius:var(--forma-radius,22px);";
 const h=make("h2",{},t[0]),p=make("p",{},t[1]),b=make("a",{href:"#contact",class:"btn btn-primary"},t[2]);section.append(h,p,b);main.append(section);section.scrollIntoView({behavior:"smooth",block:"center"});
}
window.FORMAStudio={open,close,undo,redo};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build,{once:true});else build();
})();