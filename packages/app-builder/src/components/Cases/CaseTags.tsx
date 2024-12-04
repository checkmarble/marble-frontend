import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { type Tag } from 'marble-api';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Tooltip } from 'ui-design-system';

import { FormSelectWithCombobox } from '../Form/FormSelectWithCombobox';
import { casesI18n } from './cases-i18n';

export function CaseTags({ caseTagIds }: { caseTagIds: string[] }) {
  const { t } = useTranslation(casesI18n);
  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-1">
          {caseTagIds.map((caseTagId) => (
            <CaseTag key={caseTagId} tagId={caseTagId} />
          ))}
        </div>
      }
    >
      <div className="flex w-fit flex-wrap items-center gap-1">
        {caseTagIds.slice(0, 3).map((caseTagId) => (
          <CaseTag key={caseTagId} tagId={caseTagId} />
        ))}
        {caseTagIds.length > 3 ? (
          <div className="text-grey-100 bg-grey-05 flex h-6 items-center rounded-s px-2 text-xs font-normal">
            {t('cases:case_detail.other_tags_count', {
              count: caseTagIds.length - 3,
            })}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

export function CaseTag({ tagId }: { tagId: string }) {
  const { getTagById } = useOrganizationTags();
  const { t } = useTranslation(casesI18n);

  const tag = getTagById(tagId);

  return (
    <div
      className="bg-grey-05 flex h-6 items-center rounded px-2"
      style={{ backgroundColor: tag?.color }}
    >
      <span className="text-grey-100 line-clamp-1 text-xs font-normal">
        {tag?.name || t('cases:case_detail.unknown_tag')}
      </span>
    </div>
  );
}

export function FormSelectCaseTags({
  selectedTagIds,
  orgTags,
  onOpenChange,
}: {
  selectedTagIds: string[];
  orgTags: Tag[];
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation(['cases']);
  const [value, setSearchValue] = React.useState('');
  const searchValue = React.useDeferredValue(value);

  const matches = React.useMemo(
    () => matchSorter(orgTags, searchValue, { keys: ['name'] }),
    [orgTags, searchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedTagIds}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onOpenChange={onOpenChange}
    >
      <FormSelectWithCombobox.Select className="w-full">
        <CaseTags caseTagIds={selectedTagIds} />
        <FormSelectWithCombobox.Arrow />
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((tag) => (
            <FormSelectWithCombobox.ComboboxItem key={tag.id} value={tag.id}>
              <CaseTag tagId={tag.id} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 flex items-center justify-center p-2">
              {t('cases:case_detail.tags.empty_matches')}
            </p>
          ) : null}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
}
