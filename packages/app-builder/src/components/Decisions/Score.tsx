import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export const Score = ({ score }: { score: number }) => {
  const language = useFormatLanguage();
  return (
    <Tag color="purple" border="square" size="big" className="w-16">
      {formatNumber(score, { language, signDisplay: 'exceptZero' })}
    </Tag>
  );
};

export const ScorePanel = ({ score }: { score: number }) => {
  const { t } = useTranslation(decisionsI18n);
  return (
    <div className="text-grey-00 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-purple-100 p-2">
      <div>{t('decisions:score')}</div>
      <div className="text-l font-semibold">{score}</div>
    </div>
  );
};
