import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, SwitchCamera, Smartphone, Monitor } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie) or 'environment' (back)
  const [aspectMode, setAspectMode] = useState('portrait'); // 'portrait' (3:4) or 'landscape' (16:9)

  // Auto-detect orientation on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const isPortrait = window.innerHeight >= window.innerWidth;
      setAspectMode(isPortrait ? 'portrait' : 'landscape');
    }
  }, [isOpen]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    stopCamera();

    const isPortrait = aspectMode === 'portrait';
    const idealW = isPortrait ? 1080 : 1920;
    const idealH = isPortrait ? 1920 : 1080;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: idealW },
          height: { ideal: idealH }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Initial camera constraint failed, retrying simple constraint:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        console.error('Camera access error:', fallbackErr);
        setError('Could not access camera. Please check camera permissions.');
      }
    }
  }, [aspectMode, facingMode, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode, aspectMode, startCamera, stopCamera]);

  // Flip between front and rear cameras
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Toggle between Portrait 3:4 and Landscape 16:9
  const handleToggleAspect = () => {
    setAspectMode((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (aspectMode === 'portrait') {
      // In portrait mode: crop center 3:4 rectangle so photo is true portrait
      let cropW, cropH, cropX, cropY;

      if (vw > vh) {
        // Landscape stream from camera sensor: crop center vertical 3:4 strip
        cropH = vh;
        cropW = Math.round(vh * (3 / 4));
        cropX = Math.round((vw - cropW) / 2);
        cropY = 0;
      } else {
        // Already portrait stream: crop to 3:4
        cropW = vw;
        cropH = Math.min(vh, Math.round(vw * (4 / 3)));
        cropX = 0;
        cropY = Math.round((vh - cropH) / 2);
      }

      canvas.width = cropW;
      canvas.height = cropH;

      if (facingMode === 'user') {
        // Mirror front selfie camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      } else {
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
    } else {
      // Landscape capture (full frame)
      canvas.width = vw;
      canvas.height = vh;

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, vw, vh);
    }

    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Instant local photo transfer: no network upload wait, no server messages
    stopCamera();
    onCapture(rawDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-700/80 shadow-2xl max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm sm:text-base text-slate-100">Camera Photo</h3>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Aspect Mode Switcher (Portrait 3:4 vs Landscape 16:9) */}
            <button
              onClick={handleToggleAspect}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all"
              title={aspectMode === 'portrait' ? 'Switch to Landscape' : 'Switch to Portrait'}
            >
              {aspectMode === 'portrait' ? (
                <>
                  <Smartphone className="w-3 h-3 text-amber-400" />
                  <span>Portrait 3:4</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3 h-3 text-indigo-400" />
                  <span>Landscape</span>
                </>
              )}
            </button>

            {/* Flip Front/Back Camera Switcher */}
            <button
              onClick={handleToggleCamera}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all"
              title="Flip Front/Rear Camera"
            >
              <SwitchCamera className="w-3 h-3 text-rose-400" />
              <span className="hidden xs:inline">{facingMode === 'user' ? 'Front' : 'Back'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Stream Viewfinder Container */}
        <div className={`my-3 sm:my-4 relative bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center mx-auto transition-all ${
          aspectMode === 'portrait'
            ? 'aspect-[3/4] max-h-[50vh] w-auto max-w-[340px]'
            : 'aspect-video max-h-[50vh] w-full'
        }`}>
          {error ? (
            <div className="text-center p-4 text-rose-400 text-xs sm:text-sm">
              <p>{error}</p>
              <button
                onClick={startCamera}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform ${
                facingMode === 'user' ? '-scale-x-100' : ''
              }`}
            />
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-500 font-medium">
            {aspectMode === 'portrait' ? 'Captures vertical portrait photo' : 'Captures wide landscape photo'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium active:scale-95 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleTakeSnapshot}
              disabled={!!error || !stream}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
