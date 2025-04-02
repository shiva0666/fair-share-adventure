
import { useState, useEffect } from 'react';

export interface UseCameraReturn {
  hasCamera: boolean;
}

export function useCamera(): UseCameraReturn {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false);
          return;
        }
        
        // Try to access the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // If successful, set hasCamera to true and release the camera
        setHasCamera(true);
        // Release the camera by stopping all tracks
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        // If there's an error (no camera or permission denied), set hasCamera to false
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  return { hasCamera };
}
