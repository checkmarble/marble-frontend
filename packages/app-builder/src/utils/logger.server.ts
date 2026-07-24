import { AsyncLocalStorage } from 'node:async_hooks';
import { getServerEnv } from '@app-builder/utils/environment';
import pino, { type Logger } from 'pino';
import { match, P } from 'ts-pattern';

const level = getServerEnv('LOG_LEVEL') || 'info';

const baseOptions = {
  level,
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
} satisfies pino.LoggerOptions;

const RESET = '\x1b[0m';
const paint = (code: string, text: string) => `\x1b[${code}m${text}${RESET}`;

const LEVEL_COLOR: Record<string, string> = {
  trace: '90', // grey
  debug: '90',
  info: '32', // green
  warn: '33', // yellow
  error: '31', // red
  fatal: '31',
};

function paintValue(value: unknown): string {
  return match(value)
    .with(P.nullish, () => paint('90', 'null'))
    .with(P.union(P.number, P.boolean), (v) => paint('33', String(v)))
    .with(P.string, (v) => paint('32', v))
    .otherwise((v) => paint('32', JSON.stringify(v)));
}

function prettyWrite(line: string): void {
  let record: Record<string, unknown>;

  try {
    record = JSON.parse(line);
  } catch {
    process.stdout.write(line);
    return;
  }

  const { level: lvl, time, message, pid: _pid, hostname: _hostname, ...fields } = record;
  const label = String(lvl ?? 'info');
  const headerParts: string[] = [];

  if (time !== undefined) headerParts.push(paint('90', String(time)));

  headerParts.push(paint(LEVEL_COLOR[label] ?? '37', label.toUpperCase()));

  if (message !== undefined) headerParts.push(String(message));

  let entry = headerParts.join(' ');

  const keys = Object.keys(fields).filter((key) => !['method', 'path'].includes(key));

  if (keys.length > 0) {
    const body = keys.map((key) => `${paint('36', key)}${paint('90', '=')}${paintValue(fields[key])}`).join(' ');

    entry = entry + ` ${body}`;
  }

  process.stdout.write(entry + '\n');
}

export const logger: Logger = import.meta.env.DEV ? pino(baseOptions, { write: prettyWrite }) : pino(baseOptions);

interface RequestLogContext {
  logger: Logger;
  user?: string;
  orgId?: string;
  serverFn?: string;
}

const loggerStorage = new AsyncLocalStorage<RequestLogContext>();

export function runWithLogger<T>(child: Logger, fn: () => T): T {
  return loggerStorage.run({ logger: child }, fn);
}

export function getLogger(): Logger {
  return loggerStorage.getStore()?.logger ?? logger;
}

export function setRequestUserEmail(email: string | undefined): void {
  const store = loggerStorage.getStore();
  if (store && email) store.user = email;
}

export function getRequestUserEmail(): string | undefined {
  return loggerStorage.getStore()?.user;
}

export function setRequestOrgId(orgId: string | undefined): void {
  const store = loggerStorage.getStore();
  if (store && orgId) store.orgId = orgId;
}

export function getRequestOrgId(): string | undefined {
  return loggerStorage.getStore()?.orgId;
}

export function setRequestServerFn(name: string | undefined): void {
  const store = loggerStorage.getStore();
  if (store && name) store.serverFn = name;
}

export function getRequestServerFn(): string | undefined {
  return loggerStorage.getStore()?.serverFn;
}
