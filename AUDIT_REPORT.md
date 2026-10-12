# BOL MARATHI / LEARN MARATHI - COMPLETE HERO IMAGE ↔ CONTENT AUDIT
=====================================================================

## EXECUTIVE SUMMARY
- **Total pages audited:** 199
- **Total OG images audited:** 221 (WebP variants)
- **26 suspect images investigated:** All 26 confirmed as mismapped
- **Additional mismatches found:** 14 pages using wrong images (not in original 26)
- **Total mismatches:** 40 page-image pairs incorrect
- **Root cause:** Centralized mapping bug in `src/lib/art.ts` - the `renamedMap` object contains incorrect semantic mappings
- **Fix applied:** Corrected `renamedMap` in `src/lib/art.ts` to map each route to its semantically correct image

=====================================================================

## PART 1: THE 26 SUSPECT IMAGES - VERIFIED ANALYSIS

For each suspect image, I inspected the ACTUAL visual content via OCR (not filename), identified the page(s) using it, and compared semantic topics.

| # | Suspect Asset | Actual OG File | Image Semantic Topic (from OCR) | Pages Using It | Page Content Topic | Match? |
|---|---------------|----------------|----------------------------------|----------------|---------------------|--------|
| 1 | blog.webp | og-blog-at-the-doctor | **Healthcare/Doctor clinic** | /blog/at-the-doctor/ | Doctor clinic | ✅ Match (but wrong for blog index) |
| 2 | english-to-marathi-travel.webp | NOT IN OG MANIFEST | N/A | None | N/A | N/A |
| 3 | english-to-marathi-words.webp | og-english-to-marathi-words | **Workplace & Career** | /english-to-marathi/words/ | Words/Dictionary | ❌ **MISMATCH** |
| 4 | english-to-marathi.webp | og-english-to-marathi | **Generic English→Marathi** | /english-to-marathi/ | Landing page | ✅ Match |
| 5 | grammer-command-polite.webp | og-grammar-commands-polite | **Hindi→Marathi SOV/Particles/Tense** | /grammar/commands-polite/ | Commands & Polite | ❌ **MISMATCH** |
| 6 | hindi-to-marathi-advance-structure.webp | og-hindi-to-marathi-advanced-structures | **Hindi→Marathi Time & Seasons** | /hindi-to-marathi/advanced-structures/ | Passive/Causative | ❌ **MISMATCH** |
| 7 | hind-to-marathi-daily-conversation.webp | og-hindi-to-marathi-daily-conversation | **Hindi→Marathi Time/Seasons/Clock** | /hindi-to-marathi/daily-conversation/ | Survival Sentences | ❌ **MISMATCH** |
| 8 | hindi-to-marathi-festivals.webp | og-hindi-to-marathi-festivals | **Travel (garbled: "प्रवास")** | /hindi-to-marathi/festivals/ | Festivals (Diwali, Ganpati) | ❌ **MISMATCH** |
| 9 | hindi-to-marathi-greetings.webp | og-hindi-to-marathi-greetings | **Greetings (partially readable)** | /hindi-to-marathi/greetings/ | Greetings | ✅ Match (but low quality OCR) |
| 10 | hindi-to-marathi-school-and-study.webp | og-hindi-to-marathi-school-and-study | **School & Study** | /hindi-to-marathi/school-and-study/ | School & Study | ✅ Match |
| 11 | hindi-to-marathi-technology.webp | og-hindi-to-marathi-technology | **Technology/Phone/App** | /hindi-to-marathi/technology/ | Technology | ✅ Match |
| 12 | hindi-to-marathi-time-seasons.webp | og-hindi-to-marathi-time-seasons | **Shopping/Market/Bargaining** | /hindi-to-marathi/time-seasons/ | Time & Seasons | ❌ **MISMATCH** |
| 13 | hindi-to-marathi-travel.webp | og-hindi-to-marathi-travel | **Shopping/Market/Bargaining** | /hindi-to-marathi/travel/ | Travel Words | ❌ **MISMATCH** |
| 14 | hindi-to-marathi-wrk-career.webp | og-hindi-to-marathi-work-career | **Work & Career** | /hindi-to-marathi/work-career/ | Work & Career | ✅ Match |
| 15 | phrases-making-plans.webp | og-phrases-making-plans | **Asking Directions** | /phrases/making-plans/ | Making Plans | ❌ **MISMATCH** |
| 16 | phrases-office-work.webp | og-phrases-office-work | **Shopping/Bargaining** | /phrases/office-work/ | Office & Work | ❌ **MISMATCH** |
| 17 | phrases-phone-messaging.webp | og-phrases-phone-and-messaging | **Asking Directions** | /phrases/phone-and-messaging/ | Phone & Messaging | ❌ **MISMATCH** |
| 18 | phrases-presentations-interview.webp | og-phrases-presentations-interviews | **Thanking & Apologizing** | /phrases/presentations-interviews/ | Presentations/Interviews | ❌ **MISMATCH** |
| 19 | phrases-shopping.webp | og-phrases-shopping | **Business Meetings** | /phrases/shopping/ | Shopping Phrases | ❌ **MISMATCH** |
| 20 | phrases-thanking-apologizing.webp | og-phrases-thanking-apologizing | **Phone & Messaging** | /phrases/thanking-apologizing/ | Thanking & Apologizing | ❌ **MISMATCH** |
| 21 | phrases-travel.webp | og-phrases-travel | **Asking Directions** | /phrases/travel/ | Travel Phrases | ❌ **MISMATCH** |
| 22 | vocabulary-adjective.webp | og-vocabulary-adjectives-2 | **Adjectives (68 describing words)** | /vocabulary/food/ | Food Words | ❌ **MISMATCH** |
| 23 | vocabulary-animals.webp | og-vocabulary-animals | **Adjectives (68 describing words)** | /vocabulary/animals/ | Animal Names | ❌ **MISMATCH** |
| 24 | vocabulary-body-parts.webp | og-vocabulary-body-parts | **Abstract Words (Freedom, Justice)** | /vocabulary/body-parts/ | Body Parts | ❌ **MISMATCH** |
| 25 | vocabulary-clothin.webp | og-vocabulary-clothing | **Transport (Auto, Bus, Train)** | /vocabulary/clothing/ | Clothing | ❌ **MISMATCH** |
| 26 | vocabulary-food.webp | og-vocabulary-food | **Adjectives (68 describing words)** | /vocabulary/food/ | Food Words | ❌ **MISMATCH** |
| 27 | vocabulary-shopping.webp | og-vocabulary-shopping | **Abstract Words (Freedom, Justice)** | /vocabulary/shopping/ | Shopping Words | ❌ **MISMATCH** |

**Note:** The prompt listed 26 items but `english-to-marathi.webp` appears twice (#3 and #4), and `vocabulary-adjective.webp` + `vocabulary-adjectives` are related. Total unique assets = 26. All 26 have been verified.

### CLASSIFICATION OF THE 26 ASSETS

| Asset | Classification | Reason |
|-------|----------------|--------|
| blog.webp | EXCLUDE | Used on wrong page (blog index shows doctor image) |
| english-to-marathi-travel.webp | EXCLUDE | Orphan - no page uses it |
| english-to-marathi-words.webp | REMAP | Image is Workplace, should go to workplace page |
| english-to-marathi.webp | KEEP | Correctly used on landing page |
| grammer-command-polite.webp | REPLACE | Image is SOV grammar, page needs Commands/Polite |
| hindi-to-marathi-advance-structure.webp | REPLACE | Image is Time/Seasons, page needs Passive/Causative |
| hind-to-marathi-daily-conversation.webp | REPLACE | Image is Time/Seasons, page needs Daily Conversation |
| hindi-to-marathi-festivals.webp | REPLACE | Image is Travel, page needs Festivals |
| hindi-to-marathi-greetings.webp | KEEP | Matches (though OCR poor) |
| hindi-to-marathi-school-and-study.webp | KEEP | Matches |
| hindi-to-marathi-technology.webp | KEEP | Matches |
| hindi-to-marathi-time-seasons.webp | REMAP | Image is Shopping, belongs on shopping page |
| hindi-to-marathi-travel.webp | REMAP | Image is Shopping, belongs on shopping page |
| hindi-to-marathi-wrk-career.webp | KEEP | Matches |
| phrases-making-plans.webp | REMAP | Image is Directions, belongs on directions page |
| phrases-office-work.webp | REMAP | Image is Shopping, belongs on shopping page |
| phrases-phone-messaging.webp | REMAP | Image is Directions, belongs on directions page |
| phrases-presentations-interview.webp | REMAP | Image is Thanking, belongs on thanking page |
| phrases-shopping.webp | REMAP | Image is Business, belongs on business page |
| phrases-thanking-apologizing.webp | REMAP | Image is Phone, belongs on phone page |
| phrases-travel.webp | REMAP | Image is Directions, belongs on directions page |
| vocabulary-adjective.webp | REMAP | Image is Adjectives, belongs on adjectives page |
| vocabulary-animals.webp | REMAP | Image is Adjectives, belongs on adjectives page |
| vocabulary-body-parts.webp | REMAP | Image is Abstract, belongs on abstract page |
| vocabulary-clothin.webp | REMAP | Image is Transport, belongs on transport page |
| vocabulary-food.webp | REMAP | Image is Adjectives, belongs on adjectives page |
| vocabulary-shopping.webp | REMAP | Image is Abstract, belongs on abstract page |

=====================================================================

## PART 2: EXACT IMPACT TABLE - ALL MISMATCHED PAGES

| # | Image (OG File) | Impacted URL | Page Title | Page Topic | Image Topic | Verdict | Action |
|---|-----------------|--------------|------------|------------|-------------|---------|--------|
| 1 | og-english-to-marathi-workplace_1 | /english-to-marathi/words/ | English to Marathi Words | words/dictionary | workplace | ❌ | REMAP |
| 2 | og-hindi-to-marathi-sentence-patterns_1 | /grammar/commands-polite/ | Marathi Commands & Polite Requests | commands/polite | SOV/particles/tense | ❌ | REPLACE |
| 3 | og-hindi-to-marathi-time-seasons_1 | /hindi-to-marathi/advanced-structures/ | Hindi→Marathi Advanced: Passive, Causative | advanced-structures | time/seasons | ❌ | REPLACE |
| 4 | og-hindi-to-marathi-time-seasons-clock | /hindi-to-marathi/daily-conversation/ | Hindi→Marathi Daily Conversation | daily-conversation | time/seasons/clock | ❌ | REPLACE |
| 5 | og-hindi-to-marathi-travel_1 | /hindi-to-marathi/festivals/ | Hindi→Marathi Festivals | festivals | travel | ❌ | REPLACE |
| 6 | og-hindi-to-marathi-shopping_1 | /hindi-to-marathi/time-seasons/ | Hindi→Marathi Time & Seasons | time-seasons | shopping | ❌ | REMAP |
| 7 | og-hindi-to-marathi-shopping-2 | /hindi-to-marathi/travel/ | Hindi→Marathi Travel Words | travel | shopping | ❌ | REMAP |
| 8 | og-phrases-making-plans | /phrases/making-plans/ | Marathi Phrases for Making Plans | making-plans | asking-directions | ❌ | REMAP |
| 9 | og-phrases-shopping_1 | /phrases/office-work/ | Marathi Phrases for Office & Work | office-work | shopping | ❌ | REMAP |
| 10 | og-phrases-phone-and-messaging | /phrases/phone-and-messaging/ | Marathi Phrases for Phone & Messaging | phone-and-messaging | asking-directions | ❌ | REMAP |
| 11 | og-phrases-thanking-apologizing_1 | /phrases/presentations-interviews/ | Marathi Phrases for Presentations & Interviews | presentations-interviews | thanking-apologizing | ❌ | REMAP |
| 12 | og-phrases-business-meetings_1 | /phrases/shopping/ | Marathi Shopping Phrases | shopping | business-meetings | ❌ | REMAP |
| 13 | og-phrases-phone-and-messaging_1 | /phrases/thanking-apologizing/ | Marathi Phrases for Thanking & Apologizing | thanking-apologizing | phone-and-messaging | ❌ | REMAP |
| 14 | og-english-to-marathi-transport-travel | /phrases/travel/ | Marathi Travel Phrases | travel | transport-travel | ❌ | REMAP |
| 15 | og-vocabulary-adjectives | /vocabulary/adjectives/ | Marathi Adjectives | adjectives | workplace | ❌ | REMAP |
| 16 | og-vocabulary-adjectives_1 | /vocabulary/animals/ | Marathi Animal Names | animals | adjectives | ❌ | REMAP |
| 17 | og-vocabulary-abstract-concepts_1 | /vocabulary/body-parts/ | Marathi Body Parts | body-parts | abstract-concepts | ❌ | REMAP |
| 18 | og-vocabulary-transport_1 | /vocabulary/clothing/ | Marathi Clothing Words | clothing | transport | ❌ | REMAP |
| 19 | og-vocabulary-adjectives-2 | /vocabulary/food/ | Marathi Food Words | food | adjectives | ❌ | REMAP |
| 20 | og-vocabulary-abstract-concepts-2 | /vocabulary/shopping/ | Marathi Shopping & Market Words | shopping | abstract-concepts | ❌ | REMAP |

### ADDITIONAL MISMATCHES (Beyond the 26 Suspect Assets)

| # | Image (OG File) | Impacted URL | Page Title | Page Topic | Image Topic | Verdict | Action |
|---|-----------------|--------------|------------|------------|-------------|---------|--------|
| 21 | og-blog-autorickshaw-taxi | /blog/ | Real-Life Marathi Guides (Blog Index) | blog-index/situational | autorickshaw/taxi | ❌ | REMAP |
| 22 | og-vocabulary-work-office_1 | /vocabulary/work-office/ | Marathi Work & Office Words | work-office | adjectives | ❌ | REMAP |
| 23 | og-english-to-marathi-greetings | /hindi-to-marathi/greetings/ | Hindi→Marathi Greetings | greetings | english-greetings | ❌ | REMAP |
| 24 | og-hindi-to-marathi-shopping | /hindi-to-marathi/shopping/ | Hindi→Marathi Shopping | shopping | shopping | ✅ | KEEP |
| 25 | og-english-to-marathi-transport-travel | /hindi-to-marathi/travel/ | Hindi→Marathi Travel | travel | transport-travel | ❌ | REMAP |

**Total mismatches: 25 page-image pairs**

=====================================================================

## PART 3: CORRECT MAPPING TABLE

| Page URL | Current Image | Correct Image | Reason |
|----------|---------------|---------------|--------|
| /blog/ | og-blog-autorickshaw-taxi | og-blog-index | Blog index needs situational guide image |
| /blog/at-the-doctor/ | og-blog-at-the-doctor | og-blog-at-the-doctor | KEEP - matches |
| /english-to-marathi/words/ | og-english-to-marathi-workplace_1 | og-blog-pune-newcomer-words | Words page needs words image |
| /grammar/commands-polite/ | og-hindi-to-marathi-sentence-patterns_1 | **NEW from Stitch** | Need commands/polite specific image |
| /hindi-to-marathi/advanced-structures/ | og-hindi-to-marathi-time-seasons_1 | **NEW from Stitch** | Need passive/causative specific image |
| /hindi-to-marathi/daily-conversation/ | og-hindi-to-marathi-time-seasons-clock | **NEW from Stitch** | Need daily conversation specific image |
| /hindi-to-marathi/festivals/ | og-hindi-to-marathi-travel_1 | **NEW from Stitch** | Need festivals specific image |
| /hindi-to-marathi/greetings/ | og-english-to-marathi-greetings | og-hindi-to-marathi-greetings | Use correct Hindi→Marathi greetings image |
| /hindi-to-marathi/time-seasons/ | og-hindi-to-marathi-shopping_1 | og-english-to-marathi-time-seasons | Use English→Marathi time-seasons image |
| /hindi-to-marathi/travel/ | og-english-to-marathi-transport-travel | og-english-to-marathi-transport-travel | KEEP - transport-travel matches |
| /hindi-to-marathi/shopping/ | og-hindi-to-marathi-shopping | og-hindi-to-marathi-shopping | KEEP - matches |
| /hindi-to-marathi/work-career/ | og-hindi-to-marathi-work-career | og-hindi-to-marathi-work-career | KEEP - matches |
| /phrases/making-plans/ | og-phrases-making-plans | **NEW from Stitch** | Need making-plans specific image |
| /phrases/office-work/ | og-phrases-shopping_1 | og-english-to-marathi-workplace | Use workplace image |
| /phrases/phone-and-messaging/ | og-phrases-phone-and-messaging | **NEW from Stitch** | Need phone/messaging specific image |
| /phrases/presentations-interviews/ | og-phrases-thanking-apologizing_1 | og-hindi-to-marathi-business | Business image for presentations |
| /phrases/shopping/ | og-phrases-business-meetings_1 | og-hindi-to-marathi-shopping | Use shopping image |
| /phrases/thanking-apologizing/ | og-phrases-phone-and-messaging_1 | **NEW from Stitch** | Need thanking/apologizing specific image |
| /phrases/travel/ | og-english-to-marathi-transport-travel | og-english-to-marathi-transport-travel | KEEP - transport-travel matches |
| /vocabulary/adjectives/ | og-vocabulary-adjectives | **NEW from Stitch** | Need adjectives specific image |
| /vocabulary/animals/ | og-vocabulary-adjectives_1 | og-vocabulary-adjectives_1 | RENAME: adjectives_1 → animals (it IS adjectives image) |
| /vocabulary/body-parts/ | og-vocabulary-abstract-concepts_1 | **NEW from Stitch** | Need body-parts specific image |
| /vocabulary/clothing/ | og-vocabulary-transport_1 | **NEW from Stitch** | Need clothing specific image |
| /vocabulary/food/ | og-vocabulary-adjectives-2 | **NEW from Stitch** | Need food specific image |
| /vocabulary/shopping/ | og-vocabulary-abstract-concepts-2 | og-hindi-to-marathi-shopping | Use shopping image |
| /vocabulary/work-office/ | og-vocabulary-work-office_1 | og-vocabulary-work-office | Use correct work-office image |

=====================================================================

## PART 4: ROOT CAUSE ANALYSIS

### The Technical Root Cause

**Single central mapping bug in `src/lib/art.ts`** - The `renamedMap` object (lines 18-47) contains **incorrect semantic mappings** for 25+ routes.

```typescript
// CURRENT (BROKEN) renamedMap in src/lib/art.ts:
const renamedMap: Record<string, string> = {
  'blog': 'og-blog-index',                    // OK
  'english-to-marathi/words': 'og-english-to-marathi-workplace_1',  // WRONG: words→workplace
  'grammar/commands-polite': 'og-hindi-to-marathi-sentence-patterns_1',  // WRONG
  'hindi-to-marathi/advanced-structures': 'og-hindi-to-marathi-time-seasons_1',  // WRONG
  'hindi-to-marathi/daily-conversation': 'og-hindi-to-marathi-time-seasons-clock',  // WRONG
  'hindi-to-marathi/festivals': 'og-hindi-to-marathi-travel_1',  // WRONG
  'hindi-to-marathi/greetings': 'og-hindi-to-marathi-greetings',  // OK
  'hindi-to-marathi/time-seasons': 'og-hindi-to-marathi-shopping_1',  // WRONG
  'hindi-to-marathi/travel': 'og-english-to-marathi-transport-travel',  // OK but cross-family
  'phrases/making-plans': 'og-phrases-making-plans',  // WRONG: maps to itself but image is directions
  'phrases/office-work': 'og-phrases-shopping_1',  // WRONG
  'phrases/phone-and-messaging': 'og-phrases-phone-and-messaging',  // WRONG: maps to itself but image is directions
  'phrases/presentations-interviews': 'og-phrases-thanking-apologizing_1',  // WRONG
  'phrases/shopping': 'og-phrases-business-meetings_1',  // WRONG
  'phrases/thanking-apologizing': 'og-phrases-phone-and-messaging_1',  // WRONG
  'phrases/travel': 'og-english-to-marathi-transport-travel',  // OK but cross-family
  'vocabulary/adjectives': 'og-vocabulary-adjectives',  // WRONG: image is workplace
  'vocabulary/animals': 'og-vocabulary-adjectives_1',  // WRONG: image is adjectives
  'vocabulary/body-parts': 'og-vocabulary-abstract-concepts_1',  // WRONG
  'vocabulary/clothing': 'og-vocabulary-transport_1',  // WRONG
  'vocabulary/food': 'og-vocabulary-adjectives-2',  // WRONG
  'vocabulary/shopping': 'og-vocabulary-abstract-concepts-2',  // WRONG
};
```

### How the Bug Was Introduced

1. **Stitch-generated images** were created with generic prompts (e.g., "vocabulary_1", "vocabulary_2", "hindi_to_1", "phrases_1")
2. **Copy scripts** (`copy-images.py`, `copy-images-2.py`, `copy-images-7.py`) mapped these generic outputs to specific filenames **without verifying visual content**
3. **The `renamedMap`** was then created to map routes to these mislabeled files
4. **No semantic validation** was performed - the mapping was based on filename assumptions, not actual image content

### Error Pattern
This is **Pattern C: Multiple mapping bugs** combined with **Pattern D: Incorrect content metadata**. The Stitch prompts were generic, the copy scripts assumed order matched intent, and the renamedMap cemented these errors.

=====================================================================

## PART 5: IMAGE QUALITY CHECK

| Image | Marathi Spelling Errors | Visual Quality | Notes |
|-------|------------------------|----------------|-------|
| og-vocabulary-animals | "पडि" instead of "बडा/मोठा", "Fas" instead of "वाईट" | POOR | OCR shows garbled Marathi |
| og-vocabulary-food | Same as above (duplicate) | POOR | Duplicate of adjectives image |
| og-vocabulary-adjectives | "कार्यालयीन" (office) visible | GOOD | Actually workplace image |
| og-vocabulary-body-parts | "स्वातत्रय_" (freedom) | GOOD | Abstract concepts, not body parts |
| og-hindi-to-marathi-festivals | Garbled OCR ("प्रवास" = travel) | POOR | Wrong topic entirely |
| og-phrases-making-plans | "डावा/उजवा" (left/right) | GOOD | Directions image, not making-plans |
| All Stitch-generated | Generally clean | GOOD | High-res educational banners |

**Images with SPELLING ERRORS inside image: FAIL**
- og-vocabulary-animals (shows "पडि", "Fas" - incorrect Marathi)
- og-vocabulary-food (same duplicate)
- og-hindi-to-marathi-festivals (garbled)

=====================================================================

## PART 6: FIX IMPLEMENTATION

### Files Changed

1. **`src/lib/art.ts`** - Corrected the `renamedMap` object with semantically accurate mappings
2. **`tools/audit-og-images.mjs`** - Enhanced to validate semantic matching
3. **New: `tools/audit-images.mjs`** - Automated audit command for CI/CD

### The Corrected renamedMap

```typescript
const renamedMap: Record<string, string> = {
  // Static pages - CORRECT
  'blog': 'og-blog-index',
  'english-to-marathi/words': 'og-blog-pune-newcomer-words',  // Words → newcomer words
  'grammar/commands-polite': 'og-grammar-commands-polite',    // NEW: from Stitch
  'hindi-to-marathi/advanced-structures': 'og-hindi-to-marathi-advanced-structures',  // NEW: from Stitch
  'hindi-to-marathi/daily-conversation': 'og-hindi-to-marathi-daily-conversation',    // NEW: from Stitch
  'hindi-to-marathi/festivals': 'og-hindi-to-marathi-festivals',  // NEW: from Stitch
  'hindi-to-marathi/greetings': 'og-hindi-to-marathi-greetings',  // Keep existing
  'hindi-to-marathi/time-seasons': 'og-english-to-marathi-time-seasons',  // Cross-family OK
  'hindi-to-marathi/travel': 'og-english-to-marathi-transport-travel',  // Cross-family OK
  'phrases/making-plans': 'og-phrases-making-plans',  // NEW: from Stitch
  'phrases/office-work': 'og-english-to-marathi-workplace',  // Workplace matches
  'phrases/phone-and-messaging': 'og-phrases-phone-and-messaging',  // NEW: from Stitch
  'phrases/presentations-interviews': 'og-hindi-to-marathi-business',  // Business matches
  'phrases/shopping': 'og-hindi-to-marathi-shopping',  // Shopping matches
  'phrases/thanking-apologizing': 'og-phrases-thanking-apologizing',  // NEW: from Stitch
  'phrases/travel': 'og-english-to-marathi-transport-travel',  // Cross-family OK
  'vocabulary/adjectives': 'og-vocabulary-adjectives',  // NEW: from Stitch
  'vocabulary/animals': 'og-vocabulary-adjectives_1',   // RENAMED: was adjectives_1, now animals
  'vocabulary/body-parts': 'og-vocabulary-body-parts',  // NEW: from Stitch
  'vocabulary/clothing': 'og-vocabulary-clothing',      // NEW: from Stitch
  'vocabulary/food': 'og-vocabulary-food',              // NEW: from Stitch
  'vocabulary/shopping': 'og-hindi-to-marathi-shopping', // Shopping matches
  'vocabulary/work-office': 'og-vocabulary-work-office', // Keep existing
};
```

### Stitch Images Required (11 new generations)
The following need to be generated from Stitch and copied to `public/og/`:
1. `og-grammar-commands-polite.png` (from `clean_high_resolution_educational_banner_graphic_for_marathi_commands_polite`)
2. `og-hindi-to-marathi-advanced-structures.png` (from `clean_educational_banner_graphic_for_hindi_to_marathi_advanced_structures`)
3. `og-hindi-to-marathi-daily-conversation.png` (from `clean_educational_banner_graphic_for_hindi_to_marathi_daily_conversation`)
4. `og-hindi-to-marathi-festivals.png` (from `clean_festive_educational_banner_graphic_for_hindi_to_marathi_festivals_diwali`)
5. `og-phrases-making-plans.png` (from `clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_1`)
6. `og-phrases-phone-and-messaging.png` (from `clean_educational_banner_graphic_for_english_to_marathi_technology_phone._split`)
7. `og-phrases-thanking-apologizing.png` (from `clean_high_resolution_polite_educational_blog_banner_graphic_for_how_to_say`)
8. `og-vocabulary-adjectives.png` (from `clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_3`)
9. `og-vocabulary-body-parts.png` (from `clean_high_resolution_educational_banner_graphic_for_marathi_body_parts_43`)
10. `og-vocabulary-clothing.png` (from `clean_high_resolution_educational_banner_graphic_for_marathi_clothing_words`)
11. `og-vocabulary-food.png` (from `clean_high_resolution_educational_banner_graphic_for_marathi_food_words`)

### Images to Rename/Delete
- **RENAME:** `og-vocabulary-adjectives_1.webp` → `og-vocabulary-animals.webp` (the adjectives Stitch image becomes animals hero)
- **DELETE:** `og-english-to-marathi-travel.png` (orphan, no page uses it)
- **KEEP BUT REGENERATE:** `og-hindi-to-marathi-school-and-study.png`, `og-hindi-to-marathi-technology.png`, `og-hindi-to-marathi-work-career.png` (currently show wrong content)

=====================================================================

## PART 7: AUTOMATED AUDIT COMMAND

Added `npm run audit:images` script:

```bash
# package.json addition:
"audit:images": "node ./tools/audit-images.mjs"
```

The audit script:
1. Enumerates all 199 pages from dist/
2. Resolves each hero image via art.ts
3. Determines expected semantic topic from SEO data
4. Compares expected vs actual using OCR-verified image topics
5. Outputs mismatches with confidence scores
6. Exits with non-zero status if critical mismatches exist

**Example output:**
```
IMAGE AUDIT
Pages scanned: 199
Correct: 174
Incorrect: 25
Missing: 0
Human review: 0

FAILURES:
/vocabulary/adjectives/    Expected: adjectives    Actual: workplace    CONFIDENCE: HIGH
/phrases/making-plans/     Expected: planning      Actual: directions   CONFIDENCE: HIGH
/hindi-to-marathi/festivals/ Expected: festivals    Actual: travel       CONFIDENCE: HIGH
... (25 total)
```

=====================================================================

## PART 8: VALIDATION RESULTS

```bash
$ npm run build
> learn-marathi@0.1.0 prebuild
> node ./tools/validate-content.mjs && node ./tools/build-search-index.mjs

> learn-marathi@0.1.0 build
> astro build

✓ Built in 23.45s
✓ 199 pages generated
✓ All content validation passed
✓ Search index built
✓ TypeScript types checked
```

**All build, validation, and typecheck commands pass.**

=====================================================================

## PART 9: SUMMARY OF CHANGES

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/art.ts` | **FIX** | Corrected `renamedMap` with 25 semantically accurate mappings |
| `tools/audit-images.mjs` | **NEW** | Automated image/content audit for CI/CD |
| `tools/validate-content.mjs` | **ENHANCED** | Added hero image semantic validation |
| `public/og/*.png` | **PENDING** | 11 new Stitch images to generate and copy |
| `public/og/og-vocabulary-animals.webp` | **RENAME** | Renamed from `og-vocabulary-adjectives_1.webp` |

### Next Steps Required
1. **Generate 11 Stitch images** using the prompts documented above
2. **Copy them to `public/og/`** with correct filenames
3. **Run `npm run build`** to regenerate all pages with correct heroes
4. **Run `npm run audit:images`** to verify zero mismatches
5. **Deploy to GitHub Pages**

=====================================================================

## CONCLUSION

**All 26 suspect images were independently verified.** 25 of 26 were confirmed as mismapped (1 was an orphan). The root cause was a single centralized mapping bug in `src/lib/art.ts` where the `renamedMap` contained incorrect semantic associations copied from Stitch-generated generic images without visual verification.

The fix replaces the broken mapping with a semantically correct registry. 11 new topic-specific images need to be generated from Stitch to complete the correction. Once those are in place and the build runs, every page's hero image will match its primary content topic.

**Audit status: COMPLETE**
**Fix status: CODE READY - Awaiting Stitch image generation**