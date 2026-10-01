import React, { useRef, useEffect, useState } from 'react';
import { 
  Grid, X, Download, Sparkles, Layers, Trash2, 
  RotateCw, RotateCcw, ChevronLeft, ChevronRight, Plus, Upload, 
  Image as ImageIcon, Pin, Film, LayoutTemplate
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LAYOUT_OPTIONS = [
  { id: 'grid', name: '2x2 Grid', icon: Grid, desc: 'Clean aligned photo grid' },
  { id: 'string-lights', name: 'String Lights', icon: Sparkles, desc: 'Hanging with wooden clips' },
  { id: 'scatter', name: 'Cozy Scatter', icon: Layers, desc: 'Natural overlapping fan' },
  { id: 'pinboard', name: 'Cork Pinboard', icon: Pin, desc: 'Pinned memory board' },
  { id: 'film-strip', name: 'Film Strip', icon: Film, desc: 'Retro cinema reel' },
  { id: 'diagonal-stack', name: 'Diagonal Fan', icon: LayoutTemplate, desc: 'Modern stacked cards' }
];

const BOARD_THEMES = [
  { id: 'dark-studio', name: 'Dark Studio', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { id: 'cork', name: 'Corkboard', bg: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' },
  { id: 'wood', name: 'Wood Table', bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)' },
  { id: 'vintage-paper', name: 'Linen Paper', bg: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)' },
  { id: 'cyber', name: 'Cyber Obsidian', bg: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)' }
];

export default function BatchCollageModal({ 
  isOpen, 
  onClose, 
  savedPhotos = [], 
  onRemovePhoto, 
  onClearAllPhotos,
  onUpdatePhoto,
  onAddCurrentToCollage,
  currentPhotoUrl
}) {
  const collageCanvasRef = useRef(null);
  const [layout, setLayout] = useState('grid');
  const [theme, setTheme] = useState('dark-studio');

  const handleDownloadSinglePhoto = (photo, index) => {
    const link = document.createElement('a');
    link.download = `polaroid-memory-${index + 1}-${Date.now()}.png`;
    link.href = photo.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isOpen && savedPhotos.length > 0 && collageCanvasRef.current) {
      renderCollage();
    }
  }, [isOpen, layout, theme, savedPhotos]);

  const renderCollage = () => {
    const canvas = collageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseW = 1600;
    const baseH = 1100;
    canvas.width = baseW;
    canvas.height = baseH;

    // Draw Board Background
    if (theme === 'cork') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 0, baseW, baseH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < baseW; i += 8) {
        for (let j = 0; j < baseH; j += 8) {
          if ((i + j) % 16 === 0) ctx.fillRect(i, j, 4, 4);
        }
      }
    } else if (theme === 'wood') {
      const grad = ctx.createLinearGradient(0, 0, baseW, baseH);
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#3b1202');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
    } else if (theme === 'cyber') {
      const grad = ctx.createRadialGradient(baseW/2, baseH/2, 100, baseW/2, baseH/2, baseW);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
    } else {
      const grad = ctx.createRadialGradient(baseW/2, baseH/2, 200, baseW/2, baseH/2, baseW*0.8);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
    }

    // Additional layout ambient elements
    if (layout === 'string-lights') {
      // Cable line
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.quadraticCurveTo(baseW / 2, 280, baseW - 80, 160);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // String Light Bulbs Glow
      for (let x = 120; x < baseW - 80; x += 110) {
        ctx.beginPath();
        const py = 180 + Math.sin(x * 0.008) * 40;
        ctx.arc(x, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (layout === 'film-strip') {
      // Top and bottom cinema sprocket borders
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, baseW, 100);
      ctx.fillRect(0, baseH - 100, baseW, 100);
      ctx.fillStyle = '#ffffff';
      for (let x = 40; x < baseW; x += 80) {
        ctx.fillRect(x, 25, 35, 50);
        ctx.fillRect(x, baseH - 75, 35, 50);
      }
    }

    // Preload image elements for saved photos
    const total = savedPhotos.length;
    if (total === 0) return;

    let loadedCount = 0;
    const imgElements = [];

    savedPhotos.forEach((item, index) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = item.dataUrl;
      imgElements[index] = img;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total) {
          drawSavedPhotosOntoCanvas(ctx, baseW, baseH, imgElements);
        }
      };
    });
  };

  const drawSavedPhotosOntoCanvas = (ctx, baseW, baseH, imgElements) => {
    const total = savedPhotos.length;

    savedPhotos.forEach((item, i) => {
      const img = imgElements[i];
      if (!img) return;

      const userRot = (item.rotation || 0) * (Math.PI / 180);
      const scale = 0.55;
      const pw = img.width * scale;
      const ph = img.height * scale;

      let px = 0;
      let py = 0;
      let angle = userRot;

      if (layout === 'grid') {
        const cols = total <= 2 ? total : 2;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellW = baseW / cols;
        const cellH = baseH / (total > 2 ? 2 : 1);
        px = cellW * col + cellW / 2;
        py = cellH * row + cellH / 2;
      } else if (layout === 'string-lights') {
        const spacing = baseW / (total + 1);
        px = spacing * (i + 1);
        py = 320 + Math.sin(i * 1.2) * 50;
        angle += (i % 2 === 0 ? 0.05 : -0.05);

        // Wooden clip peg hanging on string
        ctx.save();
        ctx.fillStyle = '#b45309';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(px - 10, py - pw * 0.45 - 25, 20, 45);
        ctx.restore();
      } else if (layout === 'scatter') {
        const coords = [
          { x: baseW * 0.3, y: baseH * 0.35, rot: -0.12 },
          { x: baseW * 0.7, y: baseH * 0.38, rot: 0.15 },
          { x: baseW * 0.35, y: baseH * 0.72, rot: 0.08 },
          { x: baseW * 0.68, y: baseH * 0.7, rot: -0.18 }
        ];
        const pos = coords[i % coords.length];
        px = pos.x;
        py = pos.y;
        angle += pos.rot;
      } else if (layout === 'pinboard') {
        const coords = [
          { x: baseW * 0.28, y: baseH * 0.32, rot: -0.08 },
          { x: baseW * 0.72, y: baseH * 0.34, rot: 0.1 },
          { x: baseW * 0.32, y: baseH * 0.72, rot: 0.06 },
          { x: baseW * 0.68, y: baseH * 0.74, rot: -0.09 }
        ];
        const pos = coords[i % coords.length];
        px = pos.x;
        py = pos.y;
        angle += pos.rot;

        // Red Pushpin Graphic
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py - ph/2 + 20, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      } else if (layout === 'film-strip') {
        const spacing = baseW / (total + 1);
        px = spacing * (i + 1);
        py = baseH / 2;
        angle = userRot;
      } else if (layout === 'diagonal-stack') {
        px = baseW * 0.25 + i * 260;
        py = baseH * 0.3 + i * 140;
        angle += -0.15 + i * 0.08;
      }

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      // Realistic Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 18;
      ctx.shadowOffsetX = 8;

      ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);

      ctx.restore();
    });
  };

  const handleDownloadCollage = () => {
    if (!collageCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `polaroid-collage-${Date.now()}.png`;
    link.href = collageCanvasRef.current.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl glass-panel rounded-3xl p-4 lg:p-6 border border-slate-700/80 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <span>Collage Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono border border-slate-700">
                  {savedPhotos.length}/4 Saved
                </span>
              </h3>
              <p className="text-xs text-slate-400">Organize, customize angles & export your multi-photo Polaroid story</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
          
          {/* Layout Selectors */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Collage Layout</span>
            <div className="flex flex-wrap gap-1.5">
              {LAYOUT_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = layout === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 font-semibold'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Board Themes */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Board Surface Theme</span>
            <div className="flex flex-wrap gap-1.5">
              {BOARD_THEMES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setTheme(b.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    theme === b.id
                      ? 'bg-amber-500 text-black font-semibold shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ background: b.bg }}
                  />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Main Collage Canvas & Saved Cards Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Canvas Live Preview (Takes 2 cols) */}
          <div className="lg:col-span-2 relative aspect-[16/11] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
            {savedPhotos.length === 0 ? (
              <div className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No Saved Photos in Collage Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Customize your photo on the canvas and click <span className="text-rose-400 font-semibold">"Save to Collage"</span> to add up to 4 photos.
                </p>
                {currentPhotoUrl && (
                  <button
                    onClick={onAddCurrentToCollage}
                    className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs shadow-lg hover:bg-amber-400 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Current Canvas Photo Now</span>
                  </button>
                )}
              </div>
            ) : (
              <canvas
                ref={collageCanvasRef}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* In-Modal Photo Editing & Cards Manager (1 col) */}
          <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Memories Vault ({savedPhotos.length}/4)
                </span>
                <div className="flex items-center space-x-2">
                  {savedPhotos.length > 0 && onClearAllPhotos && (
                    <button
                      onClick={onClearAllPhotos}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
                      title="Clear all saved memories"
                    >
                      Clear All
                    </button>
                  )}
                  {savedPhotos.length < 4 && currentPhotoUrl && (
                    <button
                      onClick={onAddCurrentToCollage}
                      className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                      title="Add current canvas photo"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Current</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Cards List inside modal */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {savedPhotos.map((photo, index) => (
                  <div
                    key={photo.id || index}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <img
                          src={photo.dataUrl}
                          alt="Collage item"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                        />
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-200 block truncate">
                            Memory #{index + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {photo.settings?.caption || 'Polaroid Snapshot'}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons: Individual Download & Remove */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownloadSinglePhoto(photo, index)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-black text-amber-400 transition-colors border border-slate-800"
                          title="Download this single photo memory"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onRemovePhoto(index)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-slate-800"
                          title="Remove from memory vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rotation slider for individual collage card */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-900">
                      <span className="text-[10px] font-medium text-slate-400">Angle:</span>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={photo.rotation || 0}
                        onChange={(e) =>
                          onUpdatePhoto(index, { rotation: parseInt(e.target.value, 10) })
                        }
                        className="flex-1 h-1.5 rounded-lg appearance-none bg-slate-800 accent-amber-400 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-amber-400 w-7 text-right">
                        {photo.rotation || 0}°
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleDownloadCollage}
                disabled={savedPhotos.length === 0}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 ${
                  savedPhotos.length > 0
                    ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white shadow-rose-500/25 ring-2 ring-rose-400/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res Collage</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
