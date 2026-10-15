# 10K Goal — stored implementation prompt (verbatim, as received)

> Stored on 2026-10-15. This is the external prompt under feasibility review —
> see the review in chat. Verbatim content follows.

---

FULL IMPLEMENTATION PROMPT: emanisha.in Portfolio Integration
> Copy this entire prompt and give it to another LLM — it contains everything needed to execute the integration from current state to production.

🎯 OBJECTIVE

Transform emanisha.in (Astro portfolio on Hostinger) into a multi-subdomain portfolio platform showcasing 6 high-caliber local projects (61K–25K LOC each), with AdSense-ready content architecture and affiliate monetization path.

Current State: Single Astro site (emanisha-site) deployed to Hostinger via GitHub Actions → deploy branch. DE/Agent platform embedded at /de-agent/ from separate repo.

Target State:

emanisha.in              → Main portfolio (Astro)
blog.emanisha.in         → Engineering notebook (Astro, separate repo)
learn.emanisha.in        → Bol Marathi web (Flutter web build)
app.emanisha.in          → DE/Agent platform (Vercel, existing)
mf360.emanisha.in        → MF360 dashboard (future)

📁 CURRENT FILE STRUCTURE (Reference)

/c/Users/kumar/blog/emanisha-site/
├── .github/workflows/deploy-hostinger.yml   # Current deploy workflow
├── astro.config.mjs                          # site: 'https://emanisha.in'
├── src/
│   ├── data/indie-site.ts                    # 5 project definitions
│   ├── content/notebook/projects/            # Case studies (MDX)
│   │   ├── data-eng-mastery.mdx              # ✅ Done (20K chars)
│   │   ├── learn-marathi.mdx
│   │   ├── mutual-fund-360.mdx
│   │   └── networth-app.mdx
│   ├── pages/projects/[slug].astro           # Project detail template
│   └── pages/index.astro                     # Home with hero carousel
└── package.json                              # Astro 7, Node 22

Local Projects to Integrate:
| Project                  | Path                                    | LOC | Status                       |
|--------------------------|-----------------------------------------|-----|------------------------------|
| data-eng-mastery         | /c/Users/kumar/data-eng-mastery         | 61K | Case study done              |
| mf360                    | /c/Users/kumar/mf360                    | 29K | Partial case study           |
| autonomous-data-engineer | /c/Users/kumar/autonomous-data-engineer | 28K | Needs case study             |
| bol_marathi              | /c/Users/kumar/bol_marathi              | 23K | Flutter app, needs web build |
| youtube-automation-agent | /c/Users/kumar/youtube-automation-agent | 25K | Needs case study             |
| mf360-academy            | /c/Users/kumar/mf360-academy            | ~1K | Needs case study             |

🏗 ARCHITECTURE DECISIONS (Locked)

| Decision                        | Rationale                                                                                    |
|---------------------------------|----------------------------------------------------------------------------------------------|
| Hostinger + GitHub Actions      | Already working, supports unlimited subdomains, no AdSense restrictions                      |
| Separate repo per subdomain     | Clean isolation, independent deploys, separate AdSense sites                                 |
| DE/Agent stays on Vercel        | User requirement — app.emanisha.in CNAME → cname.vercel-dns.com                              |
| Subdomains (not subdirectories) | AdSense treats subdomains as separate sites = better RPM, independent policy                 |
| Flutter web for Bol Marathi     | flutter build web --release --base-href /learn/ → static hosting                             |
| Case study format               | Follow data-eng-mastery.mdx pattern: hero, decisions, architecture, verification, reflection |

📋 IMPLEMENTATION TASKS

PHASE 1: CLEAN EXISTING WORKFLOW (emanisha-site)

File: .github/workflows/deploy-hostinger.yml

Remove lines 38–61 (DE/Agent embed steps):
```yaml
REMOVE THESE STEPS:
- name: Checkout de-agent-platform
- name: Build /de-agent/ section
- name: Embed platform into public/de-agent
```

Keep: Build site → publish dist/ to deploy branch.

Verify: astro.config.mjs has site: 'https://emanisha.in' and trailingSlash: 'always'.

PHASE 2: ADD AUTONOMOUS-DATA-ENGINEER CASE STUDY

Create: /c/Users/kumar/blog/emanisha-site/src/content/notebook/projects/autonomous-data-engineer.mdx

Template: Follow data-eng-mastery.mdx structure exactly:
- Frontmatter (title, description, repo, stack, category, status, portfolioScore, featured, draft, cover, language, focus)
- ProjectHero component
- "Two ways to read" section
- The Spark / The Struggle / The Decisions (Decision components)
- How It Works (TechStack, ArchitectureDiagram, Callout)
- The Contract, Then The Code (real curl examples)
- Where It Stands (verified/observed/intended/unknown table + MetricsTable)
- How AI Was Used
- Reflection (what worked/didn't/surprised/change/unsolved)
- Build Your Own
- Timeline
- ScreenshotGallery + DemoVideo (placeholder paths)
- Go Deeper links

Content Source: Analyze /c/Users/kumar/autonomous-data-engineer/:
- 34 tools, 17 packages
- FastAPI, Polars/DuckDB, PySpark sandboxed
- Custom orchestration, real Indian govt scheme data
- Next.js frontend with API proxy
- 25/25 verification checks pass
- Gov-scheme-tracker subproject
- Packages: autonomous-data-engineer, de-agent-*, etc.

Key Metrics to Include:
- 34 tools, 17 packages
- 25/25 verification checks
- Real govt scheme data (not synthetic)
- PySpark sandboxed execution
- Custom orchestration engine

PHASE 3: UPDATE PROJECT REGISTRY

File: /c/Users/kumar/blog/emanisha-site/src/data/indie-site.ts

Add/Update projects array:
```typescript
export const projects = [
  // Existing: marathi-learning, student-news, headspace-india, data-engineer, engineering-notebook

  // UPDATE data-engineer → autonomous-data-engineer
  {
    slug: 'autonomous-data-engineer',
    title: 'Pipelines that run themselves.',
    name: 'Autonomous Data Engineer',
    category: 'Web & data',
    kind: 'data',
    description: 'An autonomous data engineering platform with 34 tools, 17 packages, and human approval gates.',
    detail: 'A production-grade autonomous data engineering system: custom orchestration, sandboxed PySpark, real Indian government scheme data, and a Next.js frontend with API proxy. 34 tools across 17 packages, 25/25 verification checks passing.',
    color: 'sand',
    liveUrl: 'https://app.emanisha.in',  // NEW FIELD
  },

  // ADD mf360
  {
    slug: 'mf360',
    title: 'Mutual funds, decoded.',
    name: 'MF360 — Mutual Fund Analytics',
    category: 'Finance',
    kind: 'finance',
    description: 'Full-stack mutual fund analytics: portfolio tracking, factor analysis, tax optimization, and academy content.',
    detail: 'A comprehensive mutual fund platform with Dagster orchestration, FastAPI backend, React/Vite frontend, and real AMFI/SEBI data pipelines. Includes MF360 Academy for investor education.',
    color: 'blue',
    liveUrl: 'https://mf360.emanisha.in',  // Future
  },

  // ADD youtube-automation-agent
  {
    slug: 'youtube-automation',
    title: 'Content that compounds.',
    name: 'YouTube Automation Agent',
    category: 'Automation',
    kind: 'automation',
    description: 'AI agent pipeline for YouTube content: research → script → voice → edit → publish → analytics.',
    detail: 'End-to-end YouTube automation using LangGraph orchestration, Whisper + ElevenLabs + FFmpeg, with performance tracking and A/B testing built in.',
    color: 'red',
  },

  // ADD mf360-academy
  {
    slug: 'mf360-academy',
    title: 'Learn funds. Build wealth.',
    name: 'MF360 Academy',
    category: 'Education',
    kind: 'education',
    description: 'Interactive mutual fund education: courses, calculators, and certification for Indian investors.',
    detail: 'Structured learning platform for mutual fund investing — SEBI-compliant curriculum, interactive calculators, progress tracking, and certification.',
    color: 'green',
  },
] as const;
```

Add liveUrl?: string to IndieProject type.

Update [slug].astro to render "Live Demo" button when project.liveUrl exists.

PHASE 4: CREATE blog.emanisha.in (Notebook Subdomain)

New Repo: emanisha-notebook (GitHub)

Structure: Copy emanisha-site but modify:
1. astro.config.mjs:
   ```js
   site: 'https://blog.emanisha.in',
   base: '/',  // Root of subdomain
   ```
2. Remove: Hero carousel, project shelf, route band, mobile device frames
3. Keep: Notebook index, article pages, case studies, tutorials, RSS, sitemap
4. Content: All /src/content/notebook/ MDX files (copy entire folder)
5. Layout: Single-column reading-optimized, table of contents sidebar
6. Deploy Workflow: .github/workflows/deploy-hostinger.yml → publish to deploy-blog branch
7. Hostinger Site 2: Connect repo → branch deploy-blog → target public_html/blog → domain blog.emanisha.in

AdSense: Separate ad units for article pages, high CPC keywords (data engineering, finance, AI).

PHASE 5: BUILD & DEPLOY Bol Marathi Web → learn.emanisha.in

Source: /c/Users/kumar/bol_marathi (Flutter)

Build Command:
```bash
cd /c/Users/kumar/bol_marathi
flutter build web --release --base-href /learn/ --web-renderer canvaskit
```
Output: build/web/

New Repo: bol-marathi-web (GitHub)
- Contents: build/web/ only (static files)
- index.html at root
- .htaccess or _headers for SPA routing (if needed)

Deploy Workflow: .github/workflows/deploy-hostinger.yml:
```yaml
name: Deploy Bol Marathi Web
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Hostinger
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: deploy-learn
          force_orphan: true
```

Hostinger Site 3: Connect bol-marathi-web → branch deploy-learn → target public_html/learn → domain learn.emanisha.in

AdSense: Games/guides pages = high engagement, Indian traffic, education niche.

PHASE 6: CONFIGURE DNS (Hostinger hPanel)

DNS Zone for emanisha.in:

| Type  | Name  | Target               | TTL  |
|-------|-------|----------------------|------|
| A     | @     | <HOSTINGER_IP>       | 3600 |
| CNAME | www   | emanisha.in          | 3600 |
| CNAME | blog  | emanisha.in          | 3600 |
| CNAME | learn | emanisha.in          | 3600 |
| CNAME | app   | cname.vercel-dns.com | 3600 |
| CNAME | mf360 | emanisha.in          | 3600 |

Hostinger Sites Configuration:
| Site | Domain            | Document Root     | Git Repo          | Branch       |
|------|-------------------|-------------------|-------------------|--------------|
| 1    | emanisha.in       | public_html       | emanisha-site     | deploy       |
| 2    | blog.emanisha.in  | public_html/blog  | emanisha-notebook | deploy-blog  |
| 3    | learn.emanisha.in | public_html/learn | bol-marathi-web   | deploy-learn |
| 4    | mf360.emanisha.in | public_html/mf360 | (future)          | (future)     |

SSL: Enable "Force HTTPS" for all sites in hPanel → SSL.

PHASE 7: CONFIGURE DE/AGENT ON VERCEL

Existing Vercel Project: de-agent-platform (or whatever name)

Steps:
1. Vercel Dashboard → Project → Settings → Domains
2. Add app.emanisha.in
3. Verify DNS (CNAME → cname.vercel-dns.com)
4. Enable "Automatic HTTPS"

No code changes needed — already deployed.

PHASE 8: ADSENSE & AFFILIATE PREPARATION

Content Requirements (before AdSense application):
- [ ] 20+ quality content pages indexed
- [ ] Privacy Policy page (/privacy/)
- [ ] Terms of Service (/terms/)
- [ ] About/Contact pages
- [ ] No placeholder/lorem content
- [ ] Original content (case studies qualify)

Ad Unit Placement (per subdomain):
| Subdomain         | Ad Units                                              |
|-------------------|-------------------------------------------------------|
| emanisha.in       | Header (1), In-article (2), Sidebar (1)               |
| blog.emanisha.in  | In-article (3), End-of-article (1), Sticky footer (1) |
| learn.emanisha.in | Between games (1), Guide pages (2), Dictionary (1)   |
| app.emanisha.in   | AdSense for Platforms / AdMob (later)                 |

Affiliate Links: Add in case studies (e.g., Databricks certification, hosting, tools) — use rel="sponsored nofollow".

PHASE 9: CONTENT PIPELINE (Ongoing)

Create 10+ tutorial posts from existing projects:
1. "How I Built a Spaced Repetition Engine in Pure Python" (data-eng-mastery)
2. "Sandboxed PySpark: Running Untrusted Code Safely" (autonomous-data-engineer)
3. "Dagster Orchestration for Mutual Fund Data" (mf360)
4. "Flutter Web: Shipping a Mobile App to Browser" (bol_marathi)
5. "LangGraph for YouTube Automation" (youtube-automation-agent)
6. "PostgreSQL + pgvector: One Database for Everything" (data-eng-mastery)
7. "SM-2 Algorithm: Memory Science as Arithmetic" (data-eng-mastery)
8. "Real Govt Data Pipelines: Indian Schemes API" (autonomous-data-engineer)
9. "SEBI-Compliant Financial Content Architecture" (mf360-academy)
10. "Zero-Cost ML: Arithmetic Recommendations Over LLMs" (data-eng-mastery)

Each post: 2000+ words, code snippets, architecture diagrams, internal links to case studies.

✅ ACCEPTANCE CRITERIA

| Criterion                                   | Verification                              |
|---------------------------------------------|-------------------------------------------|
| emanisha.in loads with 6 project cards      | curl -I https://emanisha.in → 200         |
| blog.emanisha.in shows notebook index       | curl -I https://blog.emanisha.in → 200    |
| learn.emanisha.in loads Bol Marathi web     | curl -I https://learn.emanisha.in → 200   |
| app.emanisha.in loads DE/Agent              | curl -I https://app.emanisha.in → 200     |
| Autonomous Data Engineer case study exists  | /projects/autonomous-data-engineer/ → 200 |
| All case studies link correctly             | Check each /projects/<slug>/              |
| GitHub Actions pass for all repos           | Green checkmarks in Actions tab           |
| Subdomains have valid SSL                   | 🔒 in browser                             |
| AdSense-ready: 20+ pages, policies, contact | Manual review                             |

🛠 COMMANDS TO RUN (In Order)

```bash
1. Clean emanisha-site workflow
cd /c/Users/kumar/blog/emanisha-site
Edit .github/workflows/deploy-hostinger.yml (remove lines 38–61)
git add -A && git commit -m "chore: remove de-agent embed, stays on Vercel" && git push

2. Create autonomous-data-engineer case study
(Write MDX to src/content/notebook/projects/autonomous-data-engineer.mdx)
Update src/data/indie-site.ts
git add -A && git commit -m "feat: add autonomous-data-engineer case study" && git push

3. Build Bol Marathi web
cd /c/Users/kumar/bol_marathi
flutter build web --release --base-href /learn/ --web-renderer canvaskit
Copy build/web/* to new repo bol-marathi-web, push

4. Create emanisha-notebook repo
Copy emanisha-site, modify astro.config.mjs, strip non-blog pages
Push, configure Hostinger Site 2

5. Configure Hostinger DNS & Sites (manual in hPanel)

6. Configure Vercel custom domain for app.emanisha.in (manual in Vercel)

7. Verify all 4 subdomains live
```

📦 DELIVERABLES CHECKLIST

- [ ] Updated deploy-hostinger.yml (no DE/Agent embed)
- [ ] autonomous-data-engineer.mdx (20K+ chars, following template)
- [ ] Updated indie-site.ts with 6 projects + liveUrl field
- [ ] Updated [slug].astro to show "Live Demo" button
- [ ] emanisha-notebook repo deployed to blog.emanisha.in
- [ ] bol-marathi-web repo deployed to learn.emanisha.in
- [ ] DNS records configured in Hostinger
- [ ] Vercel custom domain app.emanisha.in active
- [ ] Privacy Policy, Terms, Contact pages on all subdomains
- [ ] 10 tutorial posts drafted (can be done post-launch)

⚠️ GOTCHAS TO WATCH

1. Astro trailingSlash: 'always' — all URLs must end with / in sitemap/canonical
2. Flutter web --base-href /learn/ — critical for subdirectory routing
3. Hostinger Git deploy — force_orphan: true wipes branch history; only deploy branch affected
4. Vercel CNAME — must be cname.vercel-dns.com (not project-specific)
5. AdSense — apply only after 20+ pages indexed; use same account across subdomains
6. Relative vs absolute URLs — in MDX, use absolute https://emanisha.in/... for cross-subdomain links

🎯 SUCCESS METRICS (Post-Launch)

| Metric                | Target (Month 1)       | Target (Month 3)   |
|-----------------------|------------------------|--------------------|
| Total pages indexed   | 30+                    | 60+                |
| Monthly pageviews     | 2,000                  | 10,000+            |
| AdSense RPM           | $1–3                   | $3–8               |
| Top traffic source    | Organic (Marathi + DE) | Organic + Referral |
| Case study dwell time | 3+ min                 | 5+ min             |

This prompt is complete. The implementing LLM should work through Phases 1–9 sequentially, verifying each before proceeding. All file paths, commands, and content requirements are specified.
