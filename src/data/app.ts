// Bol Marathi app funnel config — single place to update on launch.
// The app is NOT on the Play Store yet: keep playStoreUrl null and
// comingSoon true. Once hosted, set playStoreUrl + comingSoon: false
// (+ optional screenshots) and every CTA updates with no template edits.
export const BOL_MARATHI_APP = {
  name: 'Bol Marathi',
  tagline: 'Learn Marathi from Hindi — words, phrases, listening, speaking.',
  // e.g. 'https://play.google.com/store/apps/details?id=com.bolmarathi.app'
  playStoreUrl: null as string | null,
  appStoreUrl: null as string | null,
  waitlistUrl: null as string | null,
  comingSoon: true,
  comingSoonNote: 'Bol Marathi is in closed testing and coming soon to Android.',
  // Closed-beta opt-in link (e.g. Play Console tester URL). When set,
  // primary CTAs read "Join the beta" and link here; otherwise they
  // show the waitlist form. Null = waitlist only.
  betaOptInUrl: null as string | null,
  // Deep-link base for the future native app (unit practice links).
  // Used only when the app is live or in beta; otherwise pages fall
  // back to the waitlist form.
  deepLinkBase: 'bolmarathi://practice',
  // Waitlist: footer CTA is an inline form posting here; everywhere
  // else stays mailto (deliberate A/B split). Paste a Formspree
  // endpoint (https://formspree.io → New Form → copy
  // https://formspree.io/f/xxxxxx). Empty = footer shows mailto too.
  // See README "Waitlist".
  waitlistFormAction: 'https://formspree.io/f/xqpaeejw',
  waitlistSubject: 'Notify me — Bol Marathi launch',
  // App walkthrough in tab-flow order: Learn → Practice → Progress → Profile.
  screenshots: [
    { src: '/screenshots/flow-learn.webp', alt: 'Learn home — daily goal, continue learning and due reviews', step: '1 · Learn' },
    { src: '/screenshots/flow-practice.webp', alt: 'Practice Hub — retention stats, recommendations and practice modes', step: '2 · Practice' },
    { src: '/screenshots/flow-progress.webp', alt: 'Progress — streak, XP, weekly practice and skill map', step: '3 · Progress' },
    { src: '/screenshots/flow-profile.webp', alt: 'Profile — badges, app language and audio settings', step: '4 · Profile' },
  ] as { src: string; alt: string; step: string }[],
};
