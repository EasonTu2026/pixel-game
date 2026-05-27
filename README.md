# 🕹️ Pixel Arcade: Trivia Game

這是一個使用 React + Vite 打造的像素風街機問答遊戲。透過結合 Google Sheets 與 Google Apps Script (GAS)，讓您不需建置傳統後端與資料庫，即可輕鬆管理題庫與玩家分數！

## 🚀 快速開始

### 1. 安裝與執行
請確保您的環境已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上版本)。

```bash
# 1. 安裝依賴套件
npm install

# 2. 啟動本機開發伺服器
npm run dev

# 3. 打開瀏覽器前往 http://localhost:5173/ 開始遊戲
```
> **注意**：如果 `.env` 未設定後端 API，遊戲會自動進入 **Mock 模式**（離線體驗版），從本機隨機出題並產生假分數供您測試介面。

---

## 📊 Google Sheets 題庫與計分板設定

### 1. 建立試算表
1. 登入您的 Google 帳號，前往 [Google 雲端硬碟](https://drive.google.com/) 建立一份新的「Google 試算表」。
2. 將試算表命名（例如："Pixel Game 資料庫"）。

### 2. 設定分頁（非常重要，名稱不能錯）
請在試算表下方建立**兩個分頁**，並確實將第一列作為標題：

**分頁一：命名為 `題目`**
第一列請依序填寫：
- `題號` | `題目` | `A` | `B` | `C` | `D` | `解答`
*(請將您的題目填寫在第 2 列之後，解答請填入 A/B/C/D 大寫)*

**分頁二：命名為 `回答`**
第一列請依序填寫：
- `ID` | `闖關次數` | `總分` | `最高分` | `第一次通關分數` | `花了幾次通關` | `最近遊玩時間`

---

## ☁️ Google Apps Script (GAS) 部署教學

這是將您的 Google 試算表變成遊戲後端 API 的關鍵步驟！

### 1. 貼上程式碼
1. 在剛剛建立的試算表中，點擊上方選單的 **擴充功能** > **Apps Script**。
2. 刪除編輯器裡面原本的所有程式碼。
3. 打開專案內的 `gas-script.js`，將全部內容**複製**並**貼上**到 Apps Script 編輯器中。
4. 點選左上角磁碟片圖示 **儲存**。

### 2. 發布網頁應用程式
1. 點擊編輯器右上角的 **部署** > **新增部署**。
2. 在「選取類型」旁邊點選齒輪 ⚙️，勾選 **網頁應用程式**。
3. 填寫設定：
   - 說明：(隨意填寫，例如 `v1`)
   - 執行身分：選擇 **我 (你的信箱)**
   - 誰有權存取：選擇 **所有人 (Anyone)** *(⚠️ 必選！否則遊戲無法連線)*
4. 點擊 **部署**。

### 3. 授權存取
1. 系統會跳出「需要授權」的提示，點擊 **授權存取**。
2. 選擇您的 Google 帳號。
3. 若跳出「Google 尚未驗證這個應用程式」，請點擊左下角的 **進階** > **前往「某某某(不安全)」**。
4. 點擊 **允許**。

### 4. 取得 API 網址並設定專案
1. 部署完成後，畫面會顯示一串 **網頁應用程式 URL** (開頭為 `https://script.google.com/...`)。請點擊複製。
2. 回到您的專案程式碼，打開根目錄下的 `.env` 檔案。
3. 將網址貼在 `VITE_GOOGLE_APP_SCRIPT_URL=` 的後面：
   ```env
   VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/您的專屬亂碼/exec
   ```
4. 重新啟動您的 `npm run dev`。恭喜！您的遊戲現在已經正式連上雲端題庫了！

---

## 🌐 自動部署到 GitHub Pages

專案已經內建了 GitHub Actions 設定，只要將程式碼推送到 GitHub `main` 分支，就能自動打包並發布至 GitHub Pages！

### 1. 設定 Repository Secrets
因為我們不希望把私密的 Google Apps Script 網址 (URL) 放在公開的程式碼中，我們需要設定 GitHub Secrets：
1. 進入您在 GitHub 上的專案倉庫 (Repository) 頁面。
2. 點擊上方的 **Settings** 頁籤。
3. 在左側選單找到 **Secrets and variables** > **Actions**。
4. 點擊綠色的 **New repository secret** 按鈕。
5. **Name** 請填入：`VITE_GOOGLE_APP_SCRIPT_URL`
6. **Secret** 請貼上剛剛您部署 GAS 取得的完整 API 網址 (與 `.env` 中的相同)。
7. 點擊 **Add secret**。

### 2. (選用) 設定遊戲參數 Variables
您也可以用同樣的方式，在旁邊的 **Variables** 頁籤設定以下變數來自訂遊戲難度。如果不設定，系統將使用預設值。
1. 點擊 **Variables** 頁籤，選擇 **New repository variable**。
2. **Name**: `VITE_PASS_THRESHOLD` （及格門檻，預設 3）
3. **Name**: `VITE_QUESTION_COUNT` （總題數，預設 5）

### 3. 推送程式碼並檢查
1. 將包含 `.github/workflows/deploy.yml` 的程式碼推送到 GitHub 的 `main` 分支。
2. 在倉庫頁面點擊 **Actions** 頁籤，您會看到「Deploy to GitHub Pages」正在執行。
3. 部署成功後，進入 **Settings** > **Pages**，就能看到專屬您的遊戲公開網址了！
