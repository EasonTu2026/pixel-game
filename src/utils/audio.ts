// 8-bit Retro Arcade Sound Synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;
let isMuted = false;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuted = () => isMuted;

const playTone = (
  frequency: number,
  type: OscillatorType,
  duration: number,
  startTimeOffset = 0,
  volume = 0.1
) => {
  if (isMuted) return;
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTimeOffset);

  // 8-bit 音效的特色是沒有平滑的 Attack/Decay，通常是立馬響起並迅速消失的階梯感
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime + startTimeOffset);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + startTimeOffset + duration
  );

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + startTimeOffset);
  osc.stop(audioCtx.currentTime + startTimeOffset + duration);
};

// 🎮 經典 8-bit 街機音效定義

export const playCoin = () => {
  // 清脆的兩段高頻上行音 (叮叮~)
  playTone(987.77, 'square', 0.08, 0, 0.08); // B5
  playTone(1318.51, 'square', 0.25, 0.08, 0.08); // E6
};

export const playClick = () => {
  // 短促的點擊音
  playTone(150, 'triangle', 0.05, 0, 0.15);
};

export const playSelect = () => {
  // 較高的點擊選取音
  playTone(600, 'square', 0.08, 0, 0.05);
};

export const playCorrect = () => {
  // 歡樂的上行三和弦 (C5 -> E5 -> G5 -> C6)
  const now = 0;
  const vol = 0.08;
  playTone(523.25, 'square', 0.1, now, vol);       // C5
  playTone(659.25, 'square', 0.1, now + 0.08, vol);  // E5
  playTone(783.99, 'square', 0.1, now + 0.16, vol);  // G5
  playTone(1046.50, 'square', 0.3, now + 0.24, vol); // C6
};

export const playWrong = () => {
  // 沉重且帶有鋸齒波的降音 (嗡——)
  const vol = 0.12;
  playTone(220.00, 'sawtooth', 0.15, 0, vol);    // A3
  playTone(146.83, 'sawtooth', 0.35, 0.12, vol);  // D3
};

export const playVictory = () => {
  // 勝利凱旋小樂句 (精緻 8-bit 旋律)
  const vol = 0.08;
  const tempo = 0.12; // 每個音符的長度

  const notes = [
    { f: 523.25, d: 1 },  // C5
    { f: 659.25, d: 1 },  // E5
    { f: 783.99, d: 1 },  // G5
    { f: 1046.50, d: 2 }, // C6 (長音)
    { f: 783.99, d: 1 },  // G5
    { f: 1046.50, d: 3 }  // C6 (超長音)
  ];

  let currentOffset = 0;
  notes.forEach((note) => {
    playTone(note.f, 'square', note.d * tempo, currentOffset, vol);
    currentOffset += note.d * tempo * 0.9;
  });
};

export const playGameOver = () => {
  // 悲傷的下行小三和弦 (8-bit Game Over 經典慘叫)
  const vol = 0.1;
  const tempo = 0.15;

  const notes = [
    { f: 392.00, d: 1.5, type: 'sawtooth' as OscillatorType }, // G4
    { f: 349.23, d: 1.5, type: 'sawtooth' as OscillatorType }, // F4
    { f: 311.13, d: 1.5, type: 'sawtooth' as OscillatorType }, // Eb4
    { f: 246.94, d: 3.5, type: 'square' as OscillatorType }    // B3 (沉重悲哀長音)
  ];

  let currentOffset = 0;
  notes.forEach((note) => {
    playTone(note.f, note.type, note.d * tempo, currentOffset, vol);
    currentOffset += note.d * tempo * 0.95;
  });
};
