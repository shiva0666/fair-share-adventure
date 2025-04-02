
import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";
import { Camera, X } from "lucide-react";

interface CameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDateURL: string) => void;
}

export const CameraDialog: React.FC<CameraDialogProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const { hasCamera, requestCameraPermission } = useCamera();
  const { toast } = useToast();
  
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isOpen && videoRef.current) {
        try {
          // Request permission first
          const permissionGranted = await requestCameraPermission();
          
          if (!permissionGranted) {
            toast({
              title: "Camera Access Denied",
              description: "Please allow camera access to use this feature.",
              variant: "destructive",
            });
            onClose();
            return;
          }
          
          // Start the camera with the current facing mode
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 } 
            } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setIsCameraActive(true);
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          toast({
            title: "Camera Error",
            description: "There was an error accessing your camera.",
            variant: "destructive",
          });
          onClose();
        }
      }
    };

    startCamera();
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
        setStream(null);
      }
    };
  }, [isOpen, facingMode, onClose, requestCameraPermission, toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and pass to callback
        const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageDataURL);
      }
    }
  };

  const toggleCamera = async () => {
    if (stream) {
      // Stop current stream
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
    
    // Toggle facing mode
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {isCameraActive ? (
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleCamera}
              disabled={!hasCamera || !isCameraActive}
              className="mr-2"
            >
              <div className="rotate-90">
                {facingMode === 'user' ? '📷' : '🤳'}
              </div>
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button 
              onClick={handleCapture}
              disabled={!isCameraActive}
            >
              Capture
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
