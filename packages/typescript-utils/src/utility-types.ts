export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
