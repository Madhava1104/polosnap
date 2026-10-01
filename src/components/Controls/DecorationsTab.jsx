import React from 'react';
import { TAPE_STYLES, TAPE_POSITIONS } from '../../constants/presets';
import { Bookmark, Sparkles } from 'lucide-react';

export default function DecorationsTab({ settings, onChange }) {
  return (
    <div className="space-y-6 text-xs pr-1">
      
      {/* 1. Adhesive Washi Tape */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <span>Adhesive Washi Tape</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TAPE_STYLES.map((tape) => {
            const isSelected = settings.tapeStyle === tape.id;
            return (
              <button
                key={tape.id}
                onClick={() => onChange({ tapeStyle: tape.id })}
                className={`py-2.5 px-3 rounded-xl border text-left font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                {tape.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tape Position */}
      {settings.tapeStyle && settings.tapeStyle !== 'none' && (
        <div className="pt-2 border-t border-slate-800/80">
          <label className="font-semibold text-slate-300 mb-2 block">Tape Position</label>
          <div className="grid grid-cols-2 gap-2">
            {TAPE_POSITIONS.map((pos) => {
              const isSelected = settings.tapePosition === pos.id;
              return (
                <button
                  key={pos.id}
                  onClick={() => onChange({ tapePosition: pos.id })}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 text-amber-300 font-semibold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pos.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Photo Surface Finish */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Photo Surface Finish</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'matte', name: 'Matte Satin' },
            { id: 'glossy', name: 'Glossy Glare' },
            { id: 'holographic', name: 'Holographic' }
          ].map((finish) => {
            const isSelected = settings.finishStyle === finish.id;
            return (
              <button
                key={finish.id}
                onClick={() => onChange({ finishStyle: finish.id })}
                className={`py-2.5 px-2 rounded-xl border text-center font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {finish.name}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
