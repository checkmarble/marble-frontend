import { TranslationObject } from '@app-builder/types/i18n';
import { type Tag } from 'marble-api';
import { Tooltip } from 'ui-design-system';

export function CaseTags({
  caseTagIds,
  orgTags,
  translationObject,
}: {
  caseTagIds: string[];
  orgTags: Tag[];
  translationObject: TranslationObject<['cases']>;
}) {
  const { tCases } = translationObject;

  return (
    <Tooltip.Default
      content={
        <div className="flex max-w-sm flex-wrap gap-1">
          {caseTagIds.map((caseTagId) => (
            <CaseTag
              key={caseTagId}
              tag={orgTags.find((t) => t.id === caseTagId)}
              translationObject={translationObject}
            />
          ))}
        </div>
      }
    >
      <div className="flex w-fit flex-wrap items-center gap-1">
        {caseTagIds.slice(0, 3).map((caseTagId) => (
          <CaseTag
            key={caseTagId}
            tag={orgTags.find((t) => t.id === caseTagId)}
            translationObject={translationObject}
          />
        ))}
        {caseTagIds.length > 3 ? (
          <div className="text-grey-00 bg-grey-95 flex h-6 items-center rounded-s px-2 text-xs font-normal">
            {tCases('case_detail.other_tags_count', {
              count: caseTagIds.length - 3,
            })}
          </div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}

export function CaseTag({
  tag,
  translationObject,
}: {
  tag?: Tag;
  translationObject: TranslationObject<['cases']>;
}) {
  const { tCases } = translationObject;

  return (
    <div
      className="bg-grey-95 flex h-6 items-center rounded px-2"
      style={{ backgroundColor: tag?.color }}
    >
      <span className="text-grey-00 line-clamp-1 text-xs font-normal">
        {tag?.name || tCases('case_detail.unknown_tag')}
      </span>
    </div>
  );
}
