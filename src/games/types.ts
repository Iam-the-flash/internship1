export interface GameEngine {
  init(canvas: HTMLCanvasElement): void;
  start(): void;
  stop(): void;
  restart(): void;
  pause(): void;
  resume(): void;
  getScore(): number;
  getLevel(): number;
  isPaused(): boolean;
  onStateChange?: (score: number, level: number) => void;
  onGameOver?: (finalScore: number) => void;
  destroy(): void;
}
