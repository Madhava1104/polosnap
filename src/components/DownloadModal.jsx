import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { renderPolaroidToCanvas } from '../utils/canvasRenderer';
import { Download, Copy, X, Sparkles, Check, Printer, Image } from 'lucide-react';

export default function DownloadModal({ isOpen, onClose, settings, imageObj }) {
  const [format, setFormat] = useState('png'); // png, jpeg
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getFrameDetails = () => {
    const resolution = 4; // Always Ultra HD (2400px base width)
    const baseW = 600 * resolution; // 2400px
    let baseH = 730 * resolution; // 2920px
    let realWorldInches = '3.46" × 4.21"';
    let realWorldMm = '88 × 107 mm';
    let frameName = 'Classic Polaroid Film';

    if (settings.aspectRatio === 'instax-mini') {
      baseH = 900 * resolution; // 3600px
      realWorldInches = '2.13" × 3.39"';
      realWorldMm = '54 × 86 mm';
      frameName = 'Instax Mini Film';
    } else if (settings.aspectRatio === 'instax-wide') {
      baseH = 520 * resolution; // 2080px
      realWorldInches = '4.25" × 3.39"';
      realWorldMm = '108 × 86 mm';
      frameName = 'Instax Wide Film';
    } else if (settings.aspectRatio === 'square') {
      baseH = 670 * resolution; // 2680px
      realWorldInches = '3.39" × 3.39"';
      realWorldMm = '86 × 86 mm';
      frameName = 'Square Modern Film';
    } else if (settings.aspectRatio === 'vintage-postcard') {
      baseH = 820 * resolution; // 3280px
      realWorldInches = '4.00" × 5.47"';
      realWorldMm = '101.6 × 138.8 mm';
      frameName = 'Vintage Postcard';
    }

    return {
      width: baseW,
      height: baseH,
      realWorldInches,
      realWorldMm,
      frameName,
      resolution
    };
  };

  const details = getFrameDetails();

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        const tempCanvas = document.createElement('canvas');
        renderPolaroidToCanvas(tempCanvas, settings, imageObj, details.resolution);

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = tempCanvas.toDataURL(mimeType, 0.95);

        const link = document.createElement('a');
        link.download = `polaroid-${settings.aspectRatio || 'classic'}-${Date.now()}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Confetti Celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

      } catch (err) {
        console.error('Export error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const handleCopyToClipboard = async () => {
    try {
      const tempCanvas = document.createElement('canvas');
      renderPolaroidToCanvas(tempCanvas, settings, imageObj, details.resolution);
      tempCanvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/80 shadow-2xl space-y-4 sm:space-y-5 max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <h3 className="font-semibold text-sm sm:text-base text-slate-100">Export Ultra HD Polaroid</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-World Polaroid Film Size Info Badge */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-500/10 p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{details.frameName}</span>
            </span>
            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
              Real Film 1:1 Scale
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Real-World Size:</span>
              <span className="font-mono text-slate-100 font-bold text-xs sm:text-sm">{details.realWorldInches}</span>
              <span className="text-[10px] text-slate-500 block">({details.realWorldMm})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Ultra HD Resolution:</span>
              <span className="font-mono text-emerald-400 font-bold text-xs sm:text-sm">{details.width} × {details.height} px</span>
              <span className="text-[10px] text-slate-500 block">(300 - 600+ DPI Print Ready)</span>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 flex items-center space-x-1">
            <Image className="w-3.5 h-3.5 text-indigo-400" />
            <span>File Format</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {[
              { id: 'png', name: 'PNG (Crisp & Lossless)', desc: 'Recommended quality' },
              { id: 'jpeg', name: 'JPG / JPEG', desc: 'Compact photo file' }
            ].map((f) => {
              const isSelected = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{f.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
          <button
            onClick={handleCopyToClipboard}
            className="w-full xs:flex-1 flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full xs:flex-1 flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download Ultra HD'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

