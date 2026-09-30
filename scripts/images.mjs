// raw/*.png (generated packshots) -> public/img/*.webp, 800px.
// Every packshot background is scaled per channel to the same tone (--color-photo) so tiles read as one catalog.
// Lifestyle photos are real Pexels shots (raw-real/SURSE.md) and are not touched here.
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const src = fileURLToPath(new URL('../raw/', import.meta.url));
const out = fileURLToPath(new URL('../public/img/', import.meta.url));
const TARGET = [243, 242, 240];
await mkdir(out, { recursive: true });

async function cornerColor(file) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const s = 24;
  const spots = [
    [8, 8],
    [width - s - 8, 8],
  ];
  const acc = [0, 0, 0];
  for (const [left, top] of spots) {
    const { data } = await sharp(file).extract({ left, top, width: s, height: s }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 3) for (let c = 0; c < 3; c++) acc[c] += data[i + c];
  }
  const n = (s * s * spots.length);
  return acc.map((v) => v / n);
}

for (const f of await readdir(src)) {
  if (!f.endsWith('.png') || !f.startsWith('p')) continue;
  const file = join(src, f);
  const bg = await cornerColor(file);
  const gain = bg.map((v, c) => TARGET[c] / v);
  await sharp(file)
    .removeAlpha()
    .linear(gain, [0, 0, 0])
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(out, f.replace('.png', '.webp')));
  console.log('ok', f, bg.map(Math.round).join(','));
}
