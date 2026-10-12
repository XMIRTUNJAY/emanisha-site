# Blog Guides — 200-Page SEO Plan

Data-driven pages rendered from `src/data/blog/guides.json` via
`src/pages/blog/[slug].astro`. Every page: unique keyword targeting,
Quick Answer table, audio (TTS "listen to this guide" + per-line 🔊),
mistakes, tip, FAQs (schema via Learn layout), internal links to
vocabulary/lessons/sibling guides, AppCTA, auto RSS + sitemap + OG cards.

## Uniqueness guarantees (build-time)
1. Duplicate guide slugs → build fails (`src/lib/guides.ts`).
2. Slug colliding with a static post in `src/pages/blog/` → build fails (`[slug].astro`).
3. Vocab headwords must exist in `vocab.json` → build fails.
4. Topics curated against the 28 existing static posts (no keyword overlap).

## Topic map → 200 pages

### A. Common phrases (target: ~110) — family: "X in Marathi"
Greetings & politeness (20): thank you ✓, hello ✓, good morning ✓, good night ✓, sorry ✓,
good evening, goodbye, please reply variants, excuse me (separate intent page), welcome,
congratulations, happy birthday, happy new year, good luck, be careful, all the best,
rest well, take care, my pleasure, nice to meet you (phrase page vs dialogue) — remaining 14.
Everyday states (25): I am hungry ✓, I don't know ✓, no problem ✓, I am fine ✓, see you again ✓,
I am tired, I am sleepy, I am busy, I am ready, I am coming, I am going, wait a moment,
hurry up, slow down, come here, sit down, stand up, look, listen, speak slowly,
say it again, louder please, I forgot, I remember, it's hot/cold.
Feelings & opinions (15): I like it (exists — skip), I love you (exists — skip), I am happy,
I am sad, I am angry, I am scared, it's delicious, it's beautiful ✓, it's funny,
I agree, I disagree, maybe, of course, never mind, no idea.
Questions (15): what is your name ✓, where are you from, how old are you, what time is it,
how much is this, where is the bathroom, do you speak English, what does this mean,
how do you say this, can you help me, what happened, when will it come, who is that,
why not, which one.
Verbs in daily frames (20): eat, drink, go, come, sleep, wake up, work, study, read, write,
buy, sell, pay, open, close, start, finish, help (exists — skip), call, meet.

### B. Common conversations (target: ~50) — situational dialogues
Basics (12): introducing yourself ✓, tea time ✓, directions ✓, family talk ✓,
market bargaining dialogue, restaurant ordering dialogue, auto-rickshaw fare dialogue,
phone call dialogue, neighbor greeting dialogue, doctor visit dialogue,
hotel check-in dialogue, colleague first-day dialogue.
Plans & social (12): weekend plans, movie night, festival visit, wedding greeting line,
inviting someone home, accepting/declining invitations, making plans with a friend,
asking a favor, borrowing things, sharing news, discussing weather dialogue,
talking about food likes.
Work & study (12): asking for leave, meeting a client, asking salary day, discussing deadline,
classroom questions, talking to teacher, exam talk, interview intro dialogue,
asking for directions in office, lunch break talk, overtime talk, farewell to colleague.
Travel & errands (14): buying tickets dialogue, bus dialogue, petrol pump dialogue,
bank dialogue, post office dialogue, pharmacy dialogue, tailor dialogue,
salon dialogue, vegetable market dialogue, sweet shop dialogue, taxi dialogue,
temple visit dialogue, gym/sports talk, emergency help dialogue.

### C. Word guides (target: ~40) — high-volume single words
water (exists — skip), love (exists — skip), beautiful ✓ +:
friend, mother, father, family, food, tea, money, time, day, night, morning, year,
house/home, work/job, school, teacher, market, station, road, tree, rain, sun,
heart, life, health, happiness, anger, peace, story, song, movie, cricket, photo,
name, color, question, answer, truth, dream.

## Batch status — 200-TARGET REACHED (215 guides live)
- Batches 1–4 (hand-curated): 51 pages — phrases, conversations, word guides.
- Batch 5 (shipped): 23 verb guides (eat, drink, sleep, wake up, read, write,
  sell, give, take, open, close, walk, run, speak, sit, learn, see, ask,
  remember, laugh, cry, play, wash).
- Batch 6 (shipped): 68 noun word guides (foods, animals, body, home,
  school, transport, nature, places).
- Batch 7 (shipped): 18 adjective guides + 6 position words
  (colors, sizes, inside/outside/up/down/front/behind).
- Batch 8 (shipped): 31 custom guides — family relations, time words
  (incl. काल yesterday/tomorrow), days of the week, numbers, rain/monsoon,
  song/story/health/truth/dream/life.
- Batch 9 (shipped): 8 phrase guides (good evening, welcome,
  congratulations, good luck, take care, be careful, wait a moment,
  stand up).
- Batch 10 (shipped): 10 conversations (bank, post office, petrol pump,
  phone call, neighbour visit, buying clothes, cricket talk, morning
  routine, study session, client meeting).
- Expander: tools/expand-guide-seeds.mjs — compact seeds auto-filled from
  vocab.json (title, description, lead, Hindi-contrast mistakes,
  noteEn+example tips, 3 FAQs, links). Seed files deleted after merge.

## Audit
`node tools/audit-blog-guides.mjs` — 215/215 pass. Build-time gate in
src/lib/guides.ts blocks thin pages permanently (6+ sections, 3+ answer
rows, curriculum spotlight counts as rows for word guides, 2+ mistakes,
tip, 3+ FAQs, 2+ links, lead/description minimums).
