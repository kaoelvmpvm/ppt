# 管理者設定：Google 表單＋Google 試算表＋公開成果讀取

網站：`https://kaoelvmpvm.github.io/ppt/share/`

## 設計與安全原則

- 正式投稿使用 **Google 表單**，只設 5 個主要欄位：代表學校、議題、活動名稱、落地執行要領全文、成敗關鍵／行政檢核全文。
- 回覆由 Google Forms 保存，並自動同步至同一 Google 帳號下的 **私人 Google 試算表**；不公開試算表原始檔案。
- 網站透過管理者部署的 Apps Script **唯讀介面**取得所有公開投稿，不會把資料儲存在學員電腦。
- 任何人在表單提交的內容均可能被公開，因此研習前應說明投稿原則並安排管理者定期檢查。不應要求學員上傳任何可識別個人的資料。
- 程式目前預設**投稿後直接公開**，未內建投稿審核或防惡意灌水。若要對一般大眾長期開放，應先增加審核流程。

## 第一步：建立 Google 表單與回覆表

1. 使用預定管理資料的 Google 帳號開啟 [Google Apps Script](https://script.google.com/home/projects/create)。
2. 將 GitHub 的 `share/Code.gs` 全部貼到 `Code.gs`。
3. 選取函式 `setup`，按「執行」，依 Google 畫面完成權限授權。
4. 在下方「執行記錄」查看：表單填寫網址 `formUrl`、表單編輯網址 `formEditUrl`、試算表網址 `spreadsheetUrl`。
5. 打開 `formEditUrl`，確認表單已發布、接受回覆，且學員可在未登入受限機構帳號的情況下填寫；若你的組織政策限制外部表單，需由管理員調整或改用允許的帳號。

再次執行 `setup()` 不會重複建立表單。

## 第二步：將唯讀讀取服務發布為網路應用程式

1. 在同一 Apps Script 專案右上角按「部署」→「新增部署作業」。
2. 類型選擇「網頁應用程式（Web app）」。
3. 「執行身分」選 **我（管理者）**；「存取權」選 **所有人（Anyone）**，以讓免登入的研習網站取得公開內容。
4. 按部署，複製以 `https://script.google.com/macros/s/.../exec` 結尾的網頁應用程式網址。
5. 先在瀏覽器直接開啟該網址，應看到 `"ok":true`、`formUrl`、`records` 等 JSON 欄位。如果出現驗證要求或找不到資料，代表權限／部署設定仍未完成。

## 第三步：將網站與 Google 表單連接

在 GitHub 的 `share/config.js` 中填入：

```js
window.DODO_SHARE_CONFIG = {
  googleAppsScriptUrl: 'https://script.google.com/macros/s/你的部署ID/exec'
};
```

儲存後 GitHub Pages 會重新部署。網站便會自動取得表單連結及回覆，顯示「已連接 Google 表單」。

**若不方便在 GitHub 修改程式，只需把 Apps Script 網頁應用程式 `.../exec` 網址貼回 ChatGPT，我即可協助更新 `config.js`。** 此網址是公開唯讀服務，不是你的 Google 帳號密碼；不需提供任何 API 密鑰或身分憑證。

## 第四步：正式驗證

1. 從網站點「開啟 Google 投稿表單」。
2. 在表單用「測試國中」填寫測試策略，把兩段文字各貼一小段後送出。
3. 返回網站按「重新整理」，應出現「測試國中」卡片，點入後可看完整原文。
4. 以另一台手機或無痕視窗開啟同一網站，確認同樣看得到。
5. 到 Google 表單回覆頁及連結的試算表，確認測試紀錄確實存在；正式上線前可刪除測試回覆。

## 排錯

- 「展示模式」：尚未填 `config.js`，或部署網址格式不正確。
- 「暫時無法取得 Google 表單資料」：請檢查 Apps Script 權限、部署作業、是否仍可公開存取，以及執行記錄。
- 「已連接但沒有投稿」：確認學員填的是此 Google 表單，而非舊版 Supabase 網站。
- 若變更 Google Apps Script 程式，需在「管理部署作業」更新網頁應用程式版本；只儲存程式碼不會更新已部署的舊版本。

Google 官方參考文件：
- https://developers.google.com/apps-script/reference/forms/form
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/content
- https://support.google.com/docs/answer/2917686
