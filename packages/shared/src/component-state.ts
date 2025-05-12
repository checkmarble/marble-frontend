/* eslint-disable @typescript-eslint/no-explicit-any -- Generic are too cumbersome to manage without constraining on any */

import { batch, effect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { type DeepSignal, deepSignal } from 'deepsignal/react';
import type { Provider } from 'react';

import { createSimpleContext } from './simple-context';
import { useRefFn } from './use-ref-fn';

type ComponentStateValue<S, A> = StateApi<S, A>;
type EffectFn = () => void | (() => void);

export type ComponentState<ID extends any[], S, A> = {
  createStore: (...initialData: ID) => ComponentStateValue<S, A>;
  Provider: Provider<ComponentStateValue<S, A>>;
  useStore(): ComponentStateValue<S, A>;
  useStoreValue<Value>(selector: (s: S) => Value): DeepSignal<Value>;
  effect: (fn: EffectFn) => () => void;
};

export type ComponentStateType<T> = T extends ComponentState<any, infer S, infer A>
  ? ComponentStateValue<S, A>
  : never;

type ActionApi<S> = {
  value: S;
  batch: (fn: () => void) => void;
};

type StateFactory<Params extends any[], Ret> = (...args: Params) => Ret;
type StateAction<Params extends any[]> = (...args: Params) => void;
type ActionsConfig<S> = (api: ActionApi<S>) => Record<string, StateAction<any>>;

type Config<F extends StateFactory<any, any>> = {
  name: string;
  factory: F;
};
type ConfigWithActions<
  F extends StateFactory<any, any>,
  A extends ActionsConfig<ReturnType<F>>,
> = Config<F> & {
  actions: A;
};

type InferStateFactoryRet<F> = F extends StateFactory<any, infer R> ? R : never;

type StateFromConfig<C> = C extends Config<infer F> ? InferStateFactoryRet<F> : never;
type ParamsFromConfig<C> = C extends Config<infer F> ? Parameters<F> : never;
type ActionFromConfig<C> = C extends ConfigWithActions<any, infer A> ? A : never;

type StateUpdateFn<S> = (state: S) => void;
export type StateApi<S, A = never> = {
  value: DeepSignal<S>;
  update: (fn: StateUpdateFn<S>) => void;
} & ([A] extends [never]
  ? Record<string, never>
  : { actions: A extends ActionsConfig<S> ? ReturnType<A> : never });

export function withActions<
  F extends StateFactory<any, any>,
  A extends ActionsConfig<ReturnType<F>>,
>(cfg: { config: Config<F>; actions: A }): ConfigWithActions<F, A> {
  return { ...cfg.config, actions: cfg.actions };
}

export function createComponentState<
  F extends StateFactory<any, any>,
  A extends ActionsConfig<ReturnType<F>>,
  C extends Config<F> | ConfigWithActions<F, A>,
>(config: C) {
  type S = StateFromConfig<C>;
  type ID = ParamsFromConfig<C>;
  type InternalA = ActionFromConfig<C>;
  type CtxValue = ComponentStateValue<S, InternalA>;

  const Ctx = createSimpleContext<CtxValue>(config.name);
  const useContextValue = () => {
    useSignals();
    return Ctx.useValue();
  };

  return {
    createStore: function useCreateStore(...initialData: ID): StateApi<S, InternalA> {
      const stateApi = useRefFn<StateApi<S, InternalA>>(() => {
        const value: StateApi<S, never>['value'] = deepSignal<S>(config.factory(...initialData));
        const update: StateApi<S, never>['update'] = (fn) => {
          batch(() => {
            fn(value as S);
          });
        };

        return {
          value,
          update,
          ...('actions' in config
            ? {
                actions: config.actions({ value: value as S, batch }),
              }
            : {}),
        } as StateApi<S, InternalA>;
      });

      return stateApi.current;
    },
    Provider: Ctx.Provider as Provider<CtxValue>,
    useStore: useContextValue,
    useStoreValue<Value>(selector: (state: S) => Value): DeepSignal<Value> {
      return selector(useContextValue().value as S) as DeepSignal<Value>;
    },
    effect,
  };
}
