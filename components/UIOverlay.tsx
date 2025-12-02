import React from 'react';
import { GameState, Difficulty, Sensitivity } from '../types';
import { Trophy, Clock, Play, RotateCcw, Settings, Hand } from 'lucide-react';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  difficulty: Difficulty;
  sensitivity: Sensitivity;
  onStart: () => void;
  onReset: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onSetSensitivity: (s: Sensitivity) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  highScore,
  difficulty,
  sensitivity,
  onStart,
  onReset,
  onSetDifficulty,
  onSetSensitivity
}) => {
  return (
    <div className="flex flex-col h-full w-full max-w-sm p-4 space-y-4">
      
      {/* Score Card */}
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-2">
           <div className="flex items-center text-yellow-400">
              <Trophy className="w-5 h-5 mr-2" />
              <span className="font-bold text-sm uppercase tracking-wider">High Score</span>
           </div>
           <span className="text-2xl font-mono font-bold">{highScore}</span>
        </div>
        <div className="flex justify-between items-center">
           <div className="text-gray-400 font-bold text-sm">CURRENT</div>
           <span className="text-4xl font-mono font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Game Controls / Status */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {gameState === GameState.IDLE && (
          <div className="bg-blue-600/20 border border-blue-500/50 p-6 rounded-xl text-center backdrop-blur-sm">
             <Hand className="w-12 h-12 mx-auto text-blue-400 mb-4 animate-pulse" />
             <h2 className="text-xl font-bold mb-2">Ready to Play?</h2>
             <p className="text-sm text-gray-300 mb-6">
               Pinch your thumb and index finger to start controlling the snake. Move your hand to steer.
             </p>
             <button 
               onClick={onStart}
               className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors flex items-center justify-center"
             >
               <Play className="w-5 h-5 mr-2" fill="currentColor"/> START GAME
             </button>
          </div>
        )}

        {gameState === GameState.PAUSED && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 p-6 rounded-xl text-center backdrop-blur-sm">
             <Clock className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
             <h2 className="text-xl font-bold mb-2">Game Paused</h2>
             <p className="text-sm text-gray-300 mb-6">
               Pinch again to resume immediately.
             </p>
             <button 
               onClick={onStart}
               className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-white transition-colors"
             >
               RESUME
             </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="bg-red-600/20 border border-red-500/50 p-6 rounded-xl text-center backdrop-blur-sm">
             <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h2>
             <p className="text-lg text-white mb-6">Final Score: {score}</p>
             <button 
               onClick={onReset}
               className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-colors flex items-center justify-center"
             >
               <RotateCcw className="w-5 h-5 mr-2" /> TRY AGAIN
             </button>
          </div>
        )}
        
        {/* Settings */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 space-y-4">
           <div className="flex items-center text-gray-400 mb-2">
              <Settings className="w-4 h-4 mr-2" />
              <span className="text-xs font-bold uppercase">Settings</span>
           </div>
           
           <div>
             <label className="text-xs text-gray-500 mb-1 block">DIFFICULTY (SPEED)</label>
             <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Easy', v: Difficulty.EASY },
                  { l: 'Med', v: Difficulty.MEDIUM },
                  { l: 'Hard', v: Difficulty.HARD }
                ].map((opt) => (
                  <button
                    key={opt.l}
                    onClick={() => onSetDifficulty(opt.v)}
                    className={`text-xs py-1 rounded border ${difficulty === opt.v ? 'bg-green-600 border-green-500 text-white' : 'border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {opt.l}
                  </button>
                ))}
             </div>
           </div>

           <div>
             <label className="text-xs text-gray-500 mb-1 block">SENSITIVITY</label>
             <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Low', v: Sensitivity.LOW },
                  { l: 'Med', v: Sensitivity.MEDIUM },
                  { l: 'High', v: Sensitivity.HIGH }
                ].map((opt) => (
                  <button
                    key={opt.l}
                    onClick={() => onSetSensitivity(opt.v)}
                    className={`text-xs py-1 rounded border ${sensitivity === opt.v ? 'bg-purple-600 border-purple-500 text-white' : 'border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {opt.l}
                  </button>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
