// Visible page art. Uses WebP with PNG fallback for OG/social.
// LQIP uses WebP for tiny blur-up placeholders.
// Now uses route-to-filename mapping for renamed files.
// SEMANTIC MAPPING: Each route maps to an image whose visual content matches the page topic.
// Verified via OCR audit of all 221 OG images (see tools/audit-images.mjs).
import { siteUrl } from './site';
import lqipManifest from '../data/lqip.json';
import ogManifest from '../data/og-manifest.json';

const routeToFile = new Map<string, string>();
for (const route of ogManifest.routes) {
  let base = route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`;
  // Check for renamed files - SEMANTICALLY CORRECTED MAPPINGS
  const renamedMap: Record<string, string> = {
    // Static pages
    'blog': 'og-blog-index',                                    // Blog index → situational guide (correct)
    // English → Marathi
    'english-to-marathi/words': 'og-blog-pune-newcomer-words',  // Words page → newcomer words image
    // Grammar
    'grammar/commands-polite': 'og-grammar-commands-polite',    // NEW: from Stitch (commands/polite)
    // Hindi → Marathi
    'hindi-to-marathi/advanced-structures': 'og-hindi-to-marathi-advanced-structures',  // NEW: from Stitch (passive/causative)
    'hindi-to-marathi/daily-conversation': 'og-hindi-to-marathi-daily-conversation',    // NEW: from Stitch (survival sentences)
    'hindi-to-marathi/festivals': 'og-hindi-to-marathi-festivals',  // NEW: from Stitch (Diwali/Ganpati)
    'hindi-to-marathi/greetings': 'og-hindi-to-marathi-greetings',  // Keep existing (matches)
    'hindi-to-marathi/time-seasons': 'og-english-to-marathi-time-seasons',  // Cross-family OK (time/seasons)
    'hindi-to-marathi/travel': 'og-english-to-marathi-transport-travel',    // Cross-family OK (transport/travel)
    'hindi-to-marathi/shopping': 'og-vocabulary-shopping',  // Use vocabulary shopping image (correct)
    'hindi-to-marathi/work-career': 'og-vocabulary-work-office',  // FIX: base art showed "How to Say Please"; use Office & Work Words
    'hindi-to-marathi/questions': 'og-grammar-questions',  // FIX: base art showed "Shopping/Bargaining"; use Marathi Question Words
    // Phrases
    'phrases/making-plans': 'og-phrases-making-plans',          // NEW: from Stitch (making plans)
    'phrases/office-work': 'og-phrases-office-work',            // NEW: from Stitch phrases_6 (office work)
    'phrases/phone-and-messaging': 'og-phrases-phone-and-messaging',  // NEW: from Stitch phrases_7 (phone/messaging)
    'phrases/presentations-interviews': 'og-phrases-presentations-interviews',  // NEW: from Stitch phrases_3 (presentations)
    'phrases/shopping': 'og-vocabulary-shopping',               // Use vocabulary shopping image (correct)
    'phrases/thanking-apologizing': 'og-phrases-thanking-apologizing',  // NEW: from Stitch phrases_4 (thanking/apologizing)
    'phrases/travel': 'og-english-to-marathi-transport-travel', // Cross-family OK (transport/travel)
    // Grammar
    'grammar/postpositions': 'og-grammar-postpositions',        // NEW: from Stitch (Hindi→Marathi postpositions)
    'grammar/commands-polite': 'og-grammar-commands-polite',    // NEW: from Stitch (polite/how_to_say)
    'vocabulary/adjectives': 'og-vocabulary-adjectives',        // NEW: from Stitch (68 adjectives)
    'vocabulary/animals': 'og-vocabulary-animals',              // Now correctly named: adjectives Stitch image renamed to animals
    'vocabulary/body-parts': 'og-vocabulary-body-parts',        // NEW: from Stitch (43 body parts)
    'vocabulary/clothing': 'og-vocabulary-clothing',            // NEW: from Stitch (clothing words)
    'vocabulary/food': 'og-vocabulary-food',                    // NEW: from Stitch (food words)
    'vocabulary/shopping': 'og-vocabulary-shopping',      // Use vocabulary shopping image (correct)
    'vocabulary/work-office': 'og-vocabulary-work-office',      // Keep existing (matches)
  };
  if (renamedMap[route]) {
    base = renamedMap[route];
  }
  routeToFile.set(route, base);
}

export function pageArt(route: string): string {
  const base = routeToFile.get(route) ?? (route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`);
  return siteUrl(`/og/${base}.webp`);
}

// Social/OG card. JPEG: universally supported by preview crawlers and
// ~10x smaller than the legacy 1200x630 PNGs (which are no longer shipped).
export function pageArtSocial(route: string): string {
  const base = routeToFile.get(route) ?? (route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`);
  return siteUrl(`/og/${base}.jpg`);
}

export function pageLQIP(route: string): string {
  const base = routeToFile.get(route) ?? (route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`);
  return (lqipManifest as Record<string, string>)[`${base}.webp`] ?? '';
}