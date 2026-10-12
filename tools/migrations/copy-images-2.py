import os
import shutil

mapping = {
    # Phrases (1-9) - mapping to specific phrase pages
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_1": "og-phrases-making-plans.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_2": "og-phrases-phone-and-messaging.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_3": "og-phrases-business-meetings.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_4": "og-phrases-presentations-interviews.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_5": "og-phrases-office-work.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_6": "og-phrases-shopping.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_7": "og-phrases-thanking-apologizing.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_8": "og-phrases-travel.png",
    "clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_9": "og-phrases-shopping.png",
    
    # English to Marathi (1-2)
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_english_to_1": "og-english-to-marathi-greetings.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_english_to_2": "og-english-to-marathi-words.png",
    
    # Hindi to Marathi (1-6)
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_1": "og-hindi-to-marathi-greetings.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_2": "og-hindi-to-marathi-daily-conversation.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_3": "og-hindi-to-marathi-questions.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_4": "og-hindi-to-marathi-travel.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_5": "og-hindi-to-marathi-festivals.png",
    "clean_high_resolution_educational_split_bilingual_banner_graphic_for_hindi_to_6": "og-hindi-to-marathi-advanced-structures.png",
    
    # Grammar (1-2)
    "clean_high_resolution_educational_split_bilingual_grammar_banner_graphic_for_1": "og-grammar-commands-polite.png",
    "clean_high_resolution_educational_split_bilingual_grammar_banner_graphic_for_2": "og-grammar-postpositions.png",
    
    # Vocabulary (1-6, office_1, office_2)
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_1": "og-vocabulary-animals.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_2": "og-vocabulary-body-parts.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_3": "og-vocabulary-food.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_4": "og-vocabulary-clothing.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_5": "og-vocabulary-shopping.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_6": "og-vocabulary-transport.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_office_1": "og-vocabulary-work-office.png",
    "clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_office_2": "og-vocabulary-adjectives.png",
}

src_root = r"C:\Users\kumar\Downloads\stitch_marathi_grammar_banner_generator (2)\stitch_marathi_grammar_banner_generator"
dest_root = r"C:\Users\kumar\blog\learn-marathi\public\og"

copied = 0
missing = []

for dir_name, dest_name in mapping.items():
    src_file = os.path.join(src_root, dir_name, "screen.png")
    dest_file = os.path.join(dest_root, dest_name)
    
    if os.path.exists(src_file):
        shutil.copy2(src_file, dest_file)
        copied += 1
    else:
        missing.append(dir_name)

print(f"Copied: {copied}")
if missing:
    print(f"Missing: {len(missing)}")
    for m in missing:
        print(f"  {m}")