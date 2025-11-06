import { mkdir, rm, writeFile } from 'fs/promises';
import * as Oazapfts from 'oazapfts';
import ora from 'ora';

import { type Config, featureAccessApiConfig, GENERATED_FOLDER, marbleCoreApiConfig } from './config';

async function openapiGenerator({ apiName, apiSpec, generatedApi, apiOptions }: Config) {
  const spinner = ora(`Start to generate ${apiName} client...`).start();
  try {
    const code = await Oazapfts.generateSource(apiSpec, apiOptions);

    await writeFile(generatedApi, code);

    spinner.succeed(`Succesfully generated ${apiName} client`);
  } catch (error) {
    spinner.fail(`Failed to generate ${apiName} client`);
    throw error;
  }
}

async function main() {
  try {
    await rm(GENERATED_FOLDER, { recursive: true, force: true });
    await mkdir(GENERATED_FOLDER);

    await openapiGenerator(marbleCoreApiConfig);
    await openapiGenerator(featureAccessApiConfig);
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

void main();
