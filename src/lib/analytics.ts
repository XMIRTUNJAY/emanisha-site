// Privacy-First Analytics wrapper
// Supports Plausible, Umami, and custom events
// Respects DNT, no cookies, GDPR-friendly

interface AnalyticsEvent {
  name: string;
  props?: Record<string, any>;
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    umami?: (event: string, data?: Record<string, any>) => void;
    dataLayer?: Array<any>;
  }
}

function isDoNotTrack(): boolean {
  // Check DNT header
  if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return true;
  if ((window as any).doNotTrack === '1') return true;
  if (navigator.msDoNotTrack === '1') return true;
  return false;
}

function hasConsent(): boolean {
  // For privacy-friendly providers (Plausible, Umami), no consent needed
  // If using Google Analytics, would check cookie consent
  // For now, respect DNT
  return !isDoNotTrack();
}

function getAnalyticsProvider(): 'plausible' | 'umami' | 'gtag' | 'none' {
  if (typeof window === 'undefined') return 'none';
  if (window.plausible) return 'plausible';
  if (window.umami) return 'umami';
  if (window.gtag) return 'gtag';
  return 'none';
}

export function track(eventName: string, props?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  if (!hasConsent()) return;

  const provider = getAnalyticsProvider();

  try {
    switch (provider) {
      case 'plausible':
        window.plausible?.(eventName, { props });
        break;
      case 'umami':
        window.umami?.(eventName, props);
        break;
      case 'gtag':
        window.gtag?.('event', eventName, props);
        break;
    }
  } catch (error) {
    console.warn('[Analytics] Track failed:', error);
  }

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, props || '');
  }
}

export function trackPageView(path?: string): void {
  track('page_view', { path: path || window.location.pathname });
}

// Pre-defined event helpers for common actions
export const AnalyticsEvents = {
  // Search
  search: (query: string, resultsCount: number) =>
    track('search', { query: query.slice(0, 100), resultsCount }),

  // Quiz
  quizStart: (cluster: string, questionCount: number) =>
    track('quiz_start', { cluster, questionCount }),
  quizComplete: (cluster: string, score: number, total: number, timeMs: number) =>
    track('quiz_complete', { cluster, score, total, percentage: Math.round(score / total * 100), timeMs }),

  // Unit completion
  unitComplete: (unit: string, wordsLearned: number) =>
    track('unit_complete', { unit, wordsLearned }),

  // CTA clicks
  ctaClick: (variant: string, context: string, href: string) =>
    track('cta_click', { variant, context, href: href.slice(0, 200) }),

  // Waitlist
  waitlistSubmit: (context: string, source: string) =>
    track('waitlist_submit', { context, source }),

  // Vocabulary
  vocabView: (cluster: string, wordCount: number) =>
    track('vocab_view', { cluster, wordCount }),
  vocabFlipCard: (word: string) =>
    track('vocab_flip', { word: word.slice(0, 50) }),
  vocabAudioPlay: (word: string) =>
    track('vocab_audio_play', { word: word.slice(0, 50) }),

  // Phrase
  phraseView: (set: string, phraseCount: number) =>
    track('phrase_view', { set, phraseCount }),

  // Lesson
  lessonStart: (unit: string) =>
    track('lesson_start', { unit }),
  lessonComplete: (unit: string, timeMs: number) =>
    track('lesson_complete', { unit, timeMs }),

  // Review/SRS
  reviewOpen: (dueCount: number) =>
    track('review_open', { dueCount }),
  reviewGrade: (wordId: string, grade: 'again' | 'hard' | 'good' | 'easy') =>
    track('review_grade', { wordId: wordId.slice(0, 50), grade }),

  // Progress card share
  progressCardGenerate: () => track('progress_card_generate'),
  progressCardDownload: () => track('progress_card_download'),
  progressCardShare: (method: 'native' | 'download' | 'copy') =>
    track('progress_card_share', { method }),

  // Preferences
  prefsChange: (prefs: { fontSize: string; lineHeight: string; readingMode: boolean }) =>
    track('prefs_change', prefs),

  // Reading mode
  readingModeToggle: (enabled: boolean) =>
    track('reading_mode_toggle', { enabled }),

  // Milestone
  milestoneReached: (type: 'streak' | 'units' | 'words', value: number) =>
    track('milestone_reached', { type, value }),

  // Offline
  offlineDetected: () => track('offline_detected'),
  onlineRestored: (pendingSync: number) => track('online_restored', { pendingSync }),

  // Error
  error: (message: string, context: string) =>
    track('error', { message: message.slice(0, 200), context }),

  // External link
  externalLink: (href: string, label: string) =>
    track('external_link', { href: href.slice(0, 200), label: label.slice(0, 100) }),
};

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Track initial page view
  trackPageView();

  // Track SPA navigation (Astro View Transitions)
  document.addEventListener('astro:page-load', () => {
    trackPageView();
  });

  // Track outbound links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="http"]');
    if (link && !link.href.startsWith(window.location.origin)) {
      track('external_link', { href: link.href.slice(0, 200), label: link.textContent?.slice(0, 100) || '' });
    }
  });

  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (form.classList.contains('waitlist-form')) {
      track('waitlist_submit', { context: form.dataset.context || 'unknown' });
    }
  });
}