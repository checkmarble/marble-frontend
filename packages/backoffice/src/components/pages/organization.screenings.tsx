import { getOrganizationClientObjectQueryOptions, getOrganizationDataModelQueryOptions } from '@bo/data/organization';
import { useRunMotivaMatchMutationOptions } from '@bo/data/screenings';
import type { MotivaMatchResponse, MotivaMatchResult, MotivaProperties, MotivaQuery } from '@bo/schemas/screenings';
import {
  CLIENT_OBJECT_FORBIDDEN_ERROR,
  CLIENT_OBJECT_NOT_FOUND_ERROR,
  SCREENING_PROVIDERS,
} from '@bo/schemas/screenings';
import {
  buildMotivaComparisons,
  humanizeFtmProperty,
  type MotivaComparison,
  type MotivaPropertyEntry,
} from '@bo/utils/motiva-comparison';
import { SCREENING_PROVIDER_LABELS, type ScreeningProvider } from '@bo/utils/motiva-provider';
import { buildMotivaQuery, createMotivaQueryId } from '@bo/utils/motiva-query';
import { type UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { DataModelObjectDto, TableDto } from 'marble-api';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, cn, Input, Modal, SelectV2, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

type OrganizationScreeningsPageProps = {
  orgId: string;
  search: {
    provider?: ScreeningProvider;
    table?: string;
    objectId?: string;
  };
};

export function OrganizationScreeningsPage({ orgId, search }: OrganizationScreeningsPageProps) {
  const navigate = useNavigate();
  const dataModelQuery = useQuery(getOrganizationDataModelQueryOptions(orgId));
  const submittedProvider = search.provider ?? 'opensanctions';
  const [provider, setProvider] = useState<ScreeningProvider>(submittedProvider);
  const [tableName, setTableName] = useState(search.table ?? '');
  const [objectId, setObjectId] = useState(search.objectId ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [screeningAttempt, setScreeningAttempt] = useState(0);

  useEffect(() => {
    setProvider(submittedProvider);
    setTableName(search.table ?? '');
    setObjectId(search.objectId ?? '');
  }, [search.objectId, search.table, submittedProvider]);

  const tables = useMemo(
    () => Object.values(dataModelQuery.data?.tables ?? {}).sort((left, right) => left.name.localeCompare(right.name)),
    [dataModelQuery.data],
  );
  const submittedTable = search.table ? tables.find((table) => table.name === search.table) : undefined;
  const shouldLookup = Boolean(search.objectId && submittedTable);

  const objectQuery = useQuery({
    ...getOrganizationClientObjectQueryOptions({
      orgId,
      tableName: search.table ?? '',
      objectId: search.objectId ?? '',
    }),
    enabled: shouldLookup,
  });

  const submitLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedObjectId = objectId.trim();
    if (!tableName) {
      setFormError('Select a table');
      return;
    }
    if (!tables.some((table) => table.name === tableName)) {
      setFormError('Select a table from this organization');
      return;
    }
    if (!trimmedObjectId) {
      setFormError('Enter an object ID');
      return;
    }

    setFormError(null);
    if (submittedProvider === provider && search.table === tableName && search.objectId === trimmedObjectId) {
      await objectQuery.refetch();
      setScreeningAttempt((attempt) => attempt + 1);
      return;
    }

    void navigate({
      to: '.',
      search: { provider, table: tableName, objectId: trimmedObjectId },
    });
  };

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col gap-xs">
        <Typo variant="title2">Screenings</Typo>
        <p className="text-grey-secondary text-s">
          Retrieve an ingested client object before screening it with an external provider.
        </p>
      </div>

      <section className="flex flex-col gap-md rounded-lg border border-grey-border bg-surface-card p-lg">
        <div className="flex flex-col gap-xs">
          <Typo variant="subtitle1">Client object</Typo>
          <p className="text-grey-secondary text-s">Choose the source table and enter the object's exact identifier.</p>
        </div>

        {dataModelQuery.isPending ? (
          <div className="text-grey-secondary flex min-h-24 items-center justify-center text-s" aria-live="polite">
            Loading data-model tables…
          </div>
        ) : dataModelQuery.isError ? (
          <InlineError
            message="Something went wrong while fetching the organization data model."
            onRetry={() => void dataModelQuery.refetch()}
          />
        ) : tables.length === 0 ? (
          <div className="rounded-md border border-grey-border bg-surface-page p-md text-s text-grey-secondary">
            This organization has no data-model tables to search.
          </div>
        ) : (
          <form
            className="grid grid-cols-1 items-end gap-md md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto]"
            onSubmit={submitLookup}
          >
            <div className="flex min-w-0 flex-col gap-xs">
              <label className="text-s font-medium">Provider</label>
              <SelectV2<ScreeningProvider>
                aria-label="Provider"
                placeholder="Select a provider"
                value={provider}
                onChange={(value) => {
                  setProvider(value);
                  setFormError(null);
                }}
                options={SCREENING_PROVIDERS.map((value) => ({ value, label: SCREENING_PROVIDER_LABELS[value] }))}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-xs">
              <label className="text-s font-medium">Table</label>
              <SelectV2<string>
                aria-label="Table"
                placeholder="Select a table"
                value={tableName}
                onChange={(value) => {
                  setTableName(value);
                  setFormError(null);
                }}
                options={tables.map((table) => ({ value: table.name, label: table.name }))}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-xs">
              <label htmlFor="screening-object-id" className="text-s font-medium">
                Object ID
              </label>
              <Input
                id="screening-object-id"
                name="objectId"
                value={objectId}
                placeholder="Enter the exact object ID"
                onChange={(event) => {
                  setObjectId(event.target.value);
                  setFormError(null);
                }}
              />
            </div>

            <Button type="submit" variant="primary" size="medium" disabled={objectQuery.isFetching}>
              {objectQuery.isFetching ? 'Screening…' : 'Screen object'}
            </Button>

            {formError ? (
              <p className="text-red-47 text-s md:col-span-full" role="alert">
                {formError}
              </p>
            ) : null}
          </form>
        )}
      </section>

      {dataModelQuery.isSuccess && search.table && !submittedTable ? (
        <InlineError message={`Table “${search.table}” does not exist in this organization's data model.`} />
      ) : null}

      {shouldLookup && submittedTable && search.objectId ? (
        <ObjectResult
          provider={submittedProvider}
          table={submittedTable}
          objectId={search.objectId}
          query={objectQuery}
          screeningAttempt={screeningAttempt}
        />
      ) : null}
    </div>
  );
}

function ObjectResult({
  provider,
  table,
  objectId,
  query,
  screeningAttempt,
}: {
  provider: ScreeningProvider;
  table: TableDto;
  objectId: string;
  query: UseQueryResult<DataModelObjectDto, Error>;
  screeningAttempt: number;
}) {
  if (query.isPending) {
    return (
      <section className="flex min-h-40 items-center justify-center rounded-lg border border-grey-border bg-surface-card p-lg">
        <span className="text-grey-secondary text-s" aria-live="polite">
          Fetching client object…
        </span>
      </section>
    );
  }

  if (query.isError) {
    const errorMessage = query.error instanceof Error ? query.error.message : undefined;
    if (errorMessage === CLIENT_OBJECT_NOT_FOUND_ERROR) {
      return <InlineError message={`No object “${objectId}” was found in table “${table.name}”.`} />;
    }
    if (errorMessage === CLIENT_OBJECT_FORBIDDEN_ERROR) {
      return <InlineError message="You do not have permission to retrieve this organization's client objects." />;
    }
    return (
      <InlineError
        message="Something went wrong while fetching the client object."
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <ObjectPayloads
      key={`${provider}:${table.name}:${objectId}`}
      provider={provider}
      table={table}
      objectId={objectId}
      object={query.data}
      screeningAttempt={screeningAttempt}
    />
  );
}

function ObjectPayloads({
  provider,
  table,
  objectId,
  object,
  screeningAttempt,
}: {
  provider: ScreeningProvider;
  table: TableDto;
  objectId: string;
  object: DataModelObjectDto;
  screeningAttempt: number;
}) {
  const [manualAttempt, setManualAttempt] = useState(0);
  const motivaQuery = useMemo(
    () => buildMotivaQuery(table, object, `${createMotivaQueryId()}-${screeningAttempt}-${manualAttempt}`),
    [manualAttempt, object, screeningAttempt, table],
  );
  const matchMutation = useMutation(useRunMotivaMatchMutationOptions(provider));
  const lastAutomaticQuery = useRef<MotivaQuery | null>(null);
  const automaticQuery =
    motivaQuery.success && Object.keys(motivaQuery.query.queries[motivaQuery.queryId]?.properties ?? {}).length > 0
      ? motivaQuery.query
      : null;
  const runMotivaMatch = matchMutation.mutate;

  useEffect(() => {
    if (!automaticQuery || lastAutomaticQuery.current === automaticQuery) return;

    lastAutomaticQuery.current = automaticQuery;
    runMotivaMatch(automaticQuery);
  }, [automaticQuery, runMotivaMatch]);

  if (!motivaQuery.success) {
    return (
      <InlineError message={`Table “${table.name}” has no FTM entity. Configure one before creating a Motiva query.`} />
    );
  }

  const submittedQuery = motivaQuery.query.queries[motivaQuery.queryId];
  if (!submittedQuery) return <InlineError message="The Motiva query could not be prepared." />;

  const inputDetails = [
    { title: 'Retrieved client object', copyLabel: 'client object', value: object },
    { title: 'Motiva query', copyLabel: 'Motiva query', value: motivaQuery.query },
  ];

  if (Object.keys(submittedQuery.properties).length === 0) {
    return (
      <div className="flex flex-col gap-md">
        <div className="flex justify-end">
          <JsonDetailsDialog label="View input details" title="Screening input details" values={inputDetails} />
        </div>
        <InlineError message="The retrieved object has no values mapped to FTM properties." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <section className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-grey-border bg-surface-card p-md">
        <div className="flex min-w-0 items-center gap-sm">
          {matchMutation.isPending || (!matchMutation.data && !matchMutation.isError) ? (
            <Icon icon="spinner" className="size-5 shrink-0 animate-spin text-purple-primary" />
          ) : matchMutation.isError ? (
            <Icon icon="error" className="size-5 shrink-0 text-red-primary" />
          ) : (
            <Icon icon="tick" className="size-5 shrink-0 text-green-primary" />
          )}
          <div className="flex min-w-0 flex-col gap-xs">
            <Typo variant="subtitle2">
              {matchMutation.isPending
                ? 'Screening with Motiva…'
                : matchMutation.isError
                  ? 'Motiva screening failed'
                  : matchMutation.data
                    ? 'Motiva screening complete'
                    : 'Preparing Motiva screening…'}
            </Typo>
            <span className="truncate text-xs text-grey-secondary">
              {SCREENING_PROVIDER_LABELS[provider]} · {table.name} / {objectId} · {submittedQuery.schema}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <JsonDetailsDialog label="View input details" title="Screening input details" values={inputDetails} />
          <Button
            variant="secondary"
            size="small"
            disabled={matchMutation.isPending || !matchMutation.data}
            onClick={() => setManualAttempt((attempt) => attempt + 1)}
          >
            {matchMutation.isPending ? 'Screening…' : 'Run again'}
          </Button>
        </div>
      </section>

      {matchMutation.isError ? (
        <InlineError
          message="Motiva could not complete the screening."
          detail={matchMutation.error.message}
          onRetry={() => setManualAttempt((attempt) => attempt + 1)}
        />
      ) : null}

      {matchMutation.data ? (
        <MotivaResults response={matchMutation.data} query={motivaQuery.query} queryId={motivaQuery.queryId} />
      ) : null}
    </div>
  );
}

function MotivaResults({
  response,
  query,
  queryId,
}: {
  response: MotivaMatchResponse;
  query: MotivaQuery;
  queryId: string;
}) {
  const queryResponse = response.responses[queryId] ?? Object.values(response.responses)[0];
  const submittedProperties = query.queries[queryId]?.properties ?? {};

  if (!queryResponse) return <InlineError message="Motiva returned no response for the submitted query." />;
  if (queryResponse.status !== 200) {
    return <InlineError message={`Motiva returned query status ${queryResponse.status}.`} />;
  }

  const totalPrefix = queryResponse.total.relation === 'eq' ? '' : 'At least ';
  const totalLabel = `${totalPrefix}${queryResponse.total.value} potential ${queryResponse.total.value === 1 ? 'match' : 'matches'}`;

  if (queryResponse.results.length === 0) {
    return (
      <section className="border-green-border bg-green-background-light text-green-primary flex items-center gap-md rounded-lg border p-lg">
        <Icon icon="tick" className="size-6 shrink-0" />
        <div className="flex flex-col gap-xs">
          <Typo variant="subtitle1">No potential matches</Typo>
          <p className="text-s">Motiva searched the query successfully and returned no candidates.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <Typo variant="title2">Screening results</Typo>
          <p className="text-grey-secondary text-s">
            {totalLabel}; showing {queryResponse.results.length} of up to {response.limit}.
          </p>
        </div>
        <Tag color="red" size="small">
          Review required
        </Tag>
      </div>

      <div className="grid grid-cols-1 gap-md xl:grid-cols-2">
        {queryResponse.results.map((result) => (
          <MotivaResultCard key={result.id} result={result} submittedProperties={submittedProperties} />
        ))}
      </div>
    </section>
  );
}

const asPercentage = (value: number) => `${Math.round(value * 100)}%`;

const motivaDateFormatter = new Intl.DateTimeFormat('en', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatMotivaDate = (value: string) => {
  const parsed = new Date(value.endsWith('Z') ? value : `${value}Z`);
  return Number.isNaN(parsed.getTime()) ? value : motivaDateFormatter.format(parsed);
};

function MotivaResultCard({
  result,
  submittedProperties,
}: {
  result: MotivaMatchResult;
  submittedProperties: MotivaProperties;
}) {
  const score = Math.max(0, Math.min(1, result.score));
  const comparisons = buildMotivaComparisons(submittedProperties, result.properties, result.explanations);

  return (
    <article className="flex flex-col gap-lg rounded-lg border border-grey-border bg-surface-card p-lg">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-md">
        <div className="flex min-w-0 flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <Typo variant="subtitle1">{result.caption}</Typo>
            <Tag color="grey" size="small" appearance="monospace">
              {result.id}
            </Tag>
            <Tag color="grey" size="small">
              {result.schema}
            </Tag>
            {result.target ? (
              <Tag color="red" size="small">
                Target
              </Tag>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-xs">
            {result.datasets.map((dataset) => (
              <Tag key={dataset} color="grey" size="xs" appearance="monospace">
                {dataset}
              </Tag>
            ))}
          </div>
        </div>

        <div className="flex min-w-32 shrink-0 flex-col items-end gap-xs">
          <span className="text-red-primary text-xl font-semibold tabular-nums">{asPercentage(score)}</span>
          <span className="text-grey-secondary text-xs">match score</span>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-grey-background"
            role="progressbar"
            aria-label={`Match score ${asPercentage(score)}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(score * 100)}
          >
            <div className="h-full rounded-full bg-red-primary" style={{ width: asPercentage(score) }} />
          </div>
        </div>
      </div>

      <ComparisonTable comparisons={comparisons} />

      <div className="flex flex-wrap items-center justify-between gap-md border-t border-grey-border pt-md">
        <div className="text-grey-secondary flex flex-wrap gap-x-lg gap-y-xs text-xs">
          {result.first_seen ? <span>First seen: {formatMotivaDate(result.first_seen)}</span> : null}
          {result.last_seen ? <span>Last seen: {formatMotivaDate(result.last_seen)}</span> : null}
          {result.last_change ? <span>Last changed: {formatMotivaDate(result.last_change)}</span> : null}
          <span>
            {result.referents.length} source {result.referents.length === 1 ? 'record' : 'records'}
          </span>
        </div>
        <JsonDetailsDialog
          label="View full result"
          title={`${result.caption} — screening result`}
          values={[{ title: 'Motiva result', copyLabel: 'screening result', value: result }]}
        />
      </div>
    </article>
  );
}

function ComparisonTable({ comparisons }: { comparisons: MotivaComparison[] }) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)_minmax(0,1fr)] gap-md px-md text-xs font-medium uppercase tracking-wide text-grey-secondary lg:grid">
        <span className="text-right">Submitted attributes</span>
        <span className="text-center">Compared as</span>
        <span>Candidate attributes</span>
      </div>
      {comparisons.map((comparison) => (
        <div
          key={comparison.key}
          className="grid grid-cols-1 gap-md rounded-md border border-grey-border bg-surface-page p-md lg:grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)_minmax(0,1fr)]"
        >
          <ComparisonSide label="Submitted attributes" entries={comparison.submitted} alignRight />
          <div className="flex flex-col items-center justify-center gap-sm border-y border-grey-border py-md lg:border-x lg:border-y-0 lg:px-md lg:py-0">
            <div className="flex items-center gap-sm">
              <Icon icon="arrow-right" className="hidden size-4 text-grey-secondary lg:block" />
              <span className="text-s font-medium">{comparison.label}</span>
              <Icon icon="arrow-right" className="hidden size-4 text-grey-secondary lg:block" />
            </div>
            {comparison.explanations.map(([name, explanation]) => {
              const explanationScore = explanation.weighted ?? explanation.score;
              return (
                <div key={name} className="flex max-w-full flex-col items-center gap-xs text-center">
                  <div className="flex max-w-full items-center gap-xs">
                    <span className="truncate text-xs text-grey-secondary" title={humanizeFtmProperty(name)}>
                      {humanizeFtmProperty(name)}
                    </span>
                    {explanationScore !== undefined ? (
                      <Tag color={explanationScore < 0 ? 'red' : 'orange'} size="xs">
                        {asPercentage(explanationScore)}
                      </Tag>
                    ) : null}
                  </div>
                  {explanation.detail ? (
                    <span className="max-w-full break-words font-mono text-2xs text-grey-secondary">
                      {explanation.detail}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <ComparisonSide
            label="Candidate attributes"
            entries={comparison.candidate}
            emptyLabel="No comparable value"
          />
        </div>
      ))}
    </div>
  );
}

function ComparisonSide({
  label,
  entries,
  emptyLabel,
  alignRight = false,
}: {
  label: string;
  entries: MotivaPropertyEntry[];
  emptyLabel?: string;
  alignRight?: boolean;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-sm', alignRight && 'lg:items-end lg:text-right')}>
      <span className="text-xs font-medium uppercase tracking-wide text-grey-secondary lg:hidden">{label}</span>
      {entries.length > 0 ? (
        <PropertyEntries entries={entries} alignRight={alignRight} />
      ) : (
        <span className="text-s italic text-grey-secondary">{emptyLabel}</span>
      )}
    </div>
  );
}

function PropertyEntries({ entries, alignRight }: { entries: MotivaPropertyEntry[]; alignRight: boolean }) {
  return (
    <dl className={cn('flex min-w-0 flex-col gap-sm', alignRight && 'lg:items-end')}>
      {entries.map(({ property, values }) => (
        <div key={property} className={cn('flex min-w-0 flex-col gap-xs', alignRight && 'lg:items-end')}>
          <dt className="text-xs text-grey-secondary">{humanizeFtmProperty(property)}</dt>
          <dd className={cn('flex min-w-0 flex-wrap gap-xs', alignRight && 'lg:justify-end')}>
            {values.map((value, index) => (
              <span
                key={`${value}:${index}`}
                className="max-w-full break-words rounded-sm border border-grey-border bg-surface-card px-sm py-xs text-s text-grey-primary"
              >
                {value}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type JsonDialogValue = {
  title: string;
  copyLabel: string;
  value: unknown;
};

function JsonDetailsDialog({ label, title, values }: { label: string; title: string; values: JsonDialogValue[] }) {
  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="small">
          <Icon icon="eye" className="size-4" />
          {label}
        </Button>
      </Modal.Trigger>
      <Modal.Content size="xlarge">
        <Modal.Title>{title}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          {values.map((item) => (
            <JsonBlock key={item.title} {...item} />
          ))}
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label="Close" />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function JsonBlock({ title, copyLabel, value }: JsonDialogValue) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(value, null, 2);

  useEffect(() => {
    setCopied(false);
  }, [json]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Could not copy the ${copyLabel}`);
    }
  };

  return (
    <section className="flex min-w-0 flex-col gap-md">
      <div className="flex items-start justify-between gap-md">
        <Typo variant="subtitle1">{title}</Typo>
        <Button variant="secondary" size="small" onClick={copyJson} aria-label={`Copy ${copyLabel} JSON`}>
          <Icon icon={copied ? 'tick' : 'copy'} className="size-4" />
          {copied ? 'Copied' : 'Copy JSON'}
        </Button>
      </div>
      <pre className="max-h-[36rem] overflow-auto rounded-md border border-grey-border bg-surface-page p-md font-mono text-xs text-grey-primary">
        {json}
      </pre>
    </section>
  );
}

function InlineError({ message, detail, onRetry }: { message: string; detail?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-md rounded-md border border-red-87 bg-red-95 p-md text-red-47">
      <div className="flex min-w-0 items-start gap-sm">
        <Icon icon="error" className="size-5 shrink-0" />
        <div className="flex min-w-0 flex-col gap-xs">
          <p className="text-s">{message}</p>
          {detail ? <pre className="whitespace-pre-wrap break-words font-mono text-xs">{detail}</pre> : null}
        </div>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="small" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
