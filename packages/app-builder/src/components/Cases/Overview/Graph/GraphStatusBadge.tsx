import { type CaseStatus } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';

import { graphStatusesColors } from '../constants';

type GraphCaseStatus = Exclude<CaseStatus, 'waiting_for_action'>;

interface GraphStatusBadgeProps {
  status: GraphCaseStatus;
}

export const GraphStatusBadge = ({ status }: GraphStatusBadgeProps) => {
  const { t } = useTranslation(['cases']);
  const colors = graphStatusesColors[status];

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 h-6" style={{ backgroundColor: colors.bg }}>
      <div className="size-3 rounded-full" style={{ backgroundColor: colors.bar }} />
      <span className="text-xs" style={{ color: colors.text }}>
        {t(`cases:case.status.${status}`)}
      </span>
    </span>
  );
};
