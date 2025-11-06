export const getCaseFileUploadEndpoint = (caseId: string) => `/cases/${encodeURIComponent(caseId)}/files`;

export const getCaseInvestigationDataDownloadEndpoint = (caseId: string) =>
  `/cases/${encodeURIComponent(caseId)}/data_for_investigation`;

export const getCaseSuspiciousActivityReportFileUploadEndpointById = (caseId: string, reportId: string) =>
  `/cases/${caseId}/sar/${reportId}/file`;

export const getScreeningFileUploadEndpoint = (screeningId: string) =>
  `/screenings/${encodeURIComponent(screeningId)}/files`;

export const getClientAnnotationFileUploadEndpoint = (tableName: string, objectId: string) =>
  `/client_data/${tableName}/${objectId}/annotations/file`;

export const getIngestionDataBatchUploadEndpoint = (objectType: string) =>
  `/ingestion/${encodeURIComponent(objectType)}/batch`;

export const getCustomListDataUploadEndpoint = (listId: string) =>
  `/custom-lists/${encodeURIComponent(listId)}/values/batch`;
