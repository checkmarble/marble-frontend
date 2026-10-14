import { Spinner } from '@app-builder/components/Spinner';
import { useChromeSummarizer } from '@app-builder/hooks/useChromeSummarizer';
import { useSummaryLanguage } from '@app-builder/hooks/useSummaryLanguage';
import { isLexisTopic, isOpenSanctionTopic, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { useEntityAISummaryQuery } from '@app-builder/queries/screening/entity-ai-summary';
import { buildEntitySummaryInput } from '@app-builder/utils/screening/entity-summary-input';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';

interface EntityAISummaryProps {
  // Enriched entity, undefined until the card has been opened once
  entity: ScreeningMatchPayload | undefined;
  className?: string;
}

export function EntityAISummary({ entity, className }: EntityAISummaryProps) {
  const { languages, language, setLanguage } = useSummaryLanguage();

  if (!entity || !languages?.length || !language) return null;

  return (
    <div className={className}>
      <EntityAISummaryCard entity={entity} languages={languages} language={language} setLanguage={setLanguage} />
    </div>
  );
}

function EntityAISummaryCard({
  entity,
  languages,
  language,
  setLanguage,
}: {
  entity: ScreeningMatchPayload;
  languages: string[];
  language: string;
  setLanguage: (language: string) => void;
}) {
  const { t, i18n } = useTranslation(screeningsI18n);
  const { state, download, abort } = useChromeSummarizer(language);

  // The summarizer input is always written in English, whatever the UI language
  const input = useMemo(() => {
    const tTopics = i18n.getFixedT('en', 'screeningTopics');
    return buildEntitySummaryInput(entity, (topic) => {
      if (isOpenSanctionTopic(topic)) return tTopics(`os.${topic}`, { defaultValue: topic });
      if (isLexisTopic(topic)) return tTopics(`lexis.${topic}`, { defaultValue: topic });
      return topic;
    });
  }, [entity, i18n]);

  const summary = useEntityAISummaryQuery({
    entityId: entity.id,
    language,
    input,
    summarizer: state.status === 'ready' ? state.summarizer : undefined,
  });

  if (state.status === 'unavailable') return null;

  return (
    <Card color="purple" className="text-s flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        <Icon icon="ai-stars" className="text-purple-primary size-5 shrink-0" aria-hidden />
        <span className="font-semibold">{t('screenings:match.ai_summary.title')}</span>
        {languages.length > 1 ? (
          <SummaryLanguageSelect languages={languages} value={language} onChange={setLanguage} className="ms-auto" />
        ) : null}
      </div>

      {match(state)
        .with({ status: 'checking' }, () => <Spinner className="size-5" />)
        .with({ status: 'downloadable' }, ({ resume, failed }) => (
          <div className="flex flex-wrap items-center gap-sm">
            <span className={cn('flex-1', failed ? 'text-red-primary' : 'text-grey-secondary')}>
              {failed
                ? t('screenings:match.ai_summary.download_error')
                : t('screenings:match.ai_summary.download_description')}
            </span>
            <Button variant="primary" size="small" onClick={download}>
              {resume ? t('screenings:match.ai_summary.resume_download') : t('screenings:match.ai_summary.download')}
            </Button>
          </div>
        ))
        .with({ status: 'downloading' }, ({ progress }) => (
          <div className="flex items-center gap-sm">
            <div className="flex flex-1 flex-col gap-xs">
              <span className="text-grey-secondary">
                {t('screenings:match.ai_summary.downloading', { percent: Math.round(progress * 100) })}
              </span>
              <div className="bg-purple-background h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-purple-primary h-full rounded-full transition-[width]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
            <Button variant="secondary" size="small" onClick={abort}>
              {t('screenings:match.ai_summary.abort')}
            </Button>
          </div>
        ))
        .with({ status: 'ready' }, () => {
          if (summary.isError) {
            return (
              <div className="flex flex-wrap items-center gap-sm">
                <span className="text-red-primary flex-1">{t('screenings:match.ai_summary.error')}</span>
                <Button variant="secondary" size="small" onClick={() => summary.refetch()}>
                  {t('screenings:match.ai_summary.retry')}
                </Button>
              </div>
            );
          }
          if (summary.data) return <p className="whitespace-pre-wrap">{summary.data}</p>;
          return (
            <div className="text-grey-secondary flex items-center gap-sm">
              <Spinner className="size-4" />
              {t('screenings:match.ai_summary.generating')}
            </div>
          );
        })
        .exhaustive()}
    </Card>
  );
}

function SummaryLanguageSelect({
  languages,
  value,
  onChange,
  className,
}: {
  languages: string[];
  value: string;
  onChange: (language: string) => void;
  className?: string;
}) {
  const { t, i18n } = useTranslation(screeningsI18n);
  const [open, setOpen] = useState(false);
  const displayNames = useMemo(() => new Intl.DisplayNames([i18n.language], { type: 'language' }), [i18n.language]);
  const getLabel = (language: string) => {
    const name = displayNames.of(language) ?? language;
    return name.charAt(0).toLocaleUpperCase(i18n.language) + name.slice(1);
  };

  return (
    <div className={className}>
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton size="small" aria-label={t('screenings:match.ai_summary.language')}>
            {getLabel(value)}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="end">
          <MenuCommand.List>
            {languages.map((language) => (
              <MenuCommand.Item
                key={language}
                value={language}
                onSelect={() => {
                  onChange(language);
                  setOpen(false);
                }}
              >
                {getLabel(language)}
                {language === value ? <Icon icon="tick" className="text-purple-primary size-5" /> : null}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
