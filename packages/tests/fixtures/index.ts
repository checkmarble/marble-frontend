import { mergeExpects, mergeTests } from '@playwright/test';

import * as authentication from './authentication';

export const test = mergeTests(authentication.test);
export const expect = mergeExpects(authentication.expect);
