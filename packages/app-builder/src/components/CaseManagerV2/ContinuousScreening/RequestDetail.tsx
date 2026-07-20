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
import { Button, cn, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../../Callout';
import { ObjectRelatedCases } from '../../CaseManager/ScreeningCaseDetail/ObjectRelatedCases';
import { ScreeningObjectDetails } from '../../CaseManager/ScreeningCaseDetail/ScreeningObjectDetails';
import { ScreeningRequestDetail } from '../../CaseManager/ScreeningCaseDetail/ScreeningRequestDetail';
import { DataListGrid } from '../../DataModelExplorer/DataListGrid';
import { Panel, PanelSharpFactory } from '../../Panel';
import { EntityProperties } from '../../Screenings/EntityProperties';
import { EntityDatasetsList } from '../../Screenings/MatchCard/match-card-entity-components';
import { TopicTag } from '../../Screenings/TopicTag';
import { SquareTag } from '../../SquareTag';

type RequestDetailProps = {
  caseDetail: Case;
  screening: ContinuousScreening;
};

export function RequestDetail({ screening, caseDetail }: RequestDetailProps) {
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex flex-col gap-md">
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
      <ScreeningRequestDetail
        configStableId={screening.continuousScreeningConfigStableId}
        request={screening.request}
      />
      <ScreeningObjectDetails
        objectType={screening.objectType}
        objectId={screening.objectId}
        className="bg-surface-card border border-grey-border"
      />
      <ObjectRelatedCases
        objectType={screening.objectType}
        objectId={screening.objectId}
        currentCase={caseDetail}
        className="bg-surface-card border border-grey-border"
      />
    </>
  );
};

const IndirectScreeningRequestDetail = ({ screening }: { screening: ContinuousScreeningScreeningEntityToMarble }) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ScreeningRequestDetail
        configStableId={screening.continuousScreeningConfigStableId}
        request={screening.request}
      />
      <div className="flex flex-col gap-sm p-md bg-surface-card rounded-lg border border-grey-border">
        <div className="flex justify-between items-center gap-sm">
          <span className="font-medium">{screening.opensanctionEntityPayload.caption}</span>
          <span className="text-small text-grey-placeholder me-auto">{screening.opensanctionEntityPayload.schema}</span>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {t('continuousScreening:review.entity_details.view_all')}
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
      <Panel.Root open={open} onOpenChange={setOpen}>
        <ScreeningEntityDetailsPanel entity={screening.opensanctionEntityPayload} />
      </Panel.Root>
    </>
  );
};

const ScreeningEntityDetailsPanel = ({ entity }: { entity: OpenSanctionEntityPayload }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['continuousScreening', 'screenings']);

  return (
    <Panel.Container size="medium">
      <Panel.Content>
        <Panel.Header>
          <Button variant="secondary" mode="icon" onClick={panelSharp.actions.close}>
            <Icon icon="left-panel-close" className="size-4" />
          </Button>
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
  const circleClassName =
    'absolute size-18 p-sm grid place-content-center rounded-full border border-grey-border bg-white/40 text-center';
  const selectedClassName =
    ' data-[selected=true]:border-purple-primary data-[selected=true]:bg-purple-primary/70 data-[selected=true]:text-white';

  return (
    <div className="relative w-33 h-18">
      <div
        data-selected={type === 'indirect'}
        className={cn(circleClassName, selectedClassName, 'text-small top-0 left-0')}
      >
        Marble
      </div>
      <div
        data-selected={type === 'direct'}
        className={cn(circleClassName, selectedClassName, 'text-tiny top-0 right-0')}
      >
        Screening lists
      </div>
    </div>
  );
};
