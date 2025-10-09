import { afterEach, expect, test, vi } from 'vitest';
import type { MiddlewareFunction, ServerFunction } from './middleware-types';
import {
  cleanGlobalMiddlewares,
  createMiddleware,
  createMiddlewareWithGlobalContext,
  createServerFn,
  setGlobalMiddlewares,
} from './requests';

afterEach(() => {
  cleanGlobalMiddlewares();
});

test('server function should be called with the correct context', async () => {
  const mfn = vi.fn().mockImplementation(async function m1(_, next) {
    return next({ context: { foo: 'bar' } });
  }) satisfies MiddlewareFunction<any, any>;
  const m1 = createMiddleware([], mfn);

  const sfn = vi.fn().mockImplementation(async function fn() {
    return null;
  }) satisfies ServerFunction<any, any>;
  const s = createServerFn([m1], sfn);

  const req = new Request('https://example.com');
  const args = { request: req, params: {}, context: {} };
  const res = await s(args);
  const json = await res.json();

  expect(json).toEqual(null);
  expect(sfn).toHaveBeenCalledTimes(1);
  expect(sfn).toHaveBeenCalledWith(expect.objectContaining({ context: { foo: 'bar' } }));
});

test('server function with 2 middlewares depending on same dep propagates context correctly', async () => {
  const depFn = vi.fn().mockImplementation(async function dep({ context }, next) {
    // This dependency sets base context.
    return next({ context: { depValue: 'value-from-dep' } });
  }) satisfies MiddlewareFunction<any, any>;
  const dep = createMiddleware([], depFn);

  // Middlewares that depend on 'dep'
  const aFn = vi.fn().mockImplementation(async function a({ context }, next) {
    // Expects depValue set by dependency
    expect(context.depValue).toBe('value-from-dep');
    return next({ context: { aPassed: true } });
  }) satisfies MiddlewareFunction<any, any>;
  const a = createMiddleware([dep], aFn);

  const bFn = vi.fn().mockImplementation(async function b({ context }, next) {
    // Expects depValue set by dependency
    expect(context.depValue).toBe('value-from-dep');
    return next({ context: { bPassed: true } });
  }) satisfies MiddlewareFunction<any, any>;
  const b = createMiddleware([dep], bFn);

  const sFn = vi.fn<ServerFunction<any, any>>().mockImplementation(async function handler({
    context,
  }) {
    // All context from previous middlewares must be present
    expect(context).toEqual(
      expect.objectContaining({
        aPassed: true,
        bPassed: true,
      }),
    );
    return { ok: true, context };
  });
  const serverFn = createServerFn([a, b], sFn);

  const req = new Request('https://example.com');
  const args = { request: req, params: {}, context: {} };
  const res = await serverFn(args);
  const json = await res.json();

  expect(json.ok).toBe(true);
  expect(json.context).toEqual(
    expect.objectContaining({
      aPassed: true,
      bPassed: true,
    }),
  );

  // depFn called once per middleware (since both depend on it)
  expect(depFn).toHaveBeenCalledTimes(1);
  expect(aFn).toHaveBeenCalledTimes(1);
  expect(bFn).toHaveBeenCalledTimes(1);
  expect(sFn).toHaveBeenCalledTimes(1);
});

test('should propagate global middleware contexts correctly', async () => {
  const gFn = vi.fn().mockImplementation(async function g(_, next) {
    return next({ context: { gValue: 'value-from-global' } });
  }) satisfies MiddlewareFunction<any, any>;
  const g = createMiddleware([], gFn);

  setGlobalMiddlewares(g);

  const mFn = vi.fn<MiddlewareFunction<any, any>>().mockImplementation(async function m(
    { context },
    next,
  ) {
    expect(context.gValue).toBe('value-from-global');
    return next({ context: { mValue: 'value-from-middleware' } });
  }) satisfies MiddlewareFunction<any, any>;
  const m = createMiddlewareWithGlobalContext([], mFn);

  const sFn = vi.fn<ServerFunction<any, any>>().mockImplementation(async function handler({
    context,
  }) {
    expect(context).toEqual(expect.objectContaining({ gValue: 'value-from-global' }));
    return { ok: true, context };
  });
  const serverFn = createServerFn([m], sFn);

  const req = new Request('https://example.com');
  const args = { request: req, params: {}, context: {} };
  const res = await serverFn(args);
  const json = await res.json();

  expect(json.ok).toBe(true);
  expect(json.context).toEqual(
    expect.objectContaining({
      gValue: 'value-from-global',
      mValue: 'value-from-middleware',
    }),
  );
});
