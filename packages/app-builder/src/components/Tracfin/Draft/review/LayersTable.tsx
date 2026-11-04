import type { TracfinValidation } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { knownReasonKey, type LayerStatus, layerRows, OFFICIAL_XSD_LAYER } from './review-layers';

const statusColor: Record<LayerStatus, 'green' | 'red' | 'orange' | 'grey'> = {
  passed: 'green',
  failed: 'red',
  incomplete: 'orange',
  unavailable: 'grey',
};

/**
 * The layers of a validation with their status and reason. `official_xsd` is always a row and always
 * says that no official validator is integrated: a pass of the internal layers is never read as a pass of it.
 */
export function LayersTable({ validation }: { validation: TracfinValidation | null }) {
  const { t } = useTranslation(['tracfin']);
  const rows = layerRows(validation);

  return (
    <table className="text-s w-full border-collapse text-start">
      <thead>
        <tr className="text-grey-secondary text-xs">
          <th scope="col" className="py-xs pe-md text-start font-medium">
            {t('tracfin:draft.review.layers.layer')}
          </th>
          <th scope="col" className="py-xs pe-md text-start font-medium">
            {t('tracfin:draft.review.layers.status')}
          </th>
          <th scope="col" className="py-xs text-start font-medium">
            {t('tracfin:draft.review.layers.reason')}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const official = row.id === OFFICIAL_XSD_LAYER && (row.status === 'unavailable' || row.status === null);
          const reasonKey = row.reason ? knownReasonKey(row.reason) : null;
          const name = t(`tracfin:draft.review.layers.names.${row.id}`, { defaultValue: row.id });
          return (
            <tr key={row.id} data-layer={row.id} className="border-grey-border border-t align-top">
              <th scope="row" className="py-xs pe-md text-start font-medium">
                {name}
              </th>
              <td className="py-xs pe-md">
                <Tag size="xs" color={row.status ? statusColor[row.status] : 'grey'}>
                  {row.status
                    ? t(`tracfin:draft.review.layers.statuses.${row.status}`)
                    : t('tracfin:draft.review.layers.statuses.not_run')}
                </Tag>
              </td>
              <td className="py-xs text-grey-secondary">
                {official
                  ? t('tracfin:draft.review.layers.official_xsd_unavailable')
                  : reasonKey
                    ? t(`tracfin:draft.review.layers.reasons.${reasonKey}`)
                    : (row.reason ?? '')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
