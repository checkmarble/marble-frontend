import { Callout } from '@app-builder/components/Callout';
import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { EntityProperties } from '@app-builder/components/Screenings/EntityProperties';
import { EntityDatasetsList } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { SquareTag } from '@app-builder/components/SquareTag';
import { Case } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningMarbleToScreeningEntity,
  ContinuousScreeningScreeningEntityToMarble,
  isDirectContinuousScreening,
  isIndirectContinuousScreening,
  OpenSanctionEntityPayload,
} from '@app-builder/models/continuous-screening';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, cn, Panel, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ObjectDetails } from './ObjectDetails';
import { RequestDetail } from './RequestDetail';

type RequestSideInfoProps = {
  caseDetail: Case;
  screening: ContinuousScreening;
};

export function RequestSideInfo({ screening, caseDetail }: RequestSideInfoProps) {
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex flex-col gap-md order-2">
      <div className="flex items-center gap-sm">
        <Typo variant="title2">{t('continuousScreening:review.information_title')}</Typo>
        {isDirectContinuousScreening(screening) ? (
          <Tag>{t(`continuousScreening:review.search_tag.${screening.triggerType}`)}</Tag>
        ) : null}
      </div>
      <Callout variant="outlined" color="purple" className="text-small">
        <div className="grid grid-cols-[1fr_auto] items-center">
          <div>
            <Trans
              i18nKey={`continuousScreening:review.callout.${screening.triggerType}`}
              components={{
                EntityType: <Tag color="grey">{getEntityType(screening)}</Tag>,
              }}
            />
          </div>
          <CaseSourceType type={isDirectContinuousScreening(screening) ? 'direct' : 'indirect'} />
        </div>
      </Callout>
      {match(screening)
        .when(isDirectContinuousScreening, (directScreening) => {
          return <DirectScreeningRequestDetail screening={directScreening} caseDetail={caseDetail} />;
        })
        .when(isIndirectContinuousScreening, (indirectScreening) => {
          return <IndirectScreeningRequestDetail screening={indirectScreening} />;
        })
        .exhaustive()}
    </div>
  );
}

const getEntityType = (screening: ContinuousScreening): string => {
  if (isDirectContinuousScreening(screening)) {
    return screening.objectType;
  }
  return screening.opensanctionEntityPayload.schema;
};

const DirectScreeningRequestDetail = ({
  screening,
  caseDetail,
}: {
  screening: ContinuousScreeningMarbleToScreeningEntity;
  caseDetail: Case;
}) => {
  return (
    <>
      <Card>
        <ObjectDetails objectType={screening.objectType} objectId={screening.objectId} currentCase={caseDetail} />
      </Card>
      <RequestDetail configStableId={screening.continuousScreeningConfigStableId} request={screening.request} />
    </>
  );
};

const IndirectScreeningRequestDetail = ({ screening }: { screening: ContinuousScreeningScreeningEntityToMarble }) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-sm p-md bg-surface-card rounded-lg border border-grey-border">
        <div className="flex justify-between items-center gap-sm">
          <span className="font-medium">{screening.opensanctionEntityPayload.caption}</span>
          <span className="text-small text-grey-placeholder me-auto">{screening.opensanctionEntityPayload.schema}</span>
          <Button variant="primary" mode="icon" appearance="link" onClick={() => setOpen(true)}>
            <Icon icon="eye" className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          {screening.opensanctionEntityPayload.properties['topics']?.map((topic) => {
            return <TopicTag key={topic} topic={topic} className="text-small" />;
          })}
        </div>
        <DataListGrid>
          <div className="text-grey-placeholder truncate leading-6">
            {t('screenings:dataset', { count: screening.opensanctionEntityPayload.datasets.length })}
          </div>
          <div className="truncate flex flex-row flex-wrap gap-sm">
            {screening.opensanctionEntityPayload.datasets.map((dataset) => {
              return <SquareTag key={dataset}>{dataset}</SquareTag>;
            })}
          </div>
        </DataListGrid>
      </div>
      <RequestDetail configStableId={screening.continuousScreeningConfigStableId} request={screening.request} />
      <Panel.Root open={open} onOpenChange={setOpen}>
        <ScreeningEntityDetailsPanel entity={screening.opensanctionEntityPayload} />
      </Panel.Root>
    </>
  );
};

const ScreeningEntityDetailsPanel = ({ entity }: { entity: OpenSanctionEntityPayload }) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);

  return (
    <Panel.Container size="medium">
      <Panel.Content>
        <Panel.Header>
          <div className="text-h1">{t('continuousScreening:review.entity_details.title')}</div>
        </Panel.Header>
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="font-medium">{entity.caption}</span>
            <span className="text-small text-grey-placeholder">{entity.schema}</span>
          </div>
          <div className="flex items-center gap-sm">
            {entity.properties['topics']?.map((topic) => {
              return <TopicTag key={topic} topic={topic} className="text-small" />;
            })}
          </div>
          <EntityProperties
            entity={entity}
            before={
              <>
                <div className="font-bold">{t('screenings:dataset', { count: entity.datasets.length })}</div>
                <div className="">
                  <EntityDatasetsList
                    datasets={entity.datasets}
                    useCase="transaction_monitoring"
                    listClassName="list-disc list-inside"
                  />
                </div>
              </>
            }
          />
        </div>
      </Panel.Content>
    </Panel.Container>
  );
};

const CaseSourceType = ({ type }: { type: 'direct' | 'indirect' }) => {
  const { t } = useTranslation(['continuousScreening']);
  const circleClassName =
    'absolute size-18 p-sm grid place-content-center rounded-full border border-grey-border bg-surface-elevated/40 text-center';
  const selectedClassName =
    ' data-[selected=true]:border-purple-primary data-[selected=true]:bg-purple-primary/70 data-[selected=true]:text-white';

  return (
    <div className="relative w-33 h-18">
      <div
        data-selected={type === 'direct'}
        className={cn(circleClassName, selectedClassName, 'text-small top-0 inset-s-0')}
      >
        Marble
      </div>
      <div
        data-selected={type === 'indirect'}
        className={cn(circleClassName, selectedClassName, 'text-tiny top-0 inset-e-0')}
      >
        {t('continuousScreening:review.source_type.screening_lists')}
      </div>
    </div>
  );
};
