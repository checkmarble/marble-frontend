import { type Pivot } from '@app-builder/models';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { PivotDetails } from '../Data/PivotDetails';
import { casesI18n } from './cases-i18n';

export function CasePivotValues({
  pivotValues,
}: {
  pivotValues: {
    pivot: Pivot;
    value: string;
  }[];
}) {
  const { i18n } = useTranslation(casesI18n);

  return (
    <div className="grid grid-cols-[repeat(2,_max-content)] items-center gap-2">
      {pivotValues.map(({ pivot, value }) => {
        return (
          <React.Fragment key={pivot.id}>
            <Tag
              size="big"
              border="square"
              color={pivot.type === 'field' ? 'grey' : 'purple'}
              className="col-start-1 flex flex-row gap-2"
            >
              <span className="flex-1">{pivot.type}</span>
              <Ariakit.HovercardProvider
                showTimeout={0}
                hideTimeout={0}
                placement={i18n.dir() === 'ltr' ? 'right' : 'left'}
              >
                <Ariakit.HovercardAnchor
                  tabIndex={-1}
                  className={clsx(
                    'cursor-pointer transition-colors',
                    pivot.type === 'field' && 'text-grey-80 hover:text-grey-50',
                    pivot.type === 'link' && 'hover:text-purple-65 text-purple-82',
                  )}
                >
                  <Icon icon="tip" className="size-5" />
                </Ariakit.HovercardAnchor>
                <Ariakit.Hovercard
                  portal
                  gutter={16}
                  className="bg-grey-100 border-grey-90 flex w-fit rounded border p-2 shadow-md"
                >
                  <PivotDetails pivot={pivot} />
                </Ariakit.Hovercard>
              </Ariakit.HovercardProvider>
            </Tag>
            <CopyToClipboardButton toCopy={value} className="bg-grey-100">
              <span className="text-s line-clamp-1 max-w-40 font-normal">{value}</span>
            </CopyToClipboardButton>
          </React.Fragment>
        );
      })}
    </div>
  );
}
