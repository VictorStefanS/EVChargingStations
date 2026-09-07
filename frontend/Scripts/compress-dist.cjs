const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const DIST = path.resolve(__dirname, '..', 'dist');
const EXTENSIONS = ['.js', '.css', '.html', '.json', '.svg', '.txt', '.map'];

async function compressFile(file) {
  const full = path.resolve(DIST, file);
  const data = fs.readFileSync(full);
  // gzip
  const gz = await gzip(data, { level: zlib.constants.Z_BEST_COMPRESSION });
  fs.writeFileSync(full + '.gz', gz);
  // brotli
  try {
    const br = await brotli(data, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    });
    fs.writeFileSync(full + '.br', br);
  } catch (err) {
    console.warn('brotli failed for', file, err.message);
  }
  console.log('Compressed', file);
}

async function walk(dir, prefix = '') {
  const entries = await readdir(dir);
  for (const name of entries) {
    const full = path.join(dir, name);
    const rel = path.join(prefix, name);
    const s = await stat(full);
    if (s.isDirectory()) {
      await walk(full, rel);
    } else {
      const ext = path.extname(name).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        await compressFile(rel);
      }
    }
  }
}

(async () => {
  if (!fs.existsSync(DIST)) {
    console.error('dist directory not found. Run build first.');
    process.exit(1);
  }
  await walk(DIST);
  console.log('Compression completed.');
})();
