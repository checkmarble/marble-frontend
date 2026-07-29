import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { FormatData } from '@app-builder/components/FormatData';
import { SquareTag } from '@app-builder/components/SquareTag';
import { ContinuousScreeningRequest } from '@app-builder/models/continuous-screening';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Card, cn } from 'ui-design-system';
import { SearchParameters } from './SearchParameters';

type RequestDetailProps = {
  configStableId: string;
  request: ContinuousScreeningRequest;
};

export const RequestDetail = ({ configStableId, request }: RequestDetailProps) => {
  const { t } = useTranslation(['common', 'continuousScreening', 'screenings']);
  const queries = R.entries(request.searchInput.queries).map(([key, value]) => value);
  if (!queries[0]) return null;

  const queryEntries = R.pipe(
    queries[0].properties,
    R.mapValues((property) => parseUnknownData(property[0])),
    R.entries(),
  );

  return (
    <>
      <Card className="flex flex-col gap-sm">
        <div className="font-medium">{t('continuousScreening:review.request_detail_subtitle')}</div>
        <DataListGrid>
          <div className="text-grey-placeholder truncate leading-6">
            {t('continuousScreening:review.entity_type_label')}
          </div>
          <div>
            <SquareTag className="">{queries[0]?.schema}</SquareTag>
          </div>
          {queryEntries.map(([key, value]) => (
            <div
              key={key}
              className={cn('grid col-span-full grid-cols-subgrid', {
                'bg-purple-background-light border border-purple-border p-sm rounded-md': key === 'name',
              })}
            >
              <div className="text-grey-secondary truncate">{t(`screenings:entity.property.${key}`)}</div>
              <FormatData data={value} className={cn('truncate', { 'text-purple-primary': key === 'name' })} />
            </div>
          ))}
        </DataListGrid>
      </Card>
      <SearchParameters configStableId={configStableId} />
    </>
  );
};
