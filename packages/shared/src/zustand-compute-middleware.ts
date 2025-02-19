import { type StateCreator } from 'zustand/vanilla';

type Selector<T, U> = (state: T) => U;

type ExtractSelectorTypes<T, S> = S extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends Selector<T, infer U>
    ? Rest extends readonly Selector<T, any>[]
      ? [U, ...ExtractSelectorTypes<T, Rest>]
      : [U]
    : []
  : [];

type InferState<S extends Selector<any, any>> = Parameters<S>[0];

type BasicConfig = {
  [k: string]: {
    selectors: readonly Selector<any, any>[];
    fn: (...args: any) => any;
  };
};
type ResultStore<C extends BasicConfig> = {
  readonly [K in keyof C]: C[K]['fn'] extends (...args: any) => infer R
    ? R
    : never;
};
type Selectors<C extends BasicConfig> = {
  [K in keyof C]: C[K]['selectors'][number];
}[keyof C];

function assertIsComplete<T extends Record<string, any>>(
  obj: Partial<T>,
  keys: (keyof T)[],
): asserts obj is T {
  for (const key of keys) {
    if (!(key in obj)) {
      throw new Error(`Missing key: ${String(key)}`);
    }
  }
}

export function createComputedField<S extends readonly Selector<any, any>[], R>(
  selectors: S,
  fn: (...args: ExtractSelectorTypes<InferState<S[number]>, S>) => R,
) {
  return { selectors, fn };
}

export function createComputed<
  C extends BasicConfig,
  T extends InferState<Selectors<C>> = InferState<Selectors<C>>,
>(config: C) {
  return function (sc: StateCreator<T>): StateCreator<T & ResultStore<C>> {
    return (set, get, api) => {
      type GetComputedStateReturnType<P> = [P] extends [undefined]
        ? ResultStore<C>
        : Partial<ResultStore<C>>;
      function getComputedState<P extends T | undefined>(
        state: T,
        prev: P,
      ): GetComputedStateReturnType<P> {
        const obj: Partial<ResultStore<C>> = {};
        for (const key in config) {
          const { selectors, fn } = config[key] as C[keyof C];
          const paramsFromPrev = selectors.map((sel) =>
            prev ? sel(prev) : undefined,
          );
          const paramsFromState = selectors.map((sel) => sel(state));

          if (
            selectors.some(
              (_sel, i) => paramsFromState[i] !== paramsFromPrev[i],
            )
          ) {
            const newComputedValue = fn(...paramsFromState);
            if (newComputedValue !== state[key]) {
              obj[key] = newComputedValue;
            }
          }
        }

        if (!prev) {
          assertIsComplete(obj, Object.keys(config));
        }

        return obj as GetComputedStateReturnType<P>;
      }

      type Update = T extends object ? T | ((state: T) => T) : never;
      type ReplaceParam = Parameters<typeof api.setState>[1];
      const setWithComputed = ((update: Update, replace: ReplaceParam) => {
        set((state) => {
          const newState = {
            ...state,
            ...(typeof update === 'function' ? update(state) : update),
          };

          return {
            ...newState,
            ...getComputedState(newState, state),
          };
        }, replace);
      }) as typeof api.setState;

      api.setState = setWithComputed;
      const state = sc(setWithComputed, get, api);

      return Object.assign({}, state, getComputedState(state, undefined));
    };
  };
}
