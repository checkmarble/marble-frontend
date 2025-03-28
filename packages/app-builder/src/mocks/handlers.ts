import { getServerEnv } from '@app-builder/utils/environment';
import { faker } from '@faker-js/faker';
import { type PivotObjectDto } from 'marble-api';
import { http, HttpResponse } from 'msw';
import * as R from 'remeda';

const SERVER_URL = getServerEnv('MARBLE_API_URL_SERVER');

const pivotObjets = createPivotObjects();

export const handlers = [
  http.get(`${SERVER_URL}/cases/:caseId/pivot_objects`, () => {
    return HttpResponse.json<{ pivot_objects?: PivotObjectDto[] }>({
      pivot_objects: pivotObjets,
    });
  }),
];

function createPivotData() {
  return R.pipe(
    faker.helpers.multiple(
      () => [faker.string.alphanumeric({ length: { min: 4, max: 15 } }), faker.string.sample()],
      {
        count: { min: 3, max: 8 },
      },
    ),
    R.fromEntries(),
  );
}

function createPivotObjects() {
  return faker.helpers.multiple(
    () => ({
      pivot_id: faker.string.uuid(),
      pivot_object_id: faker.string.uuid(),
      pivot_field_name: faker.string.alpha({ length: { min: 4, max: 15 } }),
      pivot_object_name: faker.string.alpha({ length: { min: 4, max: 15 } }),
      pivot_value: faker.string.uuid(),
      pivot_object_data: createPivotData(),
      pivot_type: 'object',
      number_of_decisions: 3,
      is_ingested: true,
    }),
    { count: { min: 1, max: 4 } },
  );
}
