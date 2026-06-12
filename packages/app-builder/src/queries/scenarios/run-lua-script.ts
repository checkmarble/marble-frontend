import { runLuaScriptFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type RunLuaScriptVariables = {
  scenarioIterationId: string;
  code: string;
  payload: Record<string, unknown>;
};

export function useRunLuaScriptMutation() {
  const runLuaScript = useServerFn(runLuaScriptFn);

  return useMutation({
    mutationKey: ['scenarios', 'run-lua-script'],
    mutationFn: async (variables: RunLuaScriptVariables) => runLuaScript({ data: variables }),
  });
}
