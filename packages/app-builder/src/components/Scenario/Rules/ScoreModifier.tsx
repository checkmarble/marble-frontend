import { type ComponentProps } from 'react';
import { Tag } from 'ui-design-system';

export const ScoreModifier = ({ score, className, ...rest }: ComponentProps<'span'> & { score: number }) => {
  return (
    <Tag color="grey">
      <span>{score >= 0 ? '+' : '-'}</span>
      <span>{Math.abs(score)}</span>
    </Tag>
  );
};
