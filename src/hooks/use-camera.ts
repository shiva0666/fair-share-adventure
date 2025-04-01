
import { useState, useRef, useEffect } from 'react';

interface UseCameraOptions {
  onCapture?: (dataUrl: string) => void;
  initialFacingMode?: 'user' | 'environment';
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePicture: () => string | null;
  switchCamera: () => void;
}

export const useCamera = (options: UseCameraOptions = {}): UseCameraReturn => {
  const { onCapture, initialFacingMode = 'environment' } = options;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop any existing stream
      if (stream) {
        stopCamera();
      }
      
      const constraints = {
        video: { facingMode },
        audio: false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions and try again.");
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const takePicture = () => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      if (onCapture) {
        onCapture(dataUrl);
      }
      
      return dataUrl;
    }
    
    return null;
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // When facingMode changes, restart camera
  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    takePicture,
    switchCamera
  };
};
