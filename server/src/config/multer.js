/**
 * Multer helper for local uploads.
 *
 * - Stores files under `server/uploads/<folderName>/`.
 * - Ensures the target directory exists (recursive mkdir).
 * - Enforces a max file size (defaults to 10MB via env.MAX_FILE_SIZE_MB).
 * - Restricts to image MIME types by default.
 * - Generates unique filenames: <timestamp>_<random>.<ext>.
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { env } = require("./env");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createUploader(folderName, options = {}) {
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const targetDir = path.join(uploadsRoot, folderName);
  ensureDir(targetDir);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(targetDir);
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const base = Date.now().toString();
      const rand = Math.floor(Math.random() * 1e9);
      cb(null, `${base}_${rand}${ext.toLowerCase()}`);
    },
  });

  const maxMb = env.MAX_FILE_SIZE_MB || 10;

  const onlyImages = options.onlyImages !== false;

  const fileFilter = (_req, file, cb) => {
    if (onlyImages && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter,
  });
}

module.exports = { createUploader, ensureDir };

