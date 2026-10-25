/**
 * Image build step.
 *
 *   node scripts/optimize-images.mjs        (or: npm run images)
 *
 * Reads masters from `assets-src/` and writes web-ready derivatives to
 * `public/img/`. Masters live OUTSIDE `public/` on purpose — Vite copies all of
 * `public/` into `dist/` verbatim, so keeping a 1 MB original there shipped it
 * to every visitor even though nothing referenced it.
 *
 * For each master it emits WebP at several widths plus one optimised JPEG (or
 * PNG, where transparency matters) as the fallback for the ~3% of browsers
 * without WebP. It also prints a dimensions table, because intrinsic
 * width/height on every <img> is what stops the page reflowing as images land.
 *
 * Re-run it whenever a master changes. Output is deterministic, so committing
 * `public/img/` is fine.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/img';

/** Widths are driven by how each image is actually laid out, not a generic ladder. */
const PLAN = {
  'magallanes-aerial-hero': { widths: [768, 1152, 1365], fallback: 'jpeg', quality: 76 },
  mags: { widths: [320, 640], fallback: 'jpeg', quality: 80 },
  'bitaug-shore': { widths: [400, 800, 1264], fallback: 'jpeg', quality: 78 },
  'mangrove-delta': { widths: [400, 800, 1264], fallback: 'jpeg', quality: 78 },
  'fish-landing': { widths: [400, 800, 1264], fallback: 'jpeg', quality: 78 },
  seal: { widths: [64, 128, 256], fallback: 'png', quality: 90 },
};

/* Tourism photographs all come from the same source pool and are laid out the
 * same way (lead image, then a thumbnail strip), so one plan covers them all
 * instead of naming every file. */
const TOURISM_PLAN = { widths: [400, 800, 1600], fallback: 'jpeg', quality: 78 };

/* Browser-tab icons, cut from the seal master at the exact sizes browsers ask for — a
 * 256px seal scaled down to 16–32px by the browser comes out blurry. Written to the
 * `public/` root so index.html can link them as /favicon-*.png. */
const FAVICON_SIZES = [32, 48, 180];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function writeFavicons() {
  const src = path.join(SRC, 'seal.png');
  console.log('\nfavicons (from seal.png)');
  for (const size of FAVICON_SIZES) {
    const out = path.join('public', `favicon-${size}.png`);
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`  png  ${String(size).padStart(4)}px  ${kb((await stat(out)).size).padStart(8)}  ${out}`);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  /* `assets-src/tourism/` holds the destination photography; everything at the
   * top level is chrome and one-off page imagery. */
  const top = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const tourism = (await readdir(path.join(SRC, 'tourism')).catch(() => [])).filter((f) =>
    /\.(jpe?g|png)$/i.test(f)
  );
  const files = [...top, ...tourism.map((f) => path.join('tourism', f))];
  if (files.length === 0) {
    console.error(`No masters found in ${SRC}/`);
    process.exit(1);
  }

  const manifest = {};
  let before = 0;
  let after = 0;

  for (const file of files) {
    const base = path.parse(file).name;
    const plan = PLAN[base] ?? (file.startsWith('tourism') ? TOURISM_PLAN : undefined);
    if (!plan) {
      console.warn(`  ! no plan for "${base}" — skipped`);
      continue;
    }

    const srcPath = path.join(SRC, file);
    const meta = await sharp(srcPath).metadata();
    before += (await stat(srcPath)).size;

    console.log(`\n${file}  ${meta.width}x${meta.height}`);
    const widest = Math.min(Math.max(...plan.widths), meta.width);
    manifest[base] = { width: widest, height: Math.round((meta.height / meta.width) * widest) };

    for (const w of plan.widths) {
      if (w > meta.width) continue;
      const out = path.join(OUT, `${base}-${w}.webp`);
      await sharp(srcPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: plan.quality }).toFile(out);
      const size = (await stat(out)).size;
      after += size;
      console.log(`  webp ${String(w).padStart(4)}w  ${kb(size).padStart(8)}`);
    }

    // One fallback at the widest size for browsers without WebP.
    const fbExt = plan.fallback === 'png' ? 'png' : 'jpg';
    const fbPath = path.join(OUT, `${base}-${widest}.${fbExt}`);
    const pipeline = sharp(srcPath).resize({ width: widest, withoutEnlargement: true });
    await (plan.fallback === 'png'
      ? pipeline.png({ compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: plan.quality, mozjpeg: true })
    ).toFile(fbPath);
    const fbSize = (await stat(fbPath)).size;
    after += fbSize;
    console.log(`  ${fbExt.padEnd(4)} ${String(widest).padStart(4)}w  ${kb(fbSize).padStart(8)}  (fallback)`);
  }

  await writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFavicons();

  console.log('\n────────────────────────────────');
  console.log(`  masters   ${kb(before).padStart(9)}`);
  console.log(`  generated ${kb(after).padStart(9)}  (all widths + fallbacks combined)`);
  console.log(`  a visitor downloads ONE width, not all of them.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
