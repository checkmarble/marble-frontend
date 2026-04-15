import crypto from 'crypto';
import knex from 'knex';

interface Org {
  id: string;
}

interface Table {
  table: string;
  fields: { [key: string]: { type: string; semantic_type: string } };
}
const TABLES: Table[] = [
  {
    table: 'transactions',
    fields: {
      beneficiary: { type: 'String', semantic_type: 'name' },
      amount: { type: 'Float', semantic_type: 'monetary_amount' },
    },
  },
];

export const setupFixtures = async (dsn: string, apiUrl: string) => {
  const sql = knex({ client: 'pg', connection: dsn });
  const org = await sql<Org>('organizations').select('id').where('name', 'Zorg').first();
  const apiKey = crypto.randomUUID();

  const hash = crypto.createHash('sha256').update(apiKey).digest();

  await sql('api_keys').insert({
    org_id: org!.id,
    role: 4,
    prefix: apiKey.substring(0, 3),
    key_hash: hash,
  });

  apiUrl = `http://localhost:${apiUrl}`;

  for (const spec of TABLES) {
    createTable(apiUrl, apiKey, spec);
  }
};

const createTable = async (apiUrl: string, apiKey: string, table: Table) => {
  const bodyValues = {
    name: table.table,
    primary_ordering_field: 'updated_at',
    semantic_type: 'other',
    description: 'lorem ipsum',
    fields: [
      {
        alias: 'object_id',
        description: '',
        is_enum: false,
        is_unique: false,
        metadata: {
          hidden: false,
          semanticSubType: 'opaque_id',
          semanticTypeForFront: 'unique_id',
        },
        name: 'object_id',
        nullable: false,
        semantic_type: 'id',
        type: 'String',
      },
      {
        alias: 'updated_at',
        description: '',
        is_enum: false,
        is_unique: false,
        metadata: {
          hidden: false,
          semanticTypeForFront: 'last_update',
        },
        name: 'updated_at',
        nullable: false,
        semantic_type: 'last_update',
        type: 'Timestamp',
      },
      ...Object.entries(table.fields).map(([key, field]) => ({
        alias: key,
        description: '',
        is_enum: false,
        is_unique: false,
        name: key,
        nullable: true,
        semantic_type: field.semantic_type,
        type: field.type,
      })),
    ],
    links: [],
  };

  const tableResponse = await fetch(`${apiUrl}/data-model/tables`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: JSON.stringify(bodyValues),
  });

  if (tableResponse.status != 200)
    throw new Error(`failed to create data model table ${tableResponse.status} ${await tableResponse.json()}`);
};
