import { useState, useEffect } from 'react';
import { ArcadeCabinet } from './components/ArcadeCabinet';
import { Lobby } from './components/Lobby';
import { Quiz } from './components/Quiz';
import type { Question } from './components/Quiz';
import { Result } from './components/Result';
import type { GameResultData } from './components/Result';
import { CONFIG } from './config';
import { getRandomMockQuestions } from './utils/mockQuestions';
import { initAudio, toggleMute, getMuted } from './utils/audio';

type GameState = 'LOBBY' | 'PLAYING' | 'SUBMITTING' | 'RESULT';

function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [playerId, setPlayerId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [resultData, setResultData] = useState<GameResultData | null>(null);
  const [isMuted, setIsMuted] = useState(getMuted());

  // 靜音切換
  const handleMuteToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  // 點擊第一下解鎖瀏覽器 Web Audio 限制
  useEffect(() => {
    const unlock = () => {
      initAudio();
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);

    // 背景預載入 100 張 DiceBear 關主圖片
    console.log('🖼️ Preloading 100 boss images...');
    for (let i = 1; i <= 100; i++) {
      const img = new Image();
      img.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=boss${i}`;
    }

    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  // 開始遊戲，抓取題目
  const handleStartGame = async (id: string) => {
    setPlayerId(id);
    setIsLoading(true);
    setApiError('');

    if (CONFIG.isMockMode) {
      // 離線 Mock 模式
      console.log('🔌 Running in MOCK mode. Fetching mock questions...');
      setTimeout(() => {
        const mockQs = getRandomMockQuestions(CONFIG.questionCount);
        setQuestions(mockQs);
        setGameState('PLAYING');
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      // 從 GAS 獲取題目 (隨機 N 題)
      const fetchUrl = `${CONFIG.googleAppScriptUrl}?action=getQuestions&count=${CONFIG.questionCount}`;
      console.log('🛰️ Fetching questions from GAS:', fetchUrl);
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        // GAS 回傳的格式為 { success: true, questions: [...] }
        setQuestions(data.questions);
        setGameState('PLAYING');
      } else {
        throw new Error(data.message || 'Failed to fetch valid questions from script.');
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch from Google Sheets:', err);
      setApiError('SHEET ERROR! RUNNING OFFLINE BACKUP MODE.');
      
      // 串接失敗時，自動降級 (Graceful Degradation) 使用 Mock 題目，保證體驗不中斷！
      setTimeout(() => {
        const mockQs = getRandomMockQuestions(CONFIG.questionCount);
        setQuestions(mockQs);
        setGameState('PLAYING');
        setIsLoading(false);
        setApiError('');
      }, 1500);
    } finally {
      // 如果沒有降級，則在這裡關閉 loading。如果有降級，則在降級 setTimeout 中關閉
      if (!CONFIG.isMockMode && !apiError) {
        setIsLoading(false);
      }
    }
  };

  // 提交作答，傳送給 GAS 計算並取得結果
  const handleSubmitAnswers = async (answers: { id: string; answer: string }[]) => {
    setIsLoading(true);
    setGameState('SUBMITTING');

    if (CONFIG.isMockMode) {
      // 離線 Mock 結算
      console.log('🔌 Running in MOCK mode. Scoring answers locally...');
      setTimeout(() => {
        // 隨機計算分數以利測試
        const correctCount = Math.floor(Math.random() * (CONFIG.questionCount + 1));
        const passed = correctCount >= CONFIG.passThreshold;
        
        const mockResult: GameResultData = {
          playerId,
          score: correctCount,
          totalQuestions: CONFIG.questionCount,
          passed,
          attempts: 3, // 假裝這是第 3 次
          maxScore: Math.max(correctCount, passed ? CONFIG.questionCount : correctCount),
          firstPassScore: passed ? Math.max(CONFIG.passThreshold, correctCount) : null,
          attemptsToPass: passed ? 2 : null,
        };

        setResultData(mockResult);
        setGameState('RESULT');
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      const payload = {
        action: 'submitAnswers',
        id: playerId,
        answers: answers,
        passThreshold: CONFIG.passThreshold
      };

      console.log('🛰️ Submitting answers to GAS:', payload);

      // 使用 text/plain 避免 CORS preflight (OPTIONS) 問題，這是 GAS 連接的核心黑魔法！
      const response = await fetch(CONFIG.googleAppScriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow' // GAS 會產生 302 重新導向，必須跟隨
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🛰️ GAS Score Result:', data);

      if (data.success) {
        setResultData({
          playerId,
          score: data.score,
          totalQuestions: data.totalQuestions,
          passed: data.passed,
          attempts: data.attempts,
          maxScore: data.maxScore,
          firstPassScore: data.firstPassScore,
          attemptsToPass: data.attemptsToPass
        });
        setGameState('RESULT');
      } else {
        throw new Error(data.message || 'Evaluation failed on GAS.');
      }
    } catch (err: any) {
      console.error('❌ Failed to submit answers to GAS:', err);
      // 降級處理：本機隨機判定，確保玩家能看到結果
      const correctCount = Math.floor(Math.random() * (CONFIG.questionCount + 1));
      const passed = correctCount >= CONFIG.passThreshold;
      
      setResultData({
        playerId,
        score: correctCount,
        totalQuestions: CONFIG.questionCount,
        passed,
        attempts: 1,
        maxScore: correctCount,
        firstPassScore: passed ? correctCount : null,
        attemptsToPass: passed ? 1 : null
      });
      setGameState('RESULT');
    } finally {
      setIsLoading(false);
    }
  };

  // 再玩一次 (保留 Player ID)
  const handleRetry = () => {
    handleStartGame(playerId);
  };

  // 切換玩家 (返回 Lobby)
  const handleNewPlayer = () => {
    setPlayerId('');
    setQuestions([]);
    setResultData(null);
    setGameState('LOBBY');
  };

  return (
    <ArcadeCabinet title="PIXEL ARCADE" onMuteToggle={handleMuteToggle} isMuted={isMuted}>
      {gameState === 'LOBBY' && (
        <Lobby onStartGame={handleStartGame} isLoading={isLoading} />
      )}

      {gameState === 'PLAYING' && (
        <Quiz 
          questions={questions} 
          onSubmitAnswers={handleSubmitAnswers} 
          isLoading={isLoading}
          playerId={playerId}
        />
      )}

      {gameState === 'SUBMITTING' && (
        <div className="flex-1 flex flex-col justify-center items-center select-none text-center">
          <div className="w-16 h-16 border-8 border-t-cyan-400 border-r-pink-500 border-b-yellow-400 border-l-purple-600 rounded-full animate-spin mb-4" />
          <p className="neon-text-cyan text-base animate-pulse">SCORING ANSWERS...</p>
          <p className="text-gray-400 text-xs font-mono mt-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            TRANSMITTING TO THE CLOUD DATABASE
          </p>
        </div>
      )}

      {gameState === 'RESULT' && resultData && (
        <Result 
          result={resultData} 
          onRetry={handleRetry} 
          onNewPlayer={handleNewPlayer}
        />
      )}
    </ArcadeCabinet>
  );
}

export default App;
