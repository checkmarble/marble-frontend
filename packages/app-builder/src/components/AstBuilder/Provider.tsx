import { findDataModelTableByName } from '@app-builder/models';
import { useBuilderOptionsQuery } from '@app-builder/queries/builder-options';
import { type BuilderOptionsResource } from '@app-builder/server-fns/scenarios';
import { type ReactNode, type RefObject, useEffect } from 'react';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';

export type AstBuilderMode = 'edit' | 'view';

export const AstBuilderDataSharpFactory = createSharpFactory({
  name: 'AstBuilderData',
  initializer(init: {
    scenarioId?: string;
    data: BuilderOptionsResource;
    mode: AstBuilderMode;
    showValues: boolean;
    onValueSwitchOpenChange?: (open: boolean) => void;
  }) {
    return { ...init };
  },
}).withComputed({
  triggerObjectTable(state) {
    return findDataModelTableByName({
      dataModel: state.data.dataModel,
      tableName: state.data.triggerObjectType,
    });
  },
});

type AstBuilderDataProviderProps = {
  scenarioId: string;
  children: ReactNode;
  nodeRef?: RefObject<InferSharpApi<typeof AstBuilderDataSharpFactory> | null>;
  renderError?: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  initialData?: BuilderOptionsResource;
  mode?: AstBuilderMode;
  showValues?: boolean;
  onValueSwitchOpenChange?: (open: boolean) => void;
};

type AstBuilderInternalProviderProps = {
  scenarioId?: string;
  data: BuilderOptionsResource;
  mode: AstBuilderMode;
  showValues: boolean;
  onValueSwitchOpenChange?: (open: boolean) => void;
  children: ReactNode;
};
function AstBuilderInternalProvider(props: AstBuilderInternalProviderProps) {
  const store = AstBuilderDataSharpFactory.createSharp({
    scenarioId: props.scenarioId,
    data: props.data,
    mode: props.mode,
    showValues: props.showValues,
    onValueSwitchOpenChange: props.onValueSwitchOpenChange,
  });

  useEffect(() => {
    store.value.showValues = props.showValues;
  }, [store, props.showValues]);

  // Sync data when it changes (e.g., after navigation options are created)
  useEffect(() => {
    store.value.data = props.data;
  }, [store, props.data]);

  useEffect(() => {
    store.value.onValueSwitchOpenChange = props.onValueSwitchOpenChange;
  }, [store, props.onValueSwitchOpenChange]);

  return <AstBuilderDataSharpFactory.Provider value={store}>{props.children}</AstBuilderDataSharpFactory.Provider>;
}

type AstBuilderStaticProviderProps = {
  data: BuilderOptionsResource;
  children: ReactNode;
  mode?: AstBuilderMode;
  showValues?: boolean;
};

export function AstBuilderStaticProvider(props: AstBuilderStaticProviderProps) {
  return (
    <AstBuilderInternalProvider
      scenarioId={undefined}
      data={props.data}
      mode={props.mode ?? 'edit'}
      showValues={props.showValues ?? false}
    >
      {props.children}
    </AstBuilderInternalProvider>
  );
}

export function AstBuilderProvider(props: AstBuilderDataProviderProps) {
  const builderOptionsQuery = useBuilderOptionsQuery(props);

  if (builderOptionsQuery.isLoading || builderOptionsQuery.isPending) {
    return props.renderLoading ? props.renderLoading() : 'Loading...';
  }
  if (builderOptionsQuery.isError) {
    return props.renderError ? props.renderError(builderOptionsQuery.error) : 'Error...';
  }

  return (
    <AstBuilderInternalProvider
      mode={props.mode ?? 'view'}
      scenarioId={props.scenarioId}
      data={builderOptionsQuery.data}
      showValues={props.showValues ?? false}
      onValueSwitchOpenChange={props.onValueSwitchOpenChange}
    >
      {props.children}
    </AstBuilderInternalProvider>
  );
}
