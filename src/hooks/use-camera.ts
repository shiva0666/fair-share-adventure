
import { useState, useEffect } from 'react';

export interface UseCameraReturn {
  hasCamera: boolean;
  isPermissionGranted: boolean;
  requestCameraPermission: () => Promise<boolean>;
}

export function useCamera(): UseCameraReturn {
  const [hasCamera, setHasCamera] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false);
          return;
        }
        
        setHasCamera(true);
        
        // Check if permission is already granted
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setIsPermissionGranted(true);
          // Release the camera
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          // Permission not granted or denied
          setIsPermissionGranted(false);
        }
      } catch (err) {
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (!hasCamera) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsPermissionGranted(true);
      // Release the camera
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error("Failed to get camera permission:", err);
      setIsPermissionGranted(false);
      return false;
    }
  };

  return { hasCamera, isPermissionGranted, requestCameraPermission };
}
