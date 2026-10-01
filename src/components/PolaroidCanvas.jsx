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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [justSaved, setJustSaved] = useState(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderPolaroidToCanvas(canvasRef.current, settings, imageObj, 1);
    }
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          renderPolaroidToCanvas(canvasRef.current, settings, imageObj, 1);
        }
      });
    }
  }, [settings, imageObj]);

  const handleMouseDown = (e) => {
    if (settings.isFlippedBack) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset({ x: settings.offsetX || 0, y: settings.offsetY || 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || settings.isFlippedBack) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => {
      onUpdateTransform({
        offsetX: initialOffset.x + dx,
        offsetY: initialOffset.y + dy
      }, false);
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdateTransform({
        offsetX: settings.offsetX,
        offsetY: settings.offsetY
      }, true);
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
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden p-2 select-none">
      
      {/* Background Studio Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0,transparent_70%)] pointer-events-none" />
      
      {/* Canvas Container */}
      <div 
        className="relative group cursor-grab active:cursor-grabbing transition-transform duration-300 max-h-full flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />

        <canvas
          ref={canvasRef}
          className="relative z-10 rounded-sm polaroid-3d-shadow transition-shadow duration-300 max-h-[calc(100vh-170px)] max-w-full object-contain"
        />

        {!settings.isFlippedBack && (
          <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700 text-[11px] font-medium text-slate-300 flex items-center space-x-1.5 shadow-lg">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>Click & Drag photo</span>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      <div className="mt-3 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1.5 shadow-xl z-20 flex-shrink-0">
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono text-slate-400 px-1.5">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-800 my-auto" />

        {/* Save to Collage Button */}
        <button
          onClick={handleSaveToCollage}
          disabled={savedCollageCount >= 4}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-md active:scale-95 ${
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
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save to Collage ({savedCollageCount}/4)</span>
            </>
          )}
        </button>

        <div className="w-px h-3.5 bg-slate-800 my-auto" />

        <button
          onClick={onToggleFlipBack}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            settings.isFlippedBack
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
          }`}
          title="Flip Polaroid to Back / Front"
        >
          <RotateCw className="w-3 h-3" />
          <span>{settings.isFlippedBack ? 'View Front' : 'Flip to Back'}</span>
        </button>

        <button
          onClick={() => {
            setZoomLevel(1);
            onUpdateTransform({ offsetX: 0, offsetY: 0, zoom: 1, rotation: 0 });
          }}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

