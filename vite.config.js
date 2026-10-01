import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function uploadMiddlewarePlugin() {
  return {
    name: 'upload-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/upload' && req.method === 'POST') {
          try {
            const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filenameHeader = req.headers['x-filename'] 
              ? decodeURIComponent(req.headers['x-filename'])
              : `photo-${Date.now()}.jpg`;

            // Clean filename to preserve original extension while preventing path traversal
            const parsed = path.parse(filenameHeader);
            const safeName = `${parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}${parsed.ext || '.jpg'}`;
            const filePath = path.join(uploadsDir, safeName);

            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
              const buffer = Buffer.concat(chunks);
              fs.writeFileSync(filePath, buffer);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                url: `/uploads/${safeName}`,
                filename: safeName
              }));
            });
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), uploadMiddlewarePlugin()],
});
