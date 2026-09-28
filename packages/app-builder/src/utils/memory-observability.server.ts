import { getServerEnv } from '@app-builder/utils/environment';
import { logger } from '@app-builder/utils/logger.server';

const SAMPLE_INTERVAL_MS = 60_000;
const MAX_SERVER_FN_NAMES = 30;
const enabled = getServerEnv('MEMORY_OBSERVABILITY') === 'true';
const processInstanceId = crypto.randomUUID();
const finishDisabledObservation = () => undefined;

let activeHandlers = 0;
let completedHandlers = 0;
let completedOtherRequests = 0;
let completedOverflowServerFns = 0;
let lastSampleAt = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const completedServerFns = new Map<string, number>();

function emitMemorySample(): void {
  const now = Date.now();
  const memory = process.memoryUsage();

  // Only retain counts and fixed-size function names between samples. No Request,
  // Response, user data, or per-request objects are held by this observer.
  logger.info(
    {
      event: 'server_memory_sample',
      runtime: process.versions['bun'] ? 'bun' : 'node',
      process_instance_id: processInstanceId,
      revision: process.env['K_REVISION'],
      app_version: process.env['APP_VERSION'],
      pid: process.pid,
      uptime_seconds: Math.round(process.uptime()),
      interval_seconds: Math.round((now - lastSampleAt) / 1000),
      rss_bytes: memory.rss,
      heap_used_bytes: memory.heapUsed,
      heap_total_bytes: memory.heapTotal,
      external_bytes: memory.external,
      array_buffers_bytes: memory.arrayBuffers,
      active_handlers: activeHandlers,
      completed_handlers: completedHandlers,
      completed_other_requests: completedOtherRequests,
      completed_server_fns: Object.fromEntries(completedServerFns),
      completed_other_server_fns: completedOverflowServerFns,
    },
    'Server memory sample',
  );

  completedHandlers = 0;
  completedOtherRequests = 0;
  completedOverflowServerFns = 0;
  completedServerFns.clear();
  lastSampleAt = now;
}

/** Count request handlers and emit one process-level sample per minute per instance. */
export function observeRequestMemory(): (serverFn?: string) => void {
  if (!enabled) return finishDisabledObservation;

  if (!timer) {
    emitMemorySample();
    timer = setInterval(emitMemorySample, SAMPLE_INTERVAL_MS);
    timer.unref();
  }

  activeHandlers++;
  return (serverFn?: string) => {
    activeHandlers--;
    completedHandlers++;

    if (!serverFn) {
      completedOtherRequests++;
    } else if (completedServerFns.has(serverFn)) {
      completedServerFns.set(serverFn, (completedServerFns.get(serverFn) ?? 0) + 1);
    } else if (completedServerFns.size < MAX_SERVER_FN_NAMES) {
      completedServerFns.set(serverFn, 1);
    } else {
      completedOverflowServerFns++;
    }

    // Cloud Run may throttle timers while idle. The next completed request still
    // produces a sample as soon as the interval has elapsed.
    if (Date.now() - lastSampleAt >= SAMPLE_INTERVAL_MS) emitMemorySample();
  };
}
