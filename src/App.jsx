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
import { Sparkles, Frame, Sliders, Type, Bookmark, Move } from 'lucide-react';

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
    <div className="h-screen w-screen max-h-screen max-w-vw overflow-hidden bg-[#070b13] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Fixed Navbar */}
      <Navbar
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenCollage={() => setIsCollageOpen(true)}
        onReset={handleReset}
        onOpenPresets={() => setActiveTab('presets')}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasImage={!!imageObj}
        savedCollageCount={savedCollagePhotos.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 flex overflow-hidden min-h-0 gap-4 items-stretch">
        
        {/* Left Side: Canvas Preview */}
        <section className="flex-1 h-full min-h-0 bg-slate-950/70 rounded-2xl border border-slate-800/80 p-2 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-2xl">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <PolaroidCanvas
            settings={settings}
            imageObj={imageObj}
            onUpdateTransform={handleUpdateSettings}
            onToggleFlipBack={() => handleUpdateSettings({ isFlippedBack: !settings.isFlippedBack })}
            savedCollageCount={savedCollagePhotos.length}
            onSaveToCollage={handleSaveToCollage}
          />
        </section>

        {/* Right Side: Fixed Control Sidebar */}
        <section className="w-[420px] xl:w-[460px] h-full flex-shrink-0 flex flex-col min-h-0 glass-panel border border-slate-800 rounded-2xl p-3.5 overflow-hidden shadow-2xl">
          
          {/* Top Compact Photo Selector */}
          <div className="mb-2.5 pb-2.5 border-b border-slate-800/80 flex-shrink-0">
            <ImageUploader
              onSelectImage={setPhotoUrl}
              onOpenCamera={() => setIsCameraOpen(true)}
              currentPhotoUrl={photoUrl}
            />
          </div>

          {/* Main Controls Tab Strip */}
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-shrink-0 mb-3">
            
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'presets'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-0.5" />
              <span>Presets</span>
            </button>

            <button
              onClick={() => setActiveTab('frame')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'frame'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Frame className="w-4 h-4 mb-0.5" />
              <span>Frame</span>
            </button>

            <button
              onClick={() => setActiveTab('filter')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'filter'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 mb-0.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={() => setActiveTab('caption')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'caption'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="w-4 h-4 mb-0.5" />
              <span>Text</span>
            </button>

            <button
              onClick={() => setActiveTab('decorations')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'decorations'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4 mb-0.5" />
              <span>Deco</span>
            </button>

            <button
              onClick={() => setActiveTab('transform')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'transform'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Move className="w-4 h-4 mb-0.5" />
              <span>Crop</span>
            </button>

          </div>

          {/* Active Tab Panel (Smooth custom scrollbar on right edge, zero text overlap!) */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4">
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

          {/* Keyboard Shortcuts Tag */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
            <span>Shortcuts: <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+Z</kbd> Undo | <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+Y</kbd> Redo | <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F</kbd> Flip</span>
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
