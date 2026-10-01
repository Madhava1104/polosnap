import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, X, Sliders } from 'lucide-react';

const AESTHETIC_PALETTES = [
  {
    category: 'Classic Polaroid & Vintage',
    colors: [
      { name: 'Classic White', value: '#Fcfbf7' },
      { name: 'Aged Paper', value: '#f4ebd0' },
      { name: 'Sepia Tone', value: '#d9c5a0' },
      { name: 'Vintage Cream', value: '#fdf6e3' },
      { name: 'Desert Sand', value: '#e6d7c3' },
      { name: 'Faded Linen', value: '#e9e4d4' }
    ]
  },
  {
    category: 'Modern Dark & Cyber',
    colors: [
      { name: 'Noir Black', value: '#121318' },
      { name: 'Midnight Slate', value: '#1e293b' },
      { name: 'Dark Velvet', value: '#1f1924' },
      { name: 'Charcoal Grey', value: '#27272a' },
      { name: 'Deep Espresso', value: '#241c18' },
      { name: 'Cyber Obsidian', value: '#090d16' }
    ]
  },
  {
    category: 'Pastel Aesthetic',
    colors: [
      { name: 'Blush Rose', value: '#fecdd3' },
      { name: 'Peach Sorbet', value: '#ffedd5' },
      { name: 'Mint Matcha', value: '#dcfce7' },
      { name: 'Soft Lavender', value: '#f3e8ff' },
      { name: 'Sky Soft', value: '#e0f2fe' },
      { name: 'Vanilla Butter', value: '#fef9c3' }
    ]
  },
  {
    category: 'Vibrant Accent',
    colors: [
      { name: 'Golden Amber', value: '#f59e0b' },
      { name: 'Sunset Coral', value: '#f43f5e' },
      { name: 'Electric Cyan', value: '#06b6d4' },
      { name: 'Neon Violet', value: '#8b5cf6' },
      { name: 'Emerald Green', value: '#10b981' },
      { name: 'Terracotta Red', value: '#c2410c' }
    ]
  }
];

const GRADIENT_SWATCHES = [
  { name: 'Sunset Sorbet', value: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)' },
  { name: 'Cyber Neon', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { name: 'Golden Hour', value: 'linear-gradient(135deg, #ffe000 0%, #799f0c 100%)' },
  { name: 'Peachy Glow', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }
];

// Utility to convert HSL to HEX
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function CustomColorPicker({ value, onChange, label = 'Color' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || '#ffffff');
  const [hue, setHue] = useState(0);

  useEffect(() => {
    setHexInput(value || '#ffffff');
  }, [value]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleHueChange = (e) => {
    const h = parseInt(e.target.value, 10);
    setHue(h);
    const newHex = hslToHex(h, 85, 55);
    setHexInput(newHex);
    onChange(newHex);
  };

  const isGradient = value && value.includes('gradient');

  return (
    <div className="w-full">
      {/* Trigger Button -> Opens Floating Popup */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 transition-all active:scale-95 group shadow-sm"
      >
        <div className="flex items-center space-x-2 truncate">
          <div
            className="w-5 h-5 rounded-lg border border-slate-600 shadow-sm flex-shrink-0"
            style={{ background: value || '#ffffff' }}
          />
          <span className="text-xs font-mono font-medium text-slate-200 truncate">
            {isGradient ? 'Gradient' : value || '#ffffff'}
          </span>
        </div>

        <Palette className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      </button>

      {/* Floating Modal Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xs glass-panel rounded-3xl p-4 border border-slate-700 shadow-2xl space-y-3.5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{label} Studio Palette</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom HEX Code Input Row */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">Custom HEX Color</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-xl border border-slate-700 flex-shrink-0 shadow-inner"
                  style={{ background: value || '#ffffff' }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexChange}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Rainbow Spectrum Hue Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span className="flex items-center space-x-1">
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>Color Spectrum</span>
                </span>
                <span className="font-mono text-amber-400">{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer border border-slate-700/80 outline-none"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
            </div>

            {/* Aesthetic Palettes Grid */}
            <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {AESTHETIC_PALETTES.map((cat) => (
                <div key={cat.category}>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">{cat.category}</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {cat.colors.map((c) => {
                      const isSelected = value === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            onChange(c.value);
                            setHexInput(c.value);
                          }}
                          className={`w-7 h-7 rounded-lg border transition-transform duration-150 flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/40 scale-110 shadow-md'
                              : 'border-slate-700/80 hover:scale-110 hover:border-slate-500'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Gradient Fills */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Gradient Fills</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_SWATCHES.map((g) => {
                    const isSelected = value === g.value;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => onChange(g.value)}
                        className={`h-7 rounded-lg border transition-transform duration-150 ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                            : 'border-slate-700/80 hover:scale-105'
                        }`}
                        style={{ background: g.value }}
                        title={g.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}



