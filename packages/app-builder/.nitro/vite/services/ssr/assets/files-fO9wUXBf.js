const getCaseFileUploadEndpoint = (caseId) => `/cases/${encodeURIComponent(caseId)}/files`;
const getCaseInvestigationDataDownloadEndpoint = (caseId) => `/cases/${encodeURIComponent(caseId)}/data_for_investigation`;
const getScreeningFileUploadEndpoint = (screeningId) => `/screenings/${encodeURIComponent(screeningId)}/files`;
const getClientAnnotationFileUploadEndpoint = (tableName, objectId) => `/client_data/${tableName}/${objectId}/annotations/file`;
const getIngestionDataBatchUploadEndpoint = (objectType) => `/ingestion/${encodeURIComponent(objectType)}/batch`;
const getCustomListDataUploadEndpoint = (listId) => `/custom-lists/${encodeURIComponent(listId)}/values/batch`;
export {
  getScreeningFileUploadEndpoint as a,
  getCustomListDataUploadEndpoint as b,
  getCaseFileUploadEndpoint as c,
  getClientAnnotationFileUploadEndpoint as d,
  getIngestionDataBatchUploadEndpoint as e,
  getCaseInvestigationDataDownloadEndpoint as g
};
