import { join } from 'path';

export const GENERATED_FOLDER = join('src', 'lib', 'generated');

export const OPENAPI_OPTIONS = {
  'input-spec': 'local/src/scripts/openapi.yaml',
  'generator-name': 'typescript-fetch',
  output: join('local', GENERATED_FOLDER, 'marble-api'),
};
