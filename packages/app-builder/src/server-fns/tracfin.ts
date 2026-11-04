import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { toTracfinResult } from '@app-builder/models/tracfin';
import {
  tracfinCaseInputSchema,
  tracfinConfigurationInputSchema,
  tracfinCreateDraftInputSchema,
  tracfinNavigateInputSchema,
  tracfinPatchDraftInputSchema,
  tracfinRevisionInputSchema,
} from '@app-builder/schemas/tracfin';
import { createServerFn } from '@tanstack/react-start';

// ---- Catalog and organization configuration ----

export const getTracfinCatalogFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => toTracfinResult(() => context.authInfo.tracfin.getCatalog()));

export const getTracfinConfigurationFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) =>
    toTracfinResult(() =>
      context.authInfo.tracfin.getConfiguration({ organizationId: context.authInfo.user.organizationId }),
    ),
  );

export const putTracfinConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinConfigurationInputSchema)
  .handler(async ({ context, data }) =>
    toTracfinResult(() =>
      context.authInfo.tracfin.putConfiguration({
        organizationId: context.authInfo.user.organizationId,
        body: data,
      }),
    ),
  );

// ---- Case context and navigation ----

export const getTracfinContextFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(tracfinCaseInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.getContext(data)));

export const navigateTracfinFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinNavigateInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.navigate(data)));

// ---- Draft ----

export const getTracfinDraftFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(tracfinCaseInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.getDraft(data)));

export const createTracfinDraftFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinCreateDraftInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.createDraft(data)));

export const patchTracfinDraftFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinPatchDraftInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.patchDraft(data)));

export const prefillTracfinDraftFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinRevisionInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.prefill(data)));

export const validateTracfinDraftFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinRevisionInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.validate(data)));

export const exportTracfinDraftFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(tracfinRevisionInputSchema)
  .handler(async ({ context, data }) => toTracfinResult(() => context.authInfo.tracfin.exportDraft(data)));
