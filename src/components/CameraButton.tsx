
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from './ui/button';
import { CameraDialog } from './CameraDialog';
import { useCamera } from '@/hooks/use-camera';
import { useToast } from '@/hooks/use-toast';

interface CameraButtonProps {
  onCapture: (imageDataURL: string) => void;
}

export function CameraButton({ onCapture }: CameraButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasCamera, isPermissionGranted, requestCameraPermission } = useCamera();
  const { toast } = useToast();

  const handleCameraClick = async () => {
    if (!hasCamera) {
      toast({
        title: "Camera not available",
        description: "Your device doesn't have a camera or it's not accessible.",
        variant: "destructive",
      });
      return;
    }

    if (!isPermissionGranted) {
      const granted = await requestCameraPermission();
      if (!granted) {
        toast({
          title: "Camera permission denied",
          description: "Please allow camera access to use this feature.",
          variant: "destructive",
        });
        return;
      }
    }

    setDialogOpen(true);
  };

  const handleCapture = (imageDataURL: string) => {
    onCapture(imageDataURL);
    setDialogOpen(false);
    toast({
      title: "Photo captured",
      description: "The photo has been added to your expense."
    });
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline"
        className="flex items-center gap-2" 
        onClick={handleCameraClick}
      >
        <Camera className="h-4 w-4" />
        Take Photo
      </Button>

      <CameraDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCapture={handleCapture}
      />
    </>
  );
}
