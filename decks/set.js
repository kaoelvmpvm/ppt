(function(){
"use strict";
const $=id=>document.getElementById(id);
const slides=Array.from(document.querySelectorAll(".slide"));
const notes=JSON.parse($("notesData").textContent);
if(notes.length!==slides.length)console.warn("Slide notes count mismatch",notes.length,slides.length);
let current=0;
function resize(){document.documentElement.style.setProperty("--scale",Math.min(innerWidth/1600,innerHeight/900))}
function show(n){
 current=Math.max(0,Math.min(slides.length-1,n));
 slides.forEach((s,i)=>{s.classList.toggle("active",i===current);s.setAttribute("aria-hidden",String(i!==current))});
 $("counter").textContent=(current+1)+" / "+slides.length;
 $("prev").disabled=current===0;$("next").disabled=current===slides.length-1;
 $("progress").style.width=((current+1)/slides.length*100)+"%";
 $("noteText").textContent=notes[current]||"";
 document.title=(current+1)+"/"+slides.length+"｜王子脫魯記 SET";
 try{history.replaceState(null,"","#"+(current+1))}catch(e){}
}
slides.forEach((slide,i)=>{
 const footer=document.createElement("div");footer.className="foot";
 const source=document.createElement("span");source.textContent="王子脫魯記 SET｜板橋國中 高勳頊老師";
 const page=document.createElement("b");page.textContent=String(i+1).padStart(2,"0")+" / "+String(slides.length).padStart(2,"0");
 footer.append(source,page);slide.append(footer);
 const btn=document.createElement("button");
 btn.textContent=String(i+1).padStart(2,"0")+"　"+slide.dataset.title;
 btn.addEventListener("click",()=>{show(i);$("overview").close()});
 $("overviewList").append(btn);
});
function closeMore(){$("moreMenu").hidden=true;$("moreBtn").setAttribute("aria-expanded","false")}
$("moreBtn").addEventListener("click",e=>{e.stopPropagation();let open=$("moreMenu").hidden;$("moreMenu").hidden=!open;$("moreBtn").setAttribute("aria-expanded",String(open))});
document.addEventListener("pointerdown",e=>{if(!$("controls").contains(e.target))closeMore()});
$("prev").addEventListener("click",()=>{closeMore();show(current-1)});
$("next").addEventListener("click",()=>{closeMore();show(current+1)});
$("overviewBtn").addEventListener("click",()=>{closeMore();$("overview").showModal()});
$("overviewClose").addEventListener("click",()=>$("overview").close());
$("notesBtn").addEventListener("click",()=>{closeMore();$("notes").hidden=!$("notes").hidden});
$("motionBtn").addEventListener("click",()=>{closeMore();let off=document.body.classList.toggle("motion-off");$("motionBtn").textContent=off?"開啟動畫":"關閉動畫"});
$("printBtn").addEventListener("click",()=>{closeMore();window.print()});
$("fullBtn").addEventListener("click",()=>{
 if(document.fullscreenElement){if(document.exitFullscreen)document.exitFullscreen()}
 else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
});
window.addEventListener("resize",resize);
window.addEventListener("keydown",e=>{
 if(e.key==="Escape"){closeMore();return}
 if(document.querySelector("dialog[open]"))return;
 if(e.target.closest("input,textarea,select"))return;
 if(e.target.closest("button,a")&&[" ","Enter"].includes(e.key))return;
 let k=e.key.toLowerCase();
 if(["arrowright","arrowdown","pagedown"," ","enter"].includes(k)){e.preventDefault();show(current+1)}
 else if(["arrowleft","arrowup","pageup","backspace"].includes(k)){e.preventDefault();show(current-1)}
 else if(k==="home"){e.preventDefault();show(0)}
 else if(k==="end"){e.preventDefault();show(slides.length-1)}
 else if(k==="n")$("notes").hidden=!$("notes").hidden;
 else if(k==="o")$("overview").showModal();
 else if(k==="f")$("fullBtn").click();
});
let touch=null;
$("frame").addEventListener("touchstart",e=>{if(e.target.closest("button,a,textarea,input"))return;touch=e.changedTouches[0].clientX},{passive:true});
$("frame").addEventListener("touchend",e=>{if(touch==null)return;const dx=e.changedTouches[0].clientX-touch;touch=null;if(Math.abs(dx)>60)show(current+(dx<0?1:-1))},{passive:true});
document.querySelectorAll(".set-qr").forEach(img=>{img.src="data:image/png;base64,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"});
let seconds=1200,initial=1200,running=false,stopAt=0,interval=null;
function paintClock(){
 $("clock").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
}
function pause(){
 running=false;if(interval)clearInterval(interval);interval=null;
 $("timerToggle").textContent="繼續倒數";
 $("timerStatus").textContent=seconds===0?"倒數結束；請依學生實際進度調整":"已暫停";
}
function tick(){
 seconds=Math.max(0,Math.ceil((stopAt-Date.now())/1000));paintClock();
 if(seconds===0)pause();
}
$("timerToggle").addEventListener("click",()=>{
 if(running){pause();return}
 if(seconds<=0)seconds=initial;
 running=true;stopAt=Date.now()+seconds*1000;
 $("timerToggle").textContent="暫停倒數";
 $("timerStatus").textContent="作答要想一想，不以速度為評量依據";
 interval=setInterval(tick,250);
});
function adjust(delta){
 seconds=Math.min(5400,Math.max(60,seconds+delta));
 initial=seconds;if(running)stopAt=Date.now()+seconds*1000;paintClock();
}
$("timerMinus").addEventListener("click",()=>adjust(-300));
$("timerPlus").addEventListener("click",()=>adjust(300));
$("timerReset").addEventListener("click",()=>{
 if(running)pause();seconds=initial=1200;paintClock();
 $("timerStatus").textContent="已重設為20分鐘";
});
paintClock();
let roster=[],picked=[],spinning=false;
$("rosterInput").value=Array.from({length:30},(_,i)=>String(i+1).padStart(2,"0")).join("\n");
function rosterState(){
 $("draw").disabled=roster.length===0||spinning||picked.length===roster.length;
 $("rosterStatus").textContent=roster.length?
 "名單"+roster.length+"人｜已抽"+picked.length+"人｜剩餘"+(roster.length-picked.length)+"人":
 "請先設定真實名單；預填01～30僅為示範";
}
function openRoster(){closeMore();$("rosterError").textContent="";$("rosterDialog").showModal()}
$("openRoster").addEventListener("click",openRoster);
$("rosterMenu").addEventListener("click",openRoster);
$("rosterCancel").addEventListener("click",()=>$("rosterDialog").close());
$("rosterApply").addEventListener("click",()=>{
 let list=$("rosterInput").value.split(/[\r\n,，;；]+/).map(v=>v.trim()).filter(Boolean);
 let unique=Array.from(new Set(list));
 if(!unique.length||unique.length>80||unique.some(x=>x.length>20)){
  $("rosterError").textContent="請輸入1～80人，每人一行，單筆最多20字。";return;
 }
 roster=unique;picked=[];$("drawResult").textContent="準備抽選";
 rosterState();$("rosterDialog").close();
});
$("rosterReset").addEventListener("click",()=>{
 if(!window.confirm("清除本輪抽選紀錄？名單不變。"))return;
 picked=[];$("drawResult").textContent="準備抽選";rosterState();
});
$("draw").addEventListener("click",()=>{
 if(spinning)return;
 const available=roster.filter(v=>!picked.includes(v));
 if(!available.length)return;
 spinning=true;rosterState();
 const el=$("drawResult");el.classList.add("shuffling");
 let roulette=setInterval(()=>el.textContent=available[Math.floor(Math.random()*available.length)],75);
 setTimeout(()=>{
  clearInterval(roulette);
  let i=Math.floor(Math.random()*available.length);
  if(window.crypto&&crypto.getRandomValues){
   let rand=new Uint32Array(1);crypto.getRandomValues(rand);i=rand[0]%available.length;
  }
  const choice=available[i];picked.push(choice);
  el.classList.remove("shuffling");el.textContent=choice;
  spinning=false;rosterState();
 },1300);
});
rosterState();
resize();show((Number(location.hash.slice(1))||1)-1);
})();