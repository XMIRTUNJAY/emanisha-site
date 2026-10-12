# Content Inventory (from actual repo inspection)

From `bol_marathi/content/units/*.json` (26 units) and
`lib/content/generated_vocab.dart` (1002 entries). No invented rows.

| Content | In app? | Website? | URL | Priority |
| ------- | ------- | -------- | --- | -------- |
| Beginner greetings + first words (Unit 01, Greetings 15) | Yes | Yes | /vocabulary/beginners/ | P0 |
| Hindi → Marathi bridge maps (156 rows) | Yes | Yes | /hindi-to-marathi/ | P0 |
| Daily phrases from speaking scripts (156 rows) | Yes | Yes | /phrases/ | P0 |
| Food vocabulary (84, Unit 03) | Yes | Yes | /vocabulary/food/ | P0 |
| Travel + directions (50+16, Units 14–15) | Yes | Yes | /vocabulary/travel/ | P0 |
| Family + people + pronouns (15+10+8 merged) | Yes | Yes | /vocabulary/family/ | P1 |
| Numbers + time (33+34, Units 01/16) | Yes | Yes | /vocabulary/numbers-time/ | P1 |
| Core verbs (105, Units 02/04) | Yes | Yes | /vocabulary/verbs/ | P1 |
| Home + routine + body (65+…, Units 03/10) | Yes | Yes | /vocabulary/daily-life/ | P1 |
| Pronouns grammar (Units 05/07) | Yes | Yes | /grammar/pronouns/ | P1 |
| Verbs + SOV (Units 01/04/21) | Yes | Yes | /grammar/verbs/ | P1 |
| Sentence structure + postpositions (01/04/08) | Yes | Yes | /grammar/sentence-structure/ | P1 |
| Shopping + market (12 + Unit 09 scripts, merged w/ numbers) | Yes | Yes | /vocabulary/shopping/ | P2 |
| Culture notes (156 rows) | Yes | Partial (in unit pages) | /lessons/\<unit\>/ | P2 |
| Per-word pages (1002) | Data only | **No — thin** | — | Rejected |
| Per-lesson pages (156) | Yes | **No — 26 unit pages** | /lessons/\<unit\>/ | P1 |
| Web audio | App-only mp3s | No (V1 text only) | — | Deferred |
| SRS / speaking scoring on web | App-only | No (funnel to app) | /app/ | Funnel |

Size gate: no standalone page under ~15 real entries.
