/**
 * 🕹️ Pixel Arcade - Google Apps Script 雲端後端程式碼
 * 
 * 使用方式：
 * 1. 在您的 Google 雲端硬碟中，建立一份新的 Google 試算表 (Google Sheet)。
 * 2. 建立兩個工作表 (分頁)，名稱分別為：「題目」 與 「回答」。
 * 3. 「題目」工作表標題列 (第一列)：題號、題目、A、B、C、D、解答
 * 4. 「回答」工作表標題列 (第一列)：ID、闖關次數、總分、最高分、第一次通關分數、花了幾次通關、最近遊玩時間
 * 5. 點擊試算表選單的「擴充功能 > Apps Script」。
 * 6. 清空原本的代碼，將此 `gas-script.js` 的完整內容複製貼上。
 * 7. 點擊 Apps Script 編輯器右上角的「部署 > 新增部署」。
 * 8. 選擇部署類型為「網頁應用程式 (Web App)」。
 * 9. 設定如下：
 *    - 說明：Pixel Arcade Backend v1
 *    - 執行身分：我 (您的 Google 帳號)
 *    - 誰有權存取：任何人 (Anyone) <-- 極重要！
 * 10. 點擊部署，並授予權限。複製產生的「網頁應用程式 URL」，將其填入本機專案的 `.env` 中作為 `VITE_GOOGLE_APP_SCRIPT_URL`。
 */

// 🛠️ 1. 處理 GET 請求：隨機獲取 N 題 (防作弊：過濾掉解答欄位)
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getQuestions") {
    return handleGetQuestions(e);
  }
  
  return createJsonResponse({
    success: false,
    message: "Unknown GET action."
  });
}

// 🛠️ 2. 處理 POST 請求：提交答案、比對正確性、計算得分並寫入統計
function doPost(e) {
  try {
    // 由於前端使用 text/plain 以免觸發 CORS preflight，我們手動解析字串
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === "submitAnswers") {
      return handleSubmitAnswers(postData);
    }
    
    return createJsonResponse({
      success: false,
      message: "Unknown POST action."
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Error processing request: " + err.toString()
    });
  }
}

// -------------------------------------------------------------
// 核心處理邏輯：隨機獲取題目 (Get Questions)
// -------------------------------------------------------------
function handleGetQuestions(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("題目");
  
  if (!sheet) {
    return createJsonResponse({
      success: false,
      message: "找不到名稱為「題目」的工作表，請確認命名！"
    });
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({
      success: false,
      message: "「題目」工作表中無題目數據！"
    });
  }
  
  // 第一列為 Header: 題號、題目、A、B、C、D、解答
  var headers = data[0];
  var rawQuestions = data.slice(1);
  
  // 決定要隨機抽取的題目數量
  var count = parseInt(e.parameter.count, 10) || 5;
  count = Math.min(count, rawQuestions.length);
  
  // 進行洗牌 (Fisher-Yates Shuffle)
  var shuffled = rawQuestions.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  
  // 取得前 N 題，且「過濾掉解答欄位」防止前端看 Network 面板作弊
  var selected = shuffled.slice(0, count);
  var questionList = selected.map(function(row) {
    return {
      id: row[0].toString(), // 題號
      question: row[1],      // 題目
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
      // row[6] 是解答，故意不回傳給前端
    };
  });
  
  return createJsonResponse({
    success: true,
    questions: questionList
  });
}

// -------------------------------------------------------------
// 核心處理邏輯：提交答案並寫入回答統計 (Submit Answers)
// -------------------------------------------------------------
function handleSubmitAnswers(payload) {
  var playerId = payload.id;
  var userAnswers = payload.answers; // 格式: [{ id: "1", answer: "A" }, ...]
  var passThreshold = payload.passThreshold || 3;
  
  if (!playerId) {
    return createJsonResponse({ success: false, message: "Missing Player ID." });
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = ss.getSheetByName("題目");
  var rSheet = ss.getSheetByName("回答");
  
  if (!qSheet || !rSheet) {
    return createJsonResponse({
      success: false,
      message: "請確保試算表中有「題目」與「回答」兩個分頁！"
    });
  }
  
  // 1. 建立題目答案對照表
  var qData = qSheet.getDataRange().getValues();
  var answersMap = {};
  for (var i = 1; i < qData.length; i++) {
    var qRow = qData[i];
    var qId = qRow[0].toString();
    var qAns = qRow[6].toString().trim().toUpperCase(); // 解答欄
    answersMap[qId] = qAns;
  }
  
  // 2. 計算得分
  var score = 0;
  var totalQuestions = userAnswers.length;
  for (var j = 0; j < totalQuestions; j++) {
    var userAns = userAnswers[j];
    var correctAns = answersMap[userAns.id];
    if (correctAns && userAns.answer.trim().toUpperCase() === correctAns) {
      score++;
    }
  }
  
  var isPassed = score >= passThreshold;
  var now = new Date();
  
  // 3. 併發防撞鎖定 (Concurrency Lock)
  var lock = LockService.getScriptLock();
  try {
    // 嘗試等待 10 秒取得寫入鎖定
    lock.waitLock(10000);
    
    var rData = rSheet.getDataRange().getValues();
    var existingRowIndex = -1;
    
    // 尋找是否已有該玩家 ID
    for (var k = 1; k < rData.length; k++) {
      if (rData[k][0].toString().trim().toUpperCase() === playerId.trim().toUpperCase()) {
        existingRowIndex = k; // 保存 0-indexed 的資料列索引
        break;
      }
    }
    
    var attempts = 1;
    var maxScore = score;
    var firstPassScore = isPassed ? score : "";
    var attemptsToPass = isPassed ? 1 : "";
    
    if (existingRowIndex !== -1) {
      // 🔄 A. 玩家已存在，讀取舊數據進行更新
      var oldRow = rData[existingRowIndex];
      var oldAttempts = parseInt(oldRow[1], 10) || 0;
      var oldMaxScore = parseInt(oldRow[3], 10) || 0;
      var oldFirstPassScore = oldRow[4];
      var oldAttemptsToPass = oldRow[5];
      
      attempts = oldAttempts + 1;
      maxScore = Math.max(oldMaxScore, score);
      
      // 處理第一次通關分數與次數
      var hadPassedBefore = (oldFirstPassScore !== "" && oldFirstPassScore !== undefined && oldFirstPassScore !== null);
      
      if (hadPassedBefore) {
        // 以前通過了，數值保持不變
        firstPassScore = oldFirstPassScore;
        attemptsToPass = oldAttemptsToPass;
      } else if (isPassed) {
        // 以前沒通過，但這次通過了！
        firstPassScore = score;
        attemptsToPass = attempts;
      } else {
        // 以前沒通過，這次也沒通過
        firstPassScore = "";
        attemptsToPass = "";
      }
      
      // 更新對應行 (注意：Spreadsheet 的 Row 索引是 1-indexed，且加上 Header)
      var sheetRowIndex = existingRowIndex + 1;
      
      // 更新儲存格：
      rSheet.getRange(sheetRowIndex, 2).setValue(attempts);         // 闖關次數
      rSheet.getRange(sheetRowIndex, 3).setValue(score);            // 總分 (代表當次得分)
      rSheet.getRange(sheetRowIndex, 4).setValue(maxScore);         // 最高分
      rSheet.getRange(sheetRowIndex, 5).setValue(firstPassScore);    // 第一次通關分數
      rSheet.getRange(sheetRowIndex, 6).setValue(attemptsToPass);   // 花了幾次通關
      rSheet.getRange(sheetRowIndex, 7).setValue(now);              // 最近遊玩時間
      
    } else {
      // 🆕 B. 玩家不存在，建立全新的一列
      // 欄位：ID、闖關次數、總分、最高分、第一次通關分數、花了幾次通關、最近遊玩時間
      rSheet.appendRow([
        playerId,
        attempts,
        score,
        maxScore,
        firstPassScore,
        attemptsToPass,
        now
      ]);
    }
    
    // 釋放鎖定
    lock.releaseLock();
    
    // 回傳成功結算數據給前端
    return createJsonResponse({
      success: true,
      score: score,
      totalQuestions: totalQuestions,
      passed: isPassed,
      attempts: attempts,
      maxScore: maxScore,
      firstPassScore: firstPassScore,
      attemptsToPass: attemptsToPass
    });
    
  } catch (e) {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
    return createJsonResponse({
      success: false,
      message: "寫入資料庫鎖定逾時，請重試！"
    });
  }
}

// -------------------------------------------------------------
// 輔助函式：建立 CORS 友善的 JSON 輸出
// -------------------------------------------------------------
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script 網頁端部署已自動處理跳轉與部分跨域，這裡保證 JSON 字串正確回傳
  return output;
}
