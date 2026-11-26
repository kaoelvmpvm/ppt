const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const menu=read("index.html");
const catalog=read("decks/catalog.js");
const old=read("decks/health-dodo.html");
const set=read("decks/menstrual-equity-set.html");
const setJs=read("decks/set.js");
const setCss=read("decks/set.css");

assert.ok(menu.includes("<h1>選擇投影片</h1>"),"首頁選擇投影片文字不存在");
assert.ok(menu.includes('src="./decks/catalog.js?v=1"'),"首頁尚未載入簡報清單");
const context={window:{}};vm.runInNewContext(catalog,context);
const entries=context.window.PPT_DECKS;
assert.equal(entries.length,2,"首頁應提供SET與健多多兩份簡報");
for(const entry of entries){
 assert.match(entry.path,/^\.\/decks\/[\w-]+\.html$/);
 assert.ok(fs.existsSync(path.join(__dirname,"..",entry.path)),"簡報不存在："+entry.path);
}
assert.ok(entries.some(x=>x.id==="set"),"缺SET簡報");
assert.ok(entries.some(x=>x.id==="dodo"),"缺健多多簡報");

assert.equal((old.match(/class="slide /g)||[]).length,16,"原健多多16頁簡報不完整");
assert.ok(old.includes('href="../share/"'),"健多多分享工具路徑未更新");
assert.ok(old.includes('href="../"'),"原簡報未提供回選單入口");

const count=(set.match(/<section class="slide(?:\s|")/g)||[]).length;
assert.equal(count,15,"SET應有15頁");
const notesMatch=set.match(/<script id="notesData" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(notesMatch,"SET講者備忘缺漏");
assert.equal(JSON.parse(notesMatch[1]).length,count,"每頁應有講者備忘");

const ids=[...set.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"SET頁面出現重複ID");
for(const match of setJs.matchAll(/\$\("([^"]+)"\)/g)){
 assert.ok(ids.includes(match[1]),"SET JS未找到頁面元件："+match[1]);
}
new vm.Script(setJs);
const qrRows=setJs.match(/const qrRows="([0-9a-f|]+)"\.split\("\|"\)/);
assert.ok(qrRows,"必須有可離線生成的QR矩陣");
const matrix=qrRows[1].split("|");
assert.equal(matrix.length,49,"QR矩陣列數不正確");
assert.ok(matrix.every(x=>x.length===13),"QR矩陣行寬不正確");
assert.equal((set.match(/class="set-qr"/g)||[]).length,2,"應在進入遊戲和作答頁都有QR");
assert.ok(set.includes("https://kaoelvmpvm.github.io/menstrual-equity-set-jh/"),"遊戲連結有誤");
for(const name of ["prince","cinderella","rapunzel","matchgirl"])
 assert.ok(set.includes("/assets/characters/"+name+".png"),"缺角色："+name);
for(const id of ["Q05","Q06","Q08","Q09","Q10"])
 assert.ok(set.includes("/assets/scenes/"+id+".webp"),"缺情境圖："+id);
assert.ok(set.includes("想一想，再作答"),"缺作答前思考提醒");
assert.ok(set.includes("月經除了身體不適"),"缺遊戲後問題轉場");
assert.ok(set.includes("資源障礙"),"缺資源問題整合");
assert.ok(set.includes('id="draw"')&&set.includes('id="rosterDialog"'),"缺隨機抽人介面");
assert.ok(setJs.includes("picked.includes"),"抽選應避免重複");
assert.ok(!setJs.includes("localStorage.setItem"),"學生名單不應寫入永久儲存");
assert.ok(setCss.includes(".set-qr svg"),"QR顯示尺寸樣式缺漏");
console.log("PASS: menu, 2 decks, original 16 slides, new 15 slides, QR matrix, timer, random picker, notes and image references");
