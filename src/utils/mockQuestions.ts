import type { Question } from '../components/Quiz';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'Q-101',
    question: '在 React 中，想要在元件渲染後執行副作用（如打 API ），應該使用哪一個 Hook？',
    A: 'useState',
    B: 'useEffect',
    C: 'useContext',
    D: 'useRef'
  },
  {
    id: 'Q-102',
    question: '在 CSS 中，想要讓區塊元素在父容器中完美垂直置中，以下哪種組合是正確的？',
    A: 'display: flex; align-items: center;',
    B: 'display: flex; justify-content: center;',
    C: 'display: inline; text-align: center;',
    D: 'position: absolute; top: 0;'
  },
  {
    id: 'Q-103',
    question: '在 JavaScript 中，以下何者是宣告常數（不可重新賦值）的關鍵字？',
    A: 'var',
    B: 'let',
    C: 'const',
    D: 'define'
  },
  {
    id: 'Q-104',
    question: 'Vite 開發工具之所以比傳統 Webpack 快，最核心的技術原因是？',
    A: '它使用 Rust 寫的編譯器',
    B: '它基於瀏覽器原生 ES Modules (ESM) 進行開發伺服器啟動',
    C: '它不支援熱更新 (HMR)',
    D: '它會將所有程式碼打包成單一巨大檔案'
  },
  {
    id: 'Q-105',
    question: '在網頁像素風設計中，若要防止像素圖案在縮放時變得模糊，應使用 CSS 的何種設定？',
    A: 'filter: blur(0px);',
    B: 'image-rendering: pixelated;',
    C: 'object-fit: cover;',
    D: 'transform: scale(1);'
  },
  {
    id: 'Q-106',
    question: 'HTML5 提供的語意化標籤中，何者最適合用來封裝獨立且完整的文章或內容區塊？',
    A: '<div>',
    B: '<section>',
    C: '<article>',
    D: '<aside>'
  },
  {
    id: 'Q-107',
    question: '在 Git 中，若要將本機的分支推送到遠端伺服器，應使用何種指令？',
    A: 'git pull',
    B: 'git fetch',
    C: 'git push',
    D: 'git commit'
  }
];

// 隨機獲取 N 題
export const getRandomMockQuestions = (count: number): Question[] => {
  const shuffled = [...MOCK_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
