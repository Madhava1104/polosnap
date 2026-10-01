import React from 'react';
import { FRAME_RATIOS, FRAME_TEXTURES } from '../../constants/presets';
import CustomColorPicker from '../CustomColorPicker';
import { Frame, Palette, Layers, Grid } from 'lucide-react';

export default function FrameTab({ settings, onChange }) {
  return (
    <div className="space-y-6 text-xs pr-1">
      
      {/* 1. Frame Aspect Ratio Selector */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Frame className="w-4 h-4 text-amber-400" />
          <span>Frame Ratio & Format</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FRAME_RATIOS.map((ratio) => {
            const isSelected = settings.aspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                onClick={() => onChange({ aspectRatio: ratio.id })}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                <p className="font-semibold text-xs">{ratio.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{ratio.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Modern Custom Color Picker */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-3">
          <span className="flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-rose-400" />
            <span>Frame Color & Gradients</span>
          </span>
        </label>

        <CustomColorPicker
          value={settings.frameColor || '#Fcfbf7'}
          onChange={(newColor) => onChange({ frameColor: newColor })}
          label="Frame Color"
        />
      </div>

      {/* 3. Frame Pattern Fills */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Grid className="w-4 h-4 text-rose-400" />
          <span>Frame Pattern Fills</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'none', name: 'Solid' },
            { id: 'dots', name: 'Dots' },
            { id: 'grid', name: 'Grid' },
            { id: 'terrazzo', name: 'Terrazzo' }
          ].map((pat) => {
            const isSelected = (settings.framePattern || 'none') === pat.id;
            return (
              <button
                key={pat.id}
                onClick={() => onChange({ framePattern: pat.id })}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {pat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Paper Texture Selector */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Paper Texture</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FRAME_TEXTURES.map((tex) => {
            const isSelected = settings.frameTexture === tex.id;
            return (
              <button
                key={tex.id}
                onClick={() => onChange({ frameTexture: tex.id })}
                className={`py-2.5 px-3 rounded-xl border font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                {tex.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Corner Rounding Slider */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-slate-300">Frame Corner Rounding</span>
          <span className="font-mono text-amber-400 font-semibold">{settings.cornerRadius || 6}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          value={settings.cornerRadius || 6}
          onChange={(e) => onChange({ cornerRadius: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>

    </div>
  );
}
