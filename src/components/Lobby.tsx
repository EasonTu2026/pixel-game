import React, { useState } from 'react';
import { playCoin, playSelect, playClick } from '../utils/audio';

interface LobbyProps {
  onStartGame: (playerId: string) => void;
  isLoading: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, isLoading }) => {
  const [playerId, setPlayerId] = useState('');
  const [coinInserted, setCoinInserted] = useState(false);
  const [error, setError] = useState('');

  const handleInsertCoin = () => {
    if (coinInserted) return;
    playCoin();
    setCoinInserted(true);
    setError('');
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinInserted) {
      setError('PLEASE INSERT COIN FIRST!');
      playClick();
      return;
    }

    const trimmed = playerId.trim().toUpperCase();
    if (!trimmed) {
      setError('ENTER PLAYER ID!');
      playClick();
      return;
    }

    playSelect();
    onStartGame(trimmed);
  };

  return (
    <div className="w-full flex flex-col justify-between items-center py-6 px-4 flex-1 text-center select-none">
      
      {/* 霓虹歡迎文字 */}
      <div className="my-2">
        <p className="neon-text-cyan text-base tracking-widest mb-1" style={{ fontSize: '14px' }}>
          CHALLENGE MODE
        </p>
        <h2 className="text-4xl font-extrabold text-yellow-400 tracking-wider mb-2" style={{ textShadow: '2px 2px 0px #9a6d00' }}>
          TRIVIA WARRIOR
        </h2>
      </div>

      {/* 投幣機動態裝飾 */}
      <div className="my-4 flex flex-col items-center">
        {!coinInserted ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleInsertCoin}
              className="pixel-btn pink text-lg py-3 px-6 animate-bounce"
            >
              🪙 INSERT COIN
            </button>
            <p className="neon-blink text-cyan-400 text-[14px] mt-1 font-arcade uppercase">
              COIN REQUIRED TO PLAY
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-400 text-lg font-arcade tracking-widest animate-pulse mb-1">
              ✓ COIN ACCEPTED
            </p>
            <p className="text-gray-400 text-[11px] font-arcade">
              CREDITS: 01
            </p>
          </div>
        )}
      </div>

      {/* 輸入區塊表單 */}
      <form onSubmit={handleStart} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-xs font-arcade tracking-wider">
            PLAYER IDENTIFICATION (ID)
          </label>
          <input
            type="text"
            placeholder="ENTER ID..."
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              if (error) setError('');
            }}
            disabled={!coinInserted || isLoading}
            className="pixel-input w-full"
            maxLength={15}
          />
        </div>

        {/* 錯誤/警告提示 */}
        {error && (
          <p className="text-red-500 font-arcade text-xs tracking-tight animate-pulse bg-red-950/40 py-1 border border-dashed border-red-500 rounded">
            ⚠ {error}
          </p>
        )}

        {/* 遊戲啟動鈕 */}
        <button
          type="submit"
          disabled={isLoading}
          className={`pixel-btn w-full text-base py-3 transition-colors ${
            coinInserted ? 'green' : 'gray opacity-40 cursor-not-allowed'
          }`}
          style={{
            background: coinInserted ? '' : '#333',
            color: coinInserted ? '' : '#aaa',
            borderColor: coinInserted ? '' : '#555',
            boxShadow: coinInserted ? '' : 'none',
          }}
        >
          {isLoading ? 'LOADING SYSTEM...' : '🕹️ PRESS START'}
        </button>
      </form>

      {/* 街機底部說明 */}
      <div className="mt-6 flex flex-col gap-1 text-gray-500 text-[12px] font-mono" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <p>100 UNIQUE DYNAMIC BOSSES AWAIT YOUR CHALLENGE</p>
        <p className="text-[10px] text-purple-400">DATA WILL BE RECORDED TO GOOGLE SHEET</p>
      </div>

    </div>
  );
};
