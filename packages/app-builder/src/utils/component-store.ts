import { type Provider, useState } from 'react';
import {
  createStore,
  type StateCreator,
  type StoreApi,
  type StoreMutatorIdentifier,
  useStore,
} from 'zustand';

import { createSimpleContext } from './create-context';

type CreateStoreFn<K> = (i: never) => StoreApi<K>;
// prettier-ignore
export type ComponentStateType<T> = T extends { createComponentStore: CreateStoreFn<infer K> }
  ? StoreApi<K>
  : never;

export const createComponentStore = function useCreateComponentStore<
  T,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(initializer: StateCreator<T, [], Mos>): StoreApi<T> {
  const [store] = useState(() => createStore<T, Mos>(initializer));
  return store;
};

export function createComponentState<T>(name: string) {
  const Ctx = createSimpleContext<StoreApi<T>>(name);
  return {
    createComponentStore<Mos extends [StoreMutatorIdentifier, unknown][] = []>(
      initializer: StateCreator<T, [], Mos>,
    ) {
      return createComponentStore<T, Mos>(initializer);
    },
    Provider: Ctx.Provider as Provider<StoreApi<T>>,
    useStore<Value>(selector: (state: T) => Value): Value {
      return useStore(Ctx.useValue(), selector);
    },
  };
}
