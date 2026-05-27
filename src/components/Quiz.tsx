import React, { useState, useEffect } from 'react';
import { playSelect } from '../utils/audio';
export interface Question {
  id: string; // 題號
  question: string; // 題目
  A: string;
  B: string;
  C: string;
  D: string;
}

interface QuizProps {
  questions: Question[];
  onSubmitAnswers: (answers: { id: string; answer: string }[]) => void;
  isLoading: boolean;
  playerId: string;
}

// 👾 趣味街機關主名字庫，根據 Seed 取得
const BOSS_NAMES = [
  'GLITCH GOBLIN', 'BYTE WYRM', 'SYNTAX SLAYER', 'COMPILER CHIMERA',
  'DATABASE DRAGON', 'ALGORITHM ORC', 'NULL POINTER', 'STACK OVERFLOW',
  'REGEXP REAPER', 'BINARY BEAST', 'KERNEL KRAKEN', 'PIXEL PHANTOM',
  'COOKIE MONSTER', 'CACHE COMMANDER', 'BUFFER BULLY', 'TOKEN TROLL',
  'SCRIPT SPECTRE', 'DOCKER DEMON', 'GIT GREMLIN', 'MARKUP MINOTAUR'
];

const getBossName = (seed: number): string => {
  const name = BOSS_NAMES[seed % BOSS_NAMES.length];
  return `BOSS #${seed} - ${name}`;
};

export const Quiz: React.FC<QuizProps> = ({
  questions,
  onSubmitAnswers,
  isLoading,
  playerId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ id: string; answer: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // 為每道題隨機分配一個 1~100 的關主 Seed，保證每次答題的關主不同
  const [bossSeeds, setBossSeeds] = useState<number[]>([]);

  useEffect(() => {
    if (questions.length > 0) {
      const seeds = questions.map(() => Math.floor(Math.random() * 100) + 1);
      setBossSeeds(seeds);
    }
  }, [questions]);

  if (questions.length === 0 || bossSeeds.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center">
        <p className="text-yellow-400 font-arcade text-lg animate-pulse">LOADING STAGE...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentBossSeed = bossSeeds[currentIndex] || 1;
  const currentBossName = getBossName(currentBossSeed);
  const currentBossImgUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=boss${currentBossSeed}`;

  // 計算血條百分比 (格鬥遊戲對決概念)
  // 關主血量：隨著題目答完而遞減 (打倒關主！)
  const bossHpPercent = Math.max(0, 100 - (currentIndex / questions.length) * 100);
  // 玩家血量：答錯扣血，或是以答對率表示 (這裡以當前關卡/總關卡為進度)
  const playerProgressPercent = ((currentIndex) / questions.length) * 100;

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null || isLoading) return;
    setSelectedOption(option);
    playSelect();

    // 街機問答通常有「確認音效與作答停頓效果」
    setTimeout(() => {
      // 隨機播放對錯音效 (雖然正確答案在 GAS 後端計算，但本機為了互動感，在前端點擊時先給個清脆的短確認音效，
      // 並直接跳下一關；為避免混淆，點擊按鈕一律播 Select 聲，在答題結束 GAS 結算時才播 Correct/Wrong 的大音效，
      // 或者是前端根據本機 Mock 直接給聲音，不過因為前端沒有答案，我們就播經典的按鈕下壓聲)
      
      const newAnswers = [...selectedAnswers, { id: currentQuestion.id, answer: option }];
      setSelectedAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        // 最後一題答完，送出！
        onSubmitAnswers(newAnswers);
      }
    }, 250);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-4 px-2 select-none">
      
      {/* 頂部雙方 HP 血條 (格鬥遊戲對決介面) */}
      <div className="w-full grid grid-cols-5 gap-2 items-center mb-4">
        {/* 玩家進度條 */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-green-400 font-arcade tracking-tighter truncate max-w-[90px]">
              {playerId}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              STAGE {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <div className="pixel-healthbar-container">
            <div 
              className="pixel-healthbar-fill"
              style={{ width: `${playerProgressPercent}%` }}
            />
          </div>
        </div>

        {/* VS 霓虹標誌 */}
        <div className="col-span-1 text-center">
          <span 
            className="neon-text-pink text-sm italic font-black animate-pulse"
            style={{ fontSize: '14px', textShadow: '0 0 5px var(--color-neon-pink)' }}
          >
            VS
          </span>
        </div>

        {/* 關主 HP 條 */}
        <div className="col-span-2 text-right">
          <div className="flex justify-between items-center mb-1 flex-row-reverse">
            <span className="text-[10px] text-red-400 font-arcade tracking-tighter truncate max-w-[90px]">
              BOSS HP
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {Math.round(bossHpPercent)}%
            </span>
          </div>
          <div className="pixel-healthbar-container flex-row-reverse">
            <div 
              className="pixel-healthbar-fill danger"
              style={{ width: `${bossHpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 關主頭像與名字 */}
      <div className="my-2 flex flex-col items-center gap-2 boss-entrance">
        <div className="w-24 h-24 bg-[#14062e] border-4 border-[#ff007f] rounded-lg p-1 overflow-hidden relative shadow-[0_0_15px_rgba(255,0,127,0.4)]">
          <img 
            src={currentBossImgUrl} 
            alt={currentBossName}
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <p className="neon-text-cyan text-xs tracking-wide" style={{ fontSize: '11px' }}>
          {currentBossName}
        </p>
      </div>

      {/* 題目框線區 */}
      <div className="w-full bg-black/60 border-2 border-dashed border-cyan-400/60 p-4 mb-4 rounded relative min-h-[100px] flex items-center justify-center">
        <div className="absolute top-1 left-2 text-[9px] text-cyan-400 font-arcade uppercase tracking-widest opacity-70">
          QUESTION #{currentQuestion.id}
        </div>
        <p 
          className="text-[#e2d5f8] text-center text-lg md:text-xl font-medium tracking-wide mt-2"
          style={{ fontFamily: "var(--font-pixel)", lineHeight: '1.4' }}
        >
          {currentQuestion.question}
        </p>
      </div>

      {/* A, B, C, D 選擇按鈕 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
        {(['A', 'B', 'C', 'D'] as const).map((key) => {
          const optionText = currentQuestion[key];
          const isSelected = selectedOption === key;

          return (
            <button
              key={key}
              onClick={() => handleOptionSelect(key)}
              disabled={selectedOption !== null || isLoading}
              className={`pixel-btn text-left py-3 px-4 flex items-center gap-3 transition-all ${
                isSelected ? 'cyan active' : 'pink'
              }`}
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: '18px',
                justifyContent: 'flex-start',
                top: isSelected ? '4px' : '0px',
                boxShadow: isSelected ? '0 2px 0 #008b8b' : undefined
              }}
            >
              {/* 選項編號圓點 */}
              <span 
                className="font-arcade text-xs border border-current px-1.5 py-0.5 rounded mr-1"
                style={{ fontSize: '10px' }}
              >
                {key}
              </span>
              <span className="truncate">{optionText}</span>
            </button>
          );
        })}
      </div>



    </div>
  );
};
