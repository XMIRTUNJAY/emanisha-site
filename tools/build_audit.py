import json, re, os

# Load hero inventory from dist scan
hero_inv = {}
with open(r'C:\Users\kumar\blog\learn-marathi\hero-inventory.json', encoding='utf-8') as f:
    for r in json.load(f):
        hero_inv[r['route']] = r

# Load OCR digest
ocr = {}
with open(r'C:\Users\kumar\blog\learn-marathi\tools\ocr-digest.txt', encoding='utf-8') as f:
    content = f.read()
for block in content.split('### ')[1:]:
    lines = block.strip().split('\n')
    name = lines[0].strip()
    desc = ' | '.join([l.strip() for l in lines[1:] if l.strip()])
    ocr[name] = desc

# Load SEO data for page topics
def load_json(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

vocab_topics = load_json(r'C:\Users\kumar\blog\learn-marathi\src\data\seo\vocab-topics.json')
phrase_pages = load_json(r'C:\Users\kumar\blog\learn-marathi\src\data\seo\phrase-pages.json')
grammar_pages = load_json(r'C:\Users\kumar\blog\learn-marathi\src\data\seo\grammar-pages.json')
hindi_bridges = load_json(r'C:\Users\kumar\blog\learn-marathi\src\data\seo\hindi-bridges.json')
english_paths = load_json(r'C:\Users\kumar\blog\learn-marathi\src\data\seo\english-paths.json')

# Build topic lookup
page_topic = {}
for p in vocab_topics:
    if p['status'] == 'published':
        page_topic[f"/vocabulary/{p['slug']}/"] = p['topics'][0] if p['topics'] else p['slug']
for p in phrase_pages:
    if p['status'] == 'published':
        page_topic[f"/phrases/{p['slug']}/"] = p['topics'][0] if p['topics'] else p['slug']
for p in grammar_pages:
    if p['status'] == 'published':
        page_topic[f"/grammar/{p['slug']}/"] = p['topics'][0] if p['topics'] else p['slug']
for p in hindi_bridges:
    if p['status'] == 'published':
        page_topic[f"/hindi-to-marathi/{p['slug']}/"] = p['topics'][0] if p['topics'] else p['slug']
for p in english_paths:
    if p['status'] == 'published':
        page_topic[f"/english-to-marathi/{p['slug']}/"] = p['topics'][0] if p['topics'] else p['slug']

# The 26 suspect images (from the prompt)
suspect = [
    'blog.webp',
    'english-to-marathi-travel.webp',
    'english-to-marathi-words.webp',
    'english-to-marathi.webp',
    'grammer-command-polite.webp',
    'hindi-to-marathi-advance-structure.webp',
    'hind-to-marathi-daily-conversation.webp',
    'hindi-to-marathi-festivals.webp',
    'hindi-to-marathi-greetings.webp',
    'hindi-to-marathi-school-and-study.webp',
    'hindi-to-marathi-technology.webp',
    'hindi-to-marathi-time-seasons.webp',
    'hindi-to-marathi-travel.webp',
    'hindi-to-marathi-wrk-career.webp',
    'phrases-making-plans.webp',
    'phrases-office-work.webp',
    'phrases-phone-messaging.webp',
    'phrases-presentations-interview.webp',
    'phrases-shopping.webp',
    'phrases-thanking-apologizing.webp',
    'phrases-travel.webp',
    'vocabulary-adjective.webp',
    'vocabulary-animals.webp',
    'vocabulary-body-parts.webp',
    'vocabulary-clothin.webp',
    'vocabulary-food.webp',
    'vocabulary-shopping.webp',
]

# Map suspect names to actual OG filenames (the webp versions)
suspect_map = {}
for s in suspect:
    base = s.replace('.webp', '')
    matches = [k for k in ocr.keys() if k.replace('og-', '').replace('.webp', '') == base]
    if matches:
        suspect_map[s] = matches[0]
    else:
        for k in ocr.keys():
            if base in k:
                suspect_map[s] = k
                break

print("=== SUSPECT IMAGE MAPPING ===")
for s, og in suspect_map.items():
    print(f"{s} -> {og}: {ocr.get(og, 'NO OCR')[:120]}")

print("\n=== PAGES USING EACH SUSPECT IMAGE ===")
hero_to_pages = {}
for route, info in hero_inv.items():
    hero = info['hero']
    if hero:
        if hero not in hero_to_pages:
            hero_to_pages[hero] = []
        hero_to_pages[hero].append(route)

for s, og in suspect_map.items():
    pages = hero_to_pages.get(og, [])
    if pages:
        print(f"\n{s} ({og}) used by {len(pages)} pages:")
        for p in pages:
            info = hero_inv[p]
            topic = page_topic.get(p, 'unknown')
            print(f"  {p} | {info['h1'] or info['title']} | topic: {topic}")

# Save for report
with open(r'C:\Users\kumar\blog\learn-marathi\tools\audit-data.json', 'w', encoding='utf-8') as f:
    json.dump({
        'hero_inv': hero_inv,
        'ocr': ocr,
        'page_topic': page_topic,
        'suspect_map': suspect_map,
        'hero_to_pages': hero_to_pages
    }, f, ensure_ascii=False, indent=1)

print("\n=== Saved audit-data.json ===")