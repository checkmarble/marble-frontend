import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { PanelContainer, PanelContent, PanelHeader, PanelRoot } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tag } from 'ui-design-system';

interface TableRecordPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
}

export function TableRecordPreviewDrawer({ open, onOpenChange, tableName }: TableRecordPreviewDrawerProps) {
  const { t } = useTranslation(['data', 'common']);
  const [objectId, setObjectId] = useState('');
  const [searchedObjectId, setSearchedObjectId] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setObjectId('');
    setSearchedObjectId(null);
  }, [open]);

  const trimmedObjectId = useMemo(() => objectId.trim(), [objectId]);

  const query = useObjectDetailsQuery(tableName, searchedObjectId!);

  const isLoading = query.isFetching;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedObjectId) return;
    setSearchedObjectId(trimmedObjectId);
  };

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="4xl" className="z-50 p-0">
        <PanelHeader className="border-b border-grey-border px-v2-lg py-v2-md">
          {t('data:viewer.view_ingested_data')}
        </PanelHeader>
        <PanelContent className="flex flex-col gap-v2-lg px-v2-lg py-v2-lg">
          <div className="flex items-center gap-v2-sm">
            <Tag color="grey">{tableName}</Tag>
          </div>

          <form className="flex items-end gap-v2-sm" onSubmit={handleSubmit}>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor={`objectIdField-${tableName}`} className="text-s">
                {t('data:viewer.object_id')}
              </label>
              <Input
                id={`objectIdField-${tableName}`}
                name="objectId"
                type="text"
                value={objectId}
                onChange={(event) => setObjectId(event.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" disabled={!trimmedObjectId || isLoading} className="h-10">
              {t('common:search')}
            </Button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-32 items-center justify-center">
                <Spinner className="size-5" />
              </div>
            ) : searchedObjectId && query.data !== undefined ? (
              query.data ? (
                <div className="rounded-md border border-grey-border bg-grey-background-light p-4">
                  <DataFields table={tableName} object={query.data} options={{ showHeader: true }} />
                </div>
              ) : (
                <div className="rounded-sm border border-grey-border bg-surface-card p-4 text-center">
                  {t('data:viewer.no_object_found', { tableName, objectId: searchedObjectId })}
                </div>
              )
            ) : null}
          </div>
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}
