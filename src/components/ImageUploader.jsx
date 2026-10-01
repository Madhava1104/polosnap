import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Check, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { SAMPLE_PHOTOS } from '../constants/presets';
import { uploadImageFile } from '../utils/uploadHelper';

export default function ImageUploader({ onSelectImage, onOpenCamera, currentPhotoUrl }) {
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelection = async (file) => {
    if (!file) return;
    setErrorMessage('');

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const result = await uploadImageFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result?.url) {
        onSelectImage(result.url);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed. Please try a valid image file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset file input value so same file can be uploaded again if needed
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Strict Image File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/bmp,image/*"
        className="hidden"
      />

      {/* Invalid File Error Toast Alert */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-600/80 text-rose-200 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2 truncate">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="truncate font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs font-bold text-rose-400 hover:text-white px-1.5 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Prominent Hero Upload Card & Action Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Main Big Drag & Drop / Upload Photo Zone */}
        <button
          type="button"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isUploading}
          className={`col-span-2 relative py-3.5 px-3 rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center space-x-3 group text-left shadow-lg ${
            isUploading
              ? 'border-amber-500/80 bg-amber-950/40 cursor-wait'
              : isDraggingOver
              ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-500/20 scale-[1.02]'
              : 'border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 hover:from-amber-950/30 hover:to-slate-900 active:scale-98'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center space-x-2.5 py-0.5">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  Uploading High Quality... {uploadProgress}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Saving to project folder...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Pulsing Icon Badge */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="truncate min-w-0">
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors block truncate">
                  Upload Custom Photo
                </span>
                <span className="text-[10px] font-medium text-slate-400 block truncate">
                  JPG, PNG, WEBP (Original Quality)
                </span>
              </div>
            </>
          )}
        </button>

        {/* Webcam Action Button */}
        <button
          type="button"
          onClick={onOpenCamera}
          disabled={isUploading}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-700/60 text-indigo-300 transition-all active:scale-95 group shadow-md disabled:opacity-50"
          title="Take photo with webcam"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-900/80 border border-indigo-500/40 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Webcam</span>
        </button>
      </div>

      {/* Quick Sample Photos Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Or Pick Sample Photo</span>
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SAMPLE_PHOTOS.map((sample) => {
            const isSelected = currentPhotoUrl === sample.url;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectImage(sample.url)}
                disabled={isUploading}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  isSelected 
                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md' 
                    : 'border-slate-800 hover:border-slate-600 hover:scale-105'
                }`}
                title={sample.name}
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-500/30 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
