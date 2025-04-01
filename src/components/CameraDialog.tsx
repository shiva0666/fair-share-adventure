
import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface CameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataURL: string) => void;
}

export const CameraDialog: React.FC<CameraDialogProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataURL = canvas.toDataURL('image/jpeg');
        onCapture(imageDataURL);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          {error ? (
            <div className="text-center p-4 text-destructive">
              <p>{error}</p>
              <Button onClick={startCamera} className="mt-2">Retry</Button>
            </div>
          ) : (
            <>
              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline" onClick={switchCamera}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Switch Camera
                </Button>
                <Button onClick={takePicture}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
