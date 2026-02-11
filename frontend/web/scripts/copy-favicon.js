const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'assets', 'images', 'logo.png');
const dest = path.join(__dirname, '..', 'public', 'favicon.png');
const SIZE = 32; // 32x32 looks crisp in tabs; browsers scale to 16x16

function copyFallback() {
  fs.copyFileSync(src, dest);
  console.log('Favicon: copied logo.png (run "npm install" for resized 32x32)');
}

function run() {
  try {
    const sharp = require('sharp');
    sharp(src)
      .resize(SIZE, SIZE)
      .png()
      .toFile(dest)
      .then(() => console.log('Favicon: logo resized to 32x32'))
      .catch((err) => {
        console.warn('Favicon resize failed:', err.message);
        copyFallback();
      });
  } catch (_) {
    copyFallback();
  }
}

run();
