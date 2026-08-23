#!/usr/bin/env python3

"""Extract missing Gen IV Darkness/Metal energy symbols from source-card scans."""

import json
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'tmp/gen4/hi_cache'
OUT = ROOT / 'public/cards/gen1/energies'

ICONS = {
    # Call of Legends Gengar 94, Darkness weakness symbol.
    'darkness': {'card': 'hgss4-94', 'center': (128, 936), 'radius': 18},
    # HeartGold & SoulSilver Lapras 24, Metal weakness symbol.
    'metal': {'card': 'hgss1-24', 'center': (128, 936), 'radius': 18},
}


def ensure_scan(card_id):
    path = CACHE / f"{card_id.replace('-', '_', 1)}.png"
    if path.exists() and path.stat().st_size >= 5000:
        return path
    with urllib.request.urlopen(f'https://api.tcgdex.net/v2/en/cards/{card_id}') as response:
        card = json.load(response)
    request = urllib.request.Request(card['image'] + '/high.png', headers={'User-Agent': 'pokedex-data-builder/1.0'})
    with urllib.request.urlopen(request) as response:
        path.write_bytes(response.read())
    return path


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, spec in ICONS.items():
        image = Image.open(ensure_scan(spec['card'])).convert('RGBA')
        x, y = spec['center']
        radius = spec['radius']
        crop = image.crop((x - radius, y - radius, x + radius, y + radius))
        mask = Image.new('L', crop.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, crop.width - 1, crop.height - 1), fill=255)
        crop.putalpha(mask)
        crop.resize((240, 240), Image.Resampling.LANCZOS).save(OUT / f'{name}.png', optimize=True)
        print(f'Wrote {OUT / f"{name}.png"}')


if __name__ == '__main__':
    main()
