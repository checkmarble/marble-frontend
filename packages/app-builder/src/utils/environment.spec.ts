import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { checkEnv } from './environment';

const originalEnv = { ...process.env };

describe('checkEnv', () => {
  beforeEach(() => {
    process.env['MARBLE_API_URL'] = 'https://api.example.test';
    process.env['SESSION_SECRET'] = 'test-secret';
    delete process.env['PROBO_BANNER_ID'];
    delete process.env['PROBO_BANNER_BASE_URL'];
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('requires the banner ID and base URL to be configured together', () => {
    process.env['PROBO_BANNER_ID'] = 'banner-id';

    expect(checkEnv).toThrow('PROBO_BANNER_ID and PROBO_BANNER_BASE_URL must be configured together');
  });

  it('requires a secure browser endpoint for Probo', () => {
    process.env['PROBO_BANNER_ID'] = 'banner-id';
    process.env['PROBO_BANNER_BASE_URL'] = 'http://probo.example.test/api/cookie-banner/v1/';

    expect(checkEnv).toThrow('Must use HTTPS');
  });
});
