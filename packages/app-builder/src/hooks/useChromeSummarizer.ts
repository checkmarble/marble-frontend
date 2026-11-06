import { ENTITY_SUMMARY_SHARED_CONTEXT } from '@app-builder/utils/screening/entity-summary-input';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

// Chrome Summarizer API (https://developer.chrome.com/docs/ai/summarizer-api).
// The on-device model is shared by the whole origin, so its state lives in a module-level store
// keyed by output language: every card sees the same download progress and reuses the same instance.

export const SUMMARIZER_OPTIONS = {
  type: 'tldr',
  format: 'plain-text',
  length: 'medium',
  expectedInputLanguages: ['en'],
} as const satisfies SummarizerCreateCoreOptions;

export type SummarizerState =
  | { status: 'checking' }
  | { status: 'unavailable' }
  | { status: 'downloadable'; resume: boolean; failed: boolean }
  | { status: 'downloading'; progress: number }
  | { status: 'ready'; summarizer: Summarizer };

const CHECKING: SummarizerState = { status: 'checking' };

const states = new Map<string, SummarizerState>();
const downloads = new Map<string, AbortController>();
const listeners = new Set<() => void>();

function setState(language: string, state: SummarizerState) {
  states.set(language, state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isSummarizerSupported() {
  return typeof self !== 'undefined' && 'Summarizer' in self;
}

// Browser global declared by @types/dom-chromium-ai, only defined in supporting browsers
function getSummarizerApi() {
  return (self as unknown as { Summarizer: typeof Summarizer }).Summarizer;
}

export async function getSummarizerAvailability(outputLanguage: string): Promise<Availability> {
  if (!isSummarizerSupported()) return 'unavailable';
  try {
    return await getSummarizerApi().availability({ ...SUMMARIZER_OPTIONS, outputLanguage });
  } catch {
    return 'unavailable';
  }
}

function createSummarizer(outputLanguage: string, options: Pick<SummarizerCreateOptions, 'signal' | 'monitor'> = {}) {
  return getSummarizerApi().create({
    ...SUMMARIZER_OPTIONS,
    outputLanguage,
    sharedContext: ENTITY_SUMMARY_SHARED_CONTEXT,
    ...options,
  });
}

async function check(language: string) {
  if (states.has(language)) return;
  setState(language, CHECKING);

  const availability = await getSummarizerAvailability(language);
  if (availability === 'unavailable') return setState(language, { status: 'unavailable' });
  if (availability !== 'available') {
    // Creating the summarizer would start a download, which requires a user activation.
    return setState(language, { status: 'downloadable', resume: availability === 'downloading', failed: false });
  }

  try {
    setState(language, { status: 'ready', summarizer: await createSummarizer(language) });
  } catch {
    setState(language, { status: 'unavailable' });
  }
}

// Must be called from a user gesture (click) since it may trigger the model download.
async function startDownload(language: string) {
  if (downloads.has(language)) return;
  const controller = new AbortController();
  downloads.set(language, controller);
  setState(language, { status: 'downloading', progress: 0 });

  try {
    const summarizer = await createSummarizer(language, {
      signal: controller.signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          if (controller.signal.aborted) return;
          setState(language, { status: 'downloading', progress: event.loaded });
        });
      },
    });
    setState(language, { status: 'ready', summarizer });
  } catch {
    setState(language, { status: 'downloadable', resume: false, failed: !controller.signal.aborted });
  } finally {
    downloads.delete(language);
  }
}

function abortDownload(language: string) {
  downloads.get(language)?.abort();
}

export function useChromeSummarizer(language: string | undefined) {
  const state = useSyncExternalStore(
    subscribe,
    () => (language ? (states.get(language) ?? CHECKING) : CHECKING),
    () => CHECKING,
  );

  useEffect(() => {
    if (language) void check(language);
  }, [language]);

  return {
    state,
    download: useCallback(() => {
      if (language) void startDownload(language);
    }, [language]),
    abort: useCallback(() => {
      if (language) abortDownload(language);
    }, [language]),
  };
}
