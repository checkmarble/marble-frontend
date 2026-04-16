import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { addConfigurationPayloadSchema, client360SearchPayloadSchema } from '@app-builder/schemas/client360';
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
