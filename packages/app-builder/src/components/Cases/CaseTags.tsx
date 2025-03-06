import { type Tag } from 'marble-api';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox, Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export function CaseTags({ caseTagIds, orgTags }: { caseTagIds: string[]; orgTags: Tag[] }) {
  const { t } = useTranslation(casesI18n);

  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-1">
          {caseTagIds.map((caseTagId) => (
            <CaseTag key={caseTagId} tag={orgTags.find((t) => t.id === caseTagId)} />
          ))}
        </div>
      }
    >
      <div className="flex w-fit flex-wrap items-center gap-1">
        {caseTagIds.slice(0, 3).map((caseTagId) => (
          <CaseTag key={caseTagId} tag={orgTags.find((t) => t.id === caseTagId)} />
        ))}
        {caseTagIds.length > 3 ? (
          <div className="text-grey-00 bg-grey-95 flex h-6 items-center rounded-s px-2 text-xs font-normal">
            {t('cases:case_detail.other_tags_count', {
              count: caseTagIds.length - 3,
            })}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

export function CaseTag({ tag }: { tag?: Tag }) {
  const { t } = useTranslation(casesI18n);

  return (
    <div
      className="bg-grey-95 flex h-6 items-center rounded px-2"
      style={{ backgroundColor: tag?.color }}
    >
      <span className="text-grey-00 line-clamp-1 text-xs font-normal">
        {tag?.name || t('cases:case_detail.unknown_tag')}
      </span>
    </div>
  );
}

export function SelectCaseTags({
  name,
  orgTags,
  selectedTagIds,
  onChange,
}: {
  name?: string;
  orgTags: Tag[];
  selectedTagIds: string[];
  onChange?: (value: string[]) => void;
}) {
  const { t } = useTranslation(['cases']);
  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(
    () => matchSorter(orgTags, deferredSearchValue, { keys: ['name'] }),
    [orgTags, deferredSearchValue],
  );

  return (
    <SelectWithCombobox.Root
      selectedValue={selectedTagIds}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSelectedValueChange={onChange}
    >
      <SelectWithCombobox.Select name={name} className="w-full">
        <CaseTags caseTagIds={selectedTagIds} orgTags={orgTags} />
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <SelectWithCombobox.Combobox render={<Input className="shrink-0" />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList>
          {matches.map((tag) => (
            <SelectWithCombobox.ComboboxItem key={tag.id} value={tag.id}>
              <CaseTag tag={tag} />
            </SelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 flex items-center justify-center p-2">
              {t('cases:case_detail.tags.empty_matches')}
            </p>
          ) : null}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}
