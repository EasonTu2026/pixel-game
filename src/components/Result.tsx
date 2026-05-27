import React, { useEffect } from 'react';
import { playVictory, playGameOver, playCoin } from '../utils/audio';

export interface GameResultData {
  playerId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attempts: number;
  maxScore: number;
  firstPassScore?: number | null | string;
  attemptsToPass?: number | null | string;
}

interface ResultProps {
  result: GameResultData;
  onRetry: () => void;
  onNewPlayer: () => void;
}

export const Result: React.FC<ResultProps> = ({ result, onRetry, onNewPlayer }) => {
  const {
    playerId,
    score,
    totalQuestions,
    passed,
    attempts,
    maxScore,
    firstPassScore,
    attemptsToPass,
  } = result;

  useEffect(() => {
    // 進入結算畫面時，根據勝敗播放不同的街機經典凱旋音或悲哀哀鳴
    if (passed) {
      playVictory();
    } else {
      playGameOver();
    }
  }, [passed]);

  const handleRetryClick = () => {
    playCoin();
    onRetry();
  };

  const handleNewPlayerClick = () => {
    playCoin();
    onNewPlayer();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-4 px-2 select-none text-center">
      
      {/* 勝利或失敗的大字標題 */}
      <div className="my-2">
        {passed ? (
          <div className="flex flex-col items-center gap-1">
            <h2 className="neon-text-green text-3xl md:text-5xl tracking-widest animate-bounce">
              VICTORY!
            </h2>
            <p className="text-green-400 font-arcade text-xs tracking-widest mt-1">
              STAGE CLEAR - CONGRATULATIONS!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <h2 className="neon-text-pink text-3xl md:text-5xl tracking-widest">
              GAME OVER
            </h2>
            <p className="text-red-500 font-arcade text-xs tracking-widest mt-1 animate-pulse">
              TRY AGAIN TO BECOME A WARRIOR
            </p>
          </div>
        )}
      </div>

      {/* 分數面板 */}
      <div 
        className={`w-full max-w-sm bg-black/75 border-4 p-4 rounded my-3 ${
          passed ? 'border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'border-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.3)]'
        }`}
      >
        <p className="text-gray-400 font-arcade text-[10px] mb-2">
          FINAL SCORE REPORT
        </p>

        <div className="flex justify-between items-center border-b border-dashed border-gray-700 py-1.5 font-mono text-base">
          <span className="text-gray-400">PLAYER ID</span>
          <span className="text-yellow-400 font-arcade text-xs">{playerId}</span>
        </div>

        <div className="flex justify-between items-center border-b border-dashed border-gray-700 py-1.5 font-mono text-base">
          <span className="text-gray-400">STAGE CLEARED</span>
          <span className={`${passed ? 'text-green-400' : 'text-red-400'} font-arcade text-xs`}>
            {score} / {totalQuestions}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-dashed border-gray-700 py-1.5 font-mono text-base">
          <span className="text-gray-400">PASS STATUS</span>
          <span className={`${passed ? 'text-green-400' : 'text-red-400'} font-arcade text-xs`}>
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        </div>
      </div>

      {/* 歷史統計面板 (Google Sheet 資料對接展示) */}
      <div className="w-full max-w-sm bg-[#16062b] border-2 border-dashed border-cyan-400/40 p-4 rounded my-2">
        <p className="text-cyan-400 font-arcade text-[10px] mb-3">
          📊 ARCADE DATABASE STATS
        </p>

        <table className="arcade-table">
          <tbody>
            <tr>
              <td>ATTEMPTS (總遊玩次數)</td>
              <td className="text-right text-white font-bold">{attempts}</td>
            </tr>
            <tr>
              <td>PERSONAL BEST (最高得分)</td>
              <td className="text-right text-yellow-400 font-bold">{maxScore} 題</td>
            </tr>
            <tr>
              <td>1ST PASS SCORE (首通得分)</td>
              <td className="text-right text-green-400">
                {firstPassScore !== undefined && firstPassScore !== null && firstPassScore !== ''
                  ? `${firstPassScore} 題`
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td>ATTEMPTS TO PASS (通關花費次數)</td>
              <td className="text-right text-cyan-400">
                {attemptsToPass !== undefined && attemptsToPass !== null && attemptsToPass !== ''
                  ? `${attemptsToPass} 次`
                  : 'NOT PASSED YET'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 按鈕操作區 */}
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
        <button
          onClick={handleRetryClick}
          className="pixel-btn green text-base py-3"
        >
          🎮 RETRY CHALLENGE (再玩一次)
        </button>

        <button
          onClick={handleNewPlayerClick}
          className="pixel-btn cyan text-base py-2.5"
          style={{ fontSize: '12px' }}
        >
          👥 NEW PLAYER (切換玩家)
        </button>
      </div>

    </div>
  );
};
