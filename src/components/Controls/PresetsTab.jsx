import React from 'react';
import { THEME_PRESETS } from '../../constants/presets';
import { Sparkles, Check } from 'lucide-react';

export default function PresetsTab({ currentPresetId, onApplyPreset }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          One-Click Aesthetic Presets
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Visual Swatch Icon */}
                <div
                  className="w-10 h-10 rounded-lg shadow-sm border border-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-xs"
                  style={{
                    background: preset.frameColor,
                    color: preset.id === 'cyber-dark' ? '#fff' : '#333'
                  }}
                >
                  POLO
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {preset.tagline}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
