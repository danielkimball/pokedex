#!/usr/bin/env python3

"""Remove source-card stage UI from the exact Gen IV art crops used by #001-151.

D&P and Platinum cards place the previous-evolution medallion partly over the
illustration. Their old crop began inside that medallion. Stage 1/2 crops now
start below the source UI; HGSS crops retain their taller art because that
block keeps its evolution UI entirely in the header.
"""

import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROFILE_FILE = ROOT / 'src/core/constants/gen4-tcg-profiles.generated.ts'
OUT_ROOT = ROOT / 'public/cards/gen4'
CACHE = ROOT / 'tmp/gen4/hi_cache'
HOLE_ASPECT = 1.455


def load_profiles():
    source = PROFILE_FILE.read_text()
    match = re.search(r'GEN4_TCG_PROFILES_BY_ART[^=]*= (\{[\s\S]*\});\s*$', source)
    if not match:
        raise RuntimeError(f'Cannot parse profiles from {PROFILE_FILE}')
    return json.loads(match.group(1))


def crop_profile(profile):
    era = profile['era']
    stage = profile.get('stage')
    if era == 'hgss':
        return 0.096, 0.524
    if stage in ('Stage1', 'Stage2'):
        return 0.172, 0.495
    return 0.100, 0.495


def download(card_id, cache_path):
    with urllib.request.urlopen(f'https://api.tcgdex.net/v2/en/cards/{card_id}') as response:
        card = json.load(response)
    request = urllib.request.Request(card['image'] + '/high.png', headers={'User-Agent': 'pokedex-data-builder/1.0'})
    with urllib.request.urlopen(request) as response:
        cache_path.write_bytes(response.read())


def recrop(item):
    art_path, profile = item
    card_id = profile['cardId']
    cache_path = CACHE / f"{card_id.replace('-', '_', 1)}.png"
    if not cache_path.exists() or cache_path.stat().st_size < 5000:
        download(card_id, cache_path)

    image = Image.open(cache_path).convert('RGB')
    width, height = image.size
    top, bottom = crop_profile(profile)
    crop_height = bottom - top
    width_fraction = min(HOLE_ASPECT * crop_height * height / width, 0.92)
    left = (1 - width_fraction) / 2
    box = (
        round(left * width),
        round(top * height),
        round((left + width_fraction) * width),
        round(bottom * height),
    )
    output = ROOT / 'public' / art_path.removeprefix('/')
    output.parent.mkdir(parents=True, exist_ok=True)
    image.crop(box).save(output, 'JPEG', quality=90, optimize=True)
    return art_path, profile['era'], profile.get('stage'), box


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    items = list(load_profiles().items())
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(recrop, item) for item in items]
        for future in as_completed(futures):
            results.append(future.result())
    evolved = sum(1 for _, era, stage, _ in results if era != 'hgss' and stage in ('Stage1', 'Stage2'))
    print(f'Recropped {len(results)} Gen IV source images; removed D&P/Platinum stage UI from {evolved}.')


if __name__ == '__main__':
    main()
