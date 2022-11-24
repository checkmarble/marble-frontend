import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';
import path from 'path';
import got from 'got';
import ora from 'ora';

const spinner = ora();

const execAsync = promisify(exec);

console.log();

const protoFile = 'marble.proto';

const withLogger =
  (
    log: { start: string; success: string; fail: string },
    fn: () => Promise<void>
  ) =>
  async () => {
    spinner.start(log.start);

    try {
      await fn();
      spinner.succeed(log.success);
    } catch (error) {
      spinner.fail(log.fail);
      console.error('\n', error);
      process.exit(1);
    }
  };

async function downloadProtoFile() {
  const { encoding, content } = await got
    .get(
      `https://gitlab.com/api/v4/projects/41228702/repository/files/${protoFile}?ref=main`,
      {
        headers: {
          'PRIVATE-TOKEN': process.env['GITLAB_PAT_READ_REPOSITORY'],
        },
      }
    )
    .json<{ encoding: BufferEncoding; content: string }>();

  writeFileSync(
    path.join('./src/scripts/', protoFile),
    Buffer.from(content, encoding)
  );
}

const protocGenEsOptions = {
  proto_path: path.join(process.cwd(), 'src/scripts'),
  plugin: path.join('../../..', './node_modules/.bin/protoc-gen-es'),
  es_out: 'src/lib',
  es_opt: 'target=ts',
};

async function clear() {
  await execAsync(`rm -rf ${protocGenEsOptions.es_out}`);
  await execAsync(`mkdir ${protocGenEsOptions.es_out}`);
}

async function protocGenEs() {
  const stringifiedOptions = Object.entries(protocGenEsOptions)
    .map(([name, value]) => `--${name} ${value}`)
    .join(' ');
  await execAsync(`protoc ${stringifiedOptions} ${protoFile}`);
}

async function main() {
  await withLogger(
    {
      start: `Start to clear...`,
      success: `Succesfully clear`,
      fail: `Failed to clear`,
    },
    clear
  )();
  await withLogger(
    {
      start: `Downloading ${protoFile}...`,
      success: `${protoFile} succesfully downloaded`,
      fail: `Failed to download ${protoFile}`,
    },
    downloadProtoFile
  )();
  await withLogger(
    {
      start: `Start to run protoc...`,
      success: `Succesfully run protoc`,
      fail: `Failed to run protoc`,
    },
    protocGenEs
  )();
}

main();
