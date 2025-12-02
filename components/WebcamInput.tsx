import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { HandGestureState, Point } from '../types';
import { MP_VISION_PATH, PINCH_THRESHOLD } from '../constants';
import { Loader2, Camera, AlertCircle } from 'lucide-react';

interface WebcamInputProps {
  onGestureUpdate: (state: HandGestureState) => void;
  showDebugOverlay: boolean;
}

export const WebcamInput: React.FC<WebcamInputProps> = ({ onGestureUpdate, showDebugOverlay }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of the landmarker instance
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(MP_VISION_PATH);
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
        setError("Failed to load gesture recognition model.");
      }
    };

    initMediaPipe();

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const detect = useCallback(() => {
    if (!landmarkerRef.current || !webcamRef.current?.video || !canvasRef.current) return;

    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    const result = landmarkerRef.current.detectForVideo(video, startTimeMs);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let gestureState: HandGestureState = {
      isPinching: false,
      handPosition: null,
      pinchDistance: 1,
    };

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0]; // Assume 1 hand
      
      // Draw debug overlay
      if (showDebugOverlay) {
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2
        });
        drawingUtils.drawLandmarks(landmarks, { 
            color: "#FF0000", 
            lineWidth: 1,
            radius: 3 
        });
      }

      // 4 = Thumb Tip, 8 = Index Tip
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];

      // Calculate 3D Euclidean distance (approximate using x,y,z)
      // Note: z is relative to wrist, but x,y are normalized 0-1.
      // For simple pinch, 2D distance is usually sufficient and more stable.
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx*dx + dy*dy);

      // Hand Center (Approximate between index and thumb base for stability)
      // or just use indexTip? Let's use the midpoint of the pinch
      const midX = (thumbTip.x + indexTip.x) / 2;
      const midY = (thumbTip.y + indexTip.y) / 2;

      gestureState = {
        isPinching: distance < PINCH_THRESHOLD,
        handPosition: { x: midX, y: midY },
        pinchDistance: distance
      };

      // Visualize Pinch State
      if (showDebugOverlay) {
         ctx.beginPath();
         ctx.arc(midX * canvas.width, midY * canvas.height, 10, 0, 2 * Math.PI);
         ctx.fillStyle = gestureState.isPinching ? '#00FFFF' : 'rgba(255, 255, 0, 0.5)';
         ctx.fill();
         
         // Draw distance text
         ctx.fillStyle = 'white';
         ctx.font = '16px monospace';
         ctx.fillText(`Dist: ${distance.toFixed(3)}`, 10, 30);
         ctx.fillText(gestureState.isPinching ? "PINCH" : "OPEN", 10, 50);
      }
    }

    onGestureUpdate(gestureState);
    requestRef.current = requestAnimationFrame(detect);
  }, [onGestureUpdate, showDebugOverlay]);

  // Start loop once loaded
  useEffect(() => {
    if (isLoaded) {
      requestRef.current = requestAnimationFrame(detect);
    }
  }, [isLoaded, detect]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-gray-700 shadow-inner">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900 text-white">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Initializing Vision Model...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900 text-red-400">
           <AlertCircle className="w-8 h-8 mr-2"/>
           <span>{error}</span>
        </div>
      )}

      <Webcam
        ref={webcamRef}
        audio={false}
        className="absolute inset-0 w-full h-full object-cover mirror-x" 
        style={{ transform: "scaleX(-1)" }} // Mirror the webcam
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: "scaleX(-1)" }} // Mirror the overlay to match
      />
      
      <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white z-10 flex items-center">
         <Camera className="w-3 h-3 mr-1" /> Webcam Feed
      </div>
    </div>
  );
};