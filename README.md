# Company Window Status（公司窗戶管理）

手機、平板、電腦皆可使用的免登入共用連結窗戶狀態網站。共有 6 個區域、45 扇窗戶；初始狀態全部 CLOSED。任何持有網址的人都可點擊窗戶切換狀態，Supabase 儲存資料並即時同步。

**重要：免登入公開連結不是安全邊界。** Supabase 的 anon 角色被允許讀取與更新窗戶資料，任何取得 API URL/key 的人都可透過 API 修改資料，不只是網站畫面上的使用者。只適合不含敏感資料且公司接受此風險的情況。網站不會可靠辨識實際修改者，紀錄統一顯示「連結使用者」。

> 平面圖目前是可修改的示意排列，不代表建築實際尺寸或方位。1M 健身房依左至右顯示 A–F；其他區域依你提供的左／右側牆壁分組。

## 1. 建立 Supabase 資料庫（免登入公開連結版）

1. 開啟 https://supabase.com/dashboard ，建立或選擇一個專供本網站使用的 Supabase 專案。
2. 進入 **SQL Editor** → **New query**。
3. 開啟本專案 `supabase/schema.sql`，複製全部內容貼入 SQL Editor，按 **Run**。
4. 執行後到 **Table Editor**，確認 `window_status` 表有 45 筆資料。
5. 到 **Project Settings → API**（有些介面會顯示 API Keys），複製 Project URL 與 publishable/anon key。前端只可使用 publishable/anon key，絕對不可放 `service_role` key。
6. 不需要建立任何 Authentication 使用者。
7. 確認 **Database → Replication** 中 `public.window_status` 已啟用 Realtime。SQL 已嘗試將資料表加入 `supabase_realtime` publication；若 SQL 提示未啟用，請在介面手動啟用。

### 權限設計（公開連結模式）
- RLS 仍然啟用，但 SQL 允許 `anon` 與 `authenticated` 讀取、更新窗戶狀態。
- 不需要帳號或登入。
- 任何知道 Supabase 專案 URL 和 publishable/anon key 的人，都可能直接透過 API 讀寫狀態；這些前端值不是秘密。
- `updated_by` 統一記錄「連結使用者」，無法辨識真實修改者；更新時間由網站送出並顯示。
- 如果公司之後要求真正限制只有員工能修改，就必須加回登入、公司網路限制或後端驗證；單靠隱藏網址不夠。

## 2. 上傳專案到 GitHub（可用 Android 手機）

### 方式 A：GitHub 網頁上傳
1. 登入 https://github.com ，建立新 Repository，例如 `company-window-manager`。
2. 建議設為 **Private**，避免公開公司內部專案原始碼。
3. 在新 Repository 頁面選 **Add file → Upload files**。
4. 將本專案資料夾內的檔案上傳，保留資料夾結構：`src/`、`supabase/`、`package.json`、`index.html`、`vite.config.js`、`netlify.toml`、`.gitignore`、`README.md`。
5. GitHub 網頁上傳時，若無法直接上傳資料夾，請用 GitHub Codespaces：開啟 Repository → **Code → Codespaces → Create codespace**，在終端機上傳／解壓專案檔，再執行 `git add . && git commit -m "Create window status app" && git push`。
6. 不要上傳 `.env` 或任何私密金鑰。

### 方式 B：Codespaces 終端機
若已將 ZIP 放入 Codespaces 工作區，解壓後進入專案根目錄，執行：
```bash
npm install
npm run build
git add .
git commit -m "Create company window status app"
git push
```

## 3. 部署到 Netlify

1. 開啟 https://app.netlify.com ，選 **Add new site → Import an existing project**。
2. 選 **GitHub**，授權並選擇 `company-window-manager` Repository。
3. Build command：`npm run build`；Publish directory：`dist`。`netlify.toml` 已包含這些設定。
4. 在 Netlify 網站的 **Site configuration / Project configuration → Environment variables** 新增：
   - `VITE_SUPABASE_URL` = Supabase Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Supabase publishable key（或舊介面提供的 anon key）
5. 儲存環境變數後，執行 **Deploys → Trigger deploy → Clear cache and deploy site**。
6. 部署成功後，開啟 Netlify 提供的網址登入測試。

## 4. 驗收清單

- [ ] 登入後顯示 6 個區域與 45 扇窗戶。
- [ ] 初始狀態全部為灰色 CLOSED。
- [ ] 點擊一扇窗戶後變綠色 OPEN，並顯示更新者及時間。
- [ ] 在另一個瀏覽器或手機登入另一個同事帳號，確認狀態即時同步。
- [ ] 重新整理／重新登入後，狀態仍保留。
- [ ] 不需登入即可查看及修改。

## 5. 常見問題

- **顯示「完成雲端設定」**：檢查 Netlify 的兩個環境變數名稱與值，重新部署。
- **資料讀取失敗**：確認已重新執行新版 `supabase/schema.sql`，並確認 Supabase 專案 URL、publishable/anon key 與 Realtime 設定正確。
- **窗戶資料讀取失敗**：確認 `schema.sql` 已完整執行、RLS policies 存在、登入帳號有效。
- **不同裝置沒有即時更新**：確認 `window_status` 已加入 Supabase Realtime publication；重新載入頁面再測試。
- **狀態更新失敗**：查看 Supabase Logs，確認 RLS update policy 已建立。
- **想更改窗戶名稱／分組**：目前可在 `src/App.jsx` 的 `ZONES` 修改示意排列，並同步調整 `supabase/schema.sql` 的種子資料。正式上線後請先備份資料再改資料結構。

## 安全提醒
網站用戶端只放 Supabase Project URL 與 publishable/anon key；**絕不可把 `service_role` key 放進 Netlify 前端環境變數或 GitHub 專案。** 由於本版本允許匿名讀寫，RLS 不會限制誰能修改資料；只應在公司接受此風險時使用。