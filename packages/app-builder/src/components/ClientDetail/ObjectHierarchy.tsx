import { DataModelWithTableOptions } from '@app-builder/models';
import { useHierarchyQuery } from '@app-builder/queries/data/get-hierarchy';
import {
  HierarchyLeaf,
  HierarchyNode,
  HierarchyTreeBase,
} from '@app-builder/routes/ressources+/data+/get-hierarchy.$objectType.$objectId';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { UseQueryResult } from '@tanstack/react-query';
import { Client360Table } from 'marble-api/generated/marblecore-api';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DataModelExplorerContext } from '../DataModelExplorer/Provider';
import { Spinner } from '../Spinner';

type ObjectHierarchyProps = {
  showAll?: boolean;
  objectType: string;
  objectId: string;
  metadata: Client360Table;
  allMetadata: Client360Table[];
  dataModelQuery: UseQueryResult<{ dataModel: DataModelWithTableOptions }>;
  handleExplore: (parent: HierarchyNode, child: HierarchyLeaf) => void;
};

export const ObjectHierarchy = ({
  showAll = false,
  objectType,
  objectId,
  metadata,
  allMetadata,
  handleExplore: handleExploreProps,
  dataModelQuery,
}: ObjectHierarchyProps) => {
  const { t } = useTranslation(['common']);
  const hierarchyQuery = useHierarchyQuery(objectType, objectId, showAll);
  const [selectedParent, _setSelectedParent] = useState<HierarchyNode | null>(null);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  const handleExplore = (parent: HierarchyNode, child: HierarchyLeaf) => {
    if (!dataModelQuery.isSuccess) return;
    const navigationOption = dataModelQuery.data.dataModel
      .find((table) => table.name === parent.objectType)
      ?.navigationOptions?.find((option) => option.targetTableName === child.objectType);
    if (!navigationOption) return;
    dataModelExplorerContext.startNavigation({
      pivotObject: {
        isIngested: true,
        pivotValue: parent.data['object_id'] as string,
        pivotObjectName: parent.objectType,
      },
      sourceObject: parent.data,
      sourceTableName: navigationOption.sourceTableName,
      sourceFieldName: navigationOption.sourceFieldName,
      targetTableName: navigationOption.targetTableName,
      filterFieldName: navigationOption.filterFieldName,
      orderingFieldName: navigationOption.orderingFieldName,
    });
    handleExploreProps(parent, child);
  };

  return match(hierarchyQuery)
    .with({ isPending: true }, () => (
      <div className="h-20 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="h-20 flex items-center justify-center">
        <span className="text-center">{t('common:generic_fetch_data_error')}</span>
      </div>
    ))
    .with({ isSuccess: true }, ({ data: { hierarchy } = { hierarchy: null } }) => {
      if (!hierarchy) {
        return null;
      }

      const currentParent = selectedParent ?? hierarchy.parents[0];
      const currentParentMetadata = currentParent
        ? (allMetadata.find((m) => m.name === currentParent.objectType) ?? null)
        : null;

      return currentParent ? (
        <TreeWithParent
          parent={currentParent}
          parentMetadata={currentParentMetadata}
          tree={hierarchy}
          metadata={metadata}
          allMetadata={allMetadata}
          handleExplore={handleExplore}
        />
      ) : (
        <TreeWithoutParent
          tree={hierarchy}
          metadata={metadata}
          allMetadata={allMetadata}
          handleExplore={handleExplore}
        />
      );
    })
    .exhaustive();
};

const TreeSeparator = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('w-[60px] h-[56px] text-purple-border-light dark:text-purple-border group/separator', className)}
      viewBox="0 0 60 56"
    >
      <path d="M29.5 0 L29.5 28 Z" strokeWidth="1.5" stroke="currentColor" />
      <path
        d="M29.5 28 L29.5 56 Z"
        strokeWidth="1.5"
        stroke="currentColor"
        className="group-[.last-child]/separator:hidden"
      />
      <path d="M29 29 L60 29 Z" strokeWidth="1.5" stroke="currentColor" className="group-[.parent]/separator:hidden" />
    </svg>
  );
};

type TreeProps = {
  tree: HierarchyTreeBase;
  metadata: Client360Table;
  allMetadata: Client360Table[];
  handleExplore: (parent: HierarchyNode, child: HierarchyLeaf) => void;
};

type TreeWithParentProps = TreeProps & {
  parent: HierarchyNode;
  parentMetadata: Client360Table | null;
  handleExplore: (parent: HierarchyNode, child: HierarchyLeaf) => void;
};

const TreeWithParent = ({
  parent,
  parentMetadata,
  tree,
  metadata,
  allMetadata,
  handleExplore,
}: TreeWithParentProps) => {
  return (
    <div className="grid grid-cols-[60px_60px_1fr]">
      <TreeItem item={parent} metadata={parentMetadata} className="col-span-full" />
      <div className="grid grid-cols-subgrid col-span-full group/tree-line h-12">
        <TreeSeparator className={cn({ 'last-child': parent.children.length === 0 })} />
        <TreeItem
          hideAction
          item={tree}
          metadata={metadata}
          className="col-span-2 bg-purple-background-light my-v2-sm dark:bg-purple-primary/10"
        />
      </div>
      {tree.children.map((child, idx) => {
        return (
          <div key={`child_${child.objectType}`} className="grid grid-cols-subgrid col-span-full">
            {parent.children.length > 0 ? <TreeSeparator className="parent" /> : <div />}
            <TreeSeparator className={cn({ 'last-child': idx === tree.children.length - 1 })} />
            <TreeItem
              item={child}
              metadata={allMetadata.find((m) => m.name === child.objectType) ?? null}
              className="my-v2-sm"
              handleExplore={() => handleExplore(tree, child)}
            />
          </div>
        );
      })}
      {parent.children.map((child, idx) => {
        return (
          <div key={`parent_child_${child.objectType}`} className="grid grid-cols-subgrid col-span-full">
            <TreeSeparator className={cn({ 'last-child': idx === parent.children.length - 1 })} />
            <TreeItem
              item={child}
              metadata={allMetadata.find((m) => m.name === child.objectType) ?? null}
              className="my-v2-sm col-span-2"
              handleExplore={() => handleExplore(parent, child)}
            />
          </div>
        );
      })}
    </div>
  );
};

const TreeWithoutParent = ({ tree, metadata, allMetadata, handleExplore }: TreeProps) => {
  return (
    <div className="grid grid-cols-[60px_1fr]">
      <TreeItem
        hideAction
        item={tree}
        metadata={metadata}
        className="col-span-full bg-purple-background-light dark:bg-purple-primary/10"
      />
      {tree.children.map((child, idx) => {
        return (
          <div key={`child_${child.objectType}`} className="grid grid-cols-subgrid col-span-full">
            <TreeSeparator className={cn({ 'last-child': idx === tree.children.length - 1 })} />
            <TreeItem
              item={child}
              metadata={allMetadata.find((m) => m.name === child.objectType) ?? null}
              className="my-v2-sm"
              handleExplore={() => handleExplore(tree, child)}
            />
          </div>
        );
      })}
    </div>
  );
};

const isHierarchyLeaf = (item: HierarchyLeaf | HierarchyNode): item is HierarchyLeaf => {
  return Array.isArray(item.data);
};

const TreeItem = ({
  item,
  metadata,
  className,
  hideAction = false,
  handleExplore,
}: {
  item: HierarchyLeaf | HierarchyNode;
  metadata: Client360Table | null;
  className?: string;
  hideAction?: boolean;
  handleExplore?: () => void;
}) => {
  return (
    <div
      className={cn(
        'border border-purple-border-light rounded-md p-v2-sm h-10 flex items-center justify-between gap-v2-md',
        'dark:border-purple-border',
        className,
      )}
    >
      <TreeItemLabel item={item} metadata={metadata} />
      {!hideAction ? (
        <>
          {isHierarchyLeaf(item) ? (
            <TreeItemData item={item} metadata={metadata} handleExplore={handleExplore} />
          ) : null}
          {!isHierarchyLeaf(item) && metadata ? (
            <Link to={getRoute('/client-detail/:objectType/:objectId', item)}>
              <Icon icon="arrow-up-right" className="size-5" />
            </Link>
          ) : null}
          {!isHierarchyLeaf(item) && !metadata ? <IngestedObjectPopover /> : null}
        </>
      ) : null}
    </div>
  );
};

const TreeItemData = ({
  item,
  metadata,
  handleExplore,
}: {
  item: HierarchyLeaf;
  metadata: Client360Table | null;
  handleExplore?: () => void;
}) => {
  const splicedItems = item.data.slice(0, 3);

  if (!metadata) {
    return (
      <button type="button" onClick={() => handleExplore?.()} className="cursor-pointer">
        <Icon icon="eye" className="size-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-v2-sm truncate">
      <div className="truncate">
        {splicedItems.map((itemObject, idx) => (
          <Fragment key={itemObject['object_id'] as string}>
            <Link
              to={getRoute('/client-detail/:objectType/:objectId', {
                objectType: item.objectType,
                objectId: itemObject['object_id'] as string,
              })}
              className="text-purple-primary hover:underline"
            >
              {itemObject[metadata.caption_field] as string}
            </Link>
            {idx < item.data.length - 1 ? <span>, </span> : ''}
          </Fragment>
        ))}
      </div>
      {item.data.length > 1 ? (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className="cursor-pointer shrink-0">
              <Icon icon="plus" className="size-5" />
            </button>
          </Popover.Trigger>
          <Popover.Content side="top" align="end">
            <div className="flex flex-col gap-v2-sm min-w-[300px] max-h-[400px] p-v2-md">
              {item.data.map((itemObject) => {
                return (
                  <Link
                    key={itemObject['object_id'] as string}
                    to={getRoute('/client-detail/:objectType/:objectId', {
                      objectType: item.objectType,
                      objectId: itemObject['object_id'] as string,
                    })}
                    className="flex items-center justify-between h-6 hover:text-purple-primary"
                  >
                    <span>{itemObject[metadata.caption_field] as string}</span>
                    <Icon icon="arrow-up-right" className="size-4" />
                  </Link>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Root>
      ) : null}
    </div>
  );
};

const TreeItemLabel = ({
  item,
  metadata,
}: {
  item: HierarchyLeaf | HierarchyNode;
  metadata: Client360Table | null;
}) => {
  return metadata && !Array.isArray(item.data) ? (
    <div className="flex items-center gap-10 shrink-0">
      <span>{metadata.alias ?? metadata.name}</span>
      <span>{item.data[metadata.caption_field] as string}</span>
    </div>
  ) : (
    <span className="shrink-0">Related {item.objectType}</span>
  );
};

const IngestedObjectPopover = () => {
  return null;
};
