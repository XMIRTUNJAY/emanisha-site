# Game SFX — provenance

All sounds in this folder are **original synthesized MP3s** created for this
site (no external licensing, no attribution required). Source generator:
`tools/make_sfx.py` (regenerate with `python3 tools/make_sfx.py audio`; needs
numpy + ffmpeg with libmp3lame).

Folders shipped (games use these only — `timer`, `word_map` and
`memory_match` categories are not needed and were not copied):

| Folder | Files | Used for |
|---|---|---|
| ui | 11 | key/tile taps, back, whoosh, pop, game start |
| feedback | 8 | correct / correct_soft / incorrect / hint / try_again |
| streak | 10 | streak_1..6, streak_lost, combos |
| reward | 8 | coin, stars, level_up, new_high_score |
| fanfare | 4 | round_complete, game_complete, game_over, perfect_score |
| sentence_builder | 9 | word pick / place / remove, sentence correct / wrong |

`manifest.json` lists every file with id, category, duration and description.
Playback goes through `src/lib/games/sfx.ts` (lazy-load, rewind-to-0, mute
toggle persisted in localStorage, silent when unsupported).
