#!/usr/bin/env node
/**
 * Gera todos os ícones e splash screens do PWA a partir de um único SVG.
 *   npm run icons
 *
 * Saída: public/icons/
 *   icon-192.png, icon-512.png            → ícones comuns
 *   icon-maskable-192.png, -512.png       → com safe zone de 20% para Android
 *   apple-touch-icon.png (180x180)        → iOS
 *   splash-<w>x<h>.png                    → telas de abertura do iOS
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'icons');

const ACCENT = '#5f8a70';
const PAPER = '#faf9f7';

/** O desenho do ícone, em viewBox 512. `inset` cria a safe zone do maskable. */
function iconSvg({ bg = ACCENT, inset = 0, radius = 112 } = {}) {
  const scale = (512 - inset * 2) / 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${inset > 0 ? 0 : radius}" fill="${bg}"/>
  <g transform="translate(${inset} ${inset}) scale(${scale})">
    <path d="M150 126h212a26 26 0 0 1 26 26v234a26 26 0 0 1-26 26H150a26 26 0 0 1-26-26V152a26 26 0 0 1 26-26z" fill="${PAPER}"/>
    <path d="M186 206l26 26 48-52" fill="none" stroke="${ACCENT}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M186 292l26 26 48-52" fill="none" stroke="${ACCENT}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M292 214h40M292 300h40" stroke="#b9c7bd" stroke-width="20" stroke-linecap="round"/>
    <path d="M186 372h146" stroke="#d8ded9" stroke-width="20" stroke-linecap="round"/>
  </g>
</svg>`;
}

const SPLASH_SIZES = [
  [1179, 2556],
  [1170, 2532],
  [1284, 2778],
  [1125, 2436],
  [828, 1792],
  [1536, 2048],
];

async function png(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(outDir, file));
  console.log('  ✓', file, `${size}×${size}`);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const plain = iconSvg();
  // Maskable: 20% de inset (safe zone) e fundo sangrando até a borda.
  const maskable = iconSvg({ inset: 52, radius: 0 });

  console.log('Ícones:');
  await png(plain, 192, 'icon-192.png');
  await png(plain, 512, 'icon-512.png');
  await png(maskable, 192, 'icon-maskable-192.png');
  await png(maskable, 512, 'icon-maskable-512.png');
  await png(plain, 180, 'apple-touch-icon.png');
  // O apple-touch-icon também é referenciado na raiz pelo includeAssets.
  await sharp(Buffer.from(plain)).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png 180×180 (raiz)');

  console.log('Splash screens iOS:');
  for (const [w, h] of SPLASH_SIZES) {
    const logo = Math.round(Math.min(w, h) * 0.32);
    const buf = await sharp(Buffer.from(plain)).resize(logo, logo).png().toBuffer();
    await sharp({ create: { width: w, height: h, channels: 4, background: PAPER } })
      .composite([{ input: buf, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, `splash-${w}x${h}.png`));
    console.log('  ✓', `splash-${w}x${h}.png`);
  }

  // Guarda o SVG-fonte junto aos ícones, para quem quiser ajustar o desenho.
  await writeFile(path.join(outDir, 'source.svg'), plain, 'utf8');
  console.log('\nPronto. Arquivos em public/icons/.');
}

main().catch((err) => {
  console.error('Falha ao gerar ícones:', err);
  process.exit(1);
});
