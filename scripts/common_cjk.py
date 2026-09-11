"""Group common Chinese glyphs together; Unicode blocks alone overfetch sparse text."""
from fontTools.ttLib import TTFont
from fontTools import subset
from io import BytesIO

def common_groups(coverage):
    codes = []
    # GB2312 first-level Hanzi are ordered by pronunciation, followed by less common Hanzi.
    for high in range(0xB0, 0xF8):
        for low in range(0xA1, 0xFF):
            try: code = ord(bytes([high, low]).decode('gb2312'))
            except UnicodeDecodeError: continue
            if code in coverage: codes.append(code)
    return [codes[i:i+256] for i in range(0, len(codes), 256)]

def unicode_ranges(codes):
    codes = sorted(codes)
    if not codes: return ''
    ranges = []; start = end = codes[0]
    for code in codes[1:]:
        if code == end + 1: end = code
        else:
            ranges.append(f'U+{start:X}-{end:X}'); start = end = code
    ranges.append(f'U+{start:X}-{end:X}')
    return ','.join(ranges)

def common_faces(raw, dest, family, prefix, weight):
    coverage = TTFont(BytesIO(raw)).getBestCmap()
    faces = []
    for index, codes in enumerate(common_groups(coverage)):
        filename = f'{prefix}-common-{index}.woff2'
        if not (dest / filename).exists():
            font = TTFont(BytesIO(raw)); options = subset.Options()
            options.name_IDs = ['*']; options.name_legacy = True
            worker = subset.Subsetter(options=options)
            worker.populate(unicodes=codes); worker.subset(font)
            font.flavor = 'woff2'; font.save(dest / filename)
        faces.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url({filename}) format('woff2');unicode-range:{unicode_ranges(codes)}}}")
    return faces

if __name__ == '__main__':
    from pathlib import Path
    root = Path(__file__).resolve().parents[1]
    source = next((root / 'artifacts/font-sources').glob('NotoSansSC*.ttf'))
    dest = root / 'assets/sans'
    css = common_faces(source.read_bytes(), dest, 'Noto Sans SC', 'noto-sc', '100 900')
    (dest / 'common.css').write_text('\n'.join(css)+'\n', encoding='utf-8')
    print('Added common Chinese subsets for Noto Sans SC.', flush=True)
