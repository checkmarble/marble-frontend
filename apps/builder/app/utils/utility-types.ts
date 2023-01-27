export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: Exclude<T[P], undefined>;
};

export type OptionnalKeys<T extends object, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P] | undefined;
};

export function hasRequiredKeys<T, K extends keyof T>(requiredKeys: K[]) {
  return (value: T): value is T & RequiredKeys<T, K> => {
    for (const key of requiredKeys) {
      if (value[key] === undefined) return false;
    }
    return true;
  };
}
