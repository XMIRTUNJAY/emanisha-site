// Brand + reviewer config. "Bol Marathi" collides with bolmarathi.in,
// so all user-facing brand strings come from here — a rename is one edit.
export const BRAND = {
  siteName: 'Learn Marathi',
  brandName: 'Bol Marathi',
  tagline: 'Learn Marathi from Hindi or English.',
  github: 'https://github.com/xmirtunjay',
};

// Content reviewer. Names a real human only — never invent one.
// Empty name renders as "pending native-speaker review".
export const REVIEWER = {
  name: '',
  role: '',
  needsReview: true,
} as { name: string; role: string; needsReview: boolean };
