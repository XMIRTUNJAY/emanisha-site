import os, re, json, html

root = r"C:\Users\kumar\blog\learn-marathi\dist"
rows = []
hero_re = re.compile(r'<source[^>]*type="image/webp"[^>]*srcSet="([^"]+)"')
# fallback: any og/*.webp in a figure
figure_re = re.compile(r'<figure[^>]*hero-figure.*?</figure>', re.S)
anywebp_re = re.compile(r'/og/(og-[a-z0-9_\-]+)\.webp')
title_re = re.compile(r'<title>(.*?)</title>', re.S)
h1_re = re.compile(r'<h1[^>]*>(.*?)</h1>', re.S)
desc_re = re.compile(r'<meta name="description" content="(.*?)"')

for dirpath, dirs, files in os.walk(root):
    if 'index.html' in files:
        p = os.path.join(dirpath, 'index.html')
        rel = os.path.relpath(dirpath, root).replace('\\', '/')
        if rel == '.':
            rel = ''
        s = open(p, encoding='utf-8', errors='replace').read()
        # hero: first webp in the hero figure
        m = figure_re.search(s)
        hero = None
        if m:
            w = anywebp_re.search(m.group(0))
            if w:
                hero = w.group(1)
        if hero is None:
            w = anywebp_re.search(s)
            hero = w.group(1) if w else None
        t = title_re.search(s)
        h = h1_re.search(s)
        d = desc_re.search(s)
        strip = lambda x: html.unescape(re.sub('<[^>]+>', '', x.group(1))).strip() if x else ''
        rows.append({
            'route': '/' + rel + '/' if rel else '/',
            'title': strip(t),
            'h1': strip(h),
            'desc': strip(d),
            'hero': hero,
        })

rows.sort(key=lambda r: r['route'])
print("TOTAL", len(rows))
json.dump(rows, open(r"C:\Users\kumar\blog\learn-marathi\hero-inventory.json", 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for r in rows:
    print(f"{r['route']}\t{r['hero']}\t{r['h1'] or r['title']}")
