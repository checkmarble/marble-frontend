import { isForbiddenHttpError } from '@app-builder/models/http-errors';

export async function roleManagerOptionalList<T>(request: Promise<T[]>, canManageRoles: boolean): Promise<T[]> {
  try {
    return await request;
  } catch (error) {
    if (canManageRoles && isForbiddenHttpError(error)) return [];
    throw error;
  }
}
