
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
import { Camera, CameraOff, RefreshCw } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const { hasCamera, requestCameraPermission } = useCamera();
  const { toast } = useToast();
  
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isOpen && videoRef.current) {
        setIsLoading(true);
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
          
          console.log("Starting camera with facing mode:", facingMode);
          
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
        } finally {
          setIsLoading(false);
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
        
        // Close the dialog after capture
        onClose();
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

  const retryCamera = async () => {
    if (stream) {
      // Stop current stream
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
    
    // Try with the same facing mode again
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
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
    } catch (error) {
      console.error("Error retrying camera:", error);
      toast({
        title: "Camera Error",
        description: "Failed to restart the camera. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isCameraActive ? (
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <CameraOff className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Camera not active</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={retryCamera}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Camera
              </Button>
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
              disabled={!hasCamera || !isCameraActive || isLoading}
              className="mr-2"
              title={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
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
              disabled={!isCameraActive || isLoading}
            >
              Capture
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
