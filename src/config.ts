export interface GameConfig {
  googleAppScriptUrl: string;
  passThreshold: number;
  questionCount: number;
  isMockMode: boolean;
}

const getEnvString = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const val = import.meta.env[key];
  if (val === undefined || val === '') return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const rawUrl = getEnvString('VITE_GOOGLE_APP_SCRIPT_URL', '');

export const CONFIG: GameConfig = {
  googleAppScriptUrl: rawUrl,
  passThreshold: getEnvNumber('VITE_PASS_THRESHOLD', 3),
  questionCount: getEnvNumber('VITE_QUESTION_COUNT', 5),
  isMockMode: rawUrl.trim() === '',
};

console.log('🕹️ Arcade Configuration Loaded:', {
  ...CONFIG,
  googleAppScriptUrl: CONFIG.googleAppScriptUrl ? '✨ DEPLOYED' : '⚠️ NONE (RUNNING IN MOCK MODE)',
});
