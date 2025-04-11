import type { CaseDetail } from '@app-builder/models/cases';
import type { SanctionCheck } from '@app-builder/models/sanction-check';

export function getCaseFileUploadEndpoint(caseDetail: CaseDetail) {
  return `/cases/${caseDetail.id}/files`;
}

export const getCaseFileUploadEndpointById = (caseId: string) => `/cases/${caseId}/files`;

export const getCaseSuspiciousActivityReportFileUploadEndpointById = (
  caseId: string,
  reportId: string,
) => `/cases/${caseId}/sar/${reportId}/file`;

export function getCaseFileDownloadEndpoint() {
  return (id: string) => `/cases/files/${encodeURIComponent(id)}/download_link`;
}

export function getSanctionCheckFileUploadEndpoint(sanctionCheck: SanctionCheck) {
  return `/sanction-checks/${sanctionCheck.id}/files`;
}

export function getSanctionCheckFileDownloadEndpoint(sanctionCheck: SanctionCheck) {
  return (id: string) => `/sanction-checks/${sanctionCheck.id}/files/${encodeURIComponent(id)}`;
}
