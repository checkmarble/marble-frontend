import typescriptConfig from '@marble/eslint-config/typescript.mjs';

export default [...typescriptConfig, { ignores: ['src/generated'] }];
