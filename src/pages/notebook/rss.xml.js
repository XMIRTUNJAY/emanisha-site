import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../lib/notebook-consts';

export async function GET(context) {
	const posts = await getCollection('notebookBlog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/notebook/blog/${post.id}/`,
		})),
	});
}
