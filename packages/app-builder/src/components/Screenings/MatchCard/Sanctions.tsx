import { IconDot } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import { type ScreeningSanctionEntity } from '@app-builder/models/screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ExpandableGroupTagLine } from 'ui-design-system';
import { ModalSanction } from './ModalSanction';

const MAX_SANCTIONS = 5;

function getSanctionLabel(sanction: ScreeningSanctionEntity) {
  return sanction.properties['authority']?.[0] ?? sanction.id;
}

function getSanctionDedupeKey(sanction: ScreeningSanctionEntity) {
  const normalizedProperties = Object.entries(sanction.properties)
    .sort(([propertyA], [propertyB]) => propertyA.localeCompare(propertyB))
    .map(([property, values]) => [property, [...values].sort()] as const);

  return JSON.stringify(normalizedProperties);
}

function dedupeSanctions(sanctions: ScreeningSanctionEntity[]) {
  const seen = new Set<string>();

  return sanctions.filter((sanction) => {
    const key = getSanctionDedupeKey(sanction);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function Sanctions({ sanctions }: { sanctions: ScreeningSanctionEntity[] | undefined }) {
  const { t } = useTranslation(['screenings', 'common']);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => dedupeSanctions(sanctions ?? []), [sanctions]);
  const hiddenCount = Math.max(0, rows.length - MAX_SANCTIONS);
  const visibleRows = showAll ? rows : rows.slice(0, MAX_SANCTIONS);

  if (rows.length === 0) return null;

  return (
    <ul className="grid grid-cols-[146px_1fr] gap-2">
      {visibleRows.map((sanction, rowIndex) => {
        const isFirstElement = rowIndex === 0;
        const label = getSanctionLabel(sanction);

        const expandableItems = [
          <IconDot key="dot" dark spaced />,
          <span key="label" className="shrink-0">
            {label}
          </span>,
        ];

        return (
          <li key={sanction.id} className="contents">
            <div className="font-semibold">
              {isFirstElement && <div className="font-bold mb-2">{t('screenings:entity.property.sanctions')}</div>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-v2-sm">
                <ExpandableGroupTagLine items={expandableItems} classname="gap-v2-sm" overflowTagWidth={60} />
                <ModalSanction sanction={sanction} />
              </div>
            </div>
          </li>
        );
      })}
      {hiddenCount > 0 && !showAll && (
        <li className="contents">
          <span />
          <Button appearance="link" variant="primary" onClick={() => setShowAll(true)}>
            {t('common:more_remains', { count: hiddenCount })}
          </Button>
        </li>
      )}
    </ul>
  );
}
