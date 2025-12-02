import React, { useEffect, useRef } from 'react';
import { Point, Direction } from '../types';
import { GRID_SIZE } from '../constants';

interface GameCanvasProps {
  snake: Point[];
  food: Point;
  direction: Direction;
  gameOver: boolean;
}

const CELL_SIZE = 24; // Visual size of a cell in pixels
const GAP = 2; // Gap between cells

export const GameCanvas: React.FC<GameCanvasProps> = ({ snake, food, direction, gameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Background (Optional, for aesthetics)
    ctx.fillStyle = '#1f2937'; // gray-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    drawCell(ctx, food, '#ef4444', true); // red-500

    // Draw Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      // Head is lighter green, body is standard green
      const color = isHead ? '#4ade80' : '#22c55e'; 
      drawCell(ctx, segment, color, isHead);
      
      // Draw eyes on head based on direction
      if (isHead) {
        drawEyes(ctx, segment, direction);
      }
    });

  }, [snake, food, direction, gameOver]);

  const drawCell = (ctx: CanvasRenderingContext2D, point: Point, color: string, isRound: boolean) => {
    const x = point.x * (CELL_SIZE + GAP) + GAP;
    const y = point.y * (CELL_SIZE + GAP) + GAP;
    
    ctx.fillStyle = color;
    if (isRound) {
        ctx.beginPath();
        ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 8);
        ctx.fill();
    } else {
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  };

  const drawEyes = (ctx: CanvasRenderingContext2D, head: Point, dir: Direction) => {
    const x = head.x * (CELL_SIZE + GAP) + GAP;
    const y = head.y * (CELL_SIZE + GAP) + GAP;
    
    ctx.fillStyle = 'black';
    const eyeSize = 4;
    const offset = 6;

    let lx = 0, ly = 0, rx = 0, ry = 0;

    switch (dir) {
      case Direction.UP:
        lx = x + offset; ly = y + offset;
        rx = x + CELL_SIZE - offset - eyeSize; ry = y + offset;
        break;
      case Direction.DOWN:
        lx = x + offset; ly = y + CELL_SIZE - offset - eyeSize;
        rx = x + CELL_SIZE - offset - eyeSize; ry = y + CELL_SIZE - offset - eyeSize;
        break;
      case Direction.LEFT:
        lx = x + offset; ly = y + offset;
        rx = x + offset; ry = y + CELL_SIZE - offset - eyeSize;
        break;
      case Direction.RIGHT:
        lx = x + CELL_SIZE - offset - eyeSize; ly = y + offset;
        rx = x + CELL_SIZE - offset - eyeSize; ry = y + CELL_SIZE - offset - eyeSize;
        break;
    }

    ctx.fillRect(lx, ly, eyeSize, eyeSize);
    ctx.fillRect(rx, ry, eyeSize, eyeSize);
  };

  // Calculate total canvas size
  const totalSize = GRID_SIZE * (CELL_SIZE + GAP) + GAP;

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700">
      <canvas
        ref={canvasRef}
        width={totalSize}
        height={totalSize}
        className="block bg-gray-900"
      />
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
           <p className="text-gray-300 mb-4">Pinch twice quickly to restart</p>
        </div>
      )}
    </div>
  );
};
