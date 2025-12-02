export type Point = {
  x: number;
  y: number;
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum Difficulty {
  EASY = 200,   // ms per tick
  MEDIUM = 130,
  HARD = 80,
}

export enum Sensitivity {
  LOW = 0.08,
  MEDIUM = 0.05,
  HIGH = 0.03,
}

export interface HandGestureState {
  isPinching: boolean;
  handPosition: Point | null; // Normalized 0-1
  pinchDistance: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  sensitivity: Sensitivity;
  showDebug: boolean;
}