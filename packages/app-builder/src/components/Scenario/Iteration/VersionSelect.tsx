import { navigationI18n } from '@app-builder/components/Navigation';
import { type SortedScenarioIteration } from '@app-builder/models/scenario-iteration';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useLocation, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

export function VersionSelect({
  currentIteration,
  scenarioIterations,
}: {
  currentIteration: SortedScenarioIteration;
  scenarioIterations: SortedScenarioIteration[];
}) {
  const { t } = useTranslation(handle.i18n);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Select.Default
      value={currentIteration.id}
      border="rounded"
      className="min-w-[126px] shrink-0"
      onValueChange={(selectedId) => {
        const elem = scenarioIterations.find(({ id }) => id === selectedId);
        if (!elem?.id) return;
        navigate(
          location.pathname.replace(
            fromUUID(currentIteration.id),
            fromUUID(elem?.id),
          ),
        );
      }}
    >
      {scenarioIterations.map((iteration) => {
        return (
          <Select.DefaultItem
            className="min-w-[110px]"
            key={iteration.id}
            value={iteration.id}
          >
            <p className="text-s flex flex-row gap-1 font-semibold">
              <span className="text-grey-100 capitalize">
                {iteration.version
                  ? `V${iteration.version}`
                  : t('scenarios:draft')}
              </span>
              {iteration.type === 'live version' ? (
                <span className="capitalize text-purple-100">
                  {t('scenarios:live')}
                </span>
              ) : null}
            </p>
          </Select.DefaultItem>
        );
      })}
    </Select.Default>
  );
}
