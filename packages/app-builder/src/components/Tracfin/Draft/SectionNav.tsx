import { useTranslation } from 'react-i18next';
import { cn, Tag } from 'ui-design-system';
import { useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';
import { type TracfinSectionId, tracfinSectionIds } from './model/sections';

type SectionNavProps = {
  section: TracfinSectionId;
  onSectionChange: (section: TracfinSectionId) => void;
};

/** Free navigation between the sections. Each item says how many fields TRACFIN expects and that are still empty. */
export function SectionNav({ section, onSectionChange }: SectionNavProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();

  return (
    <nav aria-label={t('tracfin:draft.nav.label')}>
      <ul className="flex flex-row gap-xs overflow-x-auto lg:flex-col">
        {tracfinSectionIds.map((id) => {
          const missing = editor.missingExpected(id);
          const current = id === section;
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'text-s flex w-full items-center justify-between gap-sm rounded-md px-md py-sm text-start font-medium whitespace-nowrap transition-colors',
                  current
                    ? 'bg-purple-background text-purple-primary'
                    : 'hover:bg-grey-background-light text-grey-primary',
                )}
                onClick={() => onSectionChange(id)}
              >
                <span>{t(`tracfin:draft.sections.${id}`)}</span>
                {missing > 0 ? (
                  <Tag
                    size="xs"
                    color="orange"
                    aria-label={t('tracfin:draft.nav.missing', { count: missing })}
                    title={t('tracfin:draft.nav.missing', { count: missing })}
                  >
                    {missing}
                  </Tag>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
