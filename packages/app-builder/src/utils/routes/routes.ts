export const routes = [
  {
    "id": "root",
    "path": "",
    "file": "root.tsx",
    "children": [
      {
        "id": "routes/$",
        "path": "*",
        "file": "routes/$.tsx"
      },
      {
        "id": "routes/_auth+/_layout",
        "file": "routes/_auth+/_layout.tsx",
        "children": [
          {
            "id": "routes/_auth+/create-password",
            "path": "create-password",
            "file": "routes/_auth+/create-password.tsx"
          },
          {
            "id": "routes/_auth+/email-verification",
            "path": "email-verification",
            "file": "routes/_auth+/email-verification.tsx"
          },
          {
            "id": "routes/_auth+/sign-in-email",
            "path": "sign-in-email",
            "file": "routes/_auth+/sign-in-email.tsx"
          },
          {
            "id": "routes/_auth+/sign-in",
            "path": "sign-in",
            "file": "routes/_auth+/sign-in.tsx"
          }
        ]
      },
      {
        "id": "routes/_builder+/_layout",
        "file": "routes/_builder+/_layout.tsx",
        "children": [
          {
            "id": "routes/_builder+/_analytics+/analytics._layout",
            "path": "analytics",
            "file": "routes/_builder+/_analytics+/analytics._layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/_analytics+/analytics.$scenarioId",
                "path": ":scenarioId",
                "file": "routes/_builder+/_analytics+/analytics.$scenarioId.tsx"
              },
              {
                "id": "routes/_builder+/_analytics+/analytics._index",
                "index": true,
                "file": "routes/_builder+/_analytics+/analytics._index.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/analytics-legacy",
            "path": "analytics-legacy",
            "file": "routes/_builder+/analytics-legacy.tsx"
          },
          {
            "id": "routes/_builder+/api",
            "path": "api",
            "file": "routes/_builder+/api.tsx"
          },
          {
            "id": "routes/_builder+/cases+/$caseId+/_index",
            "index": true,
            "path": "cases/:caseId",
            "file": "routes/_builder+/cases+/$caseId+/_index.tsx"
          },
          {
            "id": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_layout",
            "path": "cases/:caseId/d/:decisionId/screenings/:screeningId",
            "file": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_index",
                "index": true,
                "file": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_index.tsx"
              },
              {
                "id": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/files",
                "path": "files",
                "file": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/files.tsx"
              },
              {
                "id": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/hits",
                "path": "hits",
                "file": "routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/hits.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/cases+/_index",
            "index": true,
            "path": "cases",
            "file": "routes/_builder+/cases+/_index.tsx"
          },
          {
            "id": "routes/_builder+/cases+/inboxes.$inboxId",
            "path": "cases/inboxes/:inboxId",
            "file": "routes/_builder+/cases+/inboxes.$inboxId.tsx"
          },
          {
            "id": "routes/_builder+/cases+/inboxes.index",
            "index": true,
            "path": "cases/inboxes",
            "file": "routes/_builder+/cases+/inboxes.index.tsx"
          },
          {
            "id": "routes/_builder+/data+/_layout",
            "path": "data",
            "file": "routes/_builder+/data+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/data+/_index",
                "index": true,
                "file": "routes/_builder+/data+/_index.tsx"
              },
              {
                "id": "routes/_builder+/data+/list",
                "path": "list",
                "file": "routes/_builder+/data+/list.tsx"
              },
              {
                "id": "routes/_builder+/data+/schema",
                "path": "schema",
                "file": "routes/_builder+/data+/schema.tsx"
              },
              {
                "id": "routes/_builder+/data+/view",
                "path": "view",
                "file": "routes/_builder+/data+/view.tsx",
                "children": [
                  {
                    "id": "routes/_builder+/data+/view.$tableName.$objectId",
                    "path": ":tableName/:objectId",
                    "file": "routes/_builder+/data+/view.$tableName.$objectId.tsx"
                  }
                ]
              }
            ]
          },
          {
            "id": "routes/_builder+/decisions+/_layout",
            "path": "decisions",
            "file": "routes/_builder+/decisions+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/decisions+/$decisionId",
                "path": ":decisionId",
                "file": "routes/_builder+/decisions+/$decisionId.tsx"
              },
              {
                "id": "routes/_builder+/decisions+/_index",
                "index": true,
                "file": "routes/_builder+/decisions+/_index.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/lists+/_layout",
            "path": "lists",
            "file": "routes/_builder+/lists+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/lists+/$listId",
                "path": ":listId",
                "file": "routes/_builder+/lists+/$listId.tsx"
              },
              {
                "id": "routes/_builder+/lists+/_index",
                "index": true,
                "file": "routes/_builder+/lists+/_index.tsx"
              }
            ]
          },
          {
            "id": "routes/_builder+/scenarios+/_layout",
            "path": "scenarios",
            "file": "routes/_builder+/scenarios+/_layout.tsx",
            "children": [
              {
                "id": "routes/_builder+/scenarios+/$scenarioId+/_layout",
                "path": ":scenarioId",
                "file": "routes/_builder+/scenarios+/$scenarioId+/_layout.tsx",
                "children": [
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/_index",
                    "index": true,
                    "file": "routes/_builder+/scenarios+/$scenarioId+/_index.tsx"
                  },
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/home",
                    "path": "home",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/home.tsx"
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
                      },
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/screenings.$screeningId",
                        "path": "screenings/:screeningId",
                        "file": "routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/screenings.$screeningId.tsx"
                      }
                    ]
                  },
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/scheduled-executions",
                    "path": "scheduled-executions",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/scheduled-executions.tsx"
                  },
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/test-run+/_layout",
                    "path": "test-run",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/test-run+/_layout.tsx",
                    "children": [
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId+/index",
                        "index": true,
                        "path": ":testRunId",
                        "file": "routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId+/index.tsx"
                      },
                      {
                        "id": "routes/_builder+/scenarios+/$scenarioId+/test-run+/index",
                        "index": true,
                        "file": "routes/_builder+/scenarios+/$scenarioId+/test-run+/index.tsx"
                      }
                    ]
                  },
                  {
                    "id": "routes/_builder+/scenarios+/$scenarioId+/workflow",
                    "path": "workflow",
                    "file": "routes/_builder+/scenarios+/$scenarioId+/workflow.tsx"
                  }
                ]
              },
              {
                "id": "routes/_builder+/scenarios+/_index",
                "index": true,
                "file": "routes/_builder+/scenarios+/_index.tsx"
              }
            ]
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
                "id": "routes/_builder+/settings+/ai-case-review",
                "path": "ai-case-review",
                "file": "routes/_builder+/settings+/ai-case-review.tsx"
              },
              {
                "id": "routes/_builder+/settings+/analytics+/filters",
                "path": "analytics/filters",
                "file": "routes/_builder+/settings+/analytics+/filters.tsx"
              },
              {
                "id": "routes/_builder+/settings+/api-keys",
                "path": "api-keys",
                "file": "routes/_builder+/settings+/api-keys.tsx"
              },
              {
                "id": "routes/_builder+/settings+/data-display",
                "path": "data-display",
                "file": "routes/_builder+/settings+/data-display.tsx"
              },
              {
                "id": "routes/_builder+/settings+/inboxes.$inboxId",
                "path": "inboxes/:inboxId",
                "file": "routes/_builder+/settings+/inboxes.$inboxId.tsx"
              },
              {
                "id": "routes/_builder+/settings+/inboxes._index",
                "index": true,
                "path": "inboxes",
                "file": "routes/_builder+/settings+/inboxes._index.tsx"
              },
              {
                "id": "routes/_builder+/settings+/ip-whitelisting",
                "path": "ip-whitelisting",
                "file": "routes/_builder+/settings+/ip-whitelisting.tsx"
              },
              {
                "id": "routes/_builder+/settings+/scenarios+/_index",
                "index": true,
                "path": "scenarios",
                "file": "routes/_builder+/settings+/scenarios+/_index.tsx"
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
              },
              {
                "id": "routes/_builder+/settings+/webhooks",
                "path": "webhooks",
                "file": "routes/_builder+/settings+/webhooks.tsx"
              },
              {
                "id": "routes/_builder+/settings+/webhooks_.$webhookId",
                "path": "webhooks/:webhookId",
                "file": "routes/_builder+/settings+/webhooks_.$webhookId.tsx"
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
        "id": "routes/app-router",
        "path": "app-router",
        "file": "routes/app-router.tsx"
      },
      {
        "id": "routes/healthcheck",
        "path": "healthcheck",
        "file": "routes/healthcheck.ts"
      },
      {
        "id": "routes/oidc+/auth",
        "path": "oidc/auth",
        "file": "routes/oidc+/auth.ts"
      },
      {
        "id": "routes/oidc+/callback",
        "path": "oidc/callback",
        "file": "routes/oidc+/callback.ts"
      },
      {
        "id": "routes/ressources+/analytics+/$scenarioId+/available_filters",
        "path": "ressources/analytics/:scenarioId/available_filters",
        "file": "routes/ressources+/analytics+/$scenarioId+/available_filters.ts"
      },
      {
        "id": "routes/ressources+/analytics+/$scenarioId+/query",
        "path": "ressources/analytics/:scenarioId/query",
        "file": "routes/ressources+/analytics+/$scenarioId+/query.ts"
      },
      {
        "id": "routes/ressources+/annotations+/download-file.$annotationId.$fileId",
        "path": "ressources/annotations/download-file/:annotationId/:fileId",
        "file": "routes/ressources+/annotations+/download-file.$annotationId.$fileId.tsx"
      },
      {
        "id": "routes/ressources+/app-config",
        "path": "ressources/app-config",
        "file": "routes/ressources+/app-config.tsx"
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
        "id": "routes/ressources+/cases+/$caseId+/decisions",
        "path": "ressources/cases/:caseId/decisions",
        "file": "routes/ressources+/cases+/$caseId+/decisions.tsx"
      },
      {
        "id": "routes/ressources+/cases+/$caseId+/enrich-kyc",
        "path": "ressources/cases/:caseId/enrich-kyc",
        "file": "routes/ressources+/cases+/$caseId+/enrich-kyc.ts"
      },
      {
        "id": "routes/ressources+/cases+/$caseId+/review.$reviewId.add-to-case-comments",
        "path": "ressources/cases/:caseId/review/:reviewId/add-to-case-comments",
        "file": "routes/ressources+/cases+/$caseId+/review.$reviewId.add-to-case-comments.tsx"
      },
      {
        "id": "routes/ressources+/cases+/$caseId+/review.$reviewId.feedback",
        "path": "ressources/cases/:caseId/review/:reviewId/feedback",
        "file": "routes/ressources+/cases+/$caseId+/review.$reviewId.feedback.tsx"
      },
      {
        "id": "routes/ressources+/cases+/$caseId.enqueue-review",
        "path": "ressources/cases/:caseId/enqueue-review",
        "file": "routes/ressources+/cases+/$caseId.enqueue-review.tsx"
      },
      {
        "id": "routes/ressources+/cases+/$caseId.rules-by-pivot",
        "path": "ressources/cases/:caseId/rules-by-pivot",
        "file": "routes/ressources+/cases+/$caseId.rules-by-pivot.tsx"
      },
      {
        "id": "routes/ressources+/cases+/$inboxId.cases",
        "path": "ressources/cases/:inboxId/cases",
        "file": "routes/ressources+/cases+/$inboxId.cases.tsx"
      },
      {
        "id": "routes/ressources+/cases+/add-comment",
        "path": "ressources/cases/add-comment",
        "file": "routes/ressources+/cases+/add-comment.tsx"
      },
      {
        "id": "routes/ressources+/cases+/add-rule-snooze",
        "path": "ressources/cases/add-rule-snooze",
        "file": "routes/ressources+/cases+/add-rule-snooze.tsx"
      },
      {
        "id": "routes/ressources+/cases+/add-to-case",
        "path": "ressources/cases/add-to-case",
        "file": "routes/ressources+/cases+/add-to-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/close-case",
        "path": "ressources/cases/close-case",
        "file": "routes/ressources+/cases+/close-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/create-case",
        "path": "ressources/cases/create-case",
        "file": "routes/ressources+/cases+/create-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/download-data.$caseId",
        "path": "ressources/cases/download-data/:caseId",
        "file": "routes/ressources+/cases+/download-data.$caseId.tsx"
      },
      {
        "id": "routes/ressources+/cases+/download-file.$fileId",
        "path": "ressources/cases/download-file/:fileId",
        "file": "routes/ressources+/cases+/download-file.$fileId.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-assignee",
        "path": "ressources/cases/edit-assignee",
        "file": "routes/ressources+/cases+/edit-assignee.tsx"
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
        "id": "routes/ressources+/cases+/edit-suspicion",
        "path": "ressources/cases/edit-suspicion",
        "file": "routes/ressources+/cases+/edit-suspicion.tsx"
      },
      {
        "id": "routes/ressources+/cases+/edit-tags",
        "path": "ressources/cases/edit-tags",
        "file": "routes/ressources+/cases+/edit-tags.tsx"
      },
      {
        "id": "routes/ressources+/cases+/escalate-case",
        "path": "ressources/cases/escalate-case",
        "file": "routes/ressources+/cases+/escalate-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/get-inboxes",
        "path": "ressources/cases/get-inboxes",
        "file": "routes/ressources+/cases+/get-inboxes.tsx"
      },
      {
        "id": "routes/ressources+/cases+/mass-update",
        "path": "ressources/cases/mass-update",
        "file": "routes/ressources+/cases+/mass-update.tsx"
      },
      {
        "id": "routes/ressources+/cases+/open-case",
        "path": "ressources/cases/open-case",
        "file": "routes/ressources+/cases+/open-case.tsx"
      },
      {
        "id": "routes/ressources+/cases+/pivot+/related+/$pivotValue._index",
        "index": true,
        "path": "ressources/cases/pivot/related/:pivotValue",
        "file": "routes/ressources+/cases+/pivot+/related+/$pivotValue._index.tsx"
      },
      {
        "id": "routes/ressources+/cases+/review-decision",
        "path": "ressources/cases/review-decision",
        "file": "routes/ressources+/cases+/review-decision.tsx"
      },
      {
        "id": "routes/ressources+/cases+/review-screening-match",
        "path": "ressources/cases/review-screening-match",
        "file": "routes/ressources+/cases+/review-screening-match.tsx"
      },
      {
        "id": "routes/ressources+/cases+/sar+/download.$caseId.$reportId",
        "path": "ressources/cases/sar/download/:caseId/:reportId",
        "file": "routes/ressources+/cases+/sar+/download.$caseId.$reportId.tsx"
      },
      {
        "id": "routes/ressources+/cases+/snooze-case",
        "path": "ressources/cases/snooze-case",
        "file": "routes/ressources+/cases+/snooze-case.tsx"
      },
      {
        "id": "routes/ressources+/data+/$tableId.createNavigationOption",
        "path": "ressources/data/:tableId/createNavigationOption",
        "file": "routes/ressources+/data+/$tableId.createNavigationOption.tsx"
      },
      {
        "id": "routes/ressources+/data+/$tableName.list-objects",
        "path": "ressources/data/:tableName/list-objects",
        "file": "routes/ressources+/data+/$tableName.list-objects.tsx"
      },
      {
        "id": "routes/ressources+/data+/create-annotation",
        "path": "ressources/data/create-annotation",
        "file": "routes/ressources+/data+/create-annotation.tsx"
      },
      {
        "id": "routes/ressources+/data+/create-pivot",
        "path": "ressources/data/create-pivot",
        "file": "routes/ressources+/data+/create-pivot.tsx"
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
        "id": "routes/ressources+/data+/data-model",
        "path": "ressources/data/data-model",
        "file": "routes/ressources+/data+/data-model.tsx"
      },
      {
        "id": "routes/ressources+/data+/delete-annotation.$annotationId",
        "path": "ressources/data/delete-annotation/:annotationId",
        "file": "routes/ressources+/data+/delete-annotation.$annotationId.tsx"
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
        "id": "routes/ressources+/decisions+/$decisionId",
        "path": "ressources/decisions/:decisionId",
        "file": "routes/ressources+/decisions+/$decisionId.tsx"
      },
      {
        "id": "routes/ressources+/decisions+/list-scheduled-execution",
        "path": "ressources/decisions/list-scheduled-execution",
        "file": "routes/ressources+/decisions+/list-scheduled-execution.tsx"
      },
      {
        "id": "routes/ressources+/ingestion+/upload.$objectType",
        "path": "ressources/ingestion/upload/:objectType",
        "file": "routes/ressources+/ingestion+/upload.$objectType.tsx"
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
        "id": "routes/ressources+/lists+/download-csv-file.$listId",
        "path": "ressources/lists/download-csv-file/:listId",
        "file": "routes/ressources+/lists+/download-csv-file.$listId.tsx"
      },
      {
        "id": "routes/ressources+/lists+/edit",
        "path": "ressources/lists/edit",
        "file": "routes/ressources+/lists+/edit.tsx"
      },
      {
        "id": "routes/ressources+/lists+/upload.$listId",
        "path": "ressources/lists/upload/:listId",
        "file": "routes/ressources+/lists+/upload.$listId.tsx"
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
        "id": "routes/ressources+/locales",
        "path": "ressources/locales",
        "file": "routes/ressources+/locales.ts"
      },
      {
        "id": "routes/ressources+/opensanctions+/dataset-freshness",
        "path": "ressources/opensanctions/dataset-freshness",
        "file": "routes/ressources+/opensanctions+/dataset-freshness.tsx"
      },
      {
        "id": "routes/ressources+/rule-snoozes+/read.$ruleSnoozeId",
        "path": "ressources/rule-snoozes/read/:ruleSnoozeId",
        "file": "routes/ressources+/rule-snoozes+/read.$ruleSnoozeId.tsx"
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
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create-draft",
        "path": "ressources/scenarios/:scenarioId/:iterationId/create-draft",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create-draft.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate",
        "path": "ressources/scenarios/:scenarioId/:iterationId/deactivate",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/get-rule-snoozes",
        "path": "ressources/scenarios/:scenarioId/:iterationId/get-rule-snoozes",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/get-rule-snoozes.tsx"
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
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/screenings+/$screeningId+/delete",
        "path": "ressources/scenarios/:scenarioId/:iterationId/screenings/:screeningId/delete",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/screenings+/$screeningId+/delete.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/screenings+/create",
        "path": "ressources/scenarios/:scenarioId/:iterationId/screenings/create",
        "file": "routes/ressources+/scenarios+/$scenarioId+/$iterationId+/screenings+/create.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/builder-options",
        "path": "ressources/scenarios/:scenarioId/builder-options",
        "file": "routes/ressources+/scenarios+/$scenarioId+/builder-options.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/testrun+/$testRunId+/cancel",
        "path": "ressources/scenarios/:scenarioId/testrun/:testRunId/cancel",
        "file": "routes/ressources+/scenarios+/$scenarioId+/testrun+/$testRunId+/cancel.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/testrun+/create",
        "path": "ressources/scenarios/:scenarioId/testrun/create",
        "file": "routes/ressources+/scenarios+/$scenarioId+/testrun+/create.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/$scenarioId+/validate-ast",
        "path": "ressources/scenarios/:scenarioId/validate-ast",
        "file": "routes/ressources+/scenarios+/$scenarioId+/validate-ast.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/create",
        "path": "ressources/scenarios/create",
        "file": "routes/ressources+/scenarios+/create.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/iteration+/$iterationId.get-rules",
        "path": "ressources/scenarios/iteration/:iterationId/get-rules",
        "file": "routes/ressources+/scenarios+/iteration+/$iterationId.get-rules.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/rule-description",
        "path": "ressources/scenarios/rule-description",
        "file": "routes/ressources+/scenarios+/rule-description.tsx"
      },
      {
        "id": "routes/ressources+/scenarios+/update",
        "path": "ressources/scenarios/update",
        "file": "routes/ressources+/scenarios+/update.tsx"
      },
      {
        "id": "routes/ressources+/screenings+/download.$screeningId.$fileId",
        "path": "ressources/screenings/download/:screeningId/:fileId",
        "file": "routes/ressources+/screenings+/download.$screeningId.$fileId.tsx"
      },
      {
        "id": "routes/ressources+/screenings+/enrich-match.$matchId",
        "path": "ressources/screenings/enrich-match/:matchId",
        "file": "routes/ressources+/screenings+/enrich-match.$matchId.tsx"
      },
      {
        "id": "routes/ressources+/screenings+/refine",
        "path": "ressources/screenings/refine",
        "file": "routes/ressources+/screenings+/refine.tsx"
      },
      {
        "id": "routes/ressources+/screenings+/search",
        "path": "ressources/screenings/search",
        "file": "routes/ressources+/screenings+/search.tsx"
      },
      {
        "id": "routes/ressources+/screenings+/upload.$screeningId",
        "path": "ressources/screenings/upload/:screeningId",
        "file": "routes/ressources+/screenings+/upload.$screeningId.tsx"
      },
      {
        "id": "routes/ressources+/settings+/ai-review+/_index",
        "index": true,
        "path": "ressources/settings/ai-review",
        "file": "routes/ressources+/settings+/ai-review+/_index.tsx"
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
        "id": "routes/ressources+/settings+/data-model+/tables+/$tableId+/exported-fields+/delete",
        "path": "ressources/settings/data-model/tables/:tableId/exported-fields/delete",
        "file": "routes/ressources+/settings+/data-model+/tables+/$tableId+/exported-fields+/delete.ts"
      },
      {
        "id": "routes/ressources+/settings+/data-model+/tables+/$tableId+/exported-fields+/update",
        "path": "ressources/settings/data-model/tables/:tableId/exported-fields/update",
        "file": "routes/ressources+/settings+/data-model+/tables+/$tableId+/exported-fields+/update.ts"
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
        "id": "routes/ressources+/settings+/inboxes+/inbox-users+/create",
        "path": "ressources/settings/inboxes/inbox-users/create",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users+/delete",
        "path": "ressources/settings/inboxes/inbox-users/delete",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users+/edit-auto-assign",
        "path": "ressources/settings/inboxes/inbox-users/edit-auto-assign",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users+/edit-auto-assign.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/inbox-users+/update",
        "path": "ressources/settings/inboxes/inbox-users/update",
        "file": "routes/ressources+/settings+/inboxes+/inbox-users+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/inboxes+/update",
        "path": "ressources/settings/inboxes/update",
        "file": "routes/ressources+/settings+/inboxes+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/organization+/$organizationId.update-allowed-networks",
        "path": "ressources/settings/organization/:organizationId/update-allowed-networks",
        "file": "routes/ressources+/settings+/organization+/$organizationId.update-allowed-networks.tsx"
      },
      {
        "id": "routes/ressources+/settings+/organization+/update",
        "path": "ressources/settings/organization/update",
        "file": "routes/ressources+/settings+/organization+/update.tsx"
      },
      {
        "id": "routes/ressources+/settings+/personal+/unavailability+/_index",
        "index": true,
        "path": "ressources/settings/personal/unavailability",
        "file": "routes/ressources+/settings+/personal+/unavailability+/_index.ts"
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
        "id": "routes/ressources+/settings+/webhooks+/create",
        "path": "ressources/settings/webhooks/create",
        "file": "routes/ressources+/settings+/webhooks+/create.tsx"
      },
      {
        "id": "routes/ressources+/settings+/webhooks+/delete",
        "path": "ressources/settings/webhooks/delete",
        "file": "routes/ressources+/settings+/webhooks+/delete.tsx"
      },
      {
        "id": "routes/ressources+/settings+/webhooks+/update",
        "path": "ressources/settings/webhooks/update",
        "file": "routes/ressources+/settings+/webhooks+/update.tsx"
      },
      {
        "id": "routes/ressources+/user+/language",
        "path": "ressources/user/language",
        "file": "routes/ressources+/user+/language.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/$scenarioId+/_index",
        "index": true,
        "path": "ressources/workflows/:scenarioId",
        "file": "routes/ressources+/workflows+/$scenarioId+/_index.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/$scenarioId+/latest-references",
        "path": "ressources/workflows/:scenarioId/latest-references",
        "file": "routes/ressources+/workflows+/$scenarioId+/latest-references.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/$scenarioId+/reorder",
        "path": "ressources/workflows/:scenarioId/reorder",
        "file": "routes/ressources+/workflows+/$scenarioId+/reorder.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/$scenarioId.reorder",
        "path": "ressources/workflows/:scenarioId/reorder",
        "file": "routes/ressources+/workflows+/$scenarioId.reorder.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/inboxes",
        "path": "ressources/workflows/inboxes",
        "file": "routes/ressources+/workflows+/inboxes.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/rule+/$ruleId+/_index",
        "index": true,
        "path": "ressources/workflows/rule/:ruleId",
        "file": "routes/ressources+/workflows+/rule+/$ruleId+/_index.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/rule+/$ruleId+/condition+/$conditionId",
        "path": "ressources/workflows/rule/:ruleId/condition/:conditionId",
        "file": "routes/ressources+/workflows+/rule+/$ruleId+/condition+/$conditionId.tsx"
      },
      {
        "id": "routes/ressources+/workflows+/rule+/$ruleId+/rename",
        "path": "ressources/workflows/rule/:ruleId/rename",
        "file": "routes/ressources+/workflows+/rule+/$ruleId+/rename.ts"
      },
      {
        "id": "routes/ressources+/workflows+/rule+/_index",
        "index": true,
        "path": "ressources/workflows/rule",
        "file": "routes/ressources+/workflows+/rule+/_index.tsx"
      },
      {
        "id": "routes/transfercheck+/_layout",
        "path": "transfercheck",
        "file": "routes/transfercheck+/_layout.tsx",
        "children": [
          {
            "id": "routes/transfercheck+/$",
            "path": "*",
            "file": "routes/transfercheck+/$.tsx"
          },
          {
            "id": "routes/transfercheck+/_index",
            "index": true,
            "file": "routes/transfercheck+/_index.tsx"
          },
          {
            "id": "routes/transfercheck+/alerts+/_.received.$alertId",
            "path": "alerts/received/:alertId",
            "file": "routes/transfercheck+/alerts+/_.received.$alertId.tsx"
          },
          {
            "id": "routes/transfercheck+/alerts+/_.sent.$alertId",
            "path": "alerts/sent/:alertId",
            "file": "routes/transfercheck+/alerts+/_.sent.$alertId.tsx"
          },
          {
            "id": "routes/transfercheck+/alerts+/_layout",
            "path": "alerts",
            "file": "routes/transfercheck+/alerts+/_layout.tsx",
            "children": [
              {
                "id": "routes/transfercheck+/alerts+/_index",
                "index": true,
                "file": "routes/transfercheck+/alerts+/_index.tsx"
              },
              {
                "id": "routes/transfercheck+/alerts+/received",
                "path": "received",
                "file": "routes/transfercheck+/alerts+/received.tsx"
              },
              {
                "id": "routes/transfercheck+/alerts+/sent",
                "path": "sent",
                "file": "routes/transfercheck+/alerts+/sent.tsx"
              }
            ]
          },
          {
            "id": "routes/transfercheck+/ressources+/alert.create",
            "path": "ressources/alert/create",
            "file": "routes/transfercheck+/ressources+/alert.create.tsx"
          },
          {
            "id": "routes/transfercheck+/ressources+/alert.update",
            "path": "ressources/alert/update",
            "file": "routes/transfercheck+/ressources+/alert.update.tsx",
            "children": [
              {
                "id": "routes/transfercheck+/ressources+/alert.update.status",
                "path": "status",
                "file": "routes/transfercheck+/ressources+/alert.update.status.tsx"
              }
            ]
          },
          {
            "id": "routes/transfercheck+/transfers+/$transferId",
            "path": "transfers/:transferId",
            "file": "routes/transfercheck+/transfers+/$transferId.tsx"
          },
          {
            "id": "routes/transfercheck+/transfers+/_index",
            "index": true,
            "path": "transfers",
            "file": "routes/transfercheck+/transfers+/_index.tsx"
          }
        ]
      }
    ]
  }
] as const;
