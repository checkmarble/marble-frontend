import { type Opts } from 'oazapfts/lib/codegen/index';
import { join } from 'path';

export const OPENAPI_SPEC = join('scripts', 'openapi.yaml');

export const GENERATED_FOLDER = join('src', 'generated');
export const GENERATED_API = join(GENERATED_FOLDER, 'marble-api.ts');

export const OPENAPI_OPTIONS: Opts = {
  optimistic: true,
  useEnumType: false,
  unionUndefined: false,
};
