import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Engineering-notebook collections, migrated under /notebook/.
// Schemas mirror the standalone notebook site; loaders point at
// src/content/notebook/<section>/.

const notebookBlog = defineCollection({
	// Load Markdown and MDX files in the `src/content/notebook/blog/` directory.
	loader: glob({ base: './src/content/notebook/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const notebookProjects = defineCollection({
	// One file per project in `src/content/notebook/projects/`.
	loader: glob({ base: './src/content/notebook/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			repo: z.string().optional(),
			demo: z.string().optional(),
			stack: z.array(z.string()).default([]),
			category: z.string().default('Other'),
			status: z.string().default(''),
			portfolioScore: z.number().min(0).max(100).optional(),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
			cover: z.string().optional(),
			language: z.string().optional(),
			focus: z.array(z.string()).default([]),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const notebookTutorials = defineCollection({
	// Lessons in `src/content/notebook/tutorials/<series>/<nn>-<slug>.{md,mdx}`.
	loader: glob({ base: './src/content/notebook/tutorials', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			series: z.string(),
			part: z.number(),
			project: z.string(),
			category: z.string().default(''),
			tags: z.array(z.string()).default([]),
			technologies: z.array(z.string()).default([]),
			difficulty: z.string().default('intermediate'),
			status: z.string().default(''),
			featured: z.boolean().default(false),
			draft: z.boolean().default(true),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const notebookExperiments = defineCollection({
	// Research-note style entries in `src/content/notebook/experiments/`.
	loader: glob({ base: './src/content/notebook/experiments', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		category: z.string().default('Experiment'),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		status: z.string().default('Complete'),
		hypothesis: z.string().default(''),
		technologies: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		draft: z.boolean().default(true),
	}),
});

export const collections = { notebookBlog, notebookProjects, notebookTutorials, notebookExperiments };
