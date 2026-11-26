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
/* 內嵌 SET QR：49×49 模組，含四格留白；不用依賴第三方 QR 服務。 */
const qrRows="0000000000000|0000000000000|0000000000000|0000000000000|01fd8210af7f0|0105e163e4410|0174548e995d0|017513b9c95d0|0175b53cec5d0|010566cd3b410|01fd5555557f0|000053038c000|0024bd15623b0|01a8d64f194f0|00ddf267829c0|01393b7e34a40|00342305ab480|0062cc3972820|00954e4e48630|0092abff2e500|0096875049230|015246db58650|01c5b3cb48df0|0108b77860290|00ec0a2798c60|0171d4a219c70|01bcca1797360|01f1614b26e40|017d6a65b9eb0|01035bb1ca080|00d5299305830|0098666739220|01aeef524d820|001973c430c70|013e6e86f1330|00304bfb4e980|012e87e963f60|00016ca35f170|01fc6f9a555a0|01040c1365170|0174342595fb0|0175e85286d00|0174aee6521d0|0104f7b75de20|01fc327329ba0|0000000000000|0000000000000|0000000000000|0000000000000".split("|");
document.querySelectorAll(".set-qr").forEach(function(host){
 const ns="http://www.w3.org/2000/svg";
 const svg=document.createElementNS(ns,"svg");
 svg.setAttribute("viewBox","0 0 49 49");
 svg.setAttribute("xmlns",ns);
 svg.setAttribute("shape-rendering","crispEdges");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label","掃描進入王子脫魯記 SET 遊戲");
 const white=document.createElementNS(ns,"rect");
 white.setAttribute("width","49");white.setAttribute("height","49");white.setAttribute("fill","#ffffff");
 const black=document.createElementNS(ns,"path");
 let d="";
 qrRows.forEach(function(row,y){
  const bits=BigInt("0x"+row);
  for(let x=0;x<49;x++){
   if((bits >> BigInt(48-x)) & 1n) d+="M"+x+" "+y+"h1v1h-1z";
  }
 });
 black.setAttribute("d",d);black.setAttribute("fill","#141414");
 svg.append(white,black);host.append(svg);
});
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
/* 本份講演使用固定抽選池；候選名單不顯示在投影片或輪播動畫。 */
const candidateSeats=Object.freeze(["5","13","9","27","20","1","24"]);
let picked=[],spinning=false;
function drawState(){
 $("draw").disabled=spinning||picked.length>=candidateSeats.length;
 if(picked.length>=candidateSeats.length){
  $("rosterStatus").textContent="本輪抽選已完成，按「重新開始」可再次抽選。";
 }else if(picked.length){
  $("rosterStatus").textContent="已完成一次抽選，可繼續抽選下一位。";
 }else{
  $("rosterStatus").textContent="按「開始抽人」隨機邀請一位同學。";
 }
}
$("resetDraw").addEventListener("click",()=>{
 if(spinning)return;
 if(picked.length&&!window.confirm("確定重新開始抽選？本輪已抽出的結果將重設。"))return;
 picked=[];$("drawResult").textContent="準備抽選";drawState();
});
$("draw").addEventListener("click",()=>{
 if(spinning)return;
 const available=candidateSeats.filter(v=>!picked.includes(v));
 if(!available.length)return;
 spinning=true;drawState();
 const output=$("drawResult");output.classList.add("shuffling");
 output.textContent="？";
 /* 只呈現中性抽選動畫，不輪播未被抽出的候選座號。 */
 const animation=["？","✦","？","◆"];
 let step=0;
 const roulette=setInterval(()=>{output.textContent=animation[step++%animation.length]},95);
 setTimeout(()=>{
  clearInterval(roulette);
  let idx=Math.floor(Math.random()*available.length);
  if(window.crypto&&window.crypto.getRandomValues){
   const random=new Uint32Array(1);window.crypto.getRandomValues(random);
   idx=random[0]%available.length;
  }
  const selected=available[idx];
  picked.push(selected);
  output.classList.remove("shuffling");output.textContent=selected;
  spinning=false;drawState();
 },1250);
});
drawState();
resize();show((Number(location.hash.slice(1))||1)-1);
})();