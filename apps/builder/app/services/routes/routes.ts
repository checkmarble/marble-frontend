export const routes = [
  {
    id: "root",
    path: "",
    file: "root.tsx",
    children: [
      {
        id: "routes/ressources/decisions/decision-detail.$decisionId",
        path: "ressources/decisions/decision-detail/:decisionId",
        file: "routes/ressources/decisions/decision-detail.$decisionId.tsx",
      },
      {
        id: "routes/ressources/scenarios/deployment",
        path: "ressources/scenarios/deployment",
        file: "routes/ressources/scenarios/deployment.tsx",
      },
      {
        id: "routes/ressources/user/language",
        path: "ressources/user/language",
        file: "routes/ressources/user/language.tsx",
      },
      {
        id: "routes/auth/$provider.callback",
        path: "auth/:provider/callback",
        file: "routes/auth/$provider.callback.tsx",
      },
      {
        id: "routes/auth/$provider",
        path: "auth/:provider",
        file: "routes/auth/$provider.tsx",
      },
      {
        id: "routes/auth/logout",
        path: "auth/logout",
        file: "routes/auth/logout.tsx",
      },
      {
        id: "routes/healthcheck",
        path: "healthcheck",
        file: "routes/healthcheck.ts",
      },
      {
        id: "routes/__builder",
        file: "routes/__builder.tsx",
        children: [
          {
            id: "routes/__builder/scenarios/$scenarioId",
            path: "scenarios/:scenarioId",
            file: "routes/__builder/scenarios/$scenarioId.tsx",
            children: [
              {
                id: "routes/__builder/scenarios/$scenarioId/i/$iterationId",
                path: "i/:iterationId",
                file: "routes/__builder/scenarios/$scenarioId/i/$iterationId.tsx",
                children: [
                  {
                    id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.rules.$ruleId",
                    path: "view/rules/:ruleId",
                    file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.rules.$ruleId.tsx",
                  },
                  {
                    id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/index",
                    index: true,
                    file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/index.tsx",
                  },
                  {
                    id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view",
                    path: "view",
                    file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.tsx",
                    children: [
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/decision",
                        path: "decision",
                        file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/decision.tsx",
                      },
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/trigger",
                        path: "trigger",
                        file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/trigger.tsx",
                      },
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/index",
                        index: true,
                        file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/index.tsx",
                      },
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/rules",
                        path: "rules",
                        file: "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/rules.tsx",
                      },
                    ],
                  },
                ],
              },
              {
                id: "routes/__builder/scenarios/$scenarioId/index",
                index: true,
                file: "routes/__builder/scenarios/$scenarioId/index.tsx",
              },
            ],
          },
          {
            id: "routes/__builder/scenarios/index",
            index: true,
            path: "scenarios",
            file: "routes/__builder/scenarios/index.tsx",
          },
          {
            id: "routes/__builder/lists/$listId",
            path: "lists/:listId",
            file: "routes/__builder/lists/$listId.tsx",
          },
          {
            id: "routes/__builder/lists/index",
            index: true,
            path: "lists",
            file: "routes/__builder/lists/index.tsx",
          },
          {
            id: "routes/__builder/decisions",
            path: "decisions",
            file: "routes/__builder/decisions.tsx",
          },
          {
            id: "routes/__builder/$",
            path: "*",
            file: "routes/__builder/$.tsx",
          },
        ],
      },
      { id: "routes/index", index: true, file: "routes/index.tsx" },
      { id: "routes/login", path: "login", file: "routes/login.tsx" },
    ],
  },
] as const;
