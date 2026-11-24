// Download each manifest candidate, normalize to JPEG (max 1200w), save to public/img.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const MANIFEST = "/tmp/imgsearch/manifest.json";
const OUT_DIR = "/home/z/my-project/public/img";

(async () => {
  const { found } = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const report = [];
  for (const [name, urls] of Object.entries(found)) {
    let ok = false, lastErr = "";
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
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
        // reject blank/near-uniform images
        const stdevSum = stats.channels.reduce((a, c) => a + c.stdev, 0);
        if (stdevSum < 6) throw new Error(`blank image (stdev ${stdevSum.toFixed(1)})`);
        const kb = Math.round(fs.statSync(out).size / 1024);
        report.push(`${name}: OK ${meta.width}x${meta.height} -> ${kb}KB`);
        ok = true;
        break;
      } catch (e) {
        lastErr = e.message;
      }
    }
    if (!ok) report.push(`${name}: FAILED ${lastErr}`);
  }
  console.log(report.join("\n"));
  const fails = report.filter((r) => r.includes("FAILED"));
  console.log(`\nDONE ok=${report.length - fails.length} failed=${fails.length}`);
})();
