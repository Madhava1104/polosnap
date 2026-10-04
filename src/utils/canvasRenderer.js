/**
 * Canvas Polaroid Rendering Engine
 * GPU-Accelerated, High-Performance Canvas Engine.
 */

// --- OFFSCREEN PATTERN & NOISE CACHES ---
const patternCache = {
  paper: null,
  canvas: null,
  distressed: null,
  dots: null,
  grid: null,
  grain: {} // Keyed by rounded intensity
};

function getPaperPattern(ctx) {
  if (patternCache.paper) return patternCache.paper;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tCtx = tile.getContext('2d');
  tCtx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let i = 0; i < 128; i += 4) {
    for (let j = 0; j < 128; j += 4) {
      if (Math.random() > 0.5) {
        tCtx.fillRect(i, j, 2, 2);
      }
    }
  }
  patternCache.paper = ctx.createPattern(tile, 'repeat');
  return patternCache.paper;
}

function getCanvasWeavePattern(ctx) {
  if (patternCache.canvas) return patternCache.canvas;
  const tile = document.createElement('canvas');
  tile.width = 16;
  tile.height = 16;
  const tCtx = tile.getContext('2d');
  tCtx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  tCtx.fillRect(0, 0, 1, 16);
  tCtx.fillRect(0, 0, 16, 1);
  patternCache.canvas = ctx.createPattern(tile, 'repeat');
  return patternCache.canvas;
}

function getDistressedPattern(ctx) {
  if (patternCache.distressed) return patternCache.distressed;
  const tile = document.createElement('canvas');
  tile.width = 256;
  tile.height = 256;
  const tCtx = tile.getContext('2d');
  tCtx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  tCtx.lineWidth = 1;
  for (let k = 0; k < 20; k++) {
    tCtx.beginPath();
    const sx = Math.random() * 256;
    const sy = Math.random() * 256;
    tCtx.moveTo(sx, sy);
    tCtx.lineTo(sx + (Math.random() - 0.5) * 60, sy + (Math.random() - 0.5) * 60);
    tCtx.stroke();
  }
  patternCache.distressed = ctx.createPattern(tile, 'repeat');
  return patternCache.distressed;
}

function getDotsPattern(ctx) {
  if (patternCache.dots) return patternCache.dots;
  const tile = document.createElement('canvas');
  tile.width = 32;
  tile.height = 32;
  const tCtx = tile.getContext('2d');
  tCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  tCtx.beginPath();
  tCtx.arc(16, 16, 3, 0, Math.PI * 2);
  tCtx.fill();
  patternCache.dots = ctx.createPattern(tile, 'repeat');
  return patternCache.dots;
}

function getGridPattern(ctx) {
  if (patternCache.grid) return patternCache.grid;
  const tile = document.createElement('canvas');
  tile.width = 32;
  tile.height = 32;
  const tCtx = tile.getContext('2d');
  tCtx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
  tCtx.lineWidth = 1;
  tCtx.beginPath();
  tCtx.moveTo(0, 0);
  tCtx.lineTo(32, 0);
  tCtx.moveTo(0, 0);
  tCtx.lineTo(0, 32);
  tCtx.stroke();
  patternCache.grid = ctx.createPattern(tile, 'repeat');
  return patternCache.grid;
}

function getGrainPattern(ctx, intensity) {
  const roundedIntensity = Math.round(intensity);
  if (patternCache.grain[roundedIntensity]) {
    return patternCache.grain[roundedIntensity];
  }
  const tileSize = 256;
  const tile = document.createElement('canvas');
  tile.width = tileSize;
  tile.height = tileSize;
  const gCtx = tile.getContext('2d');
  const imgData = gCtx.createImageData(tileSize, tileSize);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < 0.45) {
      const noise = (Math.random() - 0.5) * roundedIntensity * 2.8;
      const val = 128 + noise;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = Math.min(255, roundedIntensity * 2.5);
    }
  }
  gCtx.putImageData(imgData, 0, 0);
  const pattern = ctx.createPattern(tile, 'repeat');
  patternCache.grain[roundedIntensity] = pattern;
  return pattern;
}

let filteredImageCache = {
  key: '',
  canvas: null
};

function getFilteredImageCanvas(sourceImageObj, settings) {
  if (!sourceImageObj || !sourceImageObj.naturalWidth) return null;

  const brightness = settings.brightness || 0;
  const contrast = settings.contrast || 0;
  const saturation = settings.saturation || 0;
  const blur = settings.blur || 0;
  const filter = settings.filter || 'none';

  // If no filters are applied, return original image directly
  if (brightness === 0 && contrast === 0 && saturation === 0 && blur === 0 && filter === 'none') {
    return sourceImageObj;
  }

  const key = `${sourceImageObj.src}_${filter}_${brightness}_${contrast}_${saturation}_${blur}`;

  if (filteredImageCache.canvas && filteredImageCache.key === key) {
    return filteredImageCache.canvas;
  }

  // Downscale giant images for offscreen filter cache to max 2000px for max GPU performance
  const srcW = sourceImageObj.naturalWidth;
  const srcH = sourceImageObj.naturalHeight;
  const maxDim = 2000;
  let targetW = srcW;
  let targetH = srcH;

  if (srcW > maxDim || srcH > maxDim) {
    if (srcW > srcH) {
      targetW = maxDim;
      targetH = Math.round((srcH / srcW) * maxDim);
    } else {
      targetH = maxDim;
      targetW = Math.round((srcW / srcH) * maxDim);
    }
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return sourceImageObj;

  let filterString = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) `;
  if (blur > 0) filterString += `blur(${blur}px) `;

  if (filter === 'vintage') {
    filterString += `sepia(25%) hue-rotate(-10deg) `;
  } else if (filter === 'kodak') {
    filterString += `saturate(125%) contrast(110%) sepia(15%) `;
  } else if (filter === 'sepia') {
    filterString += `sepia(75%) `;
  } else if (filter === 'bw') {
    filterString += `grayscale(100%) contrast(130%) `;
  } else if (filter === 'faded') {
    filterString += `opacity(90%) brightness(105%) contrast(85%) `;
  } else if (filter === 'cyberpunk') {
    filterString += `hue-rotate(180deg) saturate(140%) `;
  } else if (filter === 'cool-drift') {
    filterString += `hue-rotate(20deg) saturate(90%) `;
  } else if (filter === 'warm-sunset') {
    filterString += `sepia(35%) saturate(130%) `;
  }

  oCtx.filter = filterString.trim() || 'none';
  oCtx.drawImage(sourceImageObj, 0, 0, targetW, targetH);
  oCtx.filter = 'none';

  filteredImageCache = {
    key,
    canvas: offscreen
  };

  return offscreen;
}

export function renderPolaroidToCanvas(canvas, settings, sourceImageObj, scaleFactor = 1) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Frame Dimensions based on aspect ratio
  const baseWidth = Math.round(600 * scaleFactor);
  let baseHeight = Math.round(730 * scaleFactor);

  if (settings.aspectRatio === 'instax-mini') {
    baseHeight = Math.round(900 * scaleFactor);
  } else if (settings.aspectRatio === 'instax-wide') {
    baseHeight = Math.round(520 * scaleFactor);
  } else if (settings.aspectRatio === 'square') {
    baseHeight = Math.round(670 * scaleFactor);
  } else if (settings.aspectRatio === 'vintage-postcard') {
    baseHeight = Math.round(820 * scaleFactor);
  }

  // Only update canvas dimensions when they actually change to prevent resetting GPU buffers on every frame
  if (canvas.width !== baseWidth) canvas.width = baseWidth;
  if (canvas.height !== baseHeight) canvas.height = baseHeight;

  ctx.clearRect(0, 0, baseWidth, baseHeight);

  // IF FLIPPED TO BACK SIDE: Draw Vintage Postcard Back
  if (settings.isFlippedBack) {
    drawPolaroidBack(ctx, baseWidth, baseHeight, settings, scaleFactor);
    return;
  }

  // --- FRONT SIDE RENDERING ---

  // 1. DRAW FRAME BACKGROUND
  ctx.save();
  
  if (settings.framePattern && settings.framePattern !== 'none') {
    drawFramePattern(ctx, baseWidth, baseHeight, settings.framePattern, settings.frameColor || '#Fcfbf7', scaleFactor);
  } else if (settings.frameColor && settings.frameColor.includes('gradient')) {
    const grad = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
    grad.addColorStop(0, '#ffc3a0');
    grad.addColorStop(1, '#ffafbd');
    ctx.fillStyle = grad;
    const cornerRadius = (settings.cornerRadius || 6) * scaleFactor;
    drawRoundedRect(ctx, 0, 0, baseWidth, baseHeight, cornerRadius);
    ctx.fill();
  } else {
    ctx.fillStyle = settings.frameColor || '#Fcfbf7';
    const cornerRadius = (settings.cornerRadius || 6) * scaleFactor;
    drawRoundedRect(ctx, 0, 0, baseWidth, baseHeight, cornerRadius);
    ctx.fill();
  }

  // Draw Frame Texture
  drawFrameTexture(ctx, baseWidth, baseHeight, settings.frameTexture, scaleFactor);

  // Outer border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1 * scaleFactor;
  ctx.stroke();
  ctx.restore();

  // 2. INNER PHOTO AREA GEOMETRY
  const paddingX = baseWidth * (settings.framePadding || 0.06);
  const paddingTop = baseWidth * (settings.framePadding || 0.06);
  const bottomMargin = baseHeight * (settings.bottomSpace || 0.22);

  const photoWidth = baseWidth - (paddingX * 2);
  const photoHeight = baseHeight - paddingTop - bottomMargin;
  const photoX = paddingX;
  const photoY = paddingTop;

  // 3. DRAW PHOTO AREA
  ctx.save();
  
  const innerCornerRadius = Math.max(0, (settings.photoCornerRadius || 2) * scaleFactor);
  ctx.beginPath();
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, innerCornerRadius);
  ctx.clip();



  // Inner Photo Placeholder Background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(photoX, photoY, photoWidth, photoHeight);

  // Draw Image if available
  if (sourceImageObj && sourceImageObj.complete && sourceImageObj.naturalWidth > 0) {
    ctx.save();
    
    const centerX = photoX + photoWidth / 2;
    const centerY = photoY + photoHeight / 2;
    ctx.translate(centerX, centerY);

    const zoom = settings.zoom || 1;
    const offsetX = (settings.offsetX || 0) * scaleFactor;
    const offsetY = (settings.offsetY || 0) * scaleFactor;

    ctx.translate(offsetX, offsetY);
    ctx.rotate(((settings.rotation || 0) * Math.PI) / 180);
    ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);

    const drawableImage = getFilteredImageCanvas(sourceImageObj, settings) || sourceImageObj;
    const drawImgW = drawableImage.width || drawableImage.naturalWidth || sourceImageObj.naturalWidth;
    const drawImgH = drawableImage.height || drawableImage.naturalHeight || sourceImageObj.naturalHeight;

    const imgRatio = drawImgW / drawImgH;
    const containerRatio = photoWidth / photoHeight;

    let drawW, drawH;
    if (settings.fitMode === 'contain') {
      if (imgRatio > containerRatio) {
        drawW = photoWidth * zoom;
        drawH = (photoWidth / imgRatio) * zoom;
      } else {
        drawH = photoHeight * zoom;
        drawW = (photoHeight * imgRatio) * zoom;
      }
    } else {
      if (imgRatio > containerRatio) {
        drawH = photoHeight * zoom;
        drawW = (photoHeight * imgRatio) * zoom;
      } else {
        drawW = photoWidth * zoom;
        drawH = (photoWidth / imgRatio) * zoom;
      }
    }

    ctx.drawImage(drawableImage, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }

  // 4. DRAW OVERLAYS ON PHOTO
  ctx.save();
  
  if (settings.warmth && settings.warmth !== 0) {
    ctx.globalCompositeOperation = settings.warmth > 0 ? 'color-burn' : 'soft-light';
    ctx.fillStyle = settings.warmth > 0 
      ? `rgba(245, 158, 11, ${Math.abs(settings.warmth) * 0.003})`
      : `rgba(59, 130, 246, ${Math.abs(settings.warmth) * 0.003})`;
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
  }

  if (settings.lightLeak && settings.lightLeak !== 'none') {
    drawLightLeak(ctx, photoX, photoY, photoWidth, photoHeight, settings.lightLeak);
  }

  if (settings.vignette && settings.vignette > 0) {
    const vignGrad = ctx.createRadialGradient(
      photoX + photoWidth / 2, photoY + photoHeight / 2, photoWidth * 0.3,
      photoX + photoWidth / 2, photoY + photoHeight / 2, photoWidth * 0.75
    );
    vignGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignGrad.addColorStop(1, `rgba(0, 0, 0, ${(settings.vignette / 100) * 0.75})`);
    ctx.fillStyle = vignGrad;
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
  }

  // GPU-Accelerated Grain Noise Rendering via Tiled Offscreen Canvas Pattern
  if (settings.grain && settings.grain > 0) {
    drawGrainGPU(ctx, photoX, photoY, photoWidth, photoHeight, settings.grain);
  }

  ctx.restore();
  ctx.restore();

  // Inner Photo Shadow Line
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1.5 * scaleFactor;
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, innerCornerRadius);
  ctx.stroke();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 6 * scaleFactor;
  ctx.shadowOffsetY = 2 * scaleFactor;
  ctx.stroke();
  ctx.restore();

  // 5. DRAW CAPTION TEXT & DATE STAMP
  ctx.save();
  
  if (settings.dateStampEnabled) {
    ctx.save();
    ctx.font = `${Math.round(20 * scaleFactor)}px VT323, monospace`;
    ctx.fillStyle = '#ff6b00';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 4 * scaleFactor;
    
    const dateStr = settings.customDate || getFormattedRetroDate();
    const dateX = photoX + photoWidth - (15 * scaleFactor);
    const dateY = photoY + photoHeight - (15 * scaleFactor);
    
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, dateX, dateY);
    ctx.restore();
  }

  if (settings.caption) {
    ctx.save();
    const fontSize = (settings.fontSize || 34) * scaleFactor;
    const fontObj = getFontFamilyString(settings.font || 'caveat');
    
    ctx.font = `${fontSize}px ${fontObj}`;
    ctx.fillStyle = settings.textColor || '#262626';
    ctx.textAlign = settings.textAlign || 'center';

    const maxTextWidth = photoWidth - (20 * scaleFactor);
    const lines = getWrappedTextLines(ctx, settings.caption, maxTextWidth);
    const lineHeight = fontSize * 1.15;
    const totalHeight = lines.length * lineHeight;
    
    const availableSpace = baseHeight - (photoY + photoHeight);
    const startY = (photoY + photoHeight) + (availableSpace - totalHeight) / 2 + (fontSize * 0.7);

    let textX = baseWidth / 2;
    if (settings.textAlign === 'left') textX = photoX + (10 * scaleFactor);
    if (settings.textAlign === 'right') textX = photoX + photoWidth - (10 * scaleFactor);

    lines.forEach((line, idx) => {
      const lineY = startY + (idx * lineHeight);
      if (settings.textRotation) {
        ctx.save();
        ctx.translate(textX, lineY);
        ctx.rotate((settings.textRotation * Math.PI) / 180);
        ctx.fillText(line, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(line, textX, lineY);
      }
    });

    ctx.restore();
  }
  ctx.restore();

  // 6. DRAW FINISH OVERLAY
  if (settings.finishStyle && settings.finishStyle !== 'none') {
    drawFinishOverlay(ctx, photoX, photoY, photoWidth, photoHeight, settings.finishStyle);
  }

  // 7. DRAW WASHI TAPE
  if (settings.tapeStyle && settings.tapeStyle !== 'none') {
    drawTapeEffect(ctx, baseWidth, baseHeight, photoX, photoY, settings.tapeStyle, settings.tapePosition, scaleFactor);
  }
}

// Fast Tiled GPU Grain Pattern
function drawGrainGPU(ctx, x, y, width, height, intensity) {
  if (!intensity || intensity <= 0) return;
  const pattern = getGrainPattern(ctx, intensity);
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

// Helper: Postcard Back Side Rendering
function drawPolaroidBack(ctx, width, height, settings, scaleFactor) {
  ctx.save();

  ctx.fillStyle = '#f5ebd2';
  const cornerRadius = (settings.cornerRadius || 6) * scaleFactor;
  drawRoundedRect(ctx, 0, 0, width, height, cornerRadius);
  ctx.fill();

  drawFrameTexture(ctx, width, height, 'paper', scaleFactor);

  ctx.strokeStyle = 'rgba(120, 90, 40, 0.3)';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(140, 110, 60, 0.4)';
  ctx.lineWidth = 1.5 * scaleFactor;
  ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 40 * scaleFactor);
  ctx.lineTo(width / 2, height - 40 * scaleFactor);
  ctx.stroke();
  ctx.setLineDash([]);

  const stampW = 75 * scaleFactor;
  const stampH = 90 * scaleFactor;
  const stampX = width - stampW - 35 * scaleFactor;
  const stampY = 35 * scaleFactor;

  ctx.fillStyle = '#e2d4b7';
  ctx.fillRect(stampX, stampY, stampW, stampH);
  ctx.strokeStyle = '#b89d72';
  ctx.lineWidth = 2 * scaleFactor;
  ctx.strokeRect(stampX, stampY, stampW, stampH);

  ctx.fillStyle = '#991b1b';
  ctx.font = `bold ${12 * scaleFactor}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('AIR MAIL', stampX + stampW / 2, stampY + 22 * scaleFactor);
  ctx.font = `${28 * scaleFactor}px sans-serif`;
  ctx.fillText('📮', stampX + stampW / 2, stampY + 58 * scaleFactor);

  ctx.save();
  ctx.strokeStyle = 'rgba(40, 40, 50, 0.5)';
  ctx.lineWidth = 1.5 * scaleFactor;
  ctx.beginPath();
  ctx.arc(stampX - 15 * scaleFactor, stampY + 30 * scaleFactor, 30 * scaleFactor, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = `${10 * scaleFactor}px VT323, monospace`;
  ctx.fillStyle = 'rgba(40, 40, 50, 0.6)';
  ctx.fillText('POSTAL SERVICE 1988', stampX - 15 * scaleFactor, stampY + 32 * scaleFactor);
  ctx.restore();

  ctx.save();
  const noteFont = getFontFamilyString(settings.font || 'caveat');
  ctx.font = `${(settings.fontSize || 32) * scaleFactor}px ${noteFont}`;
  ctx.fillStyle = settings.textColor || '#2e271d';
  ctx.textAlign = 'left';

  const noteText = settings.backNote || settings.caption || 'A moment captured in time...\nWish you were here! ❤️';
  const lines = noteText.split('\n');
  const startX = 45 * scaleFactor;
  let startY = 90 * scaleFactor;

  lines.forEach((line) => {
    ctx.fillText(line, startX, startY);
    startY += 40 * scaleFactor;
  });
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(140, 110, 60, 0.35)';
  ctx.lineWidth = 1 * scaleFactor;
  const addressX = width / 2 + 35 * scaleFactor;
  let lineY = 180 * scaleFactor;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(addressX, lineY);
    ctx.lineTo(width - 35 * scaleFactor, lineY);
    ctx.stroke();
    lineY += 45 * scaleFactor;
  }
  ctx.restore();

  ctx.restore();
}

// Fast Frame Patterns via Offscreen Canvas
function drawFramePattern(ctx, width, height, patternType, baseColor, scaleFactor) {
  ctx.save();
  ctx.fillStyle = baseColor;
  const cornerRadius = 6 * scaleFactor;
  drawRoundedRect(ctx, 0, 0, width, height, cornerRadius);
  ctx.fill();

  ctx.globalCompositeOperation = 'multiply';

  if (patternType === 'dots') {
    const pattern = getDotsPattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (patternType === 'grid') {
    const pattern = getGridPattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (patternType === 'terrazzo') {
    const colors = ['rgba(239, 68, 68, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(245, 158, 11, 0.15)', 'rgba(16, 185, 129, 0.15)'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const tx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const ty = (Math.cos(i * 33) * 0.5 + 0.5) * height;
      ctx.fillRect(tx, ty, (8 + (i % 6)) * scaleFactor, (8 + (i % 4)) * scaleFactor);
    }
  }

  ctx.restore();
}

function getWrappedTextLines(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (radius <= 0) {
    ctx.rect(x, y, width, height);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Fast Frame Texture via Offscreen Canvas Pattern
function drawFrameTexture(ctx, width, height, textureType, scaleFactor) {
  if (!textureType || textureType === 'smooth') return;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  if (textureType === 'paper') {
    const pattern = getPaperPattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (textureType === 'canvas') {
    const pattern = getCanvasWeavePattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (textureType === 'distressed') {
    const pattern = getDistressedPattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }
  ctx.restore();
}

function drawLightLeak(ctx, x, y, width, height, leakType) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  if (leakType === 'top-right') {
    const leakGrad = ctx.createRadialGradient(x + width, y, 0, x + width, y, width * 0.9);
    leakGrad.addColorStop(0, 'rgba(255, 140, 50, 0.65)');
    leakGrad.addColorStop(0.5, 'rgba(255, 80, 120, 0.3)');
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  } else if (leakType === 'side-flare') {
    const leakGrad = ctx.createLinearGradient(x, y, x + width, y);
    leakGrad.addColorStop(0, 'rgba(255, 200, 80, 0.5)');
    leakGrad.addColorStop(0.3, 'rgba(255, 100, 150, 0.25)');
    leakGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  } else if (leakType === 'bottom-warm') {
    const leakGrad = ctx.createLinearGradient(x, y + height, x, y);
    leakGrad.addColorStop(0, 'rgba(255, 100, 20, 0.6)');
    leakGrad.addColorStop(0.4, 'rgba(255, 180, 50, 0.2)');
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  } else if (leakType === 'soft-rainbow') {
    const leakGrad = ctx.createLinearGradient(x, y, x + width, y + height);
    leakGrad.addColorStop(0, 'rgba(255, 0, 128, 0.25)');
    leakGrad.addColorStop(0.3, 'rgba(255, 165, 0, 0.25)');
    leakGrad.addColorStop(0.6, 'rgba(0, 230, 255, 0.25)');
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  } else if (leakType === 'cyan-pink') {
    const leakGrad = ctx.createRadialGradient(x, y + height, 0, x, y + height, width);
    leakGrad.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
    leakGrad.addColorStop(0.5, 'rgba(255, 0, 150, 0.3)');
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  } else if (leakType === 'burnt-edge') {
    const leakGrad = ctx.createRadialGradient(x, y, 10, x, y, width * 0.7);
    leakGrad.addColorStop(0, 'rgba(255, 230, 150, 0.7)');
    leakGrad.addColorStop(0.4, 'rgba(180, 60, 0, 0.4)');
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(x, y, width, height);
  }

  ctx.restore();
}

function drawFinishOverlay(ctx, x, y, width, height, finishStyle) {
  ctx.save();
  if (finishStyle === 'glossy') {
    ctx.globalCompositeOperation = 'screen';
    const glareGrad = ctx.createLinearGradient(x, y, x + width, y + height);
    glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    glareGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.08)');
    glareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = glareGrad;
    ctx.fillRect(x, y, width, height);
  } else if (finishStyle === 'holographic') {
    ctx.globalCompositeOperation = 'color-dodge';
    const holoGrad = ctx.createLinearGradient(x, y, x + width, y + height);
    holoGrad.addColorStop(0, 'rgba(255, 0, 128, 0.15)');
    holoGrad.addColorStop(0.3, 'rgba(0, 255, 200, 0.15)');
    holoGrad.addColorStop(0.7, 'rgba(255, 230, 0, 0.15)');
    holoGrad.addColorStop(1, 'rgba(180, 0, 255, 0.15)');
    ctx.fillStyle = holoGrad;
    ctx.fillRect(x, y, width, height);
  }
  ctx.restore();
}

function drawTapeEffect(ctx, canvasW, canvasH, photoX, photoY, tapeStyle, position, scaleFactor) {
  ctx.save();

  let tapeBg = 'rgba(240, 230, 200, 0.7)';
  let tapeBorder = 'rgba(200, 180, 140, 0.5)';

  if (tapeStyle === 'vintage-tape') {
    tapeBg = 'rgba(220, 190, 120, 0.75)';
    tapeBorder = 'rgba(180, 140, 80, 0.6)';
  } else if (tapeStyle === 'washi-pink') {
    tapeBg = 'rgba(255, 180, 200, 0.8)';
    tapeBorder = 'rgba(240, 140, 170, 0.6)';
  } else if (tapeStyle === 'washi-grid') {
    tapeBg = 'rgba(255, 255, 255, 0.85)';
    tapeBorder = 'rgba(200, 200, 200, 0.8)';
  } else if (tapeStyle === 'black-duct') {
    tapeBg = 'rgba(30, 30, 35, 0.9)';
    tapeBorder = 'rgba(10, 10, 10, 0.9)';
  } else if (tapeStyle === 'holo-tape') {
    tapeBg = 'rgba(220, 240, 255, 0.75)';
    tapeBorder = 'rgba(180, 210, 255, 0.8)';
  }

  const tapeWidth = 110 * scaleFactor;
  const tapeHeight = 32 * scaleFactor;

  const renderSingleTape = (tx, ty, angleDeg) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate((angleDeg * Math.PI) / 180);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4 * scaleFactor;
    ctx.shadowOffsetY = 2 * scaleFactor;

    ctx.fillStyle = tapeBg;
    ctx.fillRect(-tapeWidth / 2, -tapeHeight / 2, tapeWidth, tapeHeight);

    ctx.fillStyle = tapeBorder;
    ctx.fillRect(-tapeWidth / 2, -tapeHeight / 2, 3 * scaleFactor, tapeHeight);
    ctx.fillRect(tapeWidth / 2 - 3 * scaleFactor, -tapeHeight / 2, 3 * scaleFactor, tapeHeight);

    ctx.restore();
  };

  if (position === 'top-center') {
    renderSingleTape(canvasW / 2, photoY - 5 * scaleFactor, -1);
  } else if (position === 'top-left') {
    renderSingleTape(photoX + 20 * scaleFactor, photoY - 5 * scaleFactor, -25);
  } else if (position === 'top-right') {
    renderSingleTape(canvasW - photoX - 20 * scaleFactor, photoY - 5 * scaleFactor, 25);
  } else if (position === 'corners') {
    renderSingleTape(photoX + 15 * scaleFactor, photoY - 5 * scaleFactor, -30);
    renderSingleTape(canvasW - photoX - 15 * scaleFactor, photoY - 5 * scaleFactor, 30);
  }

  ctx.restore();
}

function getFormattedRetroDate() {
  const d = new Date();
  const yr = String(d.getFullYear()).slice(-2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `'${yr} ${mo} ${da}`;
}

function getFontFamilyString(fontId) {
  const map = {
    caveat: "Caveat, cursive",
    permanent: '"Permanent Marker", cursive',
    indie: '"Indie Flower", cursive',
    courier: '"Courier Prime", monospace',
    dancing: '"Dancing Script", cursive',
    shadows: '"Shadows Into Light", cursive',
    reenie: '"Reenie Beanie", cursive',
    kalam: "Kalam, cursive",
    vt323: "VT323, monospace"
  };
  return map[fontId] || "Caveat, cursive";
}



