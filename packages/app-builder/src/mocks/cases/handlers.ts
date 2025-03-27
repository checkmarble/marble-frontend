import { type PivotObjectDto } from 'marble-api';
import { bypass, http, HttpResponse } from 'msw';

import { MOCKING_SERVER_URL } from '../helpers';

export const casesHandlers = [
  http.get(`${MOCKING_SERVER_URL}/cases/:caseId/pivot_objects`, async ({ request }) => {
    const origRes = await fetch(bypass(request));
    const { pivot_objects } = (await origRes.json()) as { pivot_objects: PivotObjectDto[] };

    for (const pivotObject of pivot_objects) {
      pivotObject.pivot_object_data.related_objects = [
        {
          link_name: 'owner',
          related_object_detail: {
            data: {
              object_id: 'troloooolol',
              a_field: 'trololilol',
            },
            related_objects: [],
          },
        },
      ];
    }

    return HttpResponse.json<{ pivot_objects: PivotObjectDto[] }>({
      pivot_objects,
    });
  }),
];
