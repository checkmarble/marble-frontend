import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  isAdmin,
  isHttpError,
  isMarbleError,
  isNotFoundHttpError,
  isStatusConflictHttpError,
} from '@app-builder/models';
import { type ExportedFields } from '@app-builder/models/data-model';
import { type PersonalSettings } from '@app-builder/models/personal-settings';
import {
  auditEventsFiltersSchema,
  auditEventsPaginationSchema,
  createApiKeyPayloadSchema,
  createInboxPayloadSchema,
  createInboxUserPayloadSchema,
  createTagPayloadSchema,
  createUserPayloadSchema,
  createWebhookPayloadSchema,
  createWebhookSecretPayloadSchema,
  deleteApiKeyPayloadSchema,
  deleteInboxPayloadSchema,
  deleteInboxUserPayloadSchema,
  deleteTagPayloadSchema,
  deleteUserPayloadSchema,
  deleteWebhookPayloadSchema,
  editInboxUserAutoAssignPayloadSchema,
  exportedFieldSchema,
  revokeWebhookSecretPayloadSchema,
  updateAllowedNetworksPayloadSchema,
  updateInboxPayloadSchema,
  updateInboxUserPayloadSchema,
  updateOrganizationPayloadSchema,
  updateOrganizationScenariosPayloadSchema,
  updateTagPayloadSchema,
  updateUserPayloadSchema,
  updateWebhookPayloadSchema,
} from '@app-builder/schemas/settings';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';

import { UNPROCESSABLE_ENTITY } from '@app-builder/utils/http/http-status-codes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { pick } from 'radash';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

// ---- API Keys ----

export const createApiKeyFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createApiKeyPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const authSession = await useAuthSession();
      await authSession.update({ createdApiKey: await context.authInfo.apiKey.createApiKey(data) });
      throw redirect({ to: '/settings/api-keys' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to create API key');
    }
  });

export const deleteApiKeyFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteApiKeyPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiKey.deleteApiKey(data);
      throw redirect({ to: '/settings/api-keys' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to delete API key');
    }
  });

// ---- Audit Events ----

export const getAuditEventsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(auditEventsFiltersSchema.and(auditEventsPaginationSchema))
  .handler(async ({ context, data }) => {
    const { user, auditEvents } = context.authInfo;

    if (!isAdmin(user)) {
      throw redirect({ to: '/' });
    }

    let from: string | undefined;
    let to: string | undefined;

    if (data.dateRange) {
      if (data.dateRange.type === 'dynamic') {
        const now = Temporal.Now.zonedDateTimeISO();
        from = now.add(data.dateRange.fromNow).toInstant().toString();
        to = now.toInstant().toString();
      } else {
        from = data.dateRange.startDate;
        to = data.dateRange.endDate;
      }
    }

    return auditEvents.listAuditEvents({
      from,
      to,
      userId: data.userId,
      apiKeyId: data.apiKeyId,
      table: data.table,
      entityId: data.entityId,
      limit: data.limit,
      after: data.after,
    });
  });

// ---- Exported Fields (Data Model) ----

export const deleteExportedFieldFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(exportedFieldSchema.and(z.object({ tableId: z.string() })))
  .handler(async ({ context, data }): Promise<ExportedFields> => {
    try {
      const { tableId, ...field } = data;
      const current = await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);

      if ('triggerObjectField' in field) {
        if (!current.triggerObjectFields.includes(field.triggerObjectField)) {
          throw new Error('Field not exported');
        }
        return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
          triggerObjectFields: current.triggerObjectFields.filter((f) => f !== field.triggerObjectField),
          ingestedDataFields: current.ingestedDataFields,
        });
      }

      if ('ingestedDataField' in field) {
        if (!current.ingestedDataFields.some((f) => R.isDeepEqual(f, field.ingestedDataField))) {
          throw new Error('Field not exported');
        }
        return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
          triggerObjectFields: current.triggerObjectFields,
          ingestedDataFields: current.ingestedDataFields.filter((f) => !R.isDeepEqual(f, field.ingestedDataField)),
        });
      }

      throw new Error('Invalid payload');
    } catch {
      throw new Error('Failed to delete exported field');
    }
  });

export const updateExportedFieldFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(exportedFieldSchema.and(z.object({ tableId: z.string() })))
  .handler(async ({ context, data }): Promise<ExportedFields> => {
    try {
      const { tableId, ...field } = data;
      const current = await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);

      if ('triggerObjectField' in field) {
        if (current.triggerObjectFields.includes(field.triggerObjectField)) {
          throw new Error('Field already exported');
        }
        return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
          triggerObjectFields: [...current.triggerObjectFields, field.triggerObjectField],
          ingestedDataFields: current.ingestedDataFields,
        });
      }

      if ('ingestedDataField' in field) {
        const exists = (current.ingestedDataFields ?? []).some(
          (f) =>
            f.name === field.ingestedDataField.name &&
            (f.path ?? []).join('.') === field.ingestedDataField.path.join('.'),
        );
        if (exists) {
          throw new Error('Field already exported');
        }
        return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
          triggerObjectFields: current.triggerObjectFields,
          ingestedDataFields: [...(current.ingestedDataFields ?? []), field.ingestedDataField],
        });
      }

      throw new Error('Invalid payload');
    } catch {
      throw new Error('Failed to update exported field');
    }
  });

// ---- Inboxes ----

export const createInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createInboxPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const createdInbox = await context.authInfo.inbox.createInbox(data);

      if (data.redirectRoute) {
        throw redirect({ to: data.redirectRoute, params: { inboxId: fromUUIDtoSUUID(createdInbox.id) } });
      }
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to create inbox');
    }
  });

export const deleteInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteInboxPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.inbox.deleteInbox(data.inboxId);
      throw redirect({ to: '/settings/inboxes' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to delete inbox');
    }
  });

export const updateInboxFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateInboxPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const updatedInbox = await context.authInfo.inbox.updateInbox(
        data.id,
        pick(data, ['name', 'escalationInboxId', 'autoAssignEnabled']),
      );
      throw redirect({ to: data.redirectRoute, params: { inboxId: fromUUIDtoSUUID(updatedInbox.id) } });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to update inbox');
    }
  });

export const createInboxUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createInboxUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.inbox.createInboxUser(data.inboxId, R.omit(data, ['inboxId']));
      throw redirect({
        to: '/settings/inboxes/$inboxId',
        params: { inboxId: fromUUIDtoSUUID(data.inboxId) },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to create inbox user');
    }
  });

export const deleteInboxUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteInboxUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.inbox.deleteInboxUser(data.inboxUserId);
      throw redirect({
        to: '/settings/inboxes/$inboxId',
        params: { inboxId: fromUUIDtoSUUID(data.inboxId) },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to delete inbox user');
    }
  });

export const editInboxUserAutoAssignFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editInboxUserAutoAssignPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.inbox.updateInboxUser(data.id, { autoAssignable: data.autoAssignable });
  });

export const updateInboxUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateInboxUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.inbox.updateInboxUser(data.id, pick(data, ['role', 'autoAssignable']));
      throw redirect({
        to: '/settings/inboxes/$inboxId',
        params: { inboxId: fromUUIDtoSUUID(data.inboxId) },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to update inbox user');
    }
  });

// ---- Organization ----

export const updateAllowedNetworksFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateAllowedNetworksPayloadSchema.and(z.object({ organizationId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
      const subnets = await context.authInfo.organization.updateAllowedNetworks(
        data.organizationId,
        data.allowedNetworks,
      );
      return { subnets };
    } catch (error) {
      if (isHttpError(error) && error.status === UNPROCESSABLE_ENTITY) {
        return { error: 'ip_not_in_range' as const };
      }
      throw new Error('Failed to update allowed networks');
    }
  });

export const updateOrganizationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateOrganizationPayloadSchema)
  .handler(async ({ context, data }) => {
    const { organizationId, autoAssignQueueLimit } = data;
    await context.authInfo.organization.updateOrganization({ organizationId, changes: { autoAssignQueueLimit } });
  });

export const updateOrganizationScenariosFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateOrganizationScenariosPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.organization.updateOrganization({
      organizationId: data.organizationId,
      changes: {
        defaultScenarioTimezone: data.defaultScenarioTimezone,
        sanctionThreshold: data.sanctionThreshold,
        sanctionLimit: data.sanctionLimit,
      },
    });
  });

// ---- Personal Settings ----

export const getUnavailabilityFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PersonalSettings> => {
    try {
      return await context.authInfo.personalSettings.getUnavailability();
    } catch (error) {
      if (isNotFoundHttpError(error)) {
        return { until: null };
      }
      throw new Error('Failed to fetch unavailability');
    }
  });

export const setUnavailabilityFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ until: z.string().nullable() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.personalSettings.setUnavailability({
        until: data.until ? new Date(data.until) : null,
      });
    } catch (error) {
      if (isMarbleError(error as Parameters<typeof isMarbleError>[0])) {
        throw new Error((error as { data?: { message?: string } }).data?.message ?? 'Failed to set unavailability');
      }
      throw new Error('Failed to set unavailability');
    }
  });

export const cancelUnavailabilityFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      await context.authInfo.personalSettings.cancelUnavailability();
    } catch (error) {
      if (isMarbleError(error as Parameters<typeof isMarbleError>[0])) {
        throw new Error((error as { data?: { message?: string } }).data?.message ?? 'Failed to cancel unavailability');
      }
      throw new Error('Failed to cancel unavailability');
    }
  });

// ---- Tags ----

export const createTagFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createTagPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.createTag(data);
  });

export const deleteTagFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteTagPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.deleteTag(data.tagId);
    } catch {
      throw new Error('Failed to delete tag');
    }
  });

export const updateTagFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateTagPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateTag(data.id, data);
  });

// ---- Users ----

export const createUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.createUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role,
        organization_id: data.organizationId,
      });
    } catch (error) {
      if (isStatusConflictHttpError(error)) {
        return { error: 'duplicate_email' as const };
      }
      throw new Error('Failed to create user');
    }
  });

export const deleteUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteUserPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.deleteUser(data.userId);
    } catch {
      throw new Error('Failed to delete user');
    }
  });

export const updateUserFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateUserPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateUser(data.userId, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
      organization_id: data.organizationId,
    });
  });

// ---- Webhooks ----

export const createWebhookFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createWebhookPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const webhook = await context.authInfo.webhookRepository.createWebhook({ webhookCreateBody: data });
      throw redirect({ to: '/settings/webhooks/$webhookId', params: { webhookId: webhook.id } });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to create webhook');
    }
  });

export const createWebhookSecretFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createWebhookSecretPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.webhookRepository.createWebhookSecret({
      webhookId: data.webhookId,
      createSecretBody: { expireExistingInDays: data.expireExistingInDays },
    });
  });

export const deleteWebhookFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteWebhookPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.webhookRepository.deleteWebhook({ webhookId: data.webhookId });
      throw redirect({ to: '/settings/webhooks' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to delete webhook');
    }
  });

export const revokeWebhookSecretFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(revokeWebhookSecretPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.webhookRepository.revokeWebhookSecret({
      webhookId: data.webhookId,
      secretId: data.secretId,
    });
  });

export const updateWebhookFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateWebhookPayloadSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.webhookRepository.updateWebhook({
      webhookId: data.id,
      webhookUpdateBody: data,
    });
  });
