/* eslint-disable */
export default {
  displayName: 'ui-design-system',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['./jest-setup.js'],
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      { jsc: { transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/ui/design-system',
};
