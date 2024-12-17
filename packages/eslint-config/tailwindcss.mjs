import eslintTailwindcss from 'eslint-plugin-tailwindcss';

/** @type {(configPath: string) => import('eslint').Linter.Config} */
const config = (configPath) => {
  return [
    ...eslintTailwindcss.configs['flat/recommended'],
    {
      settings: {
        tailwindcss: {
          config: configPath,
        },
      },
      rules: {
        'tailwindcss/classnames-order': 'off',
      },
    },
  ];
};

export default config;
