import React from 'react';
import { ZoomIn, RotateCw, Move, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';

export default function TransformTab({ settings, onChange }) {
  return (
    <div className="space-y-6 text-xs pr-1">
      
      {/* Fitting Mode */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Crop className="w-4 h-4 text-amber-400" />
          <span>Image Fitting Mode</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'cover', name: 'Fill Frame (Cover)' },
            { id: 'contain', name: 'Fit Entire Photo' }
          ].map((mode) => {
            const isSelected = settings.fitMode === mode.id || (!settings.fitMode && mode.id === 'cover');
            return (
              <button
                key={mode.id}
                onClick={() => onChange({ fitMode: mode.id })}
                className={`py-2.5 px-3 rounded-xl border font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flip Controls */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Photo Flip
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange({ flipH: !settings.flipH })}
            className={`py-2.5 px-3 rounded-xl border font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
              settings.flipH
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Flip Horizontal</span>
          </button>

          <button
            onClick={() => onChange({ flipV: !settings.flipV })}
            className={`py-2.5 px-3 rounded-xl border font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
              settings.flipV
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Sliders: Zoom, Rotation, Offset X, Offset Y */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <ZoomIn className="w-4 h-4 text-amber-400" />
              <span>Zoom Scale</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">{Math.round((settings.zoom || 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={settings.zoom || 1}
            onChange={(e) => onChange({ zoom: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <RotateCw className="w-4 h-4 text-rose-400" />
              <span>Rotation Angle</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">{settings.rotation || 0}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={settings.rotation || 0}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Move className="w-4 h-4 text-indigo-400" />
              <span>Horizontal Pan (X Offset)</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">{settings.offsetX || 0}px</span>
          </div>
          <input
            type="range"
            min="-250"
            max="250"
            value={settings.offsetX || 0}
            onChange={(e) => onChange({ offsetX: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 flex items-center space-x-1.5">
              <Move className="w-4 h-4 text-indigo-400" />
              <span>Vertical Pan (Y Offset)</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">{settings.offsetY || 0}px</span>
          </div>
          <input
            type="range"
            min="-250"
            max="250"
            value={settings.offsetY || 0}
            onChange={(e) => onChange({ offsetY: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
