export const routes = [
  {
    "id": "root",
    "path": "",
    "file": "root.tsx",
    "children": [
      {
        "id": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/$ruleId/edit",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/:ruleId/edit",
        "file": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/$ruleId/edit.tsx"
      },
      {
        "id": "routes/ressources/scenarios/$scenarioId/$iterationId/create_draft",
        "path": "ressources/scenarios/:scenarioId/:iterationId/create_draft",
        "file": "routes/ressources/scenarios/$scenarioId/$iterationId/create_draft.tsx"
      },
      {
        "id": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/create",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/create",
        "file": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/create.tsx"
      },
      {
        "id": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/delete",
        "file": "routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete.tsx"
      },
      {
        "id": "routes/ressources/decisions/decision-detail.$decisionId",
        "path": "ressources/decisions/decision-detail/:decisionId",
        "file": "routes/ressources/decisions/decision-detail.$decisionId.tsx"
      },
      {
        "id": "routes/ressources/scenarios/deployment",
        "path": "ressources/scenarios/deployment",
        "file": "routes/ressources/scenarios/deployment.tsx"
      },
      {
        "id": "routes/ressources/lists/value_create",
        "path": "ressources/lists/value_create",
        "file": "routes/ressources/lists/value_create.tsx"
      },
      {
        "id": "routes/ressources/lists/value_delete",
        "path": "ressources/lists/value_delete",
        "file": "routes/ressources/lists/value_delete.tsx"
      },
      {
        "id": "routes/ressources/scenarios/create",
        "path": "ressources/scenarios/create",
        "file": "routes/ressources/scenarios/create.tsx"
      },
      {
        "id": "routes/ressources/user/language",
        "path": "ressources/user/language",
        "file": "routes/ressources/user/language.tsx"
      },
      {
        "id": "routes/ressources/lists/create",
        "path": "ressources/lists/create",
        "file": "routes/ressources/lists/create.tsx"
      },
      {
        "id": "routes/ressources/lists/delete",
        "path": "ressources/lists/delete",
        "file": "routes/ressources/lists/delete.tsx"
      },
      {
        "id": "routes/ressources/auth/logout",
        "path": "ressources/auth/logout",
        "file": "routes/ressources/auth/logout.tsx"
      },
      {
        "id": "routes/ressources/auth/login",
        "path": "ressources/auth/login",
        "file": "routes/ressources/auth/login.tsx"
      },
      {
        "id": "routes/ressources/lists/edit",
        "path": "ressources/lists/edit",
        "file": "routes/ressources/lists/edit.tsx"
      },
      {
        "id": "routes/healthcheck",
        "path": "healthcheck",
        "file": "routes/healthcheck.ts"
      },
      {
        "id": "routes/__builder",
        "file": "routes/__builder.tsx",
        "children": [
          {
            "id": "routes/__builder/scenarios/$scenarioId",
            "path": "scenarios/:scenarioId",
            "file": "routes/__builder/scenarios/$scenarioId.tsx",
            "children": [
              {
                "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId",
                "path": "i/:iterationId",
                "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId.tsx",
                "children": [
                  {
                    "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit.rules.$ruleId",
                    "path": "edit/rules/:ruleId",
                    "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit.rules.$ruleId.tsx"
                  },
                  {
                    "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.rules.$ruleId",
                    "path": "view/rules/:ruleId",
                    "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.rules.$ruleId.tsx"
                  },
                  {
                    "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/index",
                    "index": true,
                    "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/index.tsx"
                  },
                  {
                    "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit",
                    "path": "edit",
                    "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit.tsx",
                    "children": [
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/decision",
                        "path": "decision",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/decision.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/trigger",
                        "path": "trigger",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/trigger.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/index",
                        "index": true,
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/index.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/rules",
                        "path": "rules",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/edit/rules.tsx"
                      }
                    ]
                  },
                  {
                    "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view",
                    "path": "view",
                    "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view.tsx",
                    "children": [
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/decision",
                        "path": "decision",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/decision.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/trigger",
                        "path": "trigger",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/trigger.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/index",
                        "index": true,
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/index.tsx"
                      },
                      {
                        "id": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/rules",
                        "path": "rules",
                        "file": "routes/__builder/scenarios/$scenarioId/i/$iterationId/view/rules.tsx"
                      }
                    ]
                  }
                ]
              },
              {
                "id": "routes/__builder/scenarios/$scenarioId/index",
                "index": true,
                "file": "routes/__builder/scenarios/$scenarioId/index.tsx"
              }
            ]
          },
          {
            "id": "routes/__builder/scenarios/index",
            "index": true,
            "path": "scenarios",
            "file": "routes/__builder/scenarios/index.tsx"
          },
          {
            "id": "routes/__builder/lists/$listId",
            "path": "lists/:listId",
            "file": "routes/__builder/lists/$listId.tsx"
          },
          {
            "id": "routes/__builder/lists/index",
            "index": true,
            "path": "lists",
            "file": "routes/__builder/lists/index.tsx"
          },
          {
            "id": "routes/__builder/decisions",
            "path": "decisions",
            "file": "routes/__builder/decisions.tsx"
          },
          {
            "id": "routes/__builder/$",
            "path": "*",
            "file": "routes/__builder/$.tsx"
          }
        ]
      },
      {
        "id": "routes/index",
        "index": true,
        "file": "routes/index.tsx"
      },
      {
        "id": "routes/login",
        "path": "login",
        "file": "routes/login.tsx"
      }
    ]
  }
] as const;
