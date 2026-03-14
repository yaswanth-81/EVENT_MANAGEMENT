import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const router = express.Router();

const uploadsDir = path.resolve(process.cwd(), '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^\w\d-]/g, '_');
    const ts = Date.now();
    cb(null, `${base}_${ts}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/image', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // public path that frontend can use
  const relative = `/uploads/${req.file.filename}`;
  return res.status(201).json({ message: 'Uploaded', path: relative });
});

export default router;

