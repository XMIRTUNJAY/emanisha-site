// Offline mutation queue + IndexedDB sync
// Queues progress, SRS reviews, preferences when offline, replays when online

import { openDB } from 'idb';
import type { DBSchema } from 'idb';

export interface QueuedMutation {
  id: string;
  type: 'progress' | 'srs' | 'preferences' | 'streak';
  payload: any;
  timestamp: number;
  retries: number;
}

interface SyncDB extends DBSchema {
  outbox: {
    key: string;
    value: QueuedMutation;
    indexes: { 'by-timestamp': number };
  };
  syncMeta: {
    key: string;
    value: { lastSync: number; pendingCount: number };
  };
}

const DB_NAME = 'bol-marathi-sync';
const DB_VERSION = 1;
const MAX_RETRIES = 5;

async function getDB() {
  return openDB<SyncDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('outbox')) {
        const store = db.createObjectStore('outbox', { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta');
      }
    },
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function queueMutation(type: QueuedMutation['type'], payload: any): Promise<void> {
  const db = await getDB();
  const mutation: QueuedMutation = {
    id: generateId(),
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
  };
  await db.add('outbox', mutation);
  await updatePendingCount(db);
  registerSync();
}

async function updatePendingCount(db: any): Promise<void> {
  const count = await db.count('outbox');
  await db.put('syncMeta', { lastSync: Date.now(), pendingCount: count }, 'meta');
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  const meta = await db.get('syncMeta', 'meta');
  return meta?.pendingCount ?? 0;
}

export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const db = await getDB();
  return db.getAllFromIndex('outbox', 'by-timestamp');
}

async function registerSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('bol-sync-mutations');
    } catch {
      // Background sync not supported or failed
    }
  }
}

async function processMutation(mutation: QueuedMutation): Promise<boolean> {
  try {
    switch (mutation.type) {
      case 'progress':
        await applyProgressMutation(mutation.payload);
        break;
      case 'srs':
        await applySRSMutation(mutation.payload);
        break;
      case 'preferences':
        await applyPreferencesMutation(mutation.payload);
        break;
      case 'streak':
        await applyStreakMutation(mutation.payload);
        break;
    }
    return true;
  } catch (error) {
    console.warn('[Sync] Mutation failed:', error);
    return false;
  }
}

async function applyProgressMutation(payload: any): Promise<void> {
  // Apply to localStorage (single-tab source of truth for progress)
  const { unit, completed, completedAt } = payload;
  const progress = JSON.parse(localStorage.getItem('bol-marathi-progress') || '{}');
  if (completed && !progress[unit]?.completed) {
    progress[unit] = { completed: true, completedAt: completedAt || Date.now() };
    localStorage.setItem('bol-marathi-progress', JSON.stringify(progress));
  }
}

async function applySRSMutation(payload: any): Promise<void> {
  // SRS uses IndexedDB directly, so we just need to ensure the DB operation happened
  // The payload contains the wordId and grade - we re-apply via the SRS module
  const { addWord } = await import('./srs');
  await addWord(payload.wordId, payload.grade);
}

async function applyPreferencesMutation(payload: any): Promise<void> {
  const prefs = JSON.parse(localStorage.getItem('bol-marathi-prefs') || '{}');
  Object.assign(prefs, payload);
  localStorage.setItem('bol-marathi-prefs', JSON.stringify(prefs));
  // Trigger UI update
  window.dispatchEvent(new CustomEvent('prefs-changed', { detail: prefs }));
}

async function applyStreakMutation(payload: any): Promise<void> {
  const { date, count } = payload;
  localStorage.setItem('bol-marathi-streak-date', date);
  localStorage.setItem('bol-marathi-streak-count', String(count));
}

export async function processOutbox(): Promise<void> {
  const db = await getDB();
  const mutations = await db.getAllFromIndex('outbox', 'by-timestamp');

  for (const mutation of mutations) {
    const success = await processMutation(mutation);

    if (success) {
      await db.delete('outbox', mutation.id);
    } else {
      mutation.retries++;
      if (mutation.retries >= MAX_RETRIES) {
        await db.delete('outbox', mutation.id);
        console.warn('[Sync] Mutation max retries exceeded, dropping:', mutation.id);
      } else {
        await db.put('outbox', mutation);
      }
    }
  }

  await updatePendingCount(db);

  // Notify UI
  window.dispatchEvent(new CustomEvent('sync-complete'));
}

// Listen for online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOutbox();
  });

  // Listen for sync completion from SW
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'sync-complete') {
      processOutbox();
    }
  });
}

// Export helper to check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Export helper to get sync status
export async function getSyncStatus(): Promise<{ pending: number; lastSync: number; online: boolean }> {
  const db = await getDB();
  const meta = await db.get('syncMeta', 'meta');
  return {
    pending: meta?.pendingCount ?? 0,
    lastSync: meta?.lastSync ?? 0,
    online: navigator.onLine,
  };
}