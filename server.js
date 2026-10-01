import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9603;

const distDir = path.join(__dirname, 'dist');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static assets & uploaded files
app.use('/uploads', express.static(uploadsDir));

// Vite build
app.use(express.static(distDir));

// ===============================
// Image upload API
// ===============================

app.post(
  '/api/upload',
  express.raw({
    type: '*/*',
    limit: '50mb'
  }),
  (req, res) => {
    try {
      const rawFilename = req.headers['x-filename']
        ? decodeURIComponent(req.headers['x-filename'])
        : `photo-${Date.now()}.jpg`;

      const parsed = path.parse(rawFilename);

      const safeName =
        `${parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_')}` +
        `_${Date.now()}` +
        `${parsed.ext || '.jpg'}`;

      const filePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(filePath, req.body);

      console.log(`Uploaded: ${safeName}`);

      res.json({
        success: true,
        url: `/uploads/${safeName}`,
        filename: safeName
      });

    } catch (err) {
      console.error('Upload error:', err);

      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

// ===============================
// React/Vite SPA fallback
// ===============================

app.get('/{*splat}', (req, res) => {
  const distIndex = path.join(distDir, 'index.html');

  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.status(404).send(
      'PoloSnap Studio Server Running. Run npm run build first.'
    );
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`PoloSnap Studio running at http://0.0.0.0:${PORT}`);
});