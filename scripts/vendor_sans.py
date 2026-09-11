"""Vendor official OFL fonts. Noto is split by Unicode range for lazy local loading."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import quote
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor
from fontTools.ttLib import TTFont
from fontTools import subset
from common_cjk import common_faces
import json

root = Path(__file__).resolve().parents[1]
dest = root / 'assets' / 'sans'
dest.mkdir(exist_ok=True)
cache = root / 'artifacts' / 'font-sources'
cache.mkdir(exist_ok=True)

def fetch(url):
    return urlopen(Request(url, headers={'User-Agent':'EasyCV-font-vendor'}), timeout=90).read()

def download(family):
    files = json.loads(fetch(f'https://api.github.com/repos/google/fonts/contents/ofl/{family}'))
    source = next(f for f in files if f['name'].endswith('.ttf') and 'Italic' not in f['name'])
    path = cache / source['name']
    if not path.exists(): path.write_bytes(fetch(source['download_url']))
    (dest / f'{family}-OFL.txt').write_bytes(fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt'))
    return family, path

css = []
sources = dict(ThreadPoolExecutor(3).map(download, ['manrope','dmsans','notosanssc']))
for family, title in [('manrope','Manrope'),('dmsans','DM Sans')]:
    font = TTFont(sources[family]); font.flavor = 'woff2'; font.save(dest / f'{family}.woff2')
    weight = next(axis for axis in font['fvar'].axes if axis.axisTag == 'wght')
    css.append(f"@font-face{{font-family:'{title}';font-style:normal;font-weight:{weight.minValue:g} {weight.maxValue:g};font-display:swap;src:url({family}.woff2) format('woff2')}}")

noto_path = sources['notosanssc']
coverage = sorted(TTFont(noto_path).getBestCmap())
# Each 512-codepoint shard retains variable weights. Browsers request only shards used by text.
buckets = sorted(set(c // 512 for c in coverage))
for bucket in buckets:
    codes = [c for c in coverage if c // 512 == bucket]
    font = TTFont(noto_path)
    opts = subset.Options(); opts.flavor = 'woff2'; opts.name_IDs = ['*']; opts.name_legacy = True
    worker = subset.Subsetter(options=opts); worker.populate(unicodes=codes); worker.subset(font)
    font.flavor = 'woff2'; filename = f'noto-sc-{bucket:x}.woff2'; font.save(dest / filename)
    css.append(f"@font-face{{font-family:'Noto Sans SC';font-style:normal;font-weight:100 900;font-display:swap;src:url({filename}) format('woff2');unicode-range:U+{bucket*512:X}-{bucket*512+511:X}}}")
(dest / 'fonts.css').write_text('\n'.join(css)+'\n', encoding='utf-8')
(dest / 'common.css').write_text('\n'.join(common_faces(noto_path.read_bytes(), dest, 'Noto Sans SC', 'noto-sc', '100 900'))+'\n', encoding='utf-8')
print(f'Vendored Manrope, DM Sans and {len(buckets)} lazy Noto Sans SC shards.')
