export const routes = [
  {
    "id": "root",
    "path": "",
    "file": "root.tsx",
    "children": [
      {
        "id": "routes/_auth+/_layout",
        "file": "routes/_auth+/_layout.tsx",
        "children": [
          {
            "id": "routes/_auth+/email-verification",
            "path": "email-verification",
            "file": "routes/_auth+/email-verification.tsx"
          },
          {
            "id": "routes/_auth+/forgot-password",
            "path": "forgot-password",
            "file": "routes/_auth+/forgot-password.tsx"
          },
          {
            "id": "routes/_auth+/sign-in",
            "path": "sign-in",
            "file": "routes/_auth+/sign-in.tsx"
          },
          {
            "id": "routes/_auth+/sign-up",
            "path": "sign-up",
            "file": "routes/_auth+/sign-up.tsx"
          }
        ]
      },
      {
        "id": "routes/_builder+/_layout",
        "file": "routes/_builder+/_layout.tsx",
        "children": [
          {
            "id": "routes/_builder+/$",
            "path": "*",
            "file": "routes/_builder+/$.tsx"
          },
          {
            "id": "routes/_builder+/analytics",
            "path": "analytics",
            "file": "routes/_builder+/analytics.tsx"
          },
          {
            "id": "routes/_builder+/api",
            "path": "api",
            "file": "routes/_builder+/api.tsx"
          },
          {
            "id": "routes/_builder+/cases+/$caseId",
            "path": "cases/:caseId",
            "file": "routes/_builder+/cases+/$caseId.tsx"
          },
          {
            "id": "routes/_builder+/cases+/_index",
            "index": true,
            "path": "cases/",
            "file": "routes/_builder+/cases+/_index.tsx"
          },
          {
            "id": "routes/_builder+/cases+/inboxes._layout",
            "path": "cases/inboxes",
            "file": "routes/_builder+/cases+/inboxes._layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/cases+/inboxes.$inboxId",
                "path": ":inboxId",
                "file": "routes/_builder+/cases+/inboxes.$inboxId.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/data+/_layout",
            "path": "data",
            "file": "routes/_builder+/data+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/data+/list",
                "path": "list",
                "file": "routes/_builder+/data+/list.tsx"
              },
              {
                "id": "routes/_builder+/data+/schema",
                "path": "schema",
                "file": "routes/_builder+/data+/schema.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/decisions+/$decisionId",
            "path": "decisions/:decisionId",
            "file": "routes/_builder+/decisions+/$decisionId.tsx"
          },
          {
            "id": "routes/_builder+/decisions+/_index",
            "index": true,
            "path": "decisions/",
            "file": "routes/_builder+/decisions+/_index.tsx"
          },
          {
            "id": "routes/_builder+/lists+/$listId",
            "path": "lists/:listId",
            "file": "routes/_builder+/lists+/$listId.tsx"
          },
          {
            "id": "routes/_builder+/lists+/_index",
            "index": true,
            "path": "lists/",
            "file": "routes/_builder+/lists+/_index.tsx"
          },
          {
            "id": "routes/_builder+/scenarios+/$scenarioId+/_layout",
            "path": "scenarios/:scenarioId",
            "file": "routes/_builder+/scenarios+/$scenarioId+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/scenarios+/$scenarioId+/_index",
                "index": true,
                "file": "routes/_builder+/scenarios+/$scenarioId+/_index.tsx"
              },
              {
                "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout",
                "path": "i/:iterationId",
                "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout.tsx",
                "children": [
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_layout",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_layout.tsx",
                    "children": [
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_index",
                        "index": true,
                        "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_index.tsx"
                      },
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/decision",
                        "path": "decision",
                        "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/decision.tsx"
                      },
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/rules",
                        "path": "rules",
                        "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/rules.tsx"
                      },
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/trigger",
                        "path": "trigger",
                        "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/trigger.tsx"
                      }
                    ]
                  },
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/rules.$ruleId",
                    "path": "rules/:ruleId",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/rules.$ruleId.tsx"
                  }
                ]
              }
            ]
          },
          {
            "id": "routes/_builder+/scenarios+/_index",
            "index": true,
            "path": "scenarios/",
            "file": "routes/_builder+/scenarios+/_index.tsx"
          },
          {
            "id": "routes/_builder+/scheduled-executions",
            "path": "scheduled-executions",
            "file": "routes/_builder+/scheduled-executions.tsx"
          },
          {
            "id": "routes/_builder+/settings+/_layout",
            "path": "settings",
            "file": "routes/_builder+/settings+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/settings+/_index",
                "index": true,
                "file": "routes/_builder+/settings+/_index.tsx"
              },
              {
                "id": "routes/_builder+/settings+/api-keys",
                "path": "api-keys",
                "file": "routes/_builder+/settings+/api-keys.tsx"
              },
              {
                "id": "routes/_builder+/settings+/inboxes.$inboxId",
                "path": "inboxes/:inboxId",
                "file": "routes/_builder+/settings+/inboxes.$inboxId.tsx"
              },
              {
                "id": "routes/_builder+/settings+/inboxes._index",
                "index": true,
                "path": "inboxes/",
                "file": "routes/_builder+/settings+/inboxes._index.tsx"
              },
              {
                "id": "routes/_builder+/settings+/tags",
                "path": "tags",
                "file": "routes/_builder+/settings+/tags.tsx"
              },
              {
                "id": "routes/_builder+/settings+/users",
                "path": "users",
                "file": "routes/_builder+/settings+/users.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/upload+/$objectType",
            "path": "upload/:objectType",
            "file": "routes/_builder+/upload+/$objectType.tsx"
          }
        ]
      },
      {
        "id": "routes/_index",
        "index": true,
        "file": "routes/_index.tsx"
      },
      {
        "id": "routes/healthcheck",
        "path": "healthcheck",
        "file": "routes/healthcheck.ts"
      },
      {
        "id": "routes/ressources+/auth+/logout",
        "path": "ressources/auth/logout",
        "file": "routes/ressources+/auth+/logout.tsx"
      },
      {
        "id": "routes/ressources+/auth+/refresh",
        "path": "ressources/auth/refresh",
        "file": "routes/ressources+/auth+/refresh.tsx"
      },
      {
        "id": "routes/ressources+/cases+/add-comment",
        "path": "ressources/cases/add-comment",
        "file": "routes/ressources+/cases+/add-comment.tsx"
      },
      {
        "id": "routes/ressources+/cases+/add-to-case",
        "path": "ressources/cases/add-to-case",
        "file": "routes/ressources+/cases+/add-to-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/create-case",
        "path": "ressources/cases/create-case",
        "file": "routes/ressources+/cases+/create-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-inbox",
        "path": "ressources/cases/edit-inbox",
        "file": "routes/ressources+/cases+/edit-inbox.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-name",
        "path": "ressources/cases/edit-name",
        "file": "routes/ressources+/cases+/edit-name.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-status",
        "path": "ressources/cases/edit-status",
        "file": "routes/ressources+/cases+/edit-status.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-tags",
        "path": "ressources/cases/edit-tags",
        "file": "routes/ressources+/cases+/edit-tags.tsx"
      },
      {
        "id": "routes/ressources+/cases+/upload-file",
        "path": "ressources/cases/upload-file",
        "file": "routes/ressources+/cases+/upload-file.tsx"
      },
      {
        "id": "routes/ressources+/data+/createField",
        "path": "ressources/data/createField",
        "file": "routes/ressources+/data+/createField.tsx"
      },
      {
        "id": "routes/ressources+/data+/createLink",
        "path": "ressources/data/createLink",
        "file": "routes/ressources+/data+/createLink.tsx"
      },
      {
        "id": "routes/ressources+/data+/createTable",
        "path": "ressources/data/createTable",
        "file": "routes/ressources+/data+/createTable.tsx"
      },
      {
        "id": "routes/ressources+/data+/editField",
        "path": "ressources/data/editField",
        "file": "routes/ressources+/data+/editField.tsx"
      },
      {
        "id": "routes/ressources+/data+/editTable",
        "path": "ressources/data/editTable",
        "file": "routes/ressources+/data+/editTable.tsx"
      },
      {
        "id": "routes/ressources+/lists+/create",
        "path": "ressources/lists/create",
        "file": "routes/ressources+/lists+/create.tsx"
      },
      {
        "id": "routes/ressources+/lists+/delete",
        "path": "ressources/lists/delete",
        "file": "routes/ressources+/lists+/delete.tsx"
      },
      {
        "id": "routes/ressources+/lists+/edit",
        "path": "ressources/lists/edit",
        "file": "routes/ressources+/lists+/edit.tsx"
      },
      {
        "id": "routes/ressources+/lists+/value_create",
        "path": "ressources/lists/value_create",
        "file": "routes/ressources+/lists+/value_create.tsx"
      },
      {
        "id": "routes/ressources+/lists+/value_delete",
        "path": "ressources/lists/value_delete",
        "file": "routes/ressources+/lists+/value_delete.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate",
        "path": "ressources/scenarios/:scenarioId/:iterationId/activate",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit",
        "path": "ressources/scenarios/:scenarioId/:iterationId/commit",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft",
        "path": "ressources/scenarios/:scenarioId/:iterationId/create_draft",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate",
        "path": "ressources/scenarios/:scenarioId/:iterationId/deactivate",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare",
        "path": "ressources/scenarios/:scenarioId/:iterationId/prepare",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/create",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/delete",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate",
        "path": "ressources/scenarios/:scenarioId/:iterationId/rules/duplicate",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule",
        "path": "ressources/scenarios/:scenarioId/:iterationId/validate-with-given-trigger-or-rule",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/create",
        "path": "ressources/scenarios/create",
        "file": "routes/ressources+/scenarios+/create.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/update",
        "path": "ressources/scenarios/update",
        "file": "routes/ressources+/scenarios+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/api-keys+/create",
        "path": "ressources/settings/api-keys/create",
        "file": "routes/ressources+/settings+/api-keys+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/api-keys+/delete",
        "path": "ressources/settings/api-keys/delete",
        "file": "routes/ressources+/settings+/api-keys+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/create",
        "path": "ressources/settings/inboxes/create",
        "file": "routes/ressources+/settings+/inboxes+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/delete",
        "path": "ressources/settings/inboxes/delete",
        "file": "routes/ressources+/settings+/inboxes+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users.create",
        "path": "ressources/settings/inboxes/inbox-users/create",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users.create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users.delete",
        "path": "ressources/settings/inboxes/inbox-users/delete",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users.delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users.update",
        "path": "ressources/settings/inboxes/inbox-users/update",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users.update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/update",
        "path": "ressources/settings/inboxes/update",
        "file": "routes/ressources+/settings+/inboxes+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/tags+/create",
        "path": "ressources/settings/tags/create",
        "file": "routes/ressources+/settings+/tags+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/tags+/delete",
        "path": "ressources/settings/tags/delete",
        "file": "routes/ressources+/settings+/tags+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/tags+/update",
        "path": "ressources/settings/tags/update",
        "file": "routes/ressources+/settings+/tags+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/users+/create",
        "path": "ressources/settings/users/create",
        "file": "routes/ressources+/settings+/users+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/users+/delete",
        "path": "ressources/settings/users/delete",
        "file": "routes/ressources+/settings+/users+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/users+/update",
        "path": "ressources/settings/users/update",
        "file": "routes/ressources+/settings+/users+/update.tsx"
      },
      {
        "id": "routes/ressources+/user+/language",
        "path": "ressources/user/language",
        "file": "routes/ressources+/user+/language.tsx"
      }
    ]
  }
] as const;
