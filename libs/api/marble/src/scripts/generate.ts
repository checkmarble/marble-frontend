import { exec } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import ora from 'ora';
import { promisify } from 'util';

import { GENERATED_FOLDER, OPENAPI_OPTIONS } from './config';

const execAsync = promisify(exec);

async function openapiGenerator() {
  const spinner = ora('Start to generate OpenAPI client...').start();
  try {
    const stringifiedOptions = Object.entries(OPENAPI_OPTIONS)
      .map(([name, value]) => `--${name} ${value}`)
      .join(' ');

    await execAsync(
      `docker run --rm -v $PWD:/local openapitools/openapi-generator-cli generate ${stringifiedOptions}`
    );

    spinner.succeed('Succesfully generated OpenAPI client');
  } catch (error) {
    spinner.fail('Failed to generate OpenAPI client');
    throw error;
  }
}

async function main() {
  try {
    await rm(GENERATED_FOLDER, { recursive: true, force: true });
    await mkdir(GENERATED_FOLDER);

    await openapiGenerator();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
