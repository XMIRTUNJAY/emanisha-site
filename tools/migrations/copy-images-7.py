import os
import shutil

mapping = {
    # Phrases - generic "phrases" -> asking-directions
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases": "og-phrases-asking-directions.png",
    
    # English to Marathi - generic "english_to" -> workplace
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_english_to": "og-english-to-marathi-workplace.png",
    
    # Hindi to Marathi (1-2)
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_1": "og-hindi-to-marathi-shopping.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_2": "og-hindi-to-marathi-time-seasons.png",
    
    # Grammar
    "clean_high_resolution_educational_split_bilingual_grammar_banner_graphic_for": "og-hindi-to-marathi-sentence-patterns.png",
    
    # Vocabulary
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi": "og-vocabulary-abstract-concepts.png",
}

src_root = r"C:\Users\kumar\Downloads\stitch_marathi_grammar_banner_generator (7)\stitch_marathi_grammar_banner_generator"
dest_root = r"C:\Users\kumar\blog\learn-marathi\public\og"

copied = 0
missing = []

for dir_name, dest_name in mapping.items():
    src_file = os.path.join(src_root, dir_name, "screen.png")
    dest_file = os.path.join(dest_root, dest_name)
    
    if os.path.exists(src_file):
        shutil.copy2(src_file, dest_file)
        copied += 1
        print(f"Copied: {dest_name}")
    else:
        missing.append(dir_name)

print(f"Copied: {copied}")
if missing:
    print(f"Missing: {len(missing)}")
    for m in missing:
        print(f"  {m}")