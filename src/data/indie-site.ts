// Content for the main emanisha.in site (ported from the eManisha app).
export interface IndieProject {
	slug: string;
	title: string;
	name: string;
	category: string;
	kind: string;
	description: string;
	detail: string;
	color: string;
	/** Live URL (internal or external). Button renders only when set. */
	liveUrl?: string;
	/** Label for the live button. Defaults to 'Open live site'. */
	liveLabel?: string;
	/** Share-card art shown in the shelf panel. Defaults to the generic card. */
	image?: string;
	/** Short tab label (one word). */
	short: string;
	/** Status line (e.g. LIVE NOW). Defaults to category. */
	status?: string;
	/** Prompt-box line, typed out on activation. Defaults to status. */
	prompt?: string;
}
export const projects: IndieProject[] = [
	{
		slug: 'marathi-learning',
		short: 'Marathi',
		status: 'LIVE NOW',
		prompt: 'Teach me Marathi from zero — a little every day.',
		title: 'Marathi, one word at a time.',
		name: 'Marathi language-learning app',
		category: 'Education',
		kind: 'marathi',
		description: 'An approachable space for learning Marathi and connecting with the language.',
		detail:
			'A language-learning build centered on Marathi. The idea is simple: make getting started feel less intimidating and give the language a welcoming digital home.',
		color: 'peach',
		liveUrl: '/learn-marathi/',
		liveLabel: 'Explore the live Marathi build',
		image: '/og/og-project-marathi-learning.png',
	},
	{
		slug: 'student-news',
		short: 'Clarity',
		status: 'CONCEPT',
		prompt: 'Explain today’s news like I’m a curious student.',
		title: 'A little scroll. A wider world.',
		name: 'News scroll for students',
		category: 'Education',
		kind: 'news',
		description: 'A news scroll that helps students explore what\u2019s happening around them.',
		image: '/og/og-project-student-news.png',
		detail:
			'A news-focused build for students, bringing updates into an easy-to-browse scroll. It explores how a familiar reading format can make discovering the world more approachable.',
		color: 'yellow',
	},
	{
		slug: 'headspace-india',
		short: 'Dhyaana',
		status: 'LIVE NOW',
		prompt: 'Guide a five-minute morning breathing session.',
		title: 'A little more room to breathe.',
		name: 'Dhyaana — Contemplative Platform',
		category: 'Wellness',
		kind: 'wellness',
		description: 'Exploring a calmer digital space for meditation, breathwork, and Indian contemplative practices.',
		detail:
			'A contemplative web platform exploring Indian contemplative wisdom, guided meditation, breath awareness, sleep journeys, and reflective inquiry. Full-screen, installable, offline-capable, and calm by design.',
		color: 'rose',
		image: '/og/og-dhyaana.png',
		liveUrl: '/dhyaana/',
	},
	{
		slug: 'data-engineer',
		short: 'DE/AGENT',
		status: 'ON THE ROADMAP',
		prompt: 'Run my data pipeline while I sleep.',
		title: 'Making complex things clear.',
		name: 'Data engineer site',
		category: 'Web & data',
		kind: 'data',
		description: 'A focused web presence for the world of data engineering.',
		detail:
			'A website build centered on data engineering. It explores how to communicate technical work through a clear structure and a focused, readable digital experience.',
		color: 'sand',
		liveUrl: '/de-agent/',
		liveLabel: 'Open the DE//AGENT platform',
		image: '/og/og-project-data-engineer.png',
	},
	{
		slug: 'engineering-notebook',
		short: 'Notebook',
		status: 'LIVE',
		prompt: 'Show me systems with receipts, not promises.',
		title: 'Notes with receipts.',
		name: 'Engineering Notebook',
		category: 'Web & data',
		kind: 'notes',
		description: 'Real systems, documented with architecture, evidence, and decisions.',
		detail:
			'A personal engineering publication: data-engineering case studies, multi-part tutorials, essays and hypothesis-first experiments — every claim backed by evidence, every decision recorded.',
		color: 'sand',
		liveUrl: '/notebook/',
		liveLabel: 'Open the Engineering Notebook',
		image: '/og/og-project-engineering-notebook.png',
	},
	{
		slug: 'autonomous-data-engineer',
		short: 'Auto DE',
		status: 'ACTIVE BUILD',
		prompt: 'Profile this dataset — and wait for my approval.',
		image: '/og/og-project-autonomous-data-engineer.png',
		title: 'Pipelines that run themselves.',
		name: 'Autonomous Data Engineer',
		category: 'Web & data',
		kind: 'data',
		description: 'An autonomous data engineering platform with typed tools, human approval gates, and full trace replay.',
		detail:
			'A production-grade autonomous data engineering system: state-machine orchestration, nine typed tools, human approval in schema, and trace replay — proven on real Indian government scheme data with a Next.js dashboard.',
		color: 'sand',
	},
	{
		slug: 'youtube-automation',
		short: 'YouTube',
		status: 'ACTIVE BUILD',
		prompt: 'Plan this week’s videos — queue them for review.',
		image: '/og/og-project-youtube-automation.png',
		title: 'Content that compounds.',
		name: 'YouTube Automation Agent',
		category: 'Automation',
		kind: 'data',
		description: 'An AI crew that runs a YouTube channel end to end — with approval-first publishing gates.',
		detail:
			'Seven specialist agents (strategy, script, thumbnail, SEO, production, publishing, analytics) with gated publishing, SQLite evidence, and controlled growth experiments. Self-hosted, MIT licensed.',
		color: 'yellow',
	},
	{
		slug: 'mf360',
		short: 'MF360',
		status: 'ACTIVE BUILD',
		prompt: 'Decode my mutual fund statement — honestly.',
		image: '/og/og-project-mf360.png',
		title: 'Mutual funds, decoded.',
		name: 'MF360 — Mutual Fund Analytics',
		category: 'Finance',
		kind: 'data',
		description: 'Trustworthy answers from messy Indian mutual-fund data — methodology first, corrections as rows.',
		detail:
			'A DIY investor platform for Indian mutual funds: portfolio tracking, cost and overlap engines, tax lots, and golden-portfolio testing. Method-first development with versioned formulas and a modular monolith.',
		color: 'sand',
	},
	{
		slug: 'mf360-academy',
		short: 'Academy',
		status: 'CONCEPT',
		prompt: 'Prep me for certification — zero fluff.',
		image: '/og/og-project-mf360-academy.png',
		title: 'Learn funds. Build wealth.',
		name: 'MF360 Academy',
		category: 'Education',
		kind: 'notes',
		description: 'Certification prep with zero runtime AI: offline pipeline generates, the website serves finished intelligence.',
		detail:
			'An AI-native certification preparation platform where models work the offline night shift and students meet only validated, versioned content through deterministic APIs. Concept stage: engine and pipeline built, store awaiting its first syllabus.',
		color: 'yellow',
	},
];

export const posts = [
	{
		slug: 'small-builds-useful-questions',
		category: 'Building',
		title: 'Small builds start with useful questions',
		excerpt: 'A simple way to give an idea a little more direction.',
		body: [
			'Before choosing a framework, ask who the build is for and what it should help them do. A clear answer is more useful than a long feature list.',
			'Write down one action a visitor should be able to complete. Sketch the shortest path to it, then build that path before the extras.',
			'A small scope is not a small ambition. It gives you something concrete to test, discuss, and improve.',
		],
	},
	{
		slug: 'designing-for-language',
		category: 'Notes',
		title: 'Making room for language in an interface',
		excerpt: 'Why language deserves more than a last-minute translation.',
		body: [
			'Language shapes an interface from the beginning. Letterforms, line lengths, and familiar words all affect whether a screen feels welcoming.',
			'Give text room to grow. Test the actual script, not just an English placeholder, and check how it behaves on a small screen.',
			'A thoughtful language experience starts with listening to the people who use it. An interface should support their words, not force those words into an inflexible layout.',
		],
	},
	{
		slug: 'clear-technical-websites',
		category: 'Web & data',
		title: 'A technical website can still feel human',
		excerpt: 'Clarity is a useful starting point for complex work.',
		body: [
			'Technical work does not have to be introduced with technical language. Start with the problem, explain the purpose, and let the detail follow.',
			'Use a clear hierarchy so readers can choose their depth. A short summary and a more detailed explanation can live together without competing.',
			'The goal is not to remove complexity. It is to give people a helpful way into it.',
		],
	},
] as const;

export type IndiePost = (typeof posts)[number];
