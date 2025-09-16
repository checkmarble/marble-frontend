export type MutationSuccess<Data> = { success: true; data: Data; errors?: undefined };
export type MutationFailure = { success: false; errors: string[]; data?: undefined };
export type MutationRedirect = { success?: undefined; redirectTo: string };

export type MutationResponse<Data> = MutationSuccess<Data> | MutationFailure | MutationRedirect;
export type PromiseMutationResponse<Data> = Promise<MutationResponse<Data>>;

export function isMutationSuccess<Data>(res: MutationResponse<Data>): res is MutationSuccess<Data> {
  return res.success === true;
}

export function isMutationFailure<Data>(res: MutationResponse<Data>): res is MutationFailure {
  return res.success === false;
}

export function isMutationRedirect<Data>(res: MutationResponse<Data>): res is MutationRedirect {
  return res.success === undefined && 'redirectTo' in res;
}
