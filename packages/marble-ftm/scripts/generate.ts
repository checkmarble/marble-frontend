import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { parseArgs } from 'util';

const GENERATED_FILES_DIR = resolve(import.meta.dir, '../src/generated');

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    schemas: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
});
const supportedSchemas = values.schemas?.split(',') ?? ['Thing'];

const schemasFilenames = await readdir(resolve(import.meta.dir, '../schema'));

const schemasFilepaths = schemasFilenames.map((filename) => resolve(import.meta.dir, '../schema', filename));
const schemasResults = await Promise.allSettled(schemasFilepaths.map((filepath) => Bun.file(filepath).text()));

let schemas: Record<string, any> = {};

for (const result of schemasResults) {
  if (result.status !== 'fulfilled') {
    continue;
  }

  schemas = { ...schemas, ...(Bun.YAML.parse(result.value) as Record<string, any>) };
}

// For each supported schema, generate a Typescript definition object
for (const [name, description] of Object.entries(schemas)) {
  if (!supportedSchemas.includes(name)) {
    continue;
  }

  const filepath = resolve(GENERATED_FILES_DIR, `${name}.ts`);

  const objectLiteral = ts.factory.createObjectLiteralExpression();
  const expression = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(name, undefined, undefined, objectLiteral)],
      ts.NodeFlags.Const,
    ),
  );

  const nodeArray = ts.factory.createNodeArray([expression]);
  const sourceFile = ts.createSourceFile('', '', ts.ScriptTarget.Latest);

  const output = ts.createPrinter().printList(ts.ListFormat.MultiLine, nodeArray, sourceFile);

  await Bun.write(filepath, output);
}
