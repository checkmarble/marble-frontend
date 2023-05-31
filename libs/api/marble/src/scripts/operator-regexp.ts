import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  try {
    const { stdout } = await execAsync(
      `awk '/\\"type\\"/ {print $2}' src/lib/generated/marble-api.ts`
    );
    const result = stdout.matchAll(/"(.*)"/g);
    const blackList = Array.from(result)
      .map((match) => match[1])
      .join('|');

    const regexp = `operatorFromType\\["((?!(${blackList})).*)"\\]`;

    console.log(regexp);
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

main();
