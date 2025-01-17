import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { personEntityProperties, type PersonProperty, type SanctionCheckMatch } from '@app-builder/utils/faker/case-sanction';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Avatar, Button, CollapsibleV2, ModalV2, Tag, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { StatusRadioGroup } from './StatusRadioGroup';
import { StatusTag } from './StatusTag';

export const handle = {
  i18n: ['common', 'navigation', 'data', ...casesI18n] satisfies Namespace,
};

type TransformerContext = {
  language: string;
  formatLanguage: string;
};

const transformUrl = (s: string) => <ExternalLink href={s}>{s}</ExternalLink>;
const transformCountry = (c: string, { language }: TransformerContext) => {
  return <span>{new Intl.DisplayNames([language], { type: 'region' }).of(c) ?? c}</span>;
};
const transformDate = (d: string, { formatLanguage }: TransformerContext) => {
  return <time dateTime={d}>{formatDateTime(d, { language: formatLanguage, timeStyle: undefined })}</time>;
};
const transformDateTime = (d: string, { formatLanguage }: TransformerContext) => {
  return <time dateTime={d}>{formatDateTime(d, { language: formatLanguage })}</time>;
};

const transformers: Record<string, (value: string, ctx: TransformerContext) => React.ReactElement> = {
  website: transformUrl,
  sourceUrl: transformUrl,
  country: transformCountry,
  birthCountry: transformCountry,
  birthDate: transformDate,
  modifiedAt: transformDateTime,
} satisfies Partial<Record<PersonProperty, (value: string, ctx: TransformerContext) => React.ReactElement>>;

const transformValue = (field: string, value: string, ctx: TransformerContext) => {
  return transformers[field]?.(value, ctx) ?? <span>{value}</span>;
};

type SanctionCheckMatchSheetProps = {
  match: SanctionCheckMatch;
};

export const SanctionCheckMatchSheet = ({ match }: SanctionCheckMatchSheetProps) => {
  const { t, i18n } = useTranslation(handle.i18n);
  const language = useFormatLanguage();

  const entity = match.payload;
  const [displayAll, setDisplayAll] = React.useState<Partial<Record<(typeof personEntityProperties)[number], boolean>>>({});
  const [isInReview, setIsInReview] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState(match.status);
  const fetcher = useFetcher();

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      setIsInReview(false);
    }
  }, [fetcher]);

  const displayProperties = R.difference(personEntityProperties, ['topics'] as const);
  const entityPropertyList = displayProperties.map((property) => {
    const items = entity.properties[property];
    const itemsToDisplay = displayAll[property] ? items : items.slice(0, 5);
    return {
      property,
      values: itemsToDisplay,
      restItemsCount: Math.max(0, items.length - itemsToDisplay.length),
    };
  });

  const handleShowMore = (prop: string) => {
    setDisplayAll((prev) => ({ ...prev, [prop]: true }));
  };

  const handleMatchReview = () => {
    setIsInReview(true);
  };

  return (
    <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-6 gap-y-2">
      <CollapsibleV2.Provider>
        <div className="bg-grey-98 col-span-full grid grid-cols-subgrid rounded-md">
          <div className="col-span-full grid grid-cols-subgrid items-center px-4 py-3">
            <CollapsibleV2.Title className="focus-visible:text-purple-65 group rounded outline-none transition-colors">
              <Icon
                icon="smallarrow-up"
                aria-hidden
                className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180 rtl:-rotate-90 rtl:group-aria-expanded:-rotate-180 rtl:group-data-[initial]:-rotate-180"
              />
            </CollapsibleV2.Title>
            <div className="text-s flex gap-2">
              <span className="font-semibold">{entity.caption}</span>
              <span>{entity.schema}</span>
            </div>
            <div className="inline-flex h-8">
              <StatusTag status={match.status} disabled={match.status !== 'pending'} onClick={handleMatchReview} />
              {/* <Tag
                color={statusTagColors[match.status]}
                border="square"
                onClick={() => {
                  console.log('click on tag');
                }}
                className="inline-flex cursor-pointer gap-1"
              >
                {t(`cases:sanctions.match.status.${match.status}`)}
                <Icon icon="caret-down" className="size-5" />
              </Tag> */}
            </div>
          </div>

          <CollapsibleV2.Content className="col-span-full">
            <div className="text-s flex flex-col gap-6 p-4">
              {match.comments.map((comment) => {
                return (
                  <div key={comment.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <Avatar size="xs" firstName="R" lastName="G" />
                      <span className="flex items-baseline gap-1">
                        Roger Grand
                        <time className="text-grey-50 text-xs" dateTime={comment.createdAt}>
                          {formatDateTime(comment.createdAt, { language })}
                        </time>
                      </span>
                    </div>
                    <p>{comment.comment}</p>
                  </div>
                );
              })}
              {/* {entityTopic ? (
                <div className="bg-grey-95 border-grey-90 border px-3 py-2">
                  {t(`cases:sanctions.callout.${entityTopic}`, {
                    name: entity.caption,
                  })}
                </div>
              ) : null} */}
              <div className="grid grid-cols-[168px,_1fr] gap-2">
                {entityPropertyList.map(({ property, values, restItemsCount }) => {
                  return (
                    <React.Fragment key={property}>
                      <span className="font-bold">{property}</span>
                      <span className="flex flex-wrap gap-1">
                        {values.map((v, i) => (
                          <React.Fragment key={i}>
                            {transformValue(property, v, { language: i18n.language, formatLanguage: language })}
                            {i === values.length - 1 ? null : <span>·</span>}
                          </React.Fragment>
                        ))}
                        {restItemsCount > 0 ? (
                          <>
                            <span>·</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleShowMore(property);
                              }}
                              className="text-purple-65 font-semibold"
                            >
                              + {restItemsCount} more
                            </button>
                          </>
                        ) : null}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CollapsibleV2.Content>
        </div>
      </CollapsibleV2.Provider>
      <ModalV2.Content
        open={isInReview}
        hideOnInteractOutside={(event) => {
          event.stopPropagation();
          // Prevent people from losing their work by clicking accidentally outside the modal
          return false;
        }}
        onClose={() => setIsInReview(false)}
        size="small"
      >
        <ModalV2.Title>Change match status</ModalV2.Title>
        <fetcher.Form className="flex flex-col gap-8 p-8" method="post" action={getRoute('/ressources/cases/review-sanction-match')}>
          <input name="sanctionMatchId" type="hidden" value={match.id} />
          <div className="flex flex-col gap-2">
            <div className="text-m">Choose a status</div>
            <StatusRadioGroup value={currentStatus} onChange={setCurrentStatus} />
            {currentStatus === 'confirmed_hit' ? <Callout>By choosing to confirm this match, the status of this sanction check will automatically changed for Confirmed hit</Callout> : null}
            {/* <div className="grid grid-cols-2 gap-2">
              {(['confirmed_hit', 'no_hit'] as const).map((status) => (
                <div key={status} className="border-grey-90 flex items-center gap-2 rounded border p-2">
                  <Icon className="text-grey-90 size-6" icon={status === match.status ? 'radio-selected' : 'radio-unselected'} />
                  <StatusTag status={status} disabled />
                </div>
              ))}
            </div> */}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-m">Add a comment</div>
            <TextArea name="comment" />
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close render={<Button className="flex-1" variant="secondary" name="cancel" />}>{t('common:cancel')}</ModalV2.Close>
            <Button
              type="submit"
              disabled={currentStatus === 'pending'}
              className="flex-1"
              variant="primary"
              name="save"
              // onClick={() => handleSave()}
            >
              {t('common:save')}
            </Button>
          </div>
        </fetcher.Form>
      </ModalV2.Content>
    </div>
  );
};
