import { type ClientDataListResponse } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import * as R from 'remeda';
import invariant from 'tiny-invariant';
import { z } from 'zod/v4';

export type DataTableObjectListResource = {
  clientDataListResponse: ClientDataListResponse;
};

const explorationOptionsSchema = z.object({
  sourceTableName: z.string(),
  filterFieldName: z.string(),
  filterFieldValue: z.union([z.string(), z.number()]),
  orderingFieldName: z.string(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().optional(),
  offsetId: z.union([z.string(), z.coerce.number()]).optional(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const tableName = params['tableName'];
  invariant(tableName, 'Expected tableName param to be present in url');

  const queryParams = R.pipe(new URL(request.url).searchParams.entries().toArray(), R.fromEntries());
  const explorationOptions = explorationOptionsSchema.parse(queryParams);
  const paginationQuery = paginationSchema.parse(queryParams);

  const [clientDataListResponse] = await Promise.all([
    dataModelRepository.listClientObjects({
      tableName,
      body: {
        explorationOptions,
        ...paginationQuery,
      },
    }),
  ]);

  return Response.json({
    clientDataListResponse,
  });
}
