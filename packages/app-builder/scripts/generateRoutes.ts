import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import ora from 'ora';
import prettier from 'prettier';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateRoutes() {
  const spinner = ora(`Generating routes...`).start();
  try {
    const { stdout } = await execAsync(`npx remix routes --json`);
    const routes = JSON.parse(stdout) as string;

    await writeFile(
      'src/utils/routes/routes.ts',
      prettier.format(
        `export const routes = ${JSON.stringify(routes)} as const;`,
        {
          parser: 'typescript',
        }
      )
    );

    spinner.succeed(`succesfully generate routes`);
  } catch (error) {
    spinner.fail(`Failed to generate routes`);
    throw error;
  }
}
async function main() {
  try {
    await generateRoutes();
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

void main();
