import React from 'react';
import { Camera, Download, Sparkles, RefreshCw, Grid, Undo2, Redo2 } from 'lucide-react';

export default function Navbar({ 
  onOpenCamera, 
  onOpenDownload, 
  onOpenCollage, 
  onReset,
  onOpenPresets,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasImage,
  savedCollageCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex-shrink-0 pt-safe">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 bg-clip-text text-transparent leading-none">
              PoloSnap<span className="hidden xs:inline text-amber-400/90 font-light ml-0.5">Studio</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-medium hidden md:block">
              Instant Aesthetic Polaroid Creator
            </p>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
          
          {/* Undo & Redo Controls */}
          <div className="flex items-center space-x-0.5 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 flex-shrink-0">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 sm:p-1.5 rounded-lg transition-all active:scale-95 ${
                canUndo 
                  ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300' 
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 sm:p-1.5 rounded-lg transition-all active:scale-95 ${
                canRedo 
                  ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300' 
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800 my-auto hidden xs:block" />

          {/* Quick Presets Button */}
          <button
            onClick={onOpenPresets}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-xs font-medium transition-all active:scale-95 flex-shrink-0"
            title="Aesthetic Presets"
            aria-label="Aesthetic Presets"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Camera Button */}
          <button
            onClick={onOpenCamera}
            className="flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all active:scale-95 flex-shrink-0"
            title="Take Photo with Camera"
            aria-label="Take Photo with Camera"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Camera</span>
          </button>

          {/* Multi-Collage Mode Button */}
          <button
            onClick={onOpenCollage}
            className="flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all active:scale-95 relative flex-shrink-0"
            title="Generate Multi-Polaroid Collage"
            aria-label="Collage"
          >
            <Grid className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Collage</span>
            {savedCollageCount > 0 && (
              <span className="px-1 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white font-mono shadow-sm">
                {savedCollageCount}
              </span>
            )}
          </button>

          {/* Reset Controls Button */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all active:scale-95 flex-shrink-0"
            title="Reset Settings"
            aria-label="Reset Settings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Export HD Button */}
          <button
            onClick={onOpenDownload}
            disabled={!hasImage}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-lg active:scale-95 flex-shrink-0 ${
              hasImage
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-rose-500/25 ring-2 ring-amber-400/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
            title="Export High-Res Polaroid"
            aria-label="Export Polaroid"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

        </div>

      </div>
    </header>
  );
}
