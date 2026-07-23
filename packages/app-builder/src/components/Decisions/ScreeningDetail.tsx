import { decisionsI18n } from '@app-builder/components';
import { DataModelField, SemanticTypeField, TableModel } from '@app-builder/models';
import { DataType } from '@app-builder/models/data-model';
import { isScreeningError, type Screening } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import {
  DateBirthdateComponent,
  DateDatetimeComponent,
  StringMainComponent,
} from '../Data/DataVisualisation/DataField';
import { DatatypeIcon, DatatypeToPrimitiveType } from '../Data/SemanticTables/Shared/DatatypeOption';
import { MatchCard } from '../Screenings/MatchCard';
import { ScreeningErrors } from '../Screenings/ScreeningErrors';
import { ScreeningStatusTag } from '../Screenings/ScreeningStatusTag';

export function ScreeningDetail({ screening, table }: { screening: Screening; table?: TableModel }) {
  const hasError = isScreeningError(screening);

  return (
    <Collapsible.Container className="bg-surface-card">
      <Collapsible.Title>
        <div className="flex grow items-center justify-between">
          <span>{screening.config.name}</span>
          <ScreeningStatusTag
            status={screening.status}
            pendingHitCount={screening.matches.filter((m) => m.status === 'pending').length}
            className="h-8"
          />
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-md">
          {hasError ? <ScreeningErrors screening={screening} /> : null}
          {screening.request ? <SearchInput request={screening.request} fields={table?.fields} /> : null}
          <div className="flex flex-col gap-2">
            {screening.matches.map((match) => (
              <MatchCard
                readonly
                key={match.id}
                screening={screening}
                unreviewable={hasError || screening.partial}
                match={match}
              />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

type SearchInputItem = {
  value: string;
  type: DataType;
  semanticType: SemanticTypeField;
};

function toSearchInputItem(value: string, field?: DataModelField): SearchInputItem {
  return {
    value,
    type: field?.dataType ?? 'String',
    semanticType: field?.semanticType ?? 'text',
  };
}

const SearchInput = ({
  request,
  fields,
}: {
  request: NonNullable<Screening['request']>;
  fields?: DataModelField[];
}) => {
  const { t } = useTranslation(decisionsI18n);

  const searchInputList: SearchInputItem[] = R.pipe(
    R.values(request.queries),
    R.flatMap((query) =>
      R.pipe(
        R.entries(query.properties),
        R.flatMap(([ftmProperty, values]) => {
          const field = fields?.find((f) => f.ftmProperty === ftmProperty);

          return values.map((value) => toSearchInputItem(value, field));
        }),
      ),
    ),
  );

  return (
    <div className="grid grid-cols-[auto_1fr] gap-sm">
      <span className="grid items-center h-[50px]">{t('screenings:search_input')}</span>
      <div className="flex flex-wrap gap-sm">
        {searchInputList.map(({ value, type, semanticType }, i) => (
          <div key={i} className="border-grey-border flex items-center gap-sm rounded-sm border p-sm">
            <DatatypeIcon dataType={DatatypeToPrimitiveType(type)} />

            {semanticType === 'date_of_birth' ? (
              <DateBirthdateComponent value={value} compact />
            ) : semanticType === 'name' ? (
              <StringMainComponent value={value} />
            ) : type === 'Timestamp' ? (
              <DateDatetimeComponent value={value} />
            ) : (
              value
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
