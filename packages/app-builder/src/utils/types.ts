// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Contra<T> = T extends any ? (arg: T) => void : never;

type InferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;

type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>;

export type UnionToArray<T> = PickOne<T> extends infer U
  ? Exclude<T, U> extends never
    ? [T]
    : [...UnionToArray<Exclude<T, U>>, U]
  : never;
