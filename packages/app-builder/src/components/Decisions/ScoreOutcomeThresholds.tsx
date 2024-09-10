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
      <div className="bg-green-10 isolate flex h-10 flex-1 items-center justify-center rounded-l-md border-b-4 border-b-green-100">
        <span className="text-s font-semibold text-green-100">
          {t('decisions:outcome.approve')}
        </span>
      </div>

      {showReviewOutcome ? (
        <>
          <div className="bg-grey-00 relative w-1">
            <span className="text-grey-100 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
              {scoreReviewThreshold}
            </span>
          </div>

          <div className="bg-yellow-10 flex h-10 flex-1 items-center justify-center border-b-4 border-b-yellow-100">
            <span className="text-s font-semibold text-yellow-100">
              {t('decisions:outcome.review')}
            </span>
          </div>
        </>
      ) : null}

      {showBlockAndReviewOutcome ? (
        <>
          <div className="bg-grey-00 relative w-1">
            <span className="text-grey-100 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
              {scoreBlockAndReviewThreshold}
            </span>
          </div>

          <div className="bg-orange-10 flex h-10 flex-1 items-center justify-center border-b-4 border-b-orange-100">
            <span className="text-s font-semibold text-orange-100">
              {t('decisions:outcome.block_and_review')}
            </span>
          </div>
        </>
      ) : null}

      <div className="bg-grey-00 relative w-1">
        <span className="text-grey-100 text-m absolute bottom-0 left-1/2 -translate-x-1/2 font-bold">
          {scoreDeclineThreshold}
        </span>
      </div>

      <div className="bg-red-10 flex h-10 flex-1 items-center justify-center rounded-r-md border-b-4 border-b-red-100">
        <span className="text-s font-semibold text-red-100">
          {t('decisions:outcome.decline')}
        </span>
      </div>
    </div>
  );
}
