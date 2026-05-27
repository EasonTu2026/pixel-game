import React from 'react';
import { playClick } from '../utils/audio';

interface ArcadeCabinetProps {
  children: React.ReactNode;
  title?: string;
  onMuteToggle?: () => void;
  isMuted?: boolean;
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  children,
  title = 'PIXEL QUIZ',
  onMuteToggle,
  isMuted = false,
}) => {
  const handleDecorBtnClick = () => {
    playClick();
  };

  return (
    <div className="w-full max-w-2xl px-4 py-8 mx-auto flex flex-col justify-center items-center">
      {/* 街機外殼 */}
      <div 
        className="w-full bg-[#1b0d36] rounded-2xl p-4 md:p-6 border-8 border-[#3b1b68] shadow-2xl relative"
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,0,127,0.15)',
        }}
      >
        {/* 頂部霓虹招牌 Header */}
        <div className="w-full bg-[#080214] border-4 border-dashed border-[#ff007f] p-4 mb-5 text-center relative overflow-hidden rounded">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,0,127,0.15)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="flex justify-between items-center px-2">
            {/* 左右側點綴燈 */}
            <span className="text-[#39ff14] text-xs font-mono animate-pulse">● SELECT</span>
            
            <h1 className="neon-text-pink text-2xl md:text-4xl tracking-widest font-arcade">
              {title}
            </h1>
            
            {/* 靜音切換按鈕，做成經典 8-bit 電子開關 */}
            <button 
              onClick={onMuteToggle}
              className="text-xs font-mono px-2 py-1 border-2 border-cyan-400 text-cyan-400 bg-black hover:bg-cyan-950 transition-colors uppercase"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '11px',
                borderColor: isMuted ? '#ff007f' : '#00ffff',
                color: isMuted ? '#ff007f' : '#00ffff',
              }}
            >
              SOUND: {isMuted ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>

        {/* CRT 螢幕主體 */}
        <div className="crt-screen w-full relative min-h-[420px] p-6 flex flex-col justify-center items-center screen-startup">
          <div className="w-full h-full flex flex-col justify-between items-center z-20">
            {children}
          </div>
        </div>

        {/* 底部搖桿與按鍵控制面板 */}
        <div className="arcade-controls mt-5">
          <div className="flex items-center gap-4">
            {/* 實體模擬搖桿 */}
            <div className="arcade-joystick" />
            <span className="text-[10px] text-gray-500 font-mono tracking-tighter" style={{ fontFamily: "'Press Start 2P'" }}>
              1P JOYSTICK
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-mono mr-1" style={{ fontFamily: "'Press Start 2P'" }}>
              ACTION
            </span>
            <div className="arcade-buttons">
              {/* 紅藍黃三個裝飾按鈕，點擊可播音效 */}
              <div 
                className="arcade-btn-circle pink" 
                onClick={handleDecorBtnClick}
                title="SFX A"
              />
              <div 
                className="arcade-btn-circle cyan" 
                onClick={handleDecorBtnClick}
                title="SFX B"
              />
              <div 
                className="arcade-btn-circle yellow" 
                onClick={handleDecorBtnClick}
                title="SFX C"
              />
            </div>
          </div>
        </div>

        {/* 底部投幣口與版權聲明 */}
        <div className="flex justify-between items-center mt-4 px-2 text-[11px] text-purple-400 font-mono" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          <span>© 2026 RETRO ARCADE INC.</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>SYSTEM ON: 2026-05-25</span>
          </div>
        </div>
      </div>
    </div>
  );
};
