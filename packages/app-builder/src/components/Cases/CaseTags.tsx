import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { type CaseTag } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export function CaseTags({ caseTags }: { caseTags: CaseTag[] }) {
  const { t } = useTranslation(casesI18n);
  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-1">
          {caseTags.map((caseTag) => (
            <CaseTag key={caseTag.id} caseTag={caseTag} />
          ))}
        </div>
      }
    >
      <div className="flex w-fit flex-wrap items-center gap-1">
        {caseTags.slice(0, 3).map((caseTag) => (
          <CaseTag key={caseTag.id} caseTag={caseTag} />
        ))}
        {caseTags.length > 3 ? (
          <div className="text-grey-100 bg-grey-05 flex h-6 items-center rounded-s px-2 text-xs font-normal">
            {t('cases:case_detail.other_tags_count', {
              count: caseTags.length - 3,
            })}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

function CaseTag({ caseTag }: { caseTag: CaseTag }) {
  const { getTagById } = useOrganizationTags();
  const { t } = useTranslation(casesI18n);

  const tag = getTagById(caseTag.tag_id);

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
