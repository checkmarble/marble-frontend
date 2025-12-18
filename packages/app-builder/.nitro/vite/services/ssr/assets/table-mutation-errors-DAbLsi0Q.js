import { E as isHttpError, I as isStatusConflictHttpError } from "./services-middleware-DR8Hua1Y.js";
function getTableMutationError(error, t, options) {
  if (isHttpError(error) && isStatusConflictHttpError(error)) {
    return {
      status: error.status,
      message: error.data?.error ?? error.data?.message ?? t("common:errors.conflict")
    };
  }
  if (isHttpError(error)) {
    return {
      status: error.status,
      message: t("common:errors.unknown")
    };
  }
  return {
    status: 500,
    message: t("common:errors.unknown")
  };
}
function formatTableMutationError(error) {
  return `${error.status}: ${error.message}`;
}
function isTableMutationError(error) {
  return typeof error === "object" && error !== null && "status" in error && "message" in error;
}
export {
  formatTableMutationError as f,
  getTableMutationError as g,
  isTableMutationError as i
};
