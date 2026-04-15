import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { addConfigurationPayloadSchema } from '@app-builder/queries/client360/add-configuration';
import { client360SearchPayloadSchema } from '@app-builder/queries/client360/search';
import { setToast } from '@app-builder/services/toast.server';
import { createServerFn } from '@tanstack/react-start';

export const addClient360ConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(addConfigurationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { tableId, ...body } = data;
      await context.authInfo.dataModelRepository.patchDataModelTable(tableId, body);
      await setToast({ type: 'success', messageKey: 'common:success.save' });
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to add configuration');
    }
  });

export const searchClient360Fn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(client360SearchPayloadSchema)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ context, data }): Promise<any> => {
    return context.authInfo.client360.searchClient360(data);
  });
