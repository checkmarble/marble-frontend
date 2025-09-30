import { type ScreeningQuery } from '@app-builder/models/screening';
import { Fragment } from 'react/jsx-runtime';
import * as R from 'remeda';
import { Separator } from 'ui-design-system';

export type SearchInputProps = {
  searchInput: ScreeningQuery[];
};

export const SearchInputDisplay = ({ searchInput }: SearchInputProps) => {
  const searchInfos = R.map(searchInput, (input) => R.entries(input.properties));

  return (
    <div className="bg-grey-100 border-grey-90 text-s flex flex-col gap-2 rounded-sm border p-2">
      {searchInfos.map((value, i) => {
        return (
          <Fragment key={i}>
            <div className="flex flex-col gap-1" key={i}>
              {value.map(([property, propValue]) => {
                return <span key={property}>{propValue.join(', ')}</span>;
              })}
            </div>
            {i < searchInfos.length - 1 ? <Separator className="bg-grey-90" /> : null}
          </Fragment>
        );
      })}
    </div>
  );
};
