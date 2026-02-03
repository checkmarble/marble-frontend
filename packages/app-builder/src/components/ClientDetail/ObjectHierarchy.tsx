import { useHierarchyQuery } from '@app-builder/queries/data/get-hierarchy';
import { HierarchyNode } from '@app-builder/routes/ressources+/data+/get-hierarchy.$objectType.$objectId';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Spinner } from '../Spinner';

type ObjectHierarchyProps = {
  objectType: string;
  objectId: string;
};

export const ObjectHierarchy = ({ objectType, objectId }: ObjectHierarchyProps) => {
  const { t } = useTranslation(['common']);
  const hierarchyQuery = useHierarchyQuery(objectType, objectId);
  const [selectedParent, _setSelectedParent] = useState<HierarchyNode | null>(null);

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

      return (
        <div className="grid grid-cols-[60px_60px_1fr]">
          <div
            className={cn('col-span-full border border-purple-border-light rounded-md p-v2-sm', {
              'bg-purple-background-light': !currentParent,
            })}
          >
            {currentParent ? currentParent.objectId : hierarchy.objectId}
          </div>
          {currentParent ? (
            <div className="grid grid-cols-subgrid col-span-full group/tree-line h-12">
              <TreeSeparator className="last-child" />
              <div className="col-span-2 bg-purple-background-light border border-purple-border-light rounded-md p-v2-sm h-10 mt-v2-sm">
                {hierarchy.objectId}
              </div>
            </div>
          ) : null}
          {hierarchy.children.map((child, idx) => {
            return (
              <div key={`child_${child.objectType}`} className="grid grid-cols-subgrid col-span-full">
                {currentParent ? (
                  currentParent.children.length > 0 ? (
                    <TreeSeparator className="parent" />
                  ) : (
                    <div />
                  )
                ) : null}
                <TreeSeparator className={cn({ 'last-child': idx === hierarchy.children.length - 1 })} />
                <div
                  className={cn('border border-purple-border-light rounded-md p-v2-sm h-10 my-v2-sm', {
                    'col-span-1': !!currentParent,
                    'col-span-2': !currentParent,
                  })}
                >
                  {child.objectType}
                </div>
              </div>
            );
          })}
        </div>
      );
    })
    .exhaustive();
};

const TreeSeparator = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('w-[60px] h-[56px] text-purple-border-light group/separator', className)} viewBox="0 0 60 56">
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
