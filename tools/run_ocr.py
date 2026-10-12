import os, subprocess, glob

TESS = r"C:\c\Users\kumar\tessenv\Library\bin\tesseract.exe"
env = dict(os.environ)
env["TESSDATA_PREFIX"] = r"C:\Users\kumar\tessdata"
og = r"C:\Users\kumar\blog\learn-marathi\public\og"
out = r"C:\Users\kumar\blog\learn-marathi\tools\ocr-out"
os.makedirs(out, exist_ok=True)

files = sorted(glob.glob(os.path.join(og, "*.webp")))
for f in files:
    base = os.path.splitext(os.path.basename(f))[0]
    dest = os.path.join(out, base + ".txt")
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        continue
    subprocess.run([TESS, f, os.path.join(out, base), "-l", "eng+mar", "--psm", "11"],
                   env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("done", len(os.listdir(out)))
