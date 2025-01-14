import { useTranslation } from 'react-i18next';

interface ScoreOutcomeThresholdsProps {
  scoreReviewThreshold?: number;
  scoreBlockAndReviewThreshold?: number;
  scoreDeclineThreshold?: number;
}

export function ScoreOutcomeThresholds({
  scoreReviewThreshold = 0,
  scoreBlockAndReviewThreshold = 0,
  scoreDeclineThreshold = 0,
}: ScoreOutcomeThresholdsProps) {
  const { t } = useTranslation(['decisions']);

  const showReviewOutcome = scoreBlockAndReviewThreshold > scoreReviewThreshold;
  const showBlockAndReviewOutcome =
    scoreDeclineThreshold > scoreBlockAndReviewThreshold;

  return (
    <div className="relative flex h-[70px] w-full flex-row">
      <div className="bg-green-94 border-b-green-38 isolate flex h-10 flex-1 items-center justify-center rounded-s-md border-b-4">
        <span className="text-s text-green-38 font-semibold">
          {t('decisions:outcome.approve')}
        </span>
      </div>

      {showReviewOutcome ? (
        <>
          <div className="bg-grey-100 relative w-1">
            <span className="text-grey-00 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
              {scoreReviewThreshold}
            </span>
          </div>

          <div className="bg-yellow-90 flex h-10 flex-1 items-center justify-center border-b-4 border-b-yellow-50">
            <span className="text-s font-semibold text-yellow-50">
              {t('decisions:outcome.review')}
            </span>
          </div>
        </>
      ) : null}

      {showBlockAndReviewOutcome ? (
        <>
          <div className="bg-grey-100 relative w-1">
            <span className="text-grey-00 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
              {scoreBlockAndReviewThreshold}
            </span>
          </div>

          <div className="bg-orange-95 flex h-10 flex-1 items-center justify-center border-b-4 border-b-orange-50">
            <span className="text-s font-semibold text-orange-50">
              {t('decisions:outcome.block_and_review')}
            </span>
          </div>
        </>
      ) : null}

      <div className="bg-grey-100 relative w-1">
        <span className="text-grey-00 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
          {scoreDeclineThreshold}
        </span>
      </div>

      <div className="bg-red-95 border-b-red-47 flex h-10 flex-1 items-center justify-center rounded-e-md border-b-4">
        <span className="text-s text-red-47 font-semibold">
          {t('decisions:outcome.decline')}
        </span>
      </div>
    </div>
  );
}
