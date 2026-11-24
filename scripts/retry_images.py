#!/usr/bin/env python3
"""Re-search images that came back watermarked/wrong; prefer non-stock sources."""
import json, subprocess, os, time, threading
from concurrent.futures import ThreadPoolExecutor, as_completed

OUT_DIR = "/tmp/imgsearch"
os.makedirs(OUT_DIR, exist_ok=True)

RETRY = {
    "ranthambore":      "tiger safari jeep on dusty track in Ranthambore national park India",
    "kolkata-victoria": "Victoria Memorial marble palace Kolkata with pond reflection daytime",
    "swiggy-food":      "burgers pizza and fries takeaway food spread on wooden table",
    "mussoorie":        "mountain valley view from hillside resort terrace with chairs Uttarakhand",
    "mumbai-night":     "Mumbai skyline at night with illuminated high rise buildings",
    "pool-resort":      "aerial top view of resort swimming pool with sun loungers and palm trees",
    "shanghai":         "Shanghai skyline with modern bridge crossing the river at dusk",
    "bangkok-rooftop":  "rooftop restaurant terrace with tables overlooking Bangkok skyline at night",
    "nyc-marriott":     "Times Square New York street with yellow taxis and large billboards",
}

BAD_SOURCES = ("alamy", "dreamstime", "123rf", "istock", "gettyimages", "shutterstock", "stockphoto", "stock.adobe", "freepik", "vecteezy")

def search_one(name, query, attempts=3):
    out = os.path.join(OUT_DIR, f"retry-{name}.json")
    for i in range(attempts):
        cmd = ["z-ai", "image-search", "-q", query, "--count", "8", "--no-rank", "--gl", "us", "-o", out]
        try:
            subprocess.run(cmd, capture_output=True, text=True, timeout=150)
            if os.path.exists(out):
                with open(out) as f:
                    data = json.load(f)
                if data.get("success") and data.get("results"):
                    return name, data["results"], None
                err = data.get("error") or "empty"
            else:
                err = "no file"
        except Exception as e:
            err = str(e)[:100]
        print(f"  attempt {i+1} failed for {name}: {str(err)[:60]}", flush=True)
        if i < attempts - 1:
            time.sleep(20 * (i + 1))
    return name, [], err

def clean_candidates(results):
    good = [r for r in results if not any(b in (r.get("source") or "").lower() for b in BAD_SOURCES)]
    return good + [r for r in results if r not in good]

found, missing = {}, {}
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(search_one, n, q): n for n, q in RETRY.items()}
    for fut in as_completed(futs):
        name, results, err = fut.result()
        if results:
            found[name] = clean_candidates(results)
        else:
            missing[name] = str(err)
        print(f"{name}: {len(results)} raw -> {len(found.get(name, []))} clean", flush=True)

with open(os.path.join(OUT_DIR, "retry-manifest.json"), "w") as f:
    json.dump({"found": found, "missing": missing}, f, indent=2)
print("DONE", {k: len(v) for k, v in found.items()}, "missing:", list(missing.keys()))
