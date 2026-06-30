import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setObjectId('');
      setSearchedObjectId(null);
      return;
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [open, inputRef]);

  const trimmedObjectId = useMemo(() => objectId.trim(), [objectId]);

  const query = useObjectDetailsQuery(tableName, searchedObjectId!);

  const isLoading = query.isFetching;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedObjectId) return;
    setSearchedObjectId(trimmedObjectId);
  };

  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container size="medium" className="z-50 p-0">
        <Panel.Content>
          <Panel.Header>{t('data:viewer.view_ingested_data')}</Panel.Header>

          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-sm">
              <Tag color="grey">{tableName}</Tag>
            </div>

            <form className="flex items-end gap-sm" onSubmit={handleSubmit}>
              <div className="flex flex-1 flex-col gap-xs">
                <label htmlFor={`objectIdField-${tableName}`} className="text-s">
                  {t('data:viewer.object_id')}
                </label>
                <Input
                  ref={inputRef}
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
                  <div className="rounded-md border border-grey-border bg-grey-background-light p-md">
                    <DataFields table={tableName} object={query.data} options={{ showHeader: true }} />
                  </div>
                ) : (
                  <div className="rounded-sm border border-grey-border bg-surface-card p-md text-center">
                    {t('data:viewer.no_object_found', { tableName, objectId: searchedObjectId })}
                  </div>
                )
              ) : null}
            </div>
          </div>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}
