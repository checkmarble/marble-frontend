import type { CaseDetail } from '@app-builder/models/cases';
import type { SanctionCheck } from '@app-builder/models/sanction-check';

export function getCaseFileUploadEndpoint(caseDetail: CaseDetail) {
  return `/cases/${caseDetail.id}/files`;
}

export function getCaseFileDownloadEndpoint() {
  return (id: string) => `/cases/files/${encodeURIComponent(id)}/download_link`;
}

export function getSanctionCheckFileUploadEndpoint(sanctionCheck: SanctionCheck) {
  return `/sanction-checks/${sanctionCheck.id}/files`;
}

export function getSanctionCheckFileDownloadEndpoint(sanctionCheck: SanctionCheck) {
  return (id: string) => `/sanction-checks/${sanctionCheck.id}/files/${encodeURIComponent(id)}`;
}
