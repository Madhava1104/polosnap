/**
 * Canvas Polaroid Rendering Engine
 * GPU-Accelerated, High-Performance Canvas Engine.
 */

// Offscreen Grain Pattern Cache for GPU-accelerated rendering
let grainCanvasCache = null;
let grainCacheKey = '';

export function renderPolaroidToCanvas(canvas, settings, sourceImageObj, scaleFactor = 1) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Frame Dimensions based on aspect ratio
  const baseWidth = 600 * scaleFactor;
  let baseHeight = 730 * scaleFactor;

  if (settings.aspectRatio === 'instax-mini') {
    baseHeight = 900 * scaleFactor;
  } else if (settings.aspectRatio === 'instax-wide') {
    baseHeight = 520 * scaleFactor;
  } else if (settings.aspectRatio === 'square') {
    baseHeight = 670 * scaleFactor;
  } else if (settings.aspectRatio === 'vintage-postcard') {
    baseHeight = 820 * scaleFactor;
  }

  canvas.width = baseWidth;
  canvas.height = baseHeight;

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

    const imgRatio = sourceImageObj.naturalWidth / sourceImageObj.naturalHeight;
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

    let filterString = '';
    const brightness = 100 + (settings.brightness || 0);
    const contrast = 100 + (settings.contrast || 0);
    const saturate = 100 + (settings.saturation || 0);
    const blur = (settings.blur || 0) * scaleFactor;

    filterString += `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) `;
    if (blur > 0) filterString += `blur(${blur}px) `;

    if (settings.filter === 'vintage') {
      filterString += `sepia(25%) hue-rotate(-10deg) `;
    } else if (settings.filter === 'kodak') {
      filterString += `saturate(125%) contrast(110%) sepia(15%) `;
    } else if (settings.filter === 'sepia') {
      filterString += `sepia(75%) `;
    } else if (settings.filter === 'bw') {
      filterString += `grayscale(100%) contrast(130%) `;
    } else if (settings.filter === 'faded') {
      filterString += `opacity(90%) brightness(105%) contrast(85%) `;
    } else if (settings.filter === 'cyberpunk') {
      filterString += `hue-rotate(180deg) saturate(140%) `;
    } else if (settings.filter === 'cool-drift') {
      filterString += `hue-rotate(20deg) saturate(90%) `;
    } else if (settings.filter === 'warm-sunset') {
      filterString += `sepia(35%) saturate(130%) `;
    }

    ctx.filter = filterString.trim() || 'none';
    ctx.drawImage(sourceImageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = 'none';

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

  // GPU-Accelerated Grain Noise Rendering
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

// GPU-Accelerated Grain Noise Rendering via Offscreen Canvas Cache
function drawGrainGPU(ctx, x, y, width, height, intensity) {
  const w = Math.round(width);
  const h = Math.round(height);
  const cacheKey = `${w}_${h}_${intensity}`;

  if (!grainCanvasCache || grainCacheKey !== cacheKey) {
    grainCanvasCache = document.createElement('canvas');
    grainCanvasCache.width = w;
    grainCanvasCache.height = h;
    const gCtx = grainCanvasCache.getContext('2d');
    const imgData = gCtx.createImageData(w, h);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.45) {
        const noise = (Math.random() - 0.5) * intensity * 2.8;
        const val = 128 + noise;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.min(255, intensity * 2.5);
      }
    }
    gCtx.putImageData(imgData, 0, 0);
    grainCacheKey = cacheKey;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCanvasCache, x, y);
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

// Helper: Frame Patterns
function drawFramePattern(ctx, width, height, patternType, baseColor, scaleFactor) {
  ctx.save();
  ctx.fillStyle = baseColor;
  const cornerRadius = 6 * scaleFactor;
  drawRoundedRect(ctx, 0, 0, width, height, cornerRadius);
  ctx.fill();

  ctx.globalCompositeOperation = 'multiply';

  if (patternType === 'dots') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 15 * scaleFactor; x < width; x += 25 * scaleFactor) {
      for (let y = 15 * scaleFactor; y < height; y += 25 * scaleFactor) {
        ctx.beginPath();
        ctx.arc(x, y, 3 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternType === 'grid') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.lineWidth = 1 * scaleFactor;
    for (let x = 20 * scaleFactor; x < width; x += 25 * scaleFactor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 20 * scaleFactor; y < height; y += 25 * scaleFactor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
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

function drawFrameTexture(ctx, width, height, textureType, scaleFactor) {
  if (!textureType || textureType === 'smooth') return;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  if (textureType === 'paper') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < width; i += 4 * scaleFactor) {
      for (let j = 0; j < height; j += 4 * scaleFactor) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 2 * scaleFactor, 2 * scaleFactor);
        }
      }
    }
  } else if (textureType === 'canvas') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let i = 0; i < width; i += 6 * scaleFactor) {
      ctx.fillRect(i, 0, 1 * scaleFactor, height);
    }
    for (let j = 0; j < height; j += 6 * scaleFactor) {
      ctx.fillRect(0, j, width, 1 * scaleFactor);
    }
  } else if (textureType === 'distressed') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1 * scaleFactor;
    for (let k = 0; k < 15; k++) {
      ctx.beginPath();
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 60 * scaleFactor, sy + (Math.random() - 0.5) * 60 * scaleFactor);
      ctx.stroke();
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
