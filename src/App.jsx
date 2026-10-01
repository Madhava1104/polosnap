import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import PolaroidCanvas from './components/PolaroidCanvas';
import PresetsTab from './components/Controls/PresetsTab';
import FrameTab from './components/Controls/FrameTab';
import FilterTab from './components/Controls/FilterTab';
import CaptionTab from './components/Controls/CaptionTab';
import DecorationsTab from './components/Controls/DecorationsTab';
import TransformTab from './components/Controls/TransformTab';
import CameraModal from './components/CameraModal';
import DownloadModal from './components/DownloadModal';
import BatchCollageModal from './components/BatchCollageModal';

import { SAMPLE_PHOTOS, PHOTO_FILTERS } from './constants/presets';
import { Sparkles, Frame, Sliders, Type, Bookmark, Move, Maximize2, SlidersHorizontal } from 'lucide-react';

const DEFAULT_SETTINGS = {
  aspectRatio: 'classic',
  frameColor: '#Fcfbf7',
  framePattern: 'none',
  frameTexture: 'paper',
  cornerRadius: 6,
  framePadding: 0.06,
  bottomSpace: 0.22,
  
  filter: 'vintage',
  brightness: 5,
  contrast: 10,
  saturation: -15,
  warmth: 20,
  grain: 25,
  vignette: 20,
  lightLeak: 'top-right',
  blur: 0,

  font: 'caveat',
  caption: 'Summer memories ☀️',
  backNote: 'A moment captured in time...\nWish you were here! ❤️',
  fontSize: 34,
  textColor: '#262626',
  textAlign: 'center',
  textRotation: 0,

  dateStampEnabled: true,
  customDate: '',

  tapeStyle: 'masking',
  tapePosition: 'top-center',
  finishStyle: 'matte',
  stickers: [],

  zoom: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  flipH: false,
  flipV: false,
  fitMode: 'cover',

  isFlippedBack: false
};

export default function App() {
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [imageObj, setImageObj] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // Undo / Redo History Stack
  const [history, setHistory] = useState([DEFAULT_SETTINGS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoActionRef = useRef(false);

  const [activeTab, setActiveTab] = useState('presets');
  const [activePresetId, setActivePresetId] = useState('classic-white');

  // Mobile View Switcher: 'split' (Canvas on top, Controls below) vs 'preview' (Full Canvas)
  const [mobileView, setMobileView] = useState('split');

  // Modals & Collage State (Persisted in localStorage across page refreshes!)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isCollageOpen, setIsCollageOpen] = useState(false);
  const [savedCollagePhotos, setSavedCollagePhotos] = useState(() => {
    try {
      const stored = localStorage.getItem('polosnap_saved_collage_photos');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync savedCollagePhotos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polosnap_saved_collage_photos', JSON.stringify(savedCollagePhotos));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [savedCollagePhotos]);

  // Save Current Polaroid Snapshot to Collage (Up to 4)
  const handleSaveToCollage = (dataUrl) => {
    if (savedCollagePhotos.length >= 4) return;
    const newItem = {
      id: Date.now(),
      dataUrl,
      settings: { ...settings },
      rotation: (savedCollagePhotos.length % 2 === 0 ? -6 : 6)
    };
    setSavedCollagePhotos((prev) => [...prev, newItem]);
  };

  const handleRemoveCollagePhoto = (index) => {
    setSavedCollagePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCollagePhotos = () => {
    setSavedCollagePhotos([]);
    try {
      localStorage.removeItem('polosnap_saved_collage_photos');
    } catch (e) {}
  };

  const handleUpdateCollagePhoto = (index, partial) => {
    setSavedCollagePhotos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...partial } : item))
    );
  };

  const handleAddCurrentToCollage = () => {
    const canvas = document.querySelector('canvas');
    if (canvas && savedCollagePhotos.length < 4) {
      handleSaveToCollage(canvas.toDataURL('image/png'));
    }
  };

  // Load Image Object
  useEffect(() => {
    if (!photoUrl) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = photoUrl;
    img.onload = () => {
      setImageObj(img);
    };
  }, [photoUrl]);

  // Handle Settings Updates with History Tracking
  const handleUpdateSettings = (newPartialSettings, saveToHistory = true) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartialSettings };
      
      if (saveToHistory && !isUndoRedoActionRef.current) {
        setHistory((prevHistory) => {
          const truncatedHistory = prevHistory.slice(0, historyIndex + 1);
          const newHistory = [...truncatedHistory, updated];
          if (newHistory.length > 35) newHistory.shift();
          return newHistory;
        });
        setHistoryIndex((prevIdx) => Math.min(prevIdx + 1, 34));
      }
      
      return updated;
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoActionRef.current = true;
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      setSettings(history[targetIdx]);
      setTimeout(() => { isUndoRedoActionRef.current = false; }, 50);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoActionRef.current = true;
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      setSettings(history[targetIdx]);
      setTimeout(() => { isUndoRedoActionRef.current = false; }, 50);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'r' || e.key === 'R') {
        const randomFilter = PHOTO_FILTERS[Math.floor(Math.random() * PHOTO_FILTERS.length)].id;
        handleUpdateSettings({ filter: randomFilter });
      } else if (e.key === 'f' || e.key === 'F') {
        handleUpdateSettings({ isFlippedBack: !settings.isFlippedBack });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, settings.isFlippedBack]);

  const handleApplyPreset = (preset) => {
    setActivePresetId(preset.id);
    handleUpdateSettings({
      frameColor: preset.frameColor,
      frameTexture: preset.frameTexture,
      filter: preset.filter,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      warmth: preset.warmth,
      grain: preset.grain,
      vignette: preset.vignette,
      lightLeak: preset.lightLeak,
      font: preset.font,
      caption: preset.caption,
      tapeStyle: preset.tapeStyle,
      tapePosition: preset.tapePosition,
      dateStampEnabled: preset.dateStampEnabled,
      finishStyle: preset.finishStyle
    });
  };

  const handleAutoEnhance = () => {
    handleUpdateSettings({
      filter: 'kodak',
      brightness: 8,
      contrast: 15,
      saturation: 10,
      warmth: 20,
      grain: 20,
      vignette: 25,
      lightLeak: 'top-right',
      finishStyle: 'glossy'
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHistory([DEFAULT_SETTINGS]);
    setHistoryIndex(0);
    setActivePresetId('classic-white');
  };

  return (
    <div className="fixed inset-0 h-full w-full overflow-hidden bg-[#070b13] text-slate-100 flex flex-col font-sans select-none overscroll-none">
      
      {/* Fixed Responsive Navbar */}
      <Navbar
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenCollage={() => setIsCollageOpen(true)}
        onReset={handleReset}
        onOpenPresets={() => {
          setActiveTab('presets');
          setMobileView('split');
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasImage={!!imageObj}
        savedCollageCount={savedCollagePhotos.length}
      />

      {/* Main Workspace Layout: Fixed viewport height on mobile, no full-page scrolling! */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-1.5 xs:p-2 sm:p-3 lg:p-3 flex flex-col lg:flex-row overflow-hidden min-h-0 gap-2 xs:gap-2.5 sm:gap-4 items-stretch">
        
        {/* Top: Fixed Canvas Preview Card (PINNED AT TOP ON MOBILE, NEVER SCROLLS) */}
        <section className={`w-full rounded-2xl border border-slate-800/80 p-1.5 sm:p-2 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-300 flex-shrink-0 touch-none overscroll-none ${
          mobileView === 'preview' 
            ? 'flex-1 h-full min-h-0 bg-slate-950' 
            : 'h-[44dvh] xs:h-[46dvh] sm:h-[48dvh] lg:h-full lg:flex-1 bg-slate-950/70'
        }`}>
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mobile Fullscreen / Controls Switcher Pill */}
          <div className="lg:hidden absolute top-2 right-2 z-30">
            <button
              onClick={() => setMobileView(mobileView === 'split' ? 'preview' : 'split')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-amber-300 shadow-lg active:scale-95 transition-all backdrop-blur-md"
            >
              {mobileView === 'split' ? (
                <>
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  <span>Show Controls</span>
                </>
              )}
            </button>
          </div>

          <PolaroidCanvas
            settings={settings}
            imageObj={imageObj}
            onUpdateTransform={handleUpdateSettings}
            onToggleFlipBack={() => handleUpdateSettings({ isFlippedBack: !settings.isFlippedBack })}
            savedCollageCount={savedCollagePhotos.length}
            onSaveToCollage={handleSaveToCollage}
          />
        </section>

        {/* Bottom: Control Sidebar (ONLY THIS COMPONENT SCROLLS ON MOBILE) */}
        <section className={`w-full lg:w-[420px] xl:w-[460px] flex-1 min-h-0 lg:h-full flex-shrink-0 flex flex-col glass-panel border border-slate-800 rounded-2xl p-2 sm:p-3.5 shadow-2xl transition-all duration-300 pb-safe overflow-hidden overscroll-none ${
          mobileView === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Scrollable Container on mobile: controls scroll smoothly inside this container */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y pr-1 sm:pr-2 space-y-2 sm:space-y-3">
            
            {/* Top Photo Selector */}
            <div className="pb-2 border-b border-slate-800/80">
              <ImageUploader
                onSelectImage={setPhotoUrl}
                onOpenCamera={() => setIsCameraOpen(true)}
                currentPhotoUrl={photoUrl}
              />
            </div>

            {/* Sticky Main Controls Tab Strip */}
            <div className="sticky top-0 z-20 grid grid-cols-6 gap-0.5 xs:gap-1 bg-slate-950/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-800 shadow-md">
              
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'presets'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Presets</span>
              </button>

              <button
                onClick={() => setActiveTab('frame')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'frame'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Frame className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Frame</span>
              </button>

              <button
                onClick={() => setActiveTab('filter')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'filter'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => setActiveTab('caption')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'caption'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Text</span>
              </button>

              <button
                onClick={() => setActiveTab('decorations')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'decorations'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Deco</span>
              </button>

              <button
                onClick={() => setActiveTab('transform')}
                className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                  activeTab === 'transform'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                <span>Crop</span>
              </button>

            </div>

            {/* Active Tab Panel */}
            <div className="space-y-3 sm:space-y-4 pt-1">
              {activeTab === 'presets' && (
                <PresetsTab
                  currentPresetId={activePresetId}
                  onApplyPreset={handleApplyPreset}
                />
              )}
              {activeTab === 'frame' && (
                <FrameTab
                  settings={settings}
                  onChange={handleUpdateSettings}
                />
              )}
              {activeTab === 'filter' && (
                <FilterTab
                  settings={settings}
                  onChange={handleUpdateSettings}
                  onAutoEnhance={handleAutoEnhance}
                />
              )}
              {activeTab === 'caption' && (
                <CaptionTab
                  settings={settings}
                  onChange={handleUpdateSettings}
                />
              )}
              {activeTab === 'decorations' && (
                <DecorationsTab
                  settings={settings}
                  onChange={handleUpdateSettings}
                />
              )}
              {activeTab === 'transform' && (
                <TransformTab
                  settings={settings}
                  onChange={handleUpdateSettings}
                />
              )}
            </div>

            {/* Desktop-only Keyboard Shortcuts Tag */}
            <div className="hidden lg:flex mt-2 pt-2 border-t border-slate-800/80 items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
              <span>Shortcuts: <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+Z</kbd> Undo | <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+Y</kbd> Redo | <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F</kbd> Flip</span>
            </div>

          </div>

        </section>

      </main>

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => setPhotoUrl(dataUrl)}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        settings={settings}
        imageObj={imageObj}
      />

      <BatchCollageModal
        isOpen={isCollageOpen}
        onClose={() => setIsCollageOpen(false)}
        savedPhotos={savedCollagePhotos}
        onRemovePhoto={handleRemoveCollagePhoto}
        onClearAllPhotos={handleClearCollagePhotos}
        onUpdatePhoto={handleUpdateCollagePhoto}
        onAddCurrentToCollage={handleAddCurrentToCollage}
        currentPhotoUrl={photoUrl}
      />

    </div>
  );
}
