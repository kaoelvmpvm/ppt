# 網頁簡報資料庫｜選擇投影片

主網址：https://kaoelvmpvm.github.io/ppt/

此儲存庫已改為多份 HTML 投影片的選擇入口。首頁「選擇投影片」可以開啟每一份簡報；各稿件分別存在 decks/ 資料夾，避免更新一份時覆蓋其他講稿。

## 現有簡報

| 簡報 | 網址 | 內容 |
|---|---|---|
| 王子脫魯記 SET｜平權偵察隊 | https://kaoelvmpvm.github.io/ppt/decks/menstrual-equity-set.html | 15頁：角色引入、四章十題、作答提醒、可離線顯示的SET QR Code、可調節倒數、學生進階分析、遊戲後偏見與用品可近性統整、隨機抽人討論 |
| 健促 AI 健多多｜一把鏟子，挖出健康的可能 | https://kaoelvmpvm.github.io/ppt/decks/health-dodo.html | 完整保留原16頁演講簡報、動畫、講者備忘和策略分享工具 |

SET 學生遊戲本體仍維持在獨立儲存庫：https://kaoelvmpvm.github.io/menstrual-equity-set-jh/

## 操作方式

- **←／→**：上一頁／下一頁；也支援 PageUp/PageDown 和投影筆模擬的方向鍵。
- **F／全螢幕**：切換全螢幕。
- **N**：講者備忘；**O**：投影片總覽。
- 底部保留「上一頁、下一頁、全螢幕、更多」，其他控制移至「更多」。
- SET 的 QR Code 採內建SVG矩陣，無須依賴外部QR網站；投影前仍需確定學生遊戲網站可以連線。
- SET 答題倒數預設20分鐘，可增減5分鐘、暫停及重設。時間只是教師節奏工具，不可代替學生思考。
- SET 抽人討論：候選座號已固定於程式內，不在簡報畫面或抽選動畫中列出。直接按「開始抽人」即可隨機抽選；同一輪不重複，按「重新開始」可清除本輪紀錄。此為公開 GitHub Pages 靜態網站，程式原始碼仍可檢視，**僅隱藏畫面中的名單，不具備保密或防作弊機制**。

## 新增其他簡報

1. 新增獨立 HTML 到 decks/ ，例如 decks/my-lecture.html。
2. 在 decks/catalog.js 的 window.PPT_DECKS 陣列加入對應的標題、副標、路徑與色彩。
3. 提交到 main；GitHub Actions 將先執行 node tests/site.cjs，再發布整個靜態網站到 GitHub Pages。
4. 新投影片可沿用 decks/set.css、decks/set.js 的控制架構，或使用獨立 HTML/CSS/JS；首頁只需登記對應路徑。

## 備註

- 教學講演所呈現的學生問答或討論題僅為教學示例，不應視為班級真實學生的回答。
- 任何公開錄影應依校方對學生個人資訊與影像的規範進行告知及必要的授權。
- 原健多多簡報的策略分享連結已隨檔案移動修正為 ../share/。
