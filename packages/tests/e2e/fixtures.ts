import knex from 'knex';
import crypto from 'crypto';

interface Org { id: string; }

interface Table {
  table: string;
  fields: { [key: string]: string};
}

const TABLES: Table[] = [
  {
    table: 'transactions',
    fields: {
      'beneficiary': 'String',
      'amount': 'Float',
    }
  }
]

export const setupFixtures = async (dsn: string, apiUrl: string) => {
  const sql = knex({ client: 'pg', connection: dsn });
  const org = await sql<Org>('organizations').select('id').where('name', 'Zorg').first();
  const apiKey = crypto.randomUUID();

  const hash = crypto.createHash('sha256').update(apiKey).digest();

  await sql('api_keys').insert({
    'org_id': org!.id,
    'role': 4,
    'prefix': apiKey.substring(0, 3),
    'key_hash': hash,
  });

  apiUrl = `http://localhost:${apiUrl}`;

  for (const spec of TABLES) {
    createTable(apiUrl, apiKey, spec);
  }
};

const createTable = async (apiUrl: string, apiKey: string, table: Table) => {
  const tableResponse = await fetch(`${apiUrl}/data-model/tables`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ 'name': table.table, 'description': 'Lorem ipsum.' })
  });

  if (tableResponse.status != 200) throw new Error('failed to create data model table');

  const tableId = (await tableResponse.json() as { id: string; }).id;

  for (const [fieldName, fieldType] of Object.entries(table.fields)) {
    const fieldResponse = await fetch(`${apiUrl}/data-model/tables/${tableId}/fields`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        'name': fieldName,
        'type': fieldType,
      }),
    });

    if (fieldResponse.status != 200) throw new Error('failed to create data model table field');
  }
}