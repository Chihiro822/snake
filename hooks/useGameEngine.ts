import { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction, GameState, Difficulty, HandGestureState } from '../types';
import { GRID_SIZE, PAUSE_TIMEOUT_MS } from '../constants';

const getRandomPoint = (snake: Point[]): Point => {
  let newPoint: Point;
  while (true) {
    newPoint = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on snake
    const onSnake = snake.some(s => s.x === newPoint.x && s.y === newPoint.y);
    if (!onSnake) break;
  }
  return newPoint;
};

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIRECTION = Direction.RIGHT;

export const useGameEngine = (
  difficulty: Difficulty, 
  sensitivity: number
) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Refs for state accessed inside interval
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const gameStateRef = useRef(gameState);
  const lastPinchTimeRef = useRef<number>(Date.now());
  
  // Gesture Control Refs
  const anchorPointRef = useRef<Point | null>(null);

  // Sync refs
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomPoint(INITIAL_SNAKE));
    setScore(0);
    setGameState(GameState.PLAYING);
    lastPinchTimeRef.current = Date.now();
  }, []);

  const gameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
  }, [score, highScore]);

  // Game Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const moveSnake = () => {
      const currentHead = snakeRef.current[0];
      const currentDir = directionRef.current;
      
      const newHead = { ...currentHead };

      switch (currentDir) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Collision Detection: Walls
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return;
      }

      // Collision Detection: Self
      if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];
      
      // Check Food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(getRandomPoint(newSnake));
        // Don't pop tail, so it grows
      } else {
        newSnake.pop(); // Remove tail
      }

      setSnake(newSnake);
    };

    const intervalId = setInterval(moveSnake, difficulty);
    return () => clearInterval(intervalId);
  }, [gameState, difficulty, food, gameOver]); // food dependency to re-check generation logic if needed, but mainly purely logic

  // Auto Pause Logic
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    
    const checkPause = setInterval(() => {
      const timeSincePinch = Date.now() - lastPinchTimeRef.current;
      if (timeSincePinch > PAUSE_TIMEOUT_MS) {
        setGameState(GameState.PAUSED);
      }
    }, 1000);

    return () => clearInterval(checkPause);
  }, [gameState]);


  // Handle Gesture Updates
  const processGesture = useCallback((gesture: HandGestureState) => {
    // 1. Handle Game Start / Resume
    if (gesture.isPinching) {
       lastPinchTimeRef.current = Date.now();
       
       if (gameStateRef.current === GameState.PAUSED) {
         setGameState(GameState.PLAYING);
       } else if (gameStateRef.current === GameState.IDLE) {
         // Require a solid pinch hold (maybe not instant) - for now instant start for snappy feel
         // Use button for start to avoid accidental start
       }
    }

    // 2. Handle Direction Control (Virtual Joystick)
    if (gameStateRef.current === GameState.PLAYING && gesture.handPosition) {
      if (gesture.isPinching) {
        if (!anchorPointRef.current) {
          // Just started pinching, set anchor
          anchorPointRef.current = gesture.handPosition;
        } else {
          // Calculate delta
          const dx = gesture.handPosition.x - anchorPointRef.current.x;
          const dy = gesture.handPosition.y - anchorPointRef.current.y;
          
          // Sensitivity threshold (Deadzone)
          if (Math.abs(dx) > sensitivity || Math.abs(dy) > sensitivity) {
            // Determine dominant axis
            if (Math.abs(dx) > Math.abs(dy)) {
              // Horizontal
              const newDir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
              // Prevent 180 turns
              if (
                (newDir === Direction.LEFT && directionRef.current !== Direction.RIGHT) ||
                (newDir === Direction.RIGHT && directionRef.current !== Direction.LEFT)
              ) {
                setDirection(newDir);
              }
            } else {
              // Vertical
              // Note: Y is usually inverted in screen coords (0 is top), but MediaPipe is also 0 top.
              // So dy > 0 means moving DOWN (increasing Y).
              const newDir = dy > 0 ? Direction.DOWN : Direction.UP;
              if (
                (newDir === Direction.UP && directionRef.current !== Direction.DOWN) ||
                (newDir === Direction.DOWN && directionRef.current !== Direction.UP)
              ) {
                setDirection(newDir);
              }
            }
          }
        }
      } else {
        // Not pinching, reset anchor
        anchorPointRef.current = null;
      }
    }

    // 3. Double Pinch Reset (Simple heuristic: not implementing strictly double click logic here for simplicity, relying on UI button primarily)
    
  }, [sensitivity]);

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    setGameState,
    resetGame,
    processGesture,
    anchorPoint: anchorPointRef.current, // For visualization
  };
};
