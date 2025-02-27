import { type DataModel } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { useBuilderOptionsQuery } from '@app-builder/queries/builder-options';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { type ReactNode, type RefObject } from 'react';
import { createSharpFactory, type InferSharpApi } from 'sharpstate';

export type AstBuilderDataStoreObject = {
  triggerObjectType: string;
  customLists: CustomList[];
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  // validate: (astNode: AstNode, expectedReturnType?: ReturnValueType) => Promise<NodeEvaluation>;
};

export const AstBuilderDataSharpFactory = createSharpFactory({
  name: 'AstBuilderData',
  initializer(data: BuilderOptionsResource) {
    return { data };
  },
});

type AstBuilderDataProviderProps = {
  scenarioId: string;
  children: ReactNode;
  nodeRef?: RefObject<InferSharpApi<typeof AstBuilderDataSharpFactory>>;
  renderError?: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  initialData?: BuilderOptionsResource;
};

type AstBuilderInternalProviderProps = {
  data: BuilderOptionsResource;
  children: ReactNode;
};
function AstBuilderInternalProvider(props: AstBuilderInternalProviderProps) {
  const store = AstBuilderDataSharpFactory.createSharp(props.data);
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
    <AstBuilderInternalProvider data={builderOptionsQuery.data}>
      {props.children}
    </AstBuilderInternalProvider>
  );
}
