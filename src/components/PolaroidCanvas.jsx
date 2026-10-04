import React, { useEffect, useRef, useState } from 'react';
import { renderPolaroidToCanvas } from '../utils/canvasRenderer';
import { Move, ZoomIn, ZoomOut, RotateCcw, RotateCw, BookmarkPlus, Check } from 'lucide-react';

export default function PolaroidCanvas({ 
  settings, 
  imageObj, 
  onUpdateTransform, 
  onToggleFlipBack,
  savedCollageCount = 0,
  onSaveToCollage
}) {
  const canvasRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [justSaved, setJustSaved] = useState(false);
  const animFrameRef = useRef(null);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    latestX: 0,
    latestY: 0
  });

  const touchRef = useRef({
    isPinching: false,
    initialPinchDist: 0,
    initialZoom: 1,
    latestZoom: 1
  });

  useEffect(() => {
    // Render at HD scaleFactor (2x) for retina clarity and sharp preview
    const previewScale = (typeof window !== 'undefined' && (window.devicePixelRatio || 1) >= 1.5) ? 2 : 1.5;
    if (canvasRef.current) {
      renderPolaroidToCanvas(canvasRef.current, settings, imageObj, previewScale);
    }
  }, [settings, imageObj]);

  // Re-render when web fonts complete loading (separated to avoid duplicate renders during dragging)
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      let isMounted = true;
      document.fonts.ready.then(() => {
        if (isMounted && canvasRef.current) {
          const previewScale = (typeof window !== 'undefined' && (window.devicePixelRatio || 1) >= 1.5) ? 2 : 1.5;
          renderPolaroidToCanvas(canvasRef.current, settings, imageObj, previewScale);
        }
      });
      return () => { isMounted = false; };
    }
  }, [settings.font]);

  const handleMouseDown = (e) => {
    if (settings.isFlippedBack) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: settings.offsetX || 0,
      initY: settings.offsetY || 0,
      latestX: settings.offsetX || 0,
      latestY: settings.offsetY || 0
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging || settings.isFlippedBack) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    dragRef.current.latestX = Math.round(dragRef.current.initX + dx);
    dragRef.current.latestY = Math.round(dragRef.current.initY + dy);

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(() => {
        onUpdateTransform({
          offsetX: dragRef.current.latestX,
          offsetY: dragRef.current.latestY
        }, false);
        animFrameRef.current = null;
      });
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      onUpdateTransform({
        offsetX: dragRef.current.latestX,
        offsetY: dragRef.current.latestY
      }, true);
    }
  };

  // Helper for touch distance (pinch-to-zoom)
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.hypot(dx, dy);
  };

  // Mobile Touch Gestures: Single finger drag, Two fingers pinch-zoom
  const handleTouchStart = (e) => {
    if (settings.isFlippedBack) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragRef.current = {
        isDragging: true,
        startX: touch.clientX,
        startY: touch.clientY,
        initX: settings.offsetX || 0,
        initY: settings.offsetY || 0,
        latestX: settings.offsetX || 0,
        latestY: settings.offsetY || 0
      };
      touchRef.current.isPinching = false;
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      touchRef.current = {
        isPinching: true,
        initialPinchDist: dist,
        initialZoom: settings.zoom || 1,
        latestZoom: settings.zoom || 1
      };
    }
  };

  const handleTouchMove = (e) => {
    if (settings.isFlippedBack) return;

    if (dragRef.current.isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      dragRef.current.latestX = Math.round(dragRef.current.initX + dx);
      dragRef.current.latestY = Math.round(dragRef.current.initY + dy);

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(() => {
          onUpdateTransform({
            offsetX: dragRef.current.latestX,
            offsetY: dragRef.current.latestY
          }, false);
          animFrameRef.current = null;
        });
      }
    } else if (touchRef.current.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      if (touchRef.current.initialPinchDist > 0) {
        const factor = currentDist / touchRef.current.initialPinchDist;
        const newZoom = Math.min(3.0, Math.max(0.5, Number((touchRef.current.initialZoom * factor).toFixed(2))));
        touchRef.current.latestZoom = newZoom;

        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(() => {
            onUpdateTransform({ zoom: touchRef.current.latestZoom }, false);
            animFrameRef.current = null;
          });
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      onUpdateTransform({
        offsetX: dragRef.current.latestX,
        offsetY: dragRef.current.latestY
      }, true);
    }
    if (touchRef.current.isPinching && e.touches.length < 2) {
      touchRef.current.isPinching = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      onUpdateTransform({ zoom: touchRef.current.latestZoom }, true);
    }
  };

  const handleSaveToCollage = () => {
    if (!canvasRef.current || !onSaveToCollage) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSaveToCollage(dataUrl);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-between overflow-hidden p-1 sm:p-2 select-none">
      
      {/* Background Studio Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0,transparent_70%)] pointer-events-none" />
      
      {/* Canvas Container (flex-1 min-h-0 fits dynamically above the toolbar without pushing it) */}
      <div 
        className="flex-1 min-h-0 w-full relative group cursor-grab active:cursor-grabbing transition-transform duration-300 flex items-center justify-center touch-none overflow-hidden py-0.5"
        style={{ transform: `scale(${zoomLevel})` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

        <canvas
          ref={canvasRef}
          className="relative z-10 rounded-sm polaroid-3d-shadow transition-shadow duration-300 max-h-full max-w-full w-auto h-auto object-contain pointer-events-auto will-change-transform transform-gpu"
        />

        {!settings.isFlippedBack && (
          <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 text-[10px] sm:text-[11px] font-medium text-slate-300 flex items-center space-x-1 shadow-lg">
            <Move className="w-3 h-3 text-amber-400" />
            <span>Drag photo</span>
          </div>
        )}
      </div>

      {/* Responsive Floating Toolbar (fixed height at bottom of card) */}
      <div className="mt-1 sm:mt-1.5 flex items-center flex-wrap justify-center gap-1 sm:gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-2 sm:px-3 py-1 shadow-xl z-20 flex-shrink-0 max-w-full">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-3.5 bg-slate-800 my-auto hidden xs:block" />

        {/* Save to Collage Button */}
        <button
          onClick={handleSaveToCollage}
          disabled={savedCollageCount >= 4}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all shadow-md active:scale-95 ${
            justSaved
              ? 'bg-emerald-500 text-black'
              : savedCollageCount >= 4
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/40'
          }`}
          title="Save current Polaroid layout to Collage gallery (up to 4)"
        >
          {justSaved ? (
            <>
              <Check className="w-3 h-3" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3 h-3 text-rose-400" />
              <span>Collage</span>
              <span className="font-mono text-[9px] bg-rose-500/40 px-1 rounded-full">
                {savedCollageCount}/4
              </span>
            </>
          )}
        </button>

        <div className="w-px h-3.5 bg-slate-800 my-auto hidden xs:block" />

        {/* Flip to Back / Front */}
        <button
          onClick={onToggleFlipBack}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
            settings.isFlippedBack
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
          }`}
          title="Flip Polaroid to Back / Front"
        >
          <RotateCw className="w-3 h-3" />
          <span>{settings.isFlippedBack ? 'Front' : 'Flip Back'}</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={() => {
            setZoomLevel(1);
            onUpdateTransform({ offsetX: 0, offsetY: 0, zoom: 1, rotation: 0 });
          }}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-95"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

