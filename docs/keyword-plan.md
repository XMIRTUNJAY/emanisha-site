# Keyword plan — 100 pages for Bing + Google (Oct 2026)

Goal: $100/mo display ads. New domain (2 days old) → expect Bing/Edge listings
in days–weeks (submit IndexNow + sitemap on day 1), Google top-10 over months
as authority builds. Nothing here is guaranteed; every keyword below was
chosen as long-tail, question-form, or error-string shaped (weak-SERP pattern:
forums/Quora/thin pages rank today). Before writing any page, do the 5-minute
incognito check: search it, and only write if ≥2 of the top 10 are forums,
Reddit/Quora, or thin/small sites. Skip anything owned by brands/docs giants.

Dedupe rule: LM slugs must not collide with the 215 in
`src/data/blog/guides.json` (grep the slug first). DE slugs must not collide
with `src/content/notebook/{blog,projects,tutorials,experiments}/`.

Pipelines: DE pages → new `.mdx` in `src/content/notebook/blog/` (schema:
title/description/pubDate). LM pages → `src/data/blog/guides.json` via
`tools/expand-guide-seeds.mjs`, must pass `tools/audit-blog-guides.mjs`
(6+ sections, 3+ answers, 2+ mistakes, tip ≥40 chars, 3+ FAQs, 2+ links).

## Setup first (15 minutes, worth more than 10 pages)

1. Bing Webmaster Tools → add emanisha.in → submit `sitemap-index.xml` →
   enable IndexNow (Bing indexes new URLs in minutes, also feeds Copilot/ChatGPT search).
2. Google Search Console → same sitemap → Request Indexing on `/`, `/notebook/`, 5 best pages.
3. Internal linking: every new page gets ≥2 inbound links from related existing pages.

## A. Data engineering + agents (60) → `/notebook/blog/<slug>/`, English, global RPM

### A1. Error strings (highest win rate — copy the exact error)

1. `airflow dag import error` — why a DAG file fails to import + 6 fixes
2. `airflow scheduler not running dags` — scheduler vs triggerer checklist
3. `psycopg2 operationalerror connection refused` — Postgres connection triage
4. `kafka no leader for partition` — what it means + recovery steps
5. `spark out of memory executor lost` — memory tuning walkthrough
6. `dbt model not found` — ref/source/path fixes
7. `docker postgres password authentication failed` — local dev fix
8. `pip install psycopg2-binary fails` — pg_config/build deps fix
9. `airflow webserver 502 bad gateway` — reverse-proxy + worker fixes
10. `pandas memoryerror large csv` — chunking/polars alternatives
11. `sqlalchemy connection pool exhausted` — pool sizing guide
12. `dagster sensor not firing` — sensor debugging checklist
13. `snowflake warehouse auto-suspend not working` — cost-setting fixes
14. `redshift disk full` — vacuum/sort-key triage
15. `airflow task stuck in queued` — executor + pool diagnosis

### A2. How-to, beginner shaped (`for beginners`, `step by step`, `explained`)

16. `what is a data pipeline explained` — ETL vs ELT with one diagram
17. `oltp vs olap explained with examples` — interview staple, weak SERPs
18. `star schema vs snowflake schema` — modeling choice guide
19. `what is slowly changing dimension type 2` — SCD1/2/3 with SQL
20. `how to schedule python script daily` — cron vs Airflow vs Dagster
21. `how to learn data engineering from scratch` — 90-day roadmap
22. `data engineer vs analytics engineer` — role split + which to pick
23. `what is dbt seed` — CSVs into warehouse, worked example
24. `how to test data pipelines` — great-expectations/dbt tests intro
25. `what is data lineage` — tools + why auditors care
26. `batch vs streaming` — when each wins, cost lens
27. `how to become data engineer without degree` — India + global paths
28. `data engineering projects for resume` — 7 buildable ideas (links to notebook projects)
29. `what is medallion architecture` — bronze/silver/gold explained
30. `how to handle late arriving data` — watermarking + reconciliation patterns

### A3. Tool comparisons (affiliate-friendly, high intent)

31. `airflow vs dagster for small team` — honest tradeoffs
32. `dbt vs stored procedures` — when models beat procs
33. `postgres vs mysql for analytics` — window functions + types
34. `pandas vs polars` — speed test with numbers (notebook-style evidence)
35. `kafka vs rabbitmq` — throughput vs routing framing
36. `snowflake vs bigquery pricing` — cost-model comparison
37. `airflow vs prefect` — UX + deployment differences
38. `spark vs duckdb` — small-data heresy post (linkable!)
39. `superset vs metabase` — open-source BI pick guide
40. `great expectations vs dbt tests` — quality-layering comparison

### A4. Cost + career (high CPC topics, India + global)

41. `how much does snowflake cost` — warehouse math worked example
42. `reduce bigquery costs` — partitioning/clustering checklist
43. `data engineer salary in india` — fresher to staff bands
44. `data engineer salary us vs india` — remote-work framing
45. `is data engineering a good career` — 2026 honest take (cite the 6-specialty split)
46. `data engineering interview questions for freshers` — 30 Q&A
47. `sql interview questions data engineer` — window-function heavy set
48. `python interview questions data engineer` — pandas + API set
49. `how to switch from analyst to data engineer` — adjacent-role playbook
50. `data engineering resume sample` — annotated example + mistakes

### A5. AI agents × data (your differentiator — Notebook voice, evidence-first)

51. `what is rag architecture` — retrieval pipeline with diagram (mermaid)
52. `how to evaluate rag pipeline` — faithfulness/relevance metrics
53. `ai agent for data validation` — approval-gate pattern from DE/AGENT
54. `llm for sql generation accuracy` — measured test, honest limits
55. `how to chunk documents for rag` — size/overlap experiments with numbers
56. `vector database explained` — pgvector-first take
57. `prompt engineering for data extraction` — invoice/log examples
58. `what is mcp server` — model-context-protocol explainer
59. `ai agent vs workflow automation` — human-in-loop framing
60. `how to stop llm hallucinations in reports` — grounding + eval checklist

## B. Learn Marathi gaps (25) → guides pipeline, fill festival/travel/work/life + mechanics

Festivals & life (none in current 215):

61. `diwali greetings in marathi` — wishes + replies for family/neighbors
62. `ganpati festival phrases in marathi` — visarjan + darshan lines
63. `gudi padwa wishes in marathi` — new-year greetings + customs vocab
64. `makar sankranti phrases in marathi` — tilgul + haldi-kunku lines
65. `wedding wishes in marathi` — shubheccha + ceremony vocab
66. `birthday wishes in marathi` — formal vs friend registers
67. `condolence in marathi` — what to say at a funeral (high-need, thin SERPs)

Travel & money (beyond the 4 travel conversations that exist):

68. `auto rickshaw phrases in marathi` — fare + directions bargaining
69. `train travel phrases in marathi` — reservation + berth + TC lines
70. `hotel room problem in marathi` — AC/water/checkout complaints
71. `bank account phrases in marathi` — deposit/withdrawal/KYC lines
72. `shopping bargaining in marathi` — price + discount haggling
73. `mobile recharge shop in marathi` — plan + balance queries

Health & help (high intent, weak competition):

74. `doctor visit in marathi` — symptoms + prescription lines
75. `fever cold cough in marathi` — body-part + symptom vocab
76. `emergency help in marathi` — police/accident/fire lines

Mechanics (grammar/how-it-works, evergreen):

77. `marathi gender rules` — masculine/feminine/neuter with tests
78. `marathi plural rules` — vachan patterns with exceptions
79. `marathi past tense` — bhootkal conjugations with examples
80. `marathi postpositions explained` — ne/la/kade vs Hindi me/se
81. `how to pronounce ळ in marathi` — the famous retroflex flap guide
82. `marathi numbers 1 to 100` — full table + audio pattern (check dupe: numbers page exists, angle = full table)
83. `marathi proverbs with meaning` — 15 mhani + usage
84. `marathi tongue twisters` — pronunciation practice set
85. `marathi matra chart` — kanya/velanti full chart for kids + learners

## C. Tools & best-of (15) → main site or notebook, affiliate + ad intent

86. `best way to learn marathi online` — app/course/YouTube roundup (own Bol Marathi #1 honestly)
87. `best marathi dictionary app` — roundup with own dictionary listed
88. `best free data engineering courses` — roadmap + affiliate links
89. `best laptop for data engineering students` — specs-first buying guide (India pricing)
90. `best sql editor for beginners` — DBeaver/DataGrip/vscode roundup
91. `best python libraries for data engineering` — pandas/polars/duckdb/sqlmodel set
92. `best airflow alternative` — Dagster/Prefect/Windmill mini-reviews
93. `best vector database for small projects` — pgvector-first honest pick
94. `best marathi keyboard app` — transliteration app roundup
95. `best books to learn data engineering` — Designing Data-Intensive Applications + 6 more
96. `best marathi learning youtube channels` — curated list (embed-friendly)
97. `duolingo marathi alternative` — Duolingo has no Marathi; capture that intent
98. `is rosтаone good` — skip; replaced: `is babbel good for marathi` — honest no + better path
99. `marathi translator app accuracy` — Google Translate limits + human check workflow
100. `free etl tools for small business` — Airbyte/Meltano/DLT + hosted costs

## Order of attack

- Week 1: setup steps + first 10 (A1 errors #1–5 + B festival #61–63 + C #97, #86).
- Weeks 2–4: 10/week, alternating one A-cluster with one B/C page (keeps all sections fresh for crawlers).
- After 30 pages: check Bing Webmaster + GSC queries ranked 11–30 → double down on what moves.
- Re-validate each keyword with the incognito check the day you write it — SERPs change.

## What NOT to do

- No thin variations of one keyword across pages (cannibalization).
- No AI-slop FAQs; every FAQ must be a real asked question (PAA/Reddit/Quora).
- No publishing without the audit gate (LM) or schema-valid frontmatter (DE).
- No chasing head terms (`data engineer`, `learn marathi`) until 100+ long-tails rank.
