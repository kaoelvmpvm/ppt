# 健多多策略共創分享區（Google Forms 版）

網站網址：https://kaoelvmpvm.github.io/ppt/share/

## 設計更新

- **由逐格填寫改為整段貼上**，以 Google 表單收件。
- 表單只需代表學校、健康促進議題、活動名稱、（一）落地執行要領全文、（二）成敗關鍵及行政檢核全文。
- 以 Google Forms 保存原始回覆，並連動 Google 試算表作為管理紀錄；GitHub Pages 透過 Apps Script 唯讀讀取分享內容。
- 依學校自動分組，點開學校後點策略即可完整閱讀兩段資料。
- 未連線前只顯示清楚標示的虛構示範案例，不顯示假的投稿成功訊息。

## 維護

- `index.html`：分享頁主體
- `styles.css`：桌面與手機版面
- `app.js`：學校分類、搜尋、內容展開、唯讀 JSONP
- `config.js`：Google Apps Script 公開唯讀網址（未連接時留空）
- `demo-data.js`：虛構示範案例
- `Code.gs`：一鍵建立 Google Form + 回覆試算表；提供公開唯讀查詢
- `SETUP.md`：一頁式管理者部署步驟

請依照 [SETUP.md](./SETUP.md) 完成一次 Google 端授權與部署。此站不再使用 Supabase。
