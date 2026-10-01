import React from 'react';
import { PHOTO_FILTERS, LIGHT_LEAKS } from '../../constants/presets';
import { Sliders, Sparkles, Zap, Wand2 } from 'lucide-react';

export default function FilterTab({ settings, onChange, onAutoEnhance }) {
  return (
    <div className="space-y-6 text-xs pr-1">
      
      {/* 1-Click Auto Enhance Button */}
      <button
        onClick={onAutoEnhance}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 group"
      >
        <Wand2 className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>1-Click Auto Vintage Enhance</span>
      </button>

      {/* Preset Filters Section */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Color Filter Presets</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {PHOTO_FILTERS.map((f) => {
            const isSelected = settings.filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ filter: f.id })}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-2.5 rounded-xl border text-center text-[11px] sm:text-xs font-medium transition-all duration-200 truncate ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vintage Light Leaks Section */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Zap className="w-4 h-4 text-rose-400" />
          <span>Vintage Light Leaks</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LIGHT_LEAKS.map((leak) => {
            const isSelected = settings.lightLeak === leak.id;
            return (
              <button
                key={leak.id}
                onClick={() => onChange({ lightLeak: leak.id })}
                className={`py-2.5 px-3 rounded-xl border font-medium text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                {leak.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine Tuning Sliders Section */}
      <div className="pt-2 border-t border-slate-800/80 space-y-3.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Color Fine Tuning</span>
        </label>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Brightness</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.brightness || 0}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.brightness || 0}
            onChange={(e) => onChange({ brightness: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Contrast</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.contrast || 0}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.contrast || 0}
            onChange={(e) => onChange({ contrast: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Saturation</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.saturation || 0}%</span>
          </div>
          <input
            type="range"
            min="-60"
            max="60"
            value={settings.saturation || 0}
            onChange={(e) => onChange({ saturation: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Warmth / Temperature</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.warmth || 0}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.warmth || 0}
            onChange={(e) => onChange({ warmth: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Film Grain Noise</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.grain || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={settings.grain || 0}
            onChange={(e) => onChange({ grain: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Vignette Darkening</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.vignette || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.vignette || 0}
            onChange={(e) => onChange({ vignette: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
