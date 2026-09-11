"""Vendor Glow Sans SC v0.93 as common subsets and a rare-glyph fallback."""
from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
from zipfile import ZipFile
from io import BytesIO
from fontTools.ttLib import TTFont
from fontTools import subset
from common_cjk import common_faces, common_groups, unicode_ranges
import logging
import time

logging.getLogger('fontTools').setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'artifacts/font-sources'
DEST = ROOT / 'assets/chinese'
CACHE.mkdir(parents=True, exist_ok=True)
DEST.mkdir(parents=True, exist_ok=True)

def vendor(width):
    archive = CACHE / f'GlowSansSC-{width}-v0.93.zip'
    url = f'https://github.com/welai/glow-sans/releases/download/v0.93/{archive.name}'
    if not archive.exists():
        for attempt in range(3):
            try:
                with urlopen(Request(url, headers={'User-Agent':'EasyCV-font-vendor'}), timeout=45) as response:
                    data = response.read()
                archive.write_bytes(data); break
            except OSError:
                if attempt == 2: raise
                time.sleep(1)
    faces = []
    with ZipFile(archive) as zipped:
        for suffix, weight in [('Regular',400),('Bold',700)]:
            raw = zipped.read(f'GlowSansSC-{width}-{suffix}.otf')
            family = f'Glow Sans SC {width}'; prefix = f'glow-{width.lower()}-{weight}'
            coverage = set(TTFont(BytesIO(raw)).getBestCmap())
            common = {code for group in common_groups(coverage) for code in group}
            basic = {code for code in coverage if code < 0x3400 or 0xFF00 <= code < 0xFFEF}
            rare = coverage - common - basic
            for label, codes in [('basic',basic),('rare',rare)]:
                filename = f'{prefix}-{label}.woff2'
                if not (DEST / filename).exists():
                    font = TTFont(BytesIO(raw)); options = subset.Options()
                    options.name_IDs=['*']; options.name_legacy=True
                    worker=subset.Subsetter(options=options); worker.populate(unicodes=codes); worker.subset(font)
                    font.flavor='woff2'; font.save(DEST / filename)
                faces.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url({filename}) format('woff2');unicode-range:{unicode_ranges(codes)}}}")
            faces.extend(common_faces(raw, DEST, family, prefix, weight))
            print(width, suffix, len(coverage), 'characters; grouped by common usage', flush=True)
    return faces

if __name__ == '__main__':
    (DEST / 'GlowSans-OFL.txt').write_bytes(urlopen('https://raw.githubusercontent.com/welai/glow-sans/master/OFL.txt', timeout=30).read())
    results = list(ThreadPoolExecutor(2).map(vendor, ['Normal','Condensed']))
    css = '\n'.join(line for result in results for line in result)+'\n'
    (DEST / 'fonts.css').write_text(css, encoding='utf-8')
    print('Vendored common Chinese subsets and rare-glyph fallback.', flush=True)
