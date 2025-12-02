import { Difficulty, Sensitivity } from './types';

export const GRID_SIZE = 25; // 25x25 grid
export const CANVAS_SIZE = 600; // Pixel size of game board

export const DEFAULT_CONFIG = {
  difficulty: Difficulty.MEDIUM,
  sensitivity: Sensitivity.MEDIUM,
  showDebug: true,
};

// MediaPipe Hands configuration
export const MP_VISION_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

// Gesture Constants
export const PINCH_THRESHOLD = 0.05; // Distance between thumb and index tip (normalized)
export const PAUSE_TIMEOUT_MS = 3000; // Auto-pause after 3 seconds of no pinch
