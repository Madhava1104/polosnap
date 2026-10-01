import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { renderPolaroidToCanvas } from '../utils/canvasRenderer';
import { Download, Copy, X, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export default function DownloadModal({ isOpen, onClose, settings, imageObj }) {
  const [resolution, setResolution] = useState(2); // 1x, 2x HD, 4x Ultra
  const [format, setFormat] = useState('png'); // png, jpeg
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getTargetDimensions = () => {
    const baseW = 600 * resolution;
    let baseH = 730 * resolution;
    if (settings.aspectRatio === 'instax-mini') baseH = 900 * resolution;
    if (settings.aspectRatio === 'instax-wide') baseH = 520 * resolution;
    if (settings.aspectRatio === 'square') baseH = 670 * resolution;
    if (settings.aspectRatio === 'vintage-postcard') baseH = 820 * resolution;
    return { width: baseW, height: baseH };
  };

  const handleDownload = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        const tempCanvas = document.createElement('canvas');
        renderPolaroidToCanvas(tempCanvas, settings, imageObj, resolution);

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = tempCanvas.toDataURL(mimeType, 0.95);

        const link = document.createElement('a');
        link.download = `polaroid-${Date.now()}.${format}`;
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
      renderPolaroidToCanvas(tempCanvas, settings, imageObj, resolution);
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

  const dims = getTargetDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">Export High-Res Polaroid</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Resolution Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            Export Quality & Scale
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { scale: 1, name: 'Standard (1x)', desc: '600px width (Fast)' },
              { scale: 2, name: 'HD Quality (2x)', desc: '1200px width (Recommended)' },
              { scale: 4, name: 'Ultra HD Print (4x)', desc: '2400px+ Print Ready' }
            ].map((res) => {
              const isSelected = resolution === res.scale;
              return (
                <button
                  key={res.scale}
                  onClick={() => setResolution(res.scale)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{res.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{res.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            File Format
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'png', name: 'PNG (Lossless & Crisp)', desc: 'Best for transparency & detail' },
              { id: 'jpeg', name: 'JPG / JPEG (Compact)', desc: 'Smaller file size' }
            ].map((f) => {
              const isSelected = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{f.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension Badge Info */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Output Canvas Dimensions:</span>
          <span className="font-mono text-amber-400 font-semibold">{dims.width} × {dims.height} px</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download Image'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
