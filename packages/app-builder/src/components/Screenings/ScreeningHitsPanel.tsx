import { scenarioI18n } from '@app-builder/components';
import { Callout } from '@app-builder/components/Callout';
import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  isScreeningReviewCompleted,
  type Screening,
  type ScreeningMatchPayload,
  type ScreeningQuery,
  type ScreeningStatus,
} from '@app-builder/models/screening';
import {
  useInvalidateScreeningDetail,
  useScreeningDetailQuery,
} from '@app-builder/queries/screening/get-screening-detail';
import { type action as refineAction } from '@app-builder/routes/ressources+/screenings+/refine';
import { refineSearchSchema, type action as searchAction } from '@app-builder/routes/ressources+/screenings+/search';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import clsx from 'clsx';
import { serialize as objectToFormData } from 'object-to-formdata';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type z } from 'zod/v4';
import { PanelContainer, PanelContent, PanelRoot } from '../Panel/Panel';
import { Spinner } from '../Spinner';
import { MatchCard } from './MatchCard';
import { MatchResult } from './MatchResult';
import { EntitySelect, setAdditionalFields } from './RefineSearchModal';
import { ScreeningStatusTag } from './ScreeningStatusTag';
import { screeningsI18n } from './screenings-i18n';

interface ScreeningHitsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId: string;
  screeningId: string;
  screeningName: string;
  screeningStatus: ScreeningStatus;
}

export function ScreeningHitsPanel({
  open,
  onOpenChange,
  decisionId,
  screeningId: initialScreeningId,
  screeningName,
  screeningStatus,
}: ScreeningHitsPanelProps) {
  const { t } = useTranslation(screeningsI18n);
  const [currentScreeningId, setCurrentScreeningId] = useState(initialScreeningId);
  const invalidateScreeningDetail = useInvalidateScreeningDetail();

  const screeningQuery = useScreeningDetailQuery(decisionId, currentScreeningId, open);

  const revalidate = useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
  }, [invalidateScreeningDetail, decisionId, currentScreeningId]);

  const handleRefineSuccess = useCallback(
    (newScreeningId: string) => {
      setCurrentScreeningId(newScreeningId);
      invalidateScreeningDetail(decisionId, newScreeningId);
    },
    [invalidateScreeningDetail, decisionId],
  );

  const currentStatus = screeningQuery.data?.status ?? screeningStatus;
  // @TODO: Uncomment this when the matches to review count is implemented
  // const matchesToReviewCount = screeningQuery.data
  //   ? filter(screeningQuery.data.matches, (m) => m.status === 'pending').length
  //   : 0;

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="max" className="!max-w-[80vw]">
        {/* Header: X | Name + Status Badge | Action button */}
        <div className="flex items-center gap-4 pb-v2-lg">
          <Icon
            icon="cross"
            className="size-6 shrink-0 cursor-pointer text-grey-secondary hover:text-grey-primary"
            onClick={() => onOpenChange(false)}
            aria-label="Close panel"
          />
          <div className="flex flex-1 items-center gap-1">
            <h2 className="text-xl font-semibold text-grey-primary tracking-[-0.8px]">{screeningName}</h2>
            <ScreeningStatusTag status={currentStatus} />
          </div>
          {/* @TODO: Uncomment this when the matches to review count is implemented */}
          {/* {currentStatus === 'in_review' && matchesToReviewCount > 0 ? (
            <Button variant="secondary" size="small" className="shrink-0">
              <Icon icon="wand" className="size-4" />
              {t('screenings:panel.dismiss_false_positives')}
            </Button>
          ) : null} */}
        </div>

        {/* Body */}
        <PanelContent>
          {match(screeningQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center p-8">
                <Spinner />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-grey-secondary p-8 text-center text-s">{t('common:global_error')}</div>
            ))
            .otherwise((query) => {
              const screening = query.data;
              if (!screening) return null;

              return (
                <LoaderRevalidatorContext.Provider value={revalidate}>
                  <div className="flex h-full items-start">
                    {/* Left: Match cards */}
                    <PanelMatchList screening={screening} />

                    {/* Right: Search details sidebar */}
                    <PanelSearchDetails screening={screening} onRefineSuccess={handleRefineSuccess} />
                  </div>
                </LoaderRevalidatorContext.Provider>
              );
            })}
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}

function PanelMatchList({ screening }: { screening: Screening }) {
  const { t } = useTranslation(screeningsI18n);
  const matchesToReviewCount = filter(screening.matches, (m) => m.status === 'pending').length;

  return (
    <div className="flex flex-1 flex-col gap-2 pr-4">
      <span className="text-m font-medium">{t('screenings:potential_matches')}</span>
      <span className="text-s opacity-50">
        {t('screenings:callout.needs_review', {
          toReview: matchesToReviewCount,
          totalMatches: screening.matches.length,
        })}
      </span>
      <div className="flex flex-col gap-2 mt-2">
        {screening.matches.map((screeningMatch) => (
          <MatchCard key={screeningMatch.id} match={screeningMatch} defaultOpen={screening.matches.length === 1} />
        ))}
      </div>
    </div>
  );
}

function SearchDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start text-s">
      <span className="w-[133px] shrink-0 opacity-50">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function QueryProperties({ query }: { query: ScreeningQuery }) {
  const { t } = useTranslation(scenarioI18n);

  const entityTypeLabel = match(query.schema)
    .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
    .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
    .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
    .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
    .otherwise(() => query.schema);

  return (
    <>
      {Object.entries(query.properties).map(([key, values]) => (
        <SearchDetailRow key={key} label={key}>
          <span>{values.join(', ')}</span>
        </SearchDetailRow>
      ))}
      <SearchDetailRow label={t('screenings:search_entity_type')}>
        <span className="inline-flex items-center rounded-full border border-grey-border bg-white px-2 py-0.5 text-xs text-grey-secondary">
          {entityTypeLabel}
        </span>
      </SearchDetailRow>
    </>
  );
}

function PanelSearchDetails({
  screening,
  onRefineSuccess,
}: {
  screening: Screening;
  onRefineSuccess: (screeningId: string) => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const [isRefining, setIsRefining] = useState(false);
  const isRefinable = !isScreeningReviewCompleted(screening);

  const request = screening.request;
  const queries = request ? Object.values(request.queries) : [];

  if (isRefining) {
    return (
      <InlineRefineSearch
        screening={screening}
        onBack={() => setIsRefining(false)}
        onRefineSuccess={(newId) => {
          setIsRefining(false);
          onRefineSuccess(newId);
        }}
      />
    );
  }

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-4 border-l border-grey-border pl-4">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      {request ? (
        <div className="bg-grey-background-light border border-grey-border flex flex-col rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <span className="text-s font-medium">{t('screenings:panel.search_label')}</span>

            {/* Query properties */}
            <div className="flex flex-col gap-2">
              {queries.map((query, idx) => (
                <QueryProperties key={idx} query={query} />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-grey-border my-2" />

          {/* Config: threshold */}
          <div className="flex flex-col gap-2">
            <SearchDetailRow label={t('screenings:match_threshold')}>
              <span>{`> ${request.threshold}%`}</span>
            </SearchDetailRow>
          </div>
        </div>
      ) : null}

      {isRefinable ? (
        <Button
          variant="primary"
          appearance="stroked"
          size="small"
          className="w-fit"
          onClick={() => setIsRefining(true)}
        >
          {t('screenings:refine_search')}
        </Button>
      ) : null}
    </div>
  );
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="flex w-full items-center gap-2" onClick={onToggle}>
      <span className="shrink-0 text-[10px] text-grey-secondary">{label}</span>
      <div className="h-px flex-1 bg-grey-border" />
      <Icon
        icon="caret-down"
        className={clsx('size-4 shrink-0 text-grey-secondary transition-transform', open && 'rotate-180')}
      />
    </button>
  );
}

function InlineRefineSearch({
  screening,
  onBack: _onBack,
  onRefineSuccess: _onRefineSuccess,
}: {
  screening: Screening;
  onBack: () => void;
  onRefineSuccess: (screeningId: string) => void;
}) {
  const { t } = useTranslation(screeningsI18n);
  const searchFetcher = useFetcher<typeof searchAction>();
  const refineFetcher = useFetcher<typeof refineAction>();
  const formDataRef = useRef<FormData | null>(null);
  const onBack = useCallbackRef(_onBack);
  const onRefineSuccess = useCallbackRef(_onRefineSuccess);

  const [mainFieldsOpen, setMainFieldsOpen] = useState(true);
  const [additionalFieldsOpen, setAdditionalFieldsOpen] = useState(true);

  const form = useForm({
    defaultValues: {
      screeningId: screening.id,
      fields: {},
    } as z.infer<typeof refineSearchSchema>,
    validators: {
      onChange: refineSearchSchema,
    },
    onSubmit: ({ value }) => {
      formDataRef.current = objectToFormData(value, {
        dotsForObjectNotation: true,
      });

      searchFetcher.submit(formDataRef.current, {
        method: 'POST',
        action: getRoute('/ressources/screenings/search'),
      });
    },
  });

  const [searchResults, setSearchResults] = useState<ScreeningMatchPayload[] | null>(null);
  useEffect(() => {
    if (searchFetcher.data?.success) {
      setSearchResults(searchFetcher.data.data);
    }
  }, [searchFetcher.data]);
  useEffect(() => {
    if (refineFetcher.data?.success) {
      onRefineSuccess(refineFetcher.data.data.id);
    }
  }, [refineFetcher.data, onRefineSuccess]);

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];

  const onSearchEntityChange = ({ value }: { value: SearchableSchema }) => {
    if (value) {
      form.setFieldValue('fields', setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields));
    }
  };

  const searchInputs = screening.request
    ? Object.values(screening.request.queries).flatMap((query) => Object.values(query.properties).flat())
    : [];

  const handleBackToForm = () => {
    setSearchResults(null);
  };

  const handleRefine = () => {
    if (formDataRef.current) {
      refineFetcher.submit(formDataRef.current, {
        method: 'POST',
        action: getRoute('/ressources/screenings/refine'),
      });
    }
  };

  return (
    <div className="sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-4 border-l border-grey-border pl-4">
      <span className="text-m font-medium">{t('screenings:panel.search_details')}</span>

      <div className="flex flex-col gap-4 rounded-lg border border-purple-primary bg-purple-background-light p-4">
        <span className="text-s font-medium">{t('screenings:refine_inline.edit_search_label')}</span>

        {searchResults ? (
          /* Results view */
          <div className="flex flex-col gap-3">
            {searchResults.length > 0 ? (
              <>
                <span className="text-s text-grey-secondary">{t('screenings:refine_modal.result_label')}</span>
                <div className="flex flex-col gap-2">
                  {searchResults.map((matchEntity) => (
                    <MatchResult key={matchEntity.id} entity={matchEntity} />
                  ))}
                </div>
                <Callout bordered>{t('screenings:refine_modal.refine_callout')}</Callout>
              </>
            ) : (
              <>
                <span className="text-s">{t('screenings:refine_modal.no_match_label')}</span>
                <Callout bordered>
                  <div className="flex flex-col items-start gap-2">
                    <Trans
                      t={t}
                      i18nKey="screenings:refine_modal.no_match_callout"
                      components={{
                        Status: <ScreeningStatusTag status="no_hit" />,
                      }}
                    />
                  </div>
                </Callout>
              </>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" appearance="stroked" size="small" onClick={handleBackToForm}>
                {t('screenings:refine_inline.back_to_form')}
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleRefine}
                disabled={searchResults.length > (screening.request?.limit ?? Infinity)}
              >
                {t('screenings:refine_inline.apply')}
              </Button>
            </div>
          </div>
        ) : (
          /* Form view */
          <searchFetcher.Form onSubmit={handleSubmit(form)} className="contents">
            <div className="flex flex-col gap-4">
              {/* Main fields section */}
              <div className="flex flex-col gap-2">
                <SectionHeader
                  label={t('screenings:refine_inline.main_fields')}
                  open={mainFieldsOpen}
                  onToggle={() => setMainFieldsOpen((v) => !v)}
                />
                {mainFieldsOpen ? (
                  <>
                    {searchInputs.length > 0 ? (
                      <div className="flex h-[33px] items-center overflow-clip rounded border border-purple-border-light bg-white p-2">
                        <span className="truncate text-s font-medium">{searchInputs.join(' ')}</span>
                      </div>
                    ) : null}
                    <form.Field name="entityType" listeners={{ onChange: onSearchEntityChange }}>
                      {(field) => (
                        <EntitySelect name={field.name} value={field.state.value} onChange={field.handleChange} />
                      )}
                    </form.Field>
                  </>
                ) : null}
              </div>

              {/* Additional fields section */}
              {additionalFields.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <SectionHeader
                    label={t('screenings:refine_inline.additional_fields')}
                    open={additionalFieldsOpen}
                    onToggle={() => setAdditionalFieldsOpen((v) => !v)}
                  />
                  {additionalFieldsOpen
                    ? additionalFields.map((field) => (
                        <form.Field key={field} name={`fields.${field}`}>
                          {(formField) => (
                            <Input
                              name={formField.name}
                              placeholder={t(`screenings:entity.property.${field}`)}
                              value={formField.state.value as string}
                              onChange={(e) => formField.handleChange(e.target.value)}
                              className="border-purple-border-light"
                            />
                          )}
                        </form.Field>
                      ))
                    : null}
                </div>
              ) : null}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" appearance="stroked" size="small" onClick={onBack}>
                {t('screenings:refine_inline.back')}
              </Button>
              <form.Subscribe selector={(state) => [state.isPristine, state.canSubmit, state.isSubmitting]}>
                {([isPristine, canSubmit, isSubmitting]) => (
                  <Button type="submit" size="small" disabled={isPristine || !canSubmit} variant="primary">
                    {isSubmitting ? '...' : t('screenings:refine_inline.search')}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </searchFetcher.Form>
        )}
      </div>
    </div>
  );
}
