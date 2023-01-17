export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends infer U | undefined ? U : T[P];
};
