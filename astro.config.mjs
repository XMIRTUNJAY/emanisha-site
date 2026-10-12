// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Combined site: https://emanisha.in (main) + /learn-marathi/ (games & guides)
// LM pages live under src/pages/learn-marathi/ and lib/site.ts prefixes
// their URLs with /learn-marathi. GitHub Pages build: see docs.
const buildDate = new Date().toISOString();

export default defineConfig({
	site: 'https://emanisha.in',
	trailingSlash: 'always',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				return { ...item, lastmod: buildDate };
			},
		}),
	],
	viewTransitions: true,
});
