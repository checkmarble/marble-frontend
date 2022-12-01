import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';
import { join } from 'path';
import got from 'got';
import ora from 'ora';
import rimraf from 'rimraf';

const execAsync = promisify(exec);

const PROTO_FILE = 'marble.proto';

const PROTOC_GEN_ES_OPTIONS = {
  proto_path: join(process.cwd(), 'src/scripts'),
  plugin: join('../../..', './node_modules/.bin/protoc-gen-es'),
  es_out: 'src/lib',
  es_opt: 'target=ts',
};

async function downloadProtoFile() {
  const spinner = ora(`Downloading ${PROTO_FILE}...`).start();
  try {
    const { encoding, content } = await got
      .get(
        `https://gitlab.com/api/v4/projects/41228702/repository/files/${PROTO_FILE}?ref=main`,
        {
          headers: {
            'PRIVATE-TOKEN': process.env['GITLAB_PAT_READ_REPOSITORY'],
          },
        }
      )
      .json<{ encoding: BufferEncoding; content: string }>();

    writeFileSync(
      join('./src/scripts/', PROTO_FILE),
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

async function main() {
  try {
    rimraf.sync(`${PROTOC_GEN_ES_OPTIONS.es_out}/*`);

    await downloadProtoFile();
    await protocGenEs();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
