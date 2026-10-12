import os, re, glob

out = r"C:\Users\kumar\blog\learn-marathi\tools\ocr-out"
files = sorted(glob.glob(os.path.join(out, "*.txt")))

def digest(txt):
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    # prefer lines with latin words or marathi
    keep = []
    for l in lines:
        if len(l) < 2:
            continue
        keep.append(l)
    return keep

for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    txt = open(f, encoding='utf-8', errors='replace').read()
    d = digest(txt)
    print("### " + name)
    print(" | ".join(d[:8]))
    print()
