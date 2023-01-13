import { join } from 'path';

export const GENERATED_FOLDER = join('src', 'lib', 'generated');

export const PROTO_FILE = 'marble.proto';

const es_out = join(GENERATED_FOLDER, 'protoc-gen-es');

export const PROTOC_GEN_ES_OPTIONS = {
  proto_path: es_out,
  plugin: join('../../..', './node_modules/.bin/protoc-gen-es'),
  es_out,
  es_opt: 'target=ts',
};

export const OPENAPI_OPTIONS = {
  'input-spec': 'local/src/scripts/openapi.json',
  'generator-name': 'typescript-fetch',
  output: join('local', GENERATED_FOLDER, 'marble-api'),
};
