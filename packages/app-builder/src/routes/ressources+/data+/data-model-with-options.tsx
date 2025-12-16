import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  DataModelWithTableOptions,
  mergeDataModelWithTableOptions,
  TableModelWithOptions,
} from '@app-builder/models/data-model';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const { dataModelRepository } = context.authInfo;

  const dataModel = await dataModelRepository.getDataModel();
  const dataModelWithTableOptions = (await Promise.all(
    dataModel.map<Promise<TableModelWithOptions>>((table) =>
      dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
        return mergeDataModelWithTableOptions(table, options);
      }),
    ),
  )) satisfies DataModelWithTableOptions;

  return { dataModel: dataModelWithTableOptions };
});
