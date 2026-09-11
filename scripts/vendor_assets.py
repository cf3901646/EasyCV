"""Fetch the existing open fonts/icons for offline use. Run only when updating assets."""
from pathlib import Path
import urllib.request
import re
from io import BytesIO
from fontTools.ttLib import TTFont
from concurrent.futures import ThreadPoolExecutor

root = Path(__file__).resolve().parents[1]
assets = root / 'assets'
assets.mkdir(exist_ok=True)
def fetch(url):
    return urllib.request.urlopen(url, timeout=40).read()

base = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/'
css = fetch(base + 'css/all.min.css').decode()
for name in ['solid', 'regular', 'brands']:
    filename = f'fa-{name}-' + ('900' if name == 'solid' else '400') + '.woff2'
    (assets / filename).write_bytes(fetch(base + 'webfonts/' + filename))
# Drop unused legacy TTF sources and use relative WOFF2 files.
css = re.sub(r',url\([^)]*\.ttf\) format\("truetype"\)', '', css)
css = css.replace('../webfonts/', '')
(assets / 'icons.css').write_text(css, encoding='utf-8')
(assets / 'Font-Awesome-LICENSE.txt').write_bytes(fetch('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.4.0/LICENSE.txt'))

families = ['Inter', 'Outfit', 'Roboto', 'JetBrains+Mono']
url = 'https://fonts.googleapis.com/css2?' + '&'.join('family=' + f + ':wght@300;400;500;600;700;800;900' for f in families[:-1]) + '&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap'
css = fetch(url).decode()
urls = list(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css)))
def save(pair):
    i, url = pair
    name = f'type-{i}.woff2'
    font = TTFont(BytesIO(fetch(url)))
    font.flavor = 'woff2'
    font.save(assets / name)
    return url, name
with ThreadPoolExecutor(max_workers=6) as executor:
    for url, name in executor.map(save, enumerate(urls)):
        css = css.replace(url, name)
css = css.replace("format('truetype')", "format('woff2')")
(assets / 'fonts.css').write_text(css, encoding='utf-8')
for name in ['inter', 'outfit', 'roboto', 'jetbrainsmono']:
    (assets / f'{name}-OFL.txt').write_bytes(fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{name}/OFL.txt'))

p = root / 'index.html'
html = p.read_text(encoding='utf-8')
html = re.sub(r'    <!-- 引入 Google Fonts[\s\S]*?(?=    <link rel="stylesheet" href="style.css">)', '    <link rel="stylesheet" href="assets/fonts.css">\n    <link rel="stylesheet" href="assets/icons.css">\n', html)
p.write_text(html, encoding='utf-8')
print('Vendored', len(urls), 'font files and 3 icon fonts.')
