import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type TracfinCatalog,
  type TracfinConfiguration,
  type TracfinConfigurationInput,
  type TracfinContext,
  type TracfinCreateDraftInput,
  type TracfinDraft,
  type TracfinDraftInput,
  type TracfinExport,
  type TracfinNavigateInput,
  type TracfinNavigationPage,
  type TracfinPrefillResult,
  type TracfinRevisionInput,
  type TracfinValidation,
} from '@app-builder/models/tracfin';

/**
 * One method per JSON route. Responses are the generated DTOs, untouched; failures are thrown as
 * the generated client throws them (an `HttpError`). The binary export download is not here: it is
 * proxied by a resource route.
 */
export interface TracfinRepository {
  getCatalog(): Promise<TracfinCatalog>;
  getConfiguration(args: { organizationId: string }): Promise<TracfinConfiguration>;
  putConfiguration(args: { organizationId: string; body: TracfinConfigurationInput }): Promise<TracfinConfiguration>;
  getContext(args: { caseId: string }): Promise<TracfinContext>;
  navigate(args: { caseId: string; body: TracfinNavigateInput }): Promise<TracfinNavigationPage>;
  getDraft(args: { caseId: string }): Promise<TracfinDraft>;
  createDraft(args: { caseId: string; body: TracfinCreateDraftInput }): Promise<TracfinDraft>;
  patchDraft(args: { caseId: string; body: TracfinDraftInput }): Promise<TracfinDraft>;
  prefill(args: { caseId: string; body: TracfinRevisionInput }): Promise<TracfinPrefillResult>;
  validate(args: { caseId: string; body: TracfinRevisionInput }): Promise<TracfinValidation>;
  exportDraft(args: { caseId: string; body: TracfinRevisionInput }): Promise<TracfinExport>;
}

export function makeGetTracfinRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): TracfinRepository => ({
    getCatalog: () => marbleCoreApiClient.tracfinGetCatalog(),
    getConfiguration: ({ organizationId }) => marbleCoreApiClient.tracfinGetConfiguration(organizationId),
    putConfiguration: ({ organizationId, body }) => marbleCoreApiClient.tracfinPutConfiguration(organizationId, body),
    getContext: ({ caseId }) => marbleCoreApiClient.tracfinGetContext(caseId),
    navigate: ({ caseId, body }) => marbleCoreApiClient.tracfinNavigate(caseId, body),
    getDraft: ({ caseId }) => marbleCoreApiClient.tracfinGetDraft(caseId),
    createDraft: ({ caseId, body }) => marbleCoreApiClient.tracfinCreateDraft(caseId, body),
    patchDraft: ({ caseId, body }) => marbleCoreApiClient.tracfinPatchDraft(caseId, body),
    prefill: ({ caseId, body }) => marbleCoreApiClient.tracfinPrefill(caseId, body),
    validate: ({ caseId, body }) => marbleCoreApiClient.tracfinValidate(caseId, body),
    exportDraft: ({ caseId, body }) => marbleCoreApiClient.tracfinExport(caseId, body),
  });
}
