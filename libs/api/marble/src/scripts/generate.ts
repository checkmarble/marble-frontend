import { exec } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { mkdir, rm } from 'fs/promises';
import ora from 'ora';
import { join } from 'path';
import { promisify } from 'util';

import {
  GENERATED_FOLDER,
  OPENAPI_OPTIONS,
  PROTO_FILE,
  PROTOC_GEN_ES_OPTIONS,
} from './config';

const execAsync = promisify(exec);

async function downloadProtoFile() {
  const spinner = ora(`Downloading ${PROTO_FILE}...`).start();
  try {
    const { encoding, content } = (await fetch(
      `https://gitlab.com/api/v4/projects/41228702/repository/files/${PROTO_FILE}?ref=dev`,
      {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': process.env['GITLAB_PAT_READ_REPOSITORY'] ?? '',
        }),
      }
    ).then((response) => response.json())) as {
      encoding: BufferEncoding;
      content: string;
    };

    mkdirSync(PROTOC_GEN_ES_OPTIONS.proto_path, { recursive: true });
    writeFileSync(
      join(PROTOC_GEN_ES_OPTIONS.proto_path, PROTO_FILE),
      Buffer.from(content, encoding)
    );

    spinner.succeed(`${PROTO_FILE} succesfully downloaded`);
  } catch (error) {
    spinner.fail(`Failed to download ${PROTO_FILE}`);
    throw error;
  }
}

async function protocGenEs() {
  const spinner = ora('Start to run protoc...').start();
  try {
    const stringifiedOptions = Object.entries(PROTOC_GEN_ES_OPTIONS)
      .map(([name, value]) => `--${name} ${value}`)
      .join(' ');
    await execAsync(`protoc ${stringifiedOptions} ${PROTO_FILE}`);

    spinner.succeed('Succesfully run protoc');
  } catch (error) {
    spinner.fail('Failed to run protoc');
    throw error;
  }
}

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

    await downloadProtoFile();
    await protocGenEs();
    await openapiGenerator();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
