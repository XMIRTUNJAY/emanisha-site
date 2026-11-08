// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig, fontProviders } from 'astro/config';

// Combined site: https://emanisha.in (main) + /learn-marathi/ (games & guides)
// LM pages live under src/pages/learn-marathi/ and lib/site.ts prefixes
// their URLs with /learn-marathi. GitHub Pages build: see docs.
const buildDate = new Date().toISOString();

export default defineConfig({
	site: 'https://emanisha.in',
	trailingSlash: 'always',
	integrations: [
		expressiveCode({
			themes: ['github-light', 'github-dark'],
			themeCssSelector: (theme) =>
				theme.type === 'dark' ? "[data-theme='dark']" : ":root:not([data-theme='dark'])",
			styleOverrides: {
				codeFontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace",
				borderRadius: '8px',
				borderWidth: '1px',
			},
		}),
		mdx(),
		sitemap({
			// /dhyaana/ is a built SPA served from public/, not an Astro page,
			// so it has to be listed explicitly for crawlers to find it.
			customPages: ['https://emanisha.in/dhyaana/'],
			serialize(item) {
				return { ...item, lastmod: buildDate };
			},
		}),
	],
	viewTransitions: true,
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/notebook/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/notebook/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
