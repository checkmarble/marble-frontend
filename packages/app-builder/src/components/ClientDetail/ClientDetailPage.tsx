import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Page } from '@app-builder/components/Page';
import { useDataModelWithOptionsQuery } from '@app-builder/queries/data/get-data-model-with-options';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { ButtonV2, cn, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormatData } from '../FormatData';
import { Spinner } from '../Spinner';
import { DocumentsList } from './DocumentsList';
import { MonitoringHitsList } from './MonitoringHitsList';
import { ObjectHierarchy } from './ObjectHierarchy';
import { TitleBar } from './TitleBar';

type ClientDetailPageProps = {
  objectType: string;
  objectId: string;
};

export const ClientDetailPage = ({ objectType, objectId }: ClientDetailPageProps) => {
  const { t } = useTranslation(['common']);
  const dataModelQuery = useDataModelWithOptionsQuery();
  const objectDetailsQuery = useObjectDetailsQuery(objectType, objectId);

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-lg">
          <TitleBar objectType={objectType} objectId={objectId} />
          {/* Client details */}
          <div className="flex gap-v2-md">
            {/* Score card */}
            <div className="flex flex-col items-center gap-v2-md justify-center text-orange-primary not-dark:bg-orange-background-light border border-orange-border rounded-lg p-v2-md py-v2-sm w-[180px] min-h-[140px] self-start">
              <div className="flex flex-col items-center gap-v2-sm">
                <span>Score:</span>
                <span className="text-[30px] font-semibold">XX / XXX</span>
              </div>
              <Tooltip.Default content="This is a tooltip">
                <Icon icon="tip" className="size-5" />
              </Tooltip.Default>
            </div>
            {/* Client fields card */}
            {/* Rule: min 2 columns, max 3 columns */}
            <Card className="grow">
              <div className="min-h-[140px]">
                {match([dataModelQuery, objectDetailsQuery])
                  .with([{ isPending: true }, P.any], () => {
                    return (
                      <div className="flex justify-center items-center min-h-[140px]">
                        <Spinner className="size-10" />
                      </div>
                    );
                  })
                  .with([P.any, { isPending: true }], () => {
                    return (
                      <div className="flex justify-center items-center min-h-[140px]">
                        <Spinner className="size-10" />
                      </div>
                    );
                  })
                  .with([{ isError: true }, P.any], () => {
                    return <div>{t('common:generic_fetch_data_error')}</div>;
                  })
                  .with([P.any, { isError: true }], () => {
                    return <div>{t('common:generic_fetch_data_error')}</div>;
                  })
                  .with([{ isSuccess: true }, { isSuccess: true }], ([dmQuery, objQuery]) => {
                    const tableModel = dmQuery.data.dataModel.find((t) => t.name === objectType);
                    if (!tableModel) return null;
                    const parsedData = R.pipe(objQuery.data.data, R.mapValues(parseUnknownData));

                    return (
                      <div className="grid grid-cols-1 min-lg:grid-cols-2 gap-x-v2-md grow min-h-[200px]">
                        {tableModel.options.fieldOrder.map((fieldId) => {
                          const field = tableModel.fields.find((f) => f.id === fieldId);
                          if (!field) return null;

                          return (
                            <div key={field.id} className="grid grid-cols-[160px_1fr]">
                              <div>{field.name}</div>
                              <FormatData data={parsedData[field.name]} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                  .exhaustive()}
              </div>
              {/* <div></div>
              <div className="w-px self-stretch bg-grey-border max-lg:hidden" />
              <div></div> */}
            </Card>
          </div>
          {/* Client timeline */}
          <Card className="flex flex-col gap-v2-sm">
            <div className="font-medium">User's history</div>
            <div className="flex gap-v2-sm">
              <ButtonV2 variant="secondary" size="default" mode="icon">
                <Icon icon="arrow-left" className="size-5" />
              </ButtonV2>
              <div className="grow"></div>
              <ButtonV2 variant="secondary" size="default" mode="icon">
                <Icon icon="arrow-right" className="size-5" />
              </ButtonV2>
            </div>
          </Card>
          {/* Client relationships */}
          <div className="grid grid-cols-[7fr_5fr] gap-v2-md">
            <div className="grid grid-rows-2 gap-v2-md">
              <Card className="flex flex-col gap-v2-sm">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Monitoring hits</div>
                </div>
                <MonitoringHitsList objectType={objectType} objectId={objectId} />
              </Card>
              <Card className="flex flex-col gap-v2-sm">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Alert hits</div>
                </div>
              </Card>
            </div>
            <Card className="flex flex-col gap-v2-sm">
              <div className="flex justify-between items-center">
                <div className="font-medium">Hierarchy</div>
              </div>
              <ObjectHierarchy objectType={objectType} objectId={objectId} />
            </Card>
          </div>
          {/* Client documents */}
          <div className="flex flex-col gap-v2-sm">
            <div className="flex justify-between items-center">
              <div className="font-medium">Documents</div>
            </div>
            <Card className="grid grid-cols-4 gap-v2-md">
              <DocumentsList objectType={objectType} objectId={objectId} />
            </Card>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};

const Card = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('p-v2-lg border border-grey-border rounded-v2-md bg-surface-card', className)}>{children}</div>
  );
};
