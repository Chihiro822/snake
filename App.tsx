import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { WebcamInput } from './components/WebcamInput';
import { UIOverlay } from './components/UIOverlay';
import { useGameEngine } from './hooks/useGameEngine';
import { DEFAULT_CONFIG } from './constants';
import { HandGestureState, GameState, Point } from './types';
import { Maximize2, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  
  const {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    setGameState,
    resetGame,
    processGesture,
    anchorPoint // To visualize control stick
  } = useGameEngine(config.difficulty, config.sensitivity);

  const [handState, setHandState] = useState<HandGestureState | null>(null);

  const handleGestureUpdate = (state: HandGestureState) => {
    setHandState(state);
    processGesture(state);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-6 items-start justify-center">
        
        {/* Left Column: Game Board */}
        <div className="flex-1 flex flex-col items-center">
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Gesture Snake
            </h1>
            <p className="text-gray-400 text-sm">Pinch & Move to Play</p>
          </div>
          
          <div className="relative group">
            <GameCanvas
              snake={snake}
              food={food}
              direction={direction}
              gameOver={gameState === GameState.GAME_OVER}
            />
            
            {/* Control Feedback Overlay (Virtual Joystick Visualization) */}
            {gameState === GameState.PLAYING && anchorPoint && handState?.handPosition && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                 <svg className="w-full h-full opacity-50">
                    <line 
                      x1={`${anchorPoint.x * 100}%`} 
                      y1={`${anchorPoint.y * 100}%`}
                      x2={`${handState.handPosition.x * 100}%`}
                      y2={`${handState.handPosition.y * 100}%`}
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                    <circle 
                      cx={`${anchorPoint.x * 100}%`} 
                      cy={`${anchorPoint.y * 100}%`} 
                      r="5" 
                      fill="rgba(255,255,255,0.8)" 
                    />
                    <circle 
                      cx={`${handState.handPosition.x * 100}%`} 
                      cy={`${handState.handPosition.y * 100}%`} 
                      r="10" 
                      fill="rgba(74, 222, 128, 0.8)" 
                    />
                 </svg>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Webcam */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          
          {/* Webcam Preview */}
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-700 relative">
             <WebcamInput 
               onGestureUpdate={handleGestureUpdate}
               showDebugOverlay={config.showDebug}
             />
             
             {/* Status Badge */}
             <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold border ${
                handState?.isPinching 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'bg-red-500/20 border-red-500 text-red-400'
             }`}>
                {handState?.isPinching ? 'PINCH ACTIVE' : 'NO PINCH'}
             </div>
          </div>

          {/* Settings & Stats */}
          <UIOverlay
            gameState={gameState}
            score={score}
            highScore={highScore}
            difficulty={config.difficulty}
            sensitivity={config.sensitivity}
            onStart={() => {
                if (gameState === GameState.GAME_OVER) resetGame();
                else setGameState(GameState.PLAYING);
            }}
            onReset={resetGame}
            onSetDifficulty={(d) => setConfig(prev => ({...prev, difficulty: d}))}
            onSetSensitivity={(s) => setConfig(prev => ({...prev, sensitivity: s}))}
          />
        </div>

      </div>
    </div>
  );
};

export default App;
