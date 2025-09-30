import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { type ScreeningCategory } from '@app-builder/models/screening';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { toggle } from 'radash';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, flatMap, map, pipe, unique } from 'remeda';
import { Button, Checkbox, Input, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const datasetFiltersSchema = z.object({
  tags: z.array(z.string()),
  search: z.string().optional().prefault(''),
});

export type DatasetFiltersForm = z.infer<typeof datasetFiltersSchema>;

export const FieldDatasetFilters = ({
  sections,
  filters,
  setFilters,
}: {
  sections: OpenSanctionsCatalogSection[];
  filters: DatasetFiltersForm;
  setFilters: Dispatch<SetStateAction<DatasetFiltersForm>>;
}) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const [searchValue, setSearchValue] = useState('');

  const tags = useMemo(
    () =>
      pipe(
        sections,
        flatMap((s) => s.datasets),
        map((d) => d.tag),
        filter((t) => t !== ''),
        filter((t) => t !== undefined),
        unique(),
      ),
    [sections],
  );

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue }));
    }, 300);
    return () => clearTimeout(delayInputTimeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative z-0 grow">
        <Input
          className="text-s h-8"
          placeholder={t('scenarios:sanction.lists.search')}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        {searchValue ? (
          <Icon
            icon="cross"
            onClick={() => setSearchValue('')}
            className="text-grey-50 hover:text-grey-00 absolute right-2 top-1.5 size-5 cursor-pointer transition-colors"
          />
        ) : null}
      </div>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="medium">
            <Icon icon="add-circle" className="size-3.5" />
            <span className="text-xs">Type</span>
            {filters.tags.length > 0 ? <div className="bg-grey-80 mx-1 h-3 w-px" /> : null}
            {filters.tags.map((tag) => (
              <DatasetTag key={tag} category={tag as ScreeningCategory} />
            ))}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2 max-h-[400px] max-w-[210px]" align="end">
          <MenuCommand.Combobox className="m-1 mb-0 h-8 p-0" iconClasses="size-4" />
          <MenuCommand.List className="p-1">
            {tags.map((tag) => (
              <MenuCommand.Item
                onSelect={() => setFilters((prev) => ({ ...prev, tags: toggle(prev.tags, tag) }))}
                className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
                key={tag}
                value={tag}
              >
                <Checkbox size="small" checked={filters.tags.includes(tag)} />
                <DatasetTag category={tag as ScreeningCategory} />
              </MenuCommand.Item>
            ))}
            <div className="bg-grey-100 sticky bottom-0 flex w-full gap-2">
              <Button
                variant="secondary"
                size="small"
                className="basis-full"
                onClick={() => setFilters((prev) => ({ ...prev, tags: [] }))}
              >
                <Icon icon="filters-off" className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="small"
                className="basis-full"
                onClick={() => setFilters((prev) => ({ ...prev, tags: tags }))}
              >
                <Icon icon="checked" className="size-3.5" />
              </Button>
            </div>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
