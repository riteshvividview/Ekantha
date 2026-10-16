import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const WORKSPACE = 'c:/VividView Websites/Ekantha/web';
const CONTENT_MD = 'C:/Users/Vivid View/.gemini/antigravity-ide/brain/85c1443a-5ca7-41e6-b2b9-86a81aa62a9a/.system_generated/steps/74/content.md';

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const raw = fs.readFileSync(CONTENT_MD, 'utf8');
  const jsonStart = raw.indexOf('{');
  const bundle = JSON.parse(raw.slice(jsonStart));

  // 1. Ensure directories exist
  const dirs = [
    path.join(WORKSPACE, 'src/shaders/landing-pages'),
    path.join(WORKSPACE, 'public/landing-pages/inner-green-assets'),
  ];
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // 2. Extract code files from bundle
  for (const f of bundle.files) {
    if (f.code) {
      const outPath = path.join(WORKSPACE, f.path);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, f.code, 'utf8');
      const hash = crypto.createHash('sha256').update(f.code).digest('hex');
      console.log(`Extracted: ${f.path} (sha match: ${hash === f.sha256})`);
    }
  }

  // 3. Download registered HTML and assets
  const downloads = [
    {
      url: 'https://threeui.com/landing-pages/inner-green-3d.html',
      path: path.join(WORKSPACE, 'public/landing-pages/inner-green-3d.html'),
    },
    {
      url: 'https://threeui.com/landing-pages/inner-green-assets/three.min.js',
      path: path.join(WORKSPACE, 'public/landing-pages/inner-green-assets/three.min.js'),
    },
    {
      url: 'https://threeui.com/landing-pages/inner-green-assets/card-ecostove.jpg',
      path: path.join(WORKSPACE, 'public/landing-pages/inner-green-assets/card-ecostove.jpg'),
    },
    {
      url: 'https://threeui.com/landing-pages/inner-green-assets/card-ethos.jpg',
      path: path.join(WORKSPACE, 'public/landing-pages/inner-green-assets/card-ethos.jpg'),
    },
    {
      url: 'https://threeui.com/landing-pages/inner-green-assets/lexend-latin.woff2',
      path: path.join(WORKSPACE, 'public/landing-pages/inner-green-assets/lexend-latin.woff2'),
    },
  ];

  for (const item of downloads) {
    console.log(`Downloading ${item.url}...`);
    const buf = await download(item.url);
    fs.writeFileSync(item.path, buf);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    console.log(`Saved: ${item.path} (${buf.length} bytes, sha256: ${hash})`);
  }

  console.log('Setup finished successfully!');
}

main().catch(console.error);
