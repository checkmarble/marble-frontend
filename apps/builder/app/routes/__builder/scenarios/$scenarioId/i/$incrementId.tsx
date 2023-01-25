import { protoBase64 } from '@bufbuild/protobuf';
import { ScenarioVersionBody } from '@marble-front/api/marble';
import { createSimpleContext } from '@marble-front/builder/utils/create-context';
import { toUUID } from '@marble-front/builder/utils/short-uuid';
import { Outlet, useParams } from '@remix-run/react';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useCurrentScenario } from '../../$scenarioId';

export const handle = {
  i18n: ['scenarios'] as const,
};

function useCurrentScenarioIncrementValue() {
  const currentScenario = useCurrentScenario();

  const { incrementId } = useParams();
  invariant(incrementId, 'incrementId is required');

  const incrementUUID = toUUID(incrementId);

  const currentScenarioVersionId =
    currentScenario.deployments.find(({ id }) => id === incrementUUID)
      ?.scenarioVersionId ?? incrementUUID;

  const currentScenarioVersion = currentScenario.versions.find(
    ({ id }) => id === currentScenarioVersionId
  );
  invariant(currentScenarioVersion, `Unknown scenarioVersion`);

  const { bodyEncodedWithProtobuf, ...rest } = currentScenarioVersion;
  const body = useMemo(
    () =>
      ScenarioVersionBody.fromBinary(protoBase64.dec(bodyEncodedWithProtobuf)),
    [bodyEncodedWithProtobuf]
  );

  return { ...rest, body };
}

type CurrentScenarioIncrement = ReturnType<
  typeof useCurrentScenarioIncrementValue
>;

const { Provider, useValue: useCurrentScenarioIncrement } =
  createSimpleContext<CurrentScenarioIncrement>('CurrentScenarioIncrement');

export default function CurrentScenarioIncrementProvider() {
  const value = useCurrentScenarioIncrementValue();
  return (
    <Provider value={value}>
      <Outlet />
    </Provider>
  );
}

export { useCurrentScenarioIncrement };
