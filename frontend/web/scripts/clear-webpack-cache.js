const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache');

try {
  fs.rmSync(cacheDir, { recursive: true, force: true });
} catch (error) {
  console.warn(`Unable to clear webpack cache at ${cacheDir}:`, error.message);
}