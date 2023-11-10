import { formatNumber } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export const Score = ({ score }: { score: number }) => {
  const {
    i18n: { language },
  } = useTranslation(decisionsI18n);
  return (
    <Tag color="purple" border="square" size="big" className="w-16">
      {formatNumber(score, { language, signDisplay: 'exceptZero' })}
    </Tag>
  );
};
