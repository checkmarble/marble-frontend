export const routes = [
  {
    id: "root",
    path: "",
    file: "root.tsx",
    children: [
      {
        id: "routes/ressources/scenarios/deployment",
        path: "ressources/scenarios/deployment",
        file: "routes/ressources/scenarios/deployment.tsx",
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
            id: "routes/__builder/scenarios",
            path: "scenarios",
            file: "routes/__builder/scenarios.tsx",
            children: [
              {
                id: "routes/__builder/scenarios/$scenarioId",
                path: ":scenarioId",
                file: "routes/__builder/scenarios/$scenarioId.tsx",
                children: [
                  {
                    id: "routes/__builder/scenarios/$scenarioId/i/$incrementId",
                    path: "i/:incrementId",
                    file: "routes/__builder/scenarios/$scenarioId/i/$incrementId.tsx",
                    children: [
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view.rules.$ruleId",
                        path: "view/rules/:ruleId",
                        file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view.rules.$ruleId.tsx",
                      },
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/index",
                        index: true,
                        file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/index.tsx",
                      },
                      {
                        id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view",
                        path: "view",
                        file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view.tsx",
                        children: [
                          {
                            id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/decision",
                            path: "decision",
                            file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/decision.tsx",
                          },
                          {
                            id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/trigger",
                            path: "trigger",
                            file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/trigger.tsx",
                          },
                          {
                            id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/index",
                            index: true,
                            file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/index.tsx",
                          },
                          {
                            id: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/rules",
                            path: "rules",
                            file: "routes/__builder/scenarios/$scenarioId/i/$incrementId/view/rules.tsx",
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
                file: "routes/__builder/scenarios/index.tsx",
              },
            ],
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
