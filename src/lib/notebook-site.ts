// Base-aware URL helper for the /notebook/ subsection.
// Mirrors the standalone notebook's siteUrl semantics exactly: the base is a
// fixed '/notebook' prefix (no trailing-slash rewriting, so file URLs like
// /notebook/rss.xml and /notebook/favicon.svg?v=2 keep working).
const base = '/notebook';

export function siteUrl(path: string = '/'): string {
	if (!path.startsWith('/')) {
		path = '/' + path;
	}
	return `${base}${path}`;
}
