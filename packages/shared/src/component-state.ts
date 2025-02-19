import { type Provider, useState } from 'react';
import {
  createStore as zustandCreateStore,
  type StateCreator,
  type StoreApi,
  type StoreMutatorIdentifier,
  useStore,
} from 'zustand';

import { createSimpleContext } from './simple-context';

type CreateStoreFn<K> = (i: never) => StoreApi<K>;
// prettier-ignore
export type ComponentStateType<T> = T extends { createComponentStore: CreateStoreFn<infer K> }
  ? StoreApi<K>
  : never;

export const createStore = function useCreateComponentStore<
  T,
  U extends any[],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
  comp: any,
  fn: (...initialData: U) => StateCreator<T, [], Mos>,
  ...initialData: U
): StoreApi<T> {
  const [store] = useState(() => {
    const sc = fn(...initialData);
    return zustandCreateStore<T, Mos>(comp ? comp(sc) : sc);
  });
  return store;
};

type CreateComponentStateConfig<
  F extends (...args: any) => StateCreator<any>,
  Comp extends
    | InferComputed<(sc: ReturnType<F>) => StateCreator<any>>
    | undefined,
> = {
  name: string;
  factory: F;
  computed?: Comp;
};

type InferFactory<F extends (...args: any) => StateCreator<any>> = F extends (
  ...args: infer U
) => StateCreator<infer R>
  ? (...args: U) => StateCreator<R>
  : never;

type InferComputed<C> = undefined extends C
  ? never
  : C extends (sc: infer I) => StateCreator<infer O>
    ? (sc: I) => StateCreator<O>
    : never;

type InferConfig<C> =
  C extends CreateComponentStateConfig<infer F, infer Comp>
    ? CreateComponentStateConfig<F, Comp>
    : never;

type InferConfigFactory<C> =
  C extends CreateComponentStateConfig<infer F, any> ? InferFactory<F> : never;

type InferConfigInitData<C> =
  C extends CreateComponentStateConfig<infer F, any>
    ? F extends (...args: infer P) => any
      ? P
      : never
    : never;
type InferConfigIn<C> =
  C extends CreateComponentStateConfig<infer F, any>
    ? F extends (...args: any) => StateCreator<infer R>
      ? R
      : never
    : never;
type InferConfigComputed<C> =
  C extends CreateComponentStateConfig<any, infer Comp> ? Comp : never;
type InferOutComp<Comp> = Comp extends (
  sc: StateCreator<any>,
) => StateCreator<infer O>
  ? O
  : never;

export { StateCreator };

export function createComponentState<
  C extends CreateComponentStateConfig<any, any>,
  U extends InferConfigInitData<C> = InferConfigInitData<C>,
  I extends InferConfigIn<C> = InferConfigIn<C>,
  Comp extends InferConfigComputed<C> = InferConfigComputed<C>,
  O extends [InferComputed<Comp>] extends [never] ? I : InferOutComp<Comp> = [
    InferComputed<Comp>,
  ] extends [never]
    ? I
    : InferOutComp<Comp>,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(config: C) {
  const Ctx = createSimpleContext<StoreApi<O>>(config.name);

  return {
    createStore(...initialData: U) {
      return createStore<O, U, Mos>(
        config.computed,
        config.factory,
        ...initialData,
      );
    },
    Provider: Ctx.Provider as Provider<StoreApi<O>>,
    useStore<Value>(selector: (state: O) => Value): Value {
      return useStore(Ctx.useValue(), selector);
    },
  };
}
