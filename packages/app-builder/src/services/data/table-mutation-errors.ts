import { isHttpError, isStatusConflictHttpError } from '@app-builder/models';
import type { TFunction } from 'i18next';

interface TableMutationError {
  status: number;
  message: string;
}

export function getTableMutationError(
  error: unknown,
  t: TFunction,
  options?: {
    conflictMessage?: string;
  },
): TableMutationError {
  if (isHttpError(error) && isStatusConflictHttpError(error)) {
    return {
      status: error.status,
      message: error.data?.error ?? error.data?.message ?? t('common:errors.conflict'),
    };
  }

  if (isHttpError(error)) {
    return {
      status: error.status,
      message: t('common:errors.unknown'),
    };
  }

  return {
    status: 500,
    message: t('common:errors.unknown'),
  };
}

export function formatTableMutationError(error: Pick<TableMutationError, 'status' | 'message'>) {
  return `${error.status}: ${error.message}`;
}
