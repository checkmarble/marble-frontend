export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type FunctionKeys<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
