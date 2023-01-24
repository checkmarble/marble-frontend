import { Page } from '@marble-front/builder/components/Page';
import { fromUUID, toUUID } from '@marble-front/builder/utils/short-uuid';
import { Select } from '@marble-front/ui/design-system';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { useCurrentScenario } from '../../../$scenarioId';

export const handle = {
  i18n: ['scenarios'] as const,
};

export default function ScenarioLayout() {
  const { t } = useTranslation(handle.i18n);
  const { name, increments, lastDeployment } = useCurrentScenario();
  const navigate = useNavigate();
  const location = useLocation();

  const { incrementId } = useParams();
  invariant(incrementId, 'incrementId is required');

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <Page.BackButton />
          </Link>
          {name}
          <Select.Default
            defaultValue={toUUID(incrementId)}
            border="rounded"
            className="min-w-[126px]"
            onValueChange={(id) => {
              const elem = increments.get(id);
              if (!elem?.id) return;
              navigate(
                location.pathname.replace(incrementId, fromUUID(elem?.id))
              );
            }}
          >
            {increments.values.map((increment) => {
              return (
                <Select.DefaultItem
                  className="min-w-[110px]"
                  key={increment.id}
                  value={increment.id}
                >
                  <p className="text-text-s-semibold-cta flex flex-row gap-1">
                    <span className="text-grey-100 capitalize">
                      {increment.label ?? t('scenarios:draft')}
                    </span>
                    {increment.versionId ===
                      lastDeployment?.scenarioVersionId && (
                      <span className="capitalize text-purple-100">
                        {t('scenarios:live')}
                      </span>
                    )}
                  </p>
                </Select.DefaultItem>
              );
            })}
          </Select.Default>
        </div>
      </Page.Header>
      <Outlet />
    </Page.Container>
  );
}
