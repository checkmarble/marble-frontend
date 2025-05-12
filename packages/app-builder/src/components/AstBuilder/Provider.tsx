import { findDataModelTableByName } from '@app-builder/models';
import { useBuilderOptionsQuery } from '@app-builder/queries/builder-options';
import type { BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { type ReactNode, type RefObject, useEffect } from 'react';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';

export type AstBuilderMode = 'edit' | 'view';

export const AstBuilderDataSharpFactory = createSharpFactory({
  name: 'AstBuilderData',
  initializer(init: {
    scenarioId: string;
    data: BuilderOptionsResource;
    mode: AstBuilderMode;
    showValues: boolean;
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
  nodeRef?: RefObject<InferSharpApi<typeof AstBuilderDataSharpFactory>>;
  renderError?: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  initialData?: BuilderOptionsResource;
  mode?: AstBuilderMode;
  showValues?: boolean;
};

type AstBuilderInternalProviderProps = {
  scenarioId: string;
  data: BuilderOptionsResource;
  mode: AstBuilderMode;
  showValues: boolean;
  children: ReactNode;
};
function AstBuilderInternalProvider(props: AstBuilderInternalProviderProps) {
  const store = AstBuilderDataSharpFactory.createSharp({
    scenarioId: props.scenarioId,
    data: props.data,
    mode: props.mode,
    showValues: props.showValues,
  });

  useEffect(() => {
    store.value.showValues = props.showValues;
  }, [store, props.showValues]);

  return (
    <AstBuilderDataSharpFactory.Provider value={store}>
      {props.children}
    </AstBuilderDataSharpFactory.Provider>
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
    >
      {props.children}
    </AstBuilderInternalProvider>
  );
}
