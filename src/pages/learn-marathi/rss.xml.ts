// RSS 2.0 feed for the blog (/blog/*). Titles and descriptions are read
// straight from each post's frontmatter or <Learn> props so the feed can
// never drift from the pages themselves.
import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';
import { siteUrl } from '../../lib/site';

type RawMod = string;
const sources = import.meta.glob('./blog/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, RawMod>;
import guidesJson from '../../data/blog/guides.json';

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

const attr = (src: string, name: string): string | null => {
  const m = src.match(new RegExp(`${name}="([^"]*)"`));
  return m ? decode(m[1]) : null;
};
const exported = (src: string, name: string): string | null => {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? decode(m[1].replace(/\\'/g, "'")) : null;
};

const items = Object.entries(sources)
  .filter(([path]) => !path.endsWith('/index.astro'))
  .map(([path, src]) => {
    const title = exported(src, 'title') ?? attr(src, 'title');
    const description = exported(src, 'description') ?? attr(src, 'description');
    const pubDate = exported(src, 'pubDate');
    const slug = path.replace(/^\.\/blog\//, '').replace(/\.astro$/, '');
    if (!title || !description) return null;
    return {
      title,
      description,
      link: siteUrl(`/blog/${slug}/`),
      ...(pubDate ? { pubDate: new Date(pubDate) } : {}),
      categories: ['Marathi', 'Language learning'],
    };
  })
  .filter((x): x is NonNullable<typeof x> => x !== null)
  // data-driven guides (src/data/blog/guides.json) ride the same feed
  .concat(
    (guidesJson as { slug: string; title: string; description: string; pubDate: string }[]).map((g) => ({
      title: g.title,
      description: g.description,
      link: siteUrl(`/blog/${g.slug}/`),
      pubDate: new Date(g.pubDate),
      categories: ['Marathi', 'Language learning'],
    }))
  )
  .sort((a, b) => {
    const da = a.pubDate ? a.pubDate.getTime() : 0;
    const db = b.pubDate ? b.pubDate.getTime() : 0;
    if (da !== db) return db - da;
    return a.title.localeCompare(b.title);
  });

export const GET = () =>
  rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: new URL('/learn-marathi/', import.meta.env.SITE).toString(),
    items,
    customData: '<language>en</language>',
  });
