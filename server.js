import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static assets & uploaded files
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'dist')));

// High Quality Image Upload Handler (Original File Resolution & Name)
app.post('/api/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  try {
    const rawFilename = req.headers['x-filename'] 
      ? decodeURIComponent(req.headers['x-filename'])
      : `photo-${Date.now()}.jpg`;

    const parsed = path.parse(rawFilename);
    const safeName = `${parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}${parsed.ext || '.jpg'}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, req.body);

    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.send('PoloSnap Studio Server Running. Run npm run build first.');
  }
});

app.listen(PORT, () => {
  console.log(`PoloSnap Studio server listening at http://localhost:${PORT}`);
});
