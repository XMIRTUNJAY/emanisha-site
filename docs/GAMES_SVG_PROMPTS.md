# Picture Guess — SVG prompt table

Original illustrations for `public/games/picture-guess/` (40 words from
`src/data/games/picture-guess.json`, which references `vocab.json` ids).
Regenerate the shipped set with `node tools/make-picture-svgs.mjs`.

## Constant settings (every row)

Flat vector illustration, centered, transparent background, warm educational style, soft rounded shapes, palette #8E2D12 (terracotta) #2E7D5B (green) #B8860B (mustard) plus muted neutrals, viewBox 0 0 200 200, no gradients, no text (text would reveal the answer).

## Files

| filename | Marathi | Transliteration | English | Level | Prompt (subject) |
|---|---|---|---|---|---|
| `safarchand.svg` | सफरचंद | sapharchand | apple | easy | "one red apple with a small green leaf" |
| `pani.svg` | पाणी | pāṇī | water | easy | "a glass of water, half full, with two ripple lines" |
| `doodh.svg` | दूध | dūdh | milk | easy | "a white milk glass with a blue label band" |
| `bhaat.svg` | भात | bhāt | cooked rice | easy | "a white bowl holding a mound of cooked rice, three visible grains" |
| `kutra.svg` | कुत्रा | kutrā | dog | easy | "a friendly dog face with floppy ears and a cream muzzle" |
| `manjar.svg` | मांजर | mānjar | cat | easy | "a cat face with pointed ears, green eyes and whiskers" |
| `gaay.svg` | गाय | gāy | cow | easy | "a cow face with small horns and a cream muzzle" |
| `ghar.svg` | घर | ghar | house / home | easy | "a simple house with a terracotta roof, door and two windows" |
| `soorya.svg` | सूर्य | sūry | sun | easy | "a warm sun with eight rays" |
| `phool.svg` | फूल | phūl | flower | easy | "an eight-petal flower with a round center" |
| `shirt.svg` | शर्ट | śarṭ | shirt | easy | "a green t-shirt" |
| `aamba.svg` | आंबा | āmbā | mango | easy | "one ripe yellow-orange mango with a stem and leaf" |
| `chaha.svg` | चहा | chahā | tea | medium | "a teacup on a saucer with steam lines and brown tea inside" |
| `daar.svg` | दार | dār | door | medium | "a wooden door with four inset panels and a round handle" |
| `khidki.svg` | खिडकी | khiḍkī | window | medium | "a window with a cross frame and a light reflection" |
| `khurchi.svg` | खुर्ची | khurchī | chair | medium | "a simple chair with a backrest and four legs" |
| `diva.svg` | दिवा | divā | lamp | medium | "a traditional oil lamp with a flame glow" |
| `dola.svg` | डोळा | ḍoḷā | eye | medium | "one wide-open eye with an iris and highlight" |
| `haat.svg` | हात | hāt | hand | medium | "an open hand with four fingers and a thumb" |
| `paay.svg` | पाय | pāy | leg / foot | medium | "one foot in profile" |
| `jhaad.svg` | झाड | jhāḍ | tree | medium | "a tree with a dark trunk and layered green crown" |
| `chandra.svg` | चंद्र | chandr | moon | medium | "a crescent moon with three small stars" |
| `chhatri.svg` | छत्री | chhatrī | umbrella | medium | "an open umbrella with a curved handle" |
| `topi.svg` | टोपी | ṭopī | cap | medium | "a cap with a small round button on top" |
| `saadi.svg` | साडी | sāḍī | sari | medium | "a draped sari with two gold border lines" |
| `batata.svg` | बटाटा | baṭāṭā | potato | medium | "two brown potatoes with a few dimple dots" |
| `hatti.svg` | हत्ती | hattī | elephant | challenge | "an elephant in profile with a trunk and one tusk hint" |
| `vaagh.svg` | वाघ | vāgh | tiger | challenge | "a tiger face with dark stripes" |
| `mor.svg` | मोर | mor | peacock | challenge | "a peacock with a blue neck and five tail feathers with eye dots" |
| `sasa.svg` | ससा | sasā | rabbit | challenge | "a rabbit face with two long upright ears" |
| `bakri.svg` | बकरी | bakrī | goat | challenge | "a goat face with small straight horns" |
| `maasa.svg` | मासा | māsā | fish | challenge | "a fish in profile with fins and a round eye" |
| `pakshi.svg` | पक्षी | pakṣī | bird | challenge | "a small bird in profile with a beak and two legs" |
| `ghadyaal.svg` | घड्याळ | ghaḍyāḷ | watch / clock | challenge | "a round clock face showing roughly ten past ten" |
| `dhabdhaba.svg` | धबधबा | dhabdhabā | waterfall | challenge | "a waterfall falling from a rock ledge into a pool" |
| `talaav.svg` | तलाव | talāv | lake / pond | challenge | "a still lake with two ripples and a distant hill" |
| `paus.svg` | पाऊस | pāūs | rain | challenge | "a rain cloud with five falling rain strokes" |
| `dhag.svg` | ढग | ḍhag | cloud | challenge | "a single fluffy cloud" |
| `vij.svg` | वीज | vīj | lightning | challenge | "a lightning bolt under a small cloud" |
| `pagdi.svg` | पगडी | pagḍī | turban | challenge | "a turban with two wrapped bands" |

## Adding / replacing art

1. Pick a row, generate or draw an SVG that matches the subject prompt.
2. Keep the settings block above (size, palette, no text).
3. Save as `public/games/picture-guess/<filename>` — the game picks it up on
   the next build; missing files fall back to a labeled placeholder card.
