// Download retry images (prefer non-stock sources), overwrite public/img/<name>.jpg
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const MANIFEST = "/tmp/imgsearch/retry-manifest.json";
const OUT_DIR = "/home/z/my-project/public/img";

(async () => {
  const { found } = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  for (const [name, results] of Object.entries(found)) {
    let ok = false, lastErr = "";
    for (const r of results) {
      try {
        const res = await fetch(r.original_url, { signal: AbortSignal.timeout(60000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const img = sharp(buf, { failOn: "none" }).rotate();
        const meta = await img.metadata();
        if (!meta.width || !meta.height) throw new Error("not an image");
        const out = path.join(OUT_DIR, `${name}.jpg`);
        await img
          .resize({ width: Math.min(meta.width, 1200), withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toFile(out);
        const stats = await sharp(out).stats();
        const stdevSum = stats.channels.reduce((a, c) => a + c.stdev, 0);
        if (stdevSum < 6) throw new Error("blank");
        console.log(`${name}: OK via ${r.source} (${meta.width}x${meta.height})`);
        ok = true;
        break;
      } catch (e) {
        lastErr = e.message;
      }
    }
    if (!ok) console.log(`${name}: FAILED ${lastErr}`);
  }
})();
