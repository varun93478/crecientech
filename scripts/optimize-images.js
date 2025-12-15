#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Install sharp: npm install sharp');
  process.exit(1);
}

const targets = [
  'img/about/About_Crecientech.png',
  'img/home/bg-1.png',
  'img/home/bg-4.jpg',
  'img/home/own-and-implemented.jpg',
  'img/home/joint-development.jpg',
  'img/Services_imgs/agile.jpg',
  'img/Services_imgs/scrum.jpg',
  'img/Services_imgs/engagement.png',
  'img/Services_imgs/engagement-model.png'
];

async function convertToWebp(root) {
  for (const rel of targets) {
    const src = path.join(root, rel);
    const ext = path.extname(src).toLowerCase();
    const out = src.replace(ext, '.webp');
    if (!fs.existsSync(src)) {
      console.warn(`[optimize] missing ${src}`);
      continue;
    }
    try {
      const buf = await sharp(src).webp({ quality: 75 }).toBuffer();
      await fse.writeFile(out, buf);
      const s1 = fs.statSync(src).size, s2 = buf.length;
      console.log(`[optimize] ${rel} -> ${path.relative(root, out)} ${(s1/1024).toFixed(0)}KB → ${(s2/1024).toFixed(0)}KB`);
      // Also recompress original if >100KB
      if (s1 > 100 * 1024) {
        let optimizedBuf;
        if (ext === '.png') optimizedBuf = await sharp(src).png({ quality: 70 }).toBuffer();
        else if (ext === '.jpg' || ext === '.jpeg') optimizedBuf = await sharp(src).jpeg({ quality: 70 }).toBuffer();
        else optimizedBuf = null;
        if (optimizedBuf) {
          const tmp = src + '.opt';
          await fse.writeFile(tmp, optimizedBuf);
          await fse.move(tmp, src, { overwrite: true });
          const s3 = optimizedBuf.length;
          console.log(`[optimize] recompress ${rel} ${(s1/1024).toFixed(0)}KB → ${(s3/1024).toFixed(0)}KB`);
        }
      }
    } catch (e) {
      console.error(`[optimize] failed ${src}: ${e.message}`);
    }
  }
}

convertToWebp(process.cwd()).catch(err => { console.error(err); process.exit(1); });
