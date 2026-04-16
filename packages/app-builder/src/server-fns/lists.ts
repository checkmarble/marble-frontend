import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import {
  addValuePayloadSchema,
  createListPayloadSchema,
  deleteListPayloadSchema,
  deleteValuePayloadSchema,
  editListPayloadSchema,
} from '@app-builder/schemas/lists';
import { setToast } from '@app-builder/services/toast.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCustomListDataUploadEndpoint } from '@app-builder/utils/files';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { omit } from 'radash';

export const createListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createListPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const result = await context.authInfo.customListsRepository.createCustomList(data);
      throw redirect({ to: '/detection/lists/$listId', params: { listId: fromUUIDtoSUUID(result.id) } });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      await setToast({
        type: 'error',
        messageKey: isStatusConflictHttpError(error)
          ? 'common:errors.list.duplicate_list_name'
          : 'common:errors.unknown',
      });
      throw new Error('Failed to create list');
    }
  });

export const deleteListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteListPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.customListsRepository.deleteCustomList(data.listId);
    throw redirect({ to: '/detection/lists' });
  });

export const editListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editListPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.customListsRepository.updateCustomList(data.listId, omit(data, ['listId']));
  });

export const addListValueFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(addValuePayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.customListsRepository.createCustomListValue(data.listId, {
      value: data.value,
    });
  });

export const deleteListValueFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteValuePayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.customListsRepository.deleteCustomListValue(data.listId, data.listValueId);
  });

export const uploadListDataFileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const listId = data.get('listId') as string | null;
    if (!listId) return new Response(null, { status: 400 });

    const token = await context.authInfo.tokenService.getToken();

    const backendData = new FormData();
    for (const [key, value] of data.entries()) {
      if (key !== 'listId') backendData.append(key, value);
    }

    return fetch(`${getServerEnv('MARBLE_API_URL')}${getCustomListDataUploadEndpoint(listId)}`, {
      body: backendData,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  });
