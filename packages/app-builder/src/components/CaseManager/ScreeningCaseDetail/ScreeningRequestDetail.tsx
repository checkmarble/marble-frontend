import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { FormatData } from '@app-builder/components/FormatData';
import { SquareTag } from '@app-builder/components/SquareTag';
import { ContinuousScreeningRequest } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningConfigurationQuery } from '@app-builder/queries/continuous-screening/configuration';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment } from 'react/jsx-runtime';
import * as R from 'remeda';
import { match } from 'ts-pattern';

type ScreeningRequestDetailProps = {
  configStableId: string;
  request: ContinuousScreeningRequest;
};

export const ScreeningRequestDetail = ({ configStableId, request }: ScreeningRequestDetailProps) => {
  const configQuery = useContinuousScreeningConfigurationQuery(configStableId);
  const queries = R.entries(request.searchInput.queries).map(([key, value]) => value);
  if (!queries[0]) return null;

  const queryEntries = R.pipe(
    queries[0].properties,
    R.mapValues((property) => parseUnknownData(property[0])),
    R.entries(),
  );

  return (
    <div className="flex flex-col gap-v2-lg p-v2-md bg-grey-background-light rounded-v2-lg">
      <div className="flex flex-col gap-v2-sm">
        <div className="font-medium">Detail of query sent to search engine</div>
        <DataListGrid>
          {queryEntries.map(([key, value]) => (
            <Fragment key={key}>
              <div className="text-grey-50 truncate">{key}</div>
              <FormatData data={value} className="truncate" />
            </Fragment>
          ))}
        </DataListGrid>
      </div>
      <div className="flex flex-col gap-v2-sm">
        <div className="font-medium">Search parameters</div>
        {match(configQuery)
          .with({ isPending: true }, () => {
            return <div>Loading...</div>;
          })
          .with({ isError: true }, () => {
            return <div>Error loading configuration</div>;
          })
          .with({ isSuccess: true }, (query) => {
            if (!query.data) return null;

            const displayedDatasets = query.data.datasets.slice(0, 3);
            const restCount = query.data.datasets.length - displayedDatasets.length;

            return (
              <DataListGrid>
                <div className="text-grey-50 truncate leading-6">Datasets</div>
                <div className="truncate flex flex-row flex-wrap gap-v2-sm">
                  {displayedDatasets.map((dataset) => (
                    <SquareTag key={dataset}>{dataset}</SquareTag>
                  ))}
                  {restCount > 0 ? <SquareTag>+{restCount}</SquareTag> : null}
                </div>
                <div className="text-grey-50 truncate leading-6">Match threshold</div>
                <div className="truncate">
                  <SquareTag>{query.data.matchThreshold}</SquareTag>
                </div>
              </DataListGrid>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
