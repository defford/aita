import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build frontend
console.log('Building frontend...');
execSync('tsc && vite build', { stdio: 'inherit' });

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy backend files to dist
console.log('Copying backend files...');
fs.copyFileSync(
  path.join(__dirname, 'server', 'index.js'),
  path.join(distDir, 'index.js')
);
fs.copyFileSync(
  path.join(__dirname, 'server', 'vercel.json'),
  path.join(distDir, 'vercel.json')
);

// Copy frontend build to dist/public
const publicDir = path.join(distDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy frontend build
fs.cpSync(path.join(__dirname, 'dist'), publicDir, { recursive: true });

console.log('Build complete!');
