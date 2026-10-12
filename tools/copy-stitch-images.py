import os, shutil

# Mapping from Stitch folder to target filename
# Based on the correct semantic mapping we need
mapping = {
    # Vocabulary - from stitch_marathi_grammar_banner_generator (2)
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_3": "og-vocabulary-adjectives.png",      # adjectives (68 words)
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_4": "og-vocabulary-clothing.png",        # clothing words
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_5": "og-vocabulary-shopping.png",       # shopping words (but we need food)
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_1": "og-vocabulary-animals.png",         # animals
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_2": "og-vocabulary-body-parts.png",      # body parts 43
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_6": "og-vocabulary-transport.png",       # transport
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_office_1": "og-vocabulary-work-office.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_office_2": "og-vocabulary-adjectives_1.png",  # this is adjectives image, will rename to animals
    
    # Grammar - from stitch_marathi_grammar_banner_generator (2)
    "clean_high_resolution_educational_split_bilingual_grammar_banner_graphic_for_1": "og-grammar-commands-polite.png",  # commands/polite
    
    # Hindi-to-Marathi - from stitch_marathi_grammar_banner_generator (2)
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_5": "og-hindi-to-marathi-festivals.png",     # festivals
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_6": "og-hindi-to-marathi-advanced-structures.png", # advanced structures
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_2": "og-hindi-to-marathi-daily-conversation.png", # daily conversation
    
    # Phrases - from stitch_marathi_grammar_banner_generator (2)
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_1": "og-phrases-making-plans.png",      # making plans
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_2": "og-phrases-phone-and-messaging.png",  # phone/messaging
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_7": "og-phrases-thanking-apologizing.png",  # thanking/apologizing
    
    # Food words - from stitch_marathi_grammar_banner_generator (original)
    "clean_high_resolution_educational_banner_graphic_for_marathi_food_words": "og-vocabulary-food.png",
    
    # Body parts 43 - from stitch_marathi_grammar_banner_generator (original)
    "clean_high_resolution_educational_banner_graphic_for_marathi_body_parts_43": "og-vocabulary-body-parts.png",
    
    # Clothing words - from stitch_marathi_grammar_banner_generator (original)
    "clean_high_resolution_educational_banner_graphic_for_marathi_clothing_words": "og-vocabulary-clothing.png",
    
    # Phone/tech - from stitch_marathi_grammar_banner_generator (original)
    "clean_educational_banner_graphic_for_english_to_marathi_technology_phone._split": "og-phrases-phone-and-messaging.png",
    
    # Polite/how-to-say - from stitch_marathi_grammar_banner_generator (original)
    "clean_high_resolution_polite_educational_blog_banner_graphic_for_how_to_say": "og-phrases-thanking-apologizing.png",
    
    # Festivals Diwali - from stitch_marathi_grammar_banner_generator (original)
    "clean_festive_educational_banner_graphic_for_hindi_to_marathi_festivals_diwali": "og-hindi-to-marathi-festivals.png",
    
    # Daily conversation - from stitch_marathi_grammar_banner_generator (original)
    "clean_educational_banner_graphic_for_hindi_to_marathi_daily_conversation": "og-hindi-to-marathi-daily-conversation.png",
    
    # Advanced structures - from stitch_marathi_grammar_banner_generator (original)
    "clean_educational_banner_graphic_for_hindi_to_marathi_advanced_structures": "og-hindi-to-marathi-advanced-structures.png",
    
    # Making plans - from stitch_marathi_grammar_banner_generator (original)
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_1": "og-phrases-making-plans.png",
}

# Source directories to search
src_dirs = [
    r"C:\Users\kumar\Downloads\stitch_marathi_grammar_banner_generator\stitch_marathi_grammar_banner_generator",
    r"C:\Users\kumar\Downloads\stitch_marathi_grammar_banner_generator (2)\stitch_marathi_grammar_banner_generator",
    r"C:\Users\kumar\Downloads\stitch_marathi_grammar_banner_generator (7)\stitch_marathi_grammar_banner_generator",
]

dest = r"C:\Users\kumar\blog\learn-marathi\public\og"

copied = 0
missing = []

for src_folder, dest_file in mapping.items():
    found = False
    for src_dir in src_dirs:
        src_file = os.path.join(src_dir, src_folder, "screen.png")
        if os.path.exists(src_file):
            dest_path = os.path.join(dest, dest_file)
            shutil.copy2(src_file, dest_path)
            print(f"Copied: {dest_file} <- {src_folder}")
            copied += 1
            found = True
            break
    if not found:
        missing.append(src_folder)

print(f"\nCopied: {copied}")
if missing:
    print(f"Missing ({len(missing)}):")
    for m in missing:
        print(f"  {m}")

# Also need to rename og-vocabulary-adjectives_1 to og-vocabulary-animals
# Actually the mapping says og-vocabulary-adjectives_1.png becomes og-vocabulary-animals.png
# But we need og-vocabulary-adjectives_1.webp to exist as the adjectives image
# The current og-vocabulary-adjectives_1.webp IS the adjectives image (from OCR)
# So we should RENAME it to og-vocabulary-animals.webp and use the NEW og-vocabulary-adjectives.webp for adjectives

# The rename plan:
# 1. og-vocabulary-adjectives_1.webp -> og-vocabulary-animals.webp (it's the adjectives Stitch image)
# 2. New og-vocabulary-adjectives.webp (from marathi_3) -> adjectives page

print("\n=== RENAME PLAN ===")
print("og-vocabulary-adjectives_1.webp -> og-vocabulary-animals.webp (the adjectives Stitch image becomes animals hero)")
print("New og-vocabulary-adjectives.webp (from marathi_3) -> adjectives page")