import Callout from '@marble-front/builder/components/Callout';
import { Paper } from '@marble-front/builder/components/Paper';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] as const,
};

function Box({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={clsx(
        'bg-grey-05 flex h-10 min-w-[40px] items-center justify-center rounded px-2',
        className
      )}
      {...props}
    />
  );
}

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Paper.Container>
      <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
      <Callout>{t('scenarios:trigger.trigger_object.callout')}</Callout>

      {/* Top + bottom line */}
      <div className="grid grid-cols-[8px_16px_repeat(2,max-content)]">
        <Box className="text-text-s-semibold-cta col-span-4 w-fit text-purple-100">
          Transaction
        </Box>
        <div className="border-r-grey-10 col-span-4 h-4 w-2 border-r " />

        <div className="border-r-grey-10 border-r" />
        <div className="border-b-grey-10 h-5 border-b" />
        <Box className="text-text-s-semibold-cta text-grey-25 mr-2">Where</Box>
        <div className="mb-2 flex flex-row gap-2">
          <Box className="text-text-s-semibold-cta text-purple-100">type</Box>
          <Box className="text-text-s-semibold-cta text-grey-100">is</Box>
          <Box className="text-text-s-medium text-grey-100 ">sepa</Box>
        </div>

        <div className="border-r-grey-10 h-5 border-r" />
        <div className="border-b-grey-10 h-5 border-b" />
        <Box className="text-text-s-semibold-cta text-grey-25 mr-2">and</Box>
        <div className="flex flex-row gap-2">
          <Box className="text-text-s-semibold-cta text-purple-100">
            direction
          </Box>
          <Box className="text-text-s-semibold-cta text-grey-100">is</Box>
          <Box className="text-text-s-medium text-grey-100 ">payout</Box>
        </div>
      </div>
    </Paper.Container>
  );
}
