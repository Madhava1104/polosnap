import React from 'react';
import { CAPTION_FONTS } from '../../constants/presets';
import CustomColorPicker from '../CustomColorPicker';
import { Type, Calendar, AlignLeft, AlignCenter, AlignRight, FileText } from 'lucide-react';

export default function CaptionTab({ settings, onChange }) {
  return (
    <div className="space-y-6 text-xs pr-1">
      
      {/* Front Caption / Back Note Input */}
      {settings.isFlippedBack ? (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mb-3">
            <FileText className="w-4 h-4" />
            <span>Postcard Back Note (Multi-Line)</span>
          </label>
          <textarea
            rows={4}
            value={settings.backNote || settings.caption || ''}
            onChange={(e) => onChange({ backNote: e.target.value })}
            placeholder="Write a longer memory, quote, or diary entry for the back of the Polaroid..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      ) : (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
            <Type className="w-4 h-4 text-amber-400" />
            <span>Front Polaroid Handwritten Note</span>
          </label>
          <input
            type="text"
            value={settings.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="e.g. Summer memories ☀️"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      )}

      {/* Font Family Selection */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
          <span>Handwriting Font Style</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CAPTION_FONTS.map((f) => {
            const isSelected = settings.font === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ font: f.id })}
                className={`py-3 px-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]'
                }`}
              >
                <p className="text-xs font-medium truncate" style={{ fontFamily: f.family }}>
                  {f.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Color & Alignment */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="font-semibold text-slate-300 mb-1.5 block">Text Color</label>
          <CustomColorPicker
            value={settings.textColor || '#262626'}
            onChange={(newColor) => onChange({ textColor: newColor })}
            label="Text Color"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-300 mb-1.5 block">Alignment</label>
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChange({ textAlign: 'left' })}
              className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${
                settings.textAlign === 'left' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange({ textAlign: 'center' })}
              className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${
                settings.textAlign === 'center' || !settings.textAlign ? 'bg-slate-800 text-amber-400' : 'text-slate-500'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange({ textAlign: 'right' })}
              className={`flex-1 p-2 rounded-lg flex justify-center transition-colors ${
                settings.textAlign === 'right' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Font Size & Tilt Angle */}
      <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Font Size</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.fontSize || 34}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="54"
            value={settings.fontSize || 34}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300">Handwriting Tilt Angle</span>
            <span className="font-mono text-amber-400 font-semibold">{settings.textRotation || 0}°</span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            value={settings.textRotation || 0}
            onChange={(e) => onChange({ textRotation: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Retro Orange Camera Date Stamp */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>Retro Camera Date Stamp</span>
          </label>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dateStampEnabled || false}
              onChange={(e) => onChange({ dateStampEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {settings.dateStampEnabled && (
          <input
            type="text"
            value={settings.customDate || ''}
            onChange={(e) => onChange({ customDate: e.target.value })}
            placeholder="'88 09 29"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
          />
        )}
      </div>

    </div>
  );
}
