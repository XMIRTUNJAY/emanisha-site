// Preferences client-side logic - compiled by Vite, runs in browser
import { AnalyticsEvents } from '../lib/analytics';

const STORAGE_KEY = 'bol-marathi-prefs';
const FONT_SIZES = { small: '15px', medium: '17px', large: '19px', xl: '21px' };
const LINE_HEIGHTS = { compact: '1.5', normal: '1.65', relaxed: '1.85' };

const root = document.documentElement;

let prefs = getPrefs();

function getPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...{ fontSize: 'medium', lineHeight: 'normal', readingMode: false }, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { fontSize: 'medium', lineHeight: 'normal', readingMode: false };
}

function savePrefs() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  try { AnalyticsEvents.prefsChange({ fontSize: prefs.fontSize, lineHeight: prefs.lineHeight, readingMode: prefs.readingMode }); } catch { /* ignore */ }
}

function applyPrefs() {
  root.style.setProperty('--font-size-base', FONT_SIZES[prefs.fontSize]);
  root.style.setProperty('--line-height-base', LINE_HEIGHTS[prefs.lineHeight]);
  document.body.classList.toggle('reading-mode', prefs.readingMode);
  updateUI();
}

function updateUI() {
  const wrapper = document.querySelector('[data-prefs-root]');
  if (!wrapper) return;

  const fontRadios = wrapper.querySelectorAll('[data-pref-font-size]');
  const lineRadios = wrapper.querySelectorAll('[data-pref-line-height]');
  const readingToggle = wrapper.querySelector('[data-pref-reading-mode]');

  fontRadios.forEach(r => {
    r.checked = r.value === prefs.fontSize;
    r.closest('.pref-option').classList.toggle('active', r.checked);
  });
  lineRadios.forEach(r => {
    r.checked = r.value === prefs.lineHeight;
    r.closest('.pref-option').classList.toggle('active', r.checked);
  });
  if (readingToggle) readingToggle.checked = prefs.readingMode;
}

function initializePreferences() {
  const wrapper = document.querySelector('[data-prefs-root]');
  if (!wrapper) return;

  const btn = wrapper.querySelector('[data-prefs-btn]');
  const panel = wrapper.querySelector('#prefs-panel');
  const fontRadios = wrapper.querySelectorAll('[data-pref-font-size]');
  const lineRadios = wrapper.querySelectorAll('[data-pref-line-height]');
  const readingToggle = wrapper.querySelector('[data-pref-reading-mode]');
  const resetBtn = wrapper.querySelector('[data-prefs-reset]');

  function togglePanel() {
    const open = panel.hidden === false;
    panel.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
  }

  btn.addEventListener('click', togglePanel);

fontRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        prefs.fontSize = radio.value;
        savePrefs();
        applyPrefs();
      }
    });
  });

    lineRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          prefs.lineHeight = radio.value;
          savePrefs();
          applyPrefs();
        }
      });
    });

    readingToggle?.addEventListener('change', () => {
      prefs.readingMode = readingToggle.checked;
      savePrefs();
      applyPrefs();
    });

    resetBtn?.addEventListener('click', () => {
      prefs = { fontSize: 'medium', lineHeight: 'normal', readingMode: false };
      savePrefs();
      applyPrefs();
    });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        prefs = { ...{ fontSize: 'medium', lineHeight: 'normal', readingMode: false }, ...JSON.parse(e.newValue) };
        applyPrefs();
      } catch { /* ignore */ }
    }
  });

  // Listen for prefs-changed event from sync
  window.addEventListener('prefs-changed', (e) => {
    prefs = { ...prefs, ...e.detail };
    applyPrefs();
  });

  // Initialize on load
  applyPrefs();
}

function bootPreferences() {
  document.querySelectorAll('[data-prefs-root]').forEach((root) => {
    if (root.dataset.prefsInitialized === 'true') return;
    root.dataset.prefsInitialized = 'true';
    initializePreferences(root);
  });
}

bootPreferences();
document.addEventListener('astro:page-load', bootPreferences);

export { initializePreferences, bootPreferences };