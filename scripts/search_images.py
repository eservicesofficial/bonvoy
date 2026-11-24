#!/usr/bin/env python3
"""Search images for each app asset slot — low concurrency, retries, incremental manifest."""
import json, subprocess, os, time, threading
from concurrent.futures import ThreadPoolExecutor, as_completed

OUT_DIR = "/tmp/imgsearch"
MANIFEST = os.path.join(OUT_DIR, "manifest.json")
os.makedirs(OUT_DIR, exist_ok=True)

QUERIES = {
    "hero-delhi":       "New Delhi India Gate aerial view with city skyline and green trees",
    "westin-kolkata":   "modern hotel skyscraper tower illuminated at night blue hour",
    "pool-resort":      "luxury tropical resort swimming pool aerial view with palm trees",
    "ranthambore":      "open safari jeep driving through dry golden grassland savanna",
    "shanghai":         "Shanghai cable bridge at sunset with orange sky and city skyline",
    "goa":              "Goa beach with palm trees leaning over the sand at golden sunset",
    "kolkata-victoria": "Victoria Memorial Kolkata white marble building with water reflection",
    "mumbai-night":     "Mumbai skyscraper tower illuminated at night with city lights below",
    "restaurant-interior": "elegant luxury restaurant interior with chandeliers and floor to ceiling windows",
    "biryani":          "Indian biryani rice dish served in a pot with curries and flatbread on table",
    "courtyard-hotel":  "Courtyard by Marriott hotel building exterior with entrance driveway",
    "goan-escapade":    "people with surfboards walking on the beach at sunset silhouette",
    "mussoorie":        "mountain resort terrace with wicker armchairs overlooking Himalayan mountains",
    "fairfield-room":   "modern hotel guest room interior with white bed and window city view",
    "fern-lobby":       "hotel lobby reception desk interior with warm lighting",
    "renaissance-goa":  "resort infinity swimming pool with cabanas and loungers overlooking green hills",
    "bangkok":          "Bangkok Wat Arun temple with tuk tuk taxi at sunset",
    "kuala-lumpur":     "Kuala Lumpur Petronas Twin Towers with dramatic storm clouds",
    "bali":             "Bali Ulun Danu Beratan temple on the lake at sunset",
    "phuket":           "Phuket Thailand limestone cliffs with longtail boat on turquoise sea",
    "bangkok-rooftop":  "Bangkok rooftop restaurant terrace overlooking city skyline at dusk",
    "nyc-marriott":     "New York Marriott Marquis hotel in Times Square with yellow taxis",
    "orlando-marriott": "large Orlando resort hotel with swimming pools aerial view",
    "swiggy-food":      "picnic food spread with pizza burger fries and paper bag on grass",
}

def load_manifest():
    if os.path.exists(MANIFEST):
        with open(MANIFEST) as f:
            d = json.load(f)
        return d.get("found", {}), d.get("missing", {})
    return {}, {}

lock = threading.Lock()
found, missing = load_manifest()

def save():
    with lock:
        with open(MANIFEST, "w") as f:
            json.dump({"found": found, "missing": missing}, f, indent=2)

def search_one(name, query, attempts=3):
    out = os.path.join(OUT_DIR, f"{name}.json")
    for i in range(attempts):
        cmd = ["z-ai", "image-search", "-q", query, "--count", "2", "--no-rank", "--gl", "us", "-o", out]
        try:
            subprocess.run(cmd, capture_output=True, text=True, timeout=150)
            if os.path.exists(out):
                with open(out) as f:
                    data = json.load(f)
                if data.get("success") and data.get("results"):
                    return name, [x["original_url"] for x in data["results"]], None
                err = data.get("error") or "empty"
            else:
                err = (subprocess.run(cmd, capture_output=True, text=True).stderr or "no file")[-120:]
        except Exception as e:
            err = str(e)[:120]
        err_short = ("429" if "429" in err else err)[:60]
        print(f"  attempt {i+1} failed for {name}: {err_short}", flush=True)
        if i < attempts - 1:
            time.sleep(25 * (i + 1))
    return name, [], err

todo = {n: q for n, q in QUERIES.items() if n not in found}
print(f"Already found: {sorted(found.keys())}", flush=True)
print(f"To search: {len(todo)}", flush=True)
time.sleep(20)  # let the rate limiter cool down

with ThreadPoolExecutor(max_workers=2) as ex:
    futs = {ex.submit(search_one, n, q): n for n, q in todo.items()}
    done = 0
    for fut in as_completed(futs):
        name, urls, err = fut.result()
        done += 1
        with lock:
            if urls:
                found[name] = urls
                missing.pop(name, None)
            else:
                missing[name] = err
        save()
        print(f"[{done}/{len(todo)}] {name}: {'OK ' + str(len(urls)) if urls else 'MISSING: ' + str(err)[:80]}", flush=True)

print(f"\nDONE. found={len(found)} missing={len(missing)}", flush=True)
if missing:
    print("MISSING:", json.dumps({k: str(v)[:60] for k, v in missing.items()}, indent=2), flush=True)
