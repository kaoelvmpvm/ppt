# 健促 AI 健多多｜策略共創分享區

靜態網站：`https://kaoelvmpvm.github.io/ppt/share/`

## 功能

- 學員輸入代表學校，發布一項經自己確認的健康促進策略。
- 公開瀏覽按學校彙整；點擊學校可看各策略，再開啟完整的兩張表。
- 完整保存：活動名稱、執行說明、建議對象、建議時間、關鍵意見、成效指標、HPS 與 Ophelia 重點及判定依據、成敗關鍵／常見問題／建議搭配／行政檢核問句。
- 不收集投稿者姓名、學生身分資訊，也不提供未授權的匿名刪改。
- 未啟用資料庫時僅展示 **明確標示的虛構示範案例**，按下提交不會假裝儲存。

## 開通真正的共用資料庫

1. 前往 https://supabase.com/ 建立專案。
2. 在 **SQL Editor** 貼入並執行 [`schema.sql`](./schema.sql)，建立 `strategy_shares` 表與資料庫安全政策。
3. 前往 Supabase **Project Settings → API**（或 **Connect / API Keys** 頁），複製 **Project URL** 和 **Publishable key**。
4. 在本儲存庫的 `share/config.js` 填入 `supabaseUrl` 與 `supabasePublishableKey`，commit 至 `main`。可公開的是 **Publishable Key**；**絕不可使用 Secret 或 service_role key**。
5. GitHub Pages 自動部署後，開啟分享區，看見「共用資料庫已連線」，從兩台裝置測試發表與瀏覽。

## 資安與營運注意事項

- 任何訪客能閱讀公開策略，也能新增策略；這種做法適合小規模受控研習，不適合長期不設防地開放投稿。
- 資料庫啟用 RLS；`anon` 僅能 `SELECT` 與指定欄位的 `INSERT`，不能 `UPDATE` / `DELETE`。管理者可以使用 Supabase Dashboard 管理資料。
- 公開前應評估 CAPTCHA、速率限制及管理員審核機制，避免垃圾投稿、學校名稱冒用。
- 帳號安全：不要把 Supabase 的 secret/service_role key 放在前端或公開 repo。
- 學校名稱由提交者自行提供，沒有經過代表學校身分驗證。
- 素材為自行撰寫 HTML/CSS/SVG，示範案例為研習虛構資料。

## 檔案

- `index.html`：分享區網頁。
- `styles.css`：響應式版面。
- `app.js`：讀取資料、依校瀏覽、預覽、提交。
- `demo-data.js`：未設定資料庫時的虛構案例。
- `config.js`：由管理者填入 Supabase 連線設定。
- `schema.sql`：建表、權限與 RLS。
