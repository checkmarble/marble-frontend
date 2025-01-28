export type RoutePath =
  | '/'
  | '/*'
  | '/email-verification'
  | '/forgot-password'
  | '/sign-in'
  | '/sign-up'
  | '/analytics'
  | '/api'
  | '/cases/:caseId'
  | '/cases/:caseId/decisions'
  | '/cases/:caseId/files'
  | '/cases/:caseId/information'
  | '/cases/'
  | '/cases/inboxes'
  | '/cases/inboxes/:inboxId'
  | '/data'
  | '/data/list'
  | '/data/schema'
  | '/decisions'
  | '/decisions/:decisionId'
  | '/lists'
  | '/lists/:listId'
  | '/scenarios'
  | '/scenarios/:scenarioId'
  | '/scenarios/:scenarioId/home'
  | '/scenarios/:scenarioId/i/:iterationId'
  | '/scenarios/:scenarioId/i/:iterationId/decision'
  | '/scenarios/:scenarioId/i/:iterationId/rules'
  | '/scenarios/:scenarioId/i/:iterationId/trigger'
  | '/scenarios/:scenarioId/i/:iterationId/rules/:ruleId'
  | '/scenarios/:scenarioId/scheduled-executions'
  | '/scenarios/:scenarioId/test-run'
  | '/scenarios/:scenarioId/test-run/:testRunId/'
  | '/scenarios/:scenarioId/workflow'
  | '/settings'
  | '/settings/api-keys'
  | '/settings/inboxes/:inboxId'
  | '/settings/inboxes/'
  | '/settings/scenarios'
  | '/settings/tags'
  | '/settings/users'
  | '/settings/webhooks'
  | '/settings/webhooks/:webhookId'
  | '/upload/:objectType'
  | '/app-router'
  | '/healthcheck'
  | '/ressources/auth/logout'
  | '/ressources/auth/refresh'
  | '/ressources/cases/add-comment'
  | '/ressources/cases/add-rule-snooze'
  | '/ressources/cases/add-to-case'
  | '/ressources/cases/create-case'
  | '/ressources/cases/edit-inbox'
  | '/ressources/cases/edit-name'
  | '/ressources/cases/edit-status'
  | '/ressources/cases/edit-tags'
  | '/ressources/cases/review-decision'
  | '/ressources/cases/upload-file'
  | '/ressources/data/create-pivot'
  | '/ressources/data/createField'
  | '/ressources/data/createLink'
  | '/ressources/data/createTable'
  | '/ressources/data/editField'
  | '/ressources/data/editTable'
  | '/ressources/decisions/list-scheduled-execution'
  | '/ressources/lists/create'
  | '/ressources/lists/delete'
  | '/ressources/lists/edit'
  | '/ressources/lists/value_create'
  | '/ressources/lists/value_delete'
  | '/ressources/locales'
  | '/ressources/rule-snoozes/read/:ruleSnoozeId'
  | '/ressources/scenarios/:scenarioId/:iterationId/activate'
  | '/ressources/scenarios/:scenarioId/:iterationId/commit'
  | '/ressources/scenarios/:scenarioId/:iterationId/create_draft'
  | '/ressources/scenarios/:scenarioId/:iterationId/deactivate'
  | '/ressources/scenarios/:scenarioId/:iterationId/prepare'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/create'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/delete'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/duplicate'
  | '/ressources/scenarios/:scenarioId/:iterationId/validate-with-given-trigger-or-rule'
  | '/ressources/scenarios/:scenarioId/testrun/:testRunId/cancel'
  | '/ressources/scenarios/:scenarioId/testrun/create'
  | '/ressources/scenarios/:scenarioId/validate-ast'
  | '/ressources/scenarios/create'
  | '/ressources/scenarios/update'
  | '/ressources/settings/api-keys/create'
  | '/ressources/settings/api-keys/delete'
  | '/ressources/settings/edit-org-default-timezone'
  | '/ressources/settings/inboxes/create'
  | '/ressources/settings/inboxes/delete'
  | '/ressources/settings/inboxes/inbox-users/create'
  | '/ressources/settings/inboxes/inbox-users/delete'
  | '/ressources/settings/inboxes/inbox-users/update'
  | '/ressources/settings/inboxes/update'
  | '/ressources/settings/tags/create'
  | '/ressources/settings/tags/delete'
  | '/ressources/settings/tags/update'
  | '/ressources/settings/users/create'
  | '/ressources/settings/users/delete'
  | '/ressources/settings/users/update'
  | '/ressources/settings/webhooks/create'
  | '/ressources/settings/webhooks/delete'
  | '/ressources/settings/webhooks/update'
  | '/ressources/user/language'
  | '/transfercheck'
  | '/transfercheck/*'
  | '/transfercheck/alerts/received/:alertId'
  | '/transfercheck/alerts/sent/:alertId'
  | '/transfercheck/alerts'
  | '/transfercheck/alerts/received'
  | '/transfercheck/alerts/sent'
  | '/transfercheck/ressources/alert/create'
  | '/transfercheck/ressources/alert/update'
  | '/transfercheck/ressources/alert/update/status'
  | '/transfercheck/transfers/:transferId'
  | '/transfercheck/transfers/';

export type RouteID =
  | 'root'
  | 'routes/$'
  | 'routes/_auth+/_layout'
  | 'routes/_auth+/email-verification'
  | 'routes/_auth+/forgot-password'
  | 'routes/_auth+/sign-in'
  | 'routes/_auth+/sign-up'
  | 'routes/_builder+/_layout'
  | 'routes/_builder+/analytics'
  | 'routes/_builder+/api'
  | 'routes/_builder+/cases+/$caseId._layout'
  | 'routes/_builder+/cases+/$caseId._index'
  | 'routes/_builder+/cases+/$caseId.decisions'
  | 'routes/_builder+/cases+/$caseId.files'
  | 'routes/_builder+/cases+/$caseId.information'
  | 'routes/_builder+/cases+/_index'
  | 'routes/_builder+/cases+/inboxes._layout'
  | 'routes/_builder+/cases+/inboxes.$inboxId'
  | 'routes/_builder+/data+/_layout'
  | 'routes/_builder+/data+/_index'
  | 'routes/_builder+/data+/list'
  | 'routes/_builder+/data+/schema'
  | 'routes/_builder+/decisions+/_layout'
  | 'routes/_builder+/decisions+/$decisionId'
  | 'routes/_builder+/decisions+/_index'
  | 'routes/_builder+/lists+/_layout'
  | 'routes/_builder+/lists+/$listId'
  | 'routes/_builder+/lists+/_index'
  | 'routes/_builder+/scenarios+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/_index'
  | 'routes/_builder+/scenarios+/$scenarioId+/home'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/_index'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/decision'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/rules'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_edit-view+/trigger'
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/rules.$ruleId'
  | 'routes/_builder+/scenarios+/$scenarioId+/scheduled-executions'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId+/index'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/index'
  | 'routes/_builder+/scenarios+/$scenarioId+/workflow'
  | 'routes/_builder+/scenarios+/_index'
  | 'routes/_builder+/settings+/_layout'
  | 'routes/_builder+/settings+/_index'
  | 'routes/_builder+/settings+/api-keys'
  | 'routes/_builder+/settings+/inboxes.$inboxId'
  | 'routes/_builder+/settings+/inboxes._index'
  | 'routes/_builder+/settings+/scenarios'
  | 'routes/_builder+/settings+/tags'
  | 'routes/_builder+/settings+/users'
  | 'routes/_builder+/settings+/webhooks'
  | 'routes/_builder+/settings+/webhooks_.$webhookId'
  | 'routes/_builder+/upload+/$objectType'
  | 'routes/_index'
  | 'routes/app-router'
  | 'routes/healthcheck'
  | 'routes/ressources+/auth+/logout'
  | 'routes/ressources+/auth+/refresh'
  | 'routes/ressources+/cases+/add-comment'
  | 'routes/ressources+/cases+/add-rule-snooze'
  | 'routes/ressources+/cases+/add-to-case'
  | 'routes/ressources+/cases+/create-case'
  | 'routes/ressources+/cases+/edit-inbox'
  | 'routes/ressources+/cases+/edit-name'
  | 'routes/ressources+/cases+/edit-status'
  | 'routes/ressources+/cases+/edit-tags'
  | 'routes/ressources+/cases+/review-decision'
  | 'routes/ressources+/cases+/upload-file'
  | 'routes/ressources+/data+/create-pivot'
  | 'routes/ressources+/data+/createField'
  | 'routes/ressources+/data+/createLink'
  | 'routes/ressources+/data+/createTable'
  | 'routes/ressources+/data+/editField'
  | 'routes/ressources+/data+/editTable'
  | 'routes/ressources+/decisions+/list-scheduled-execution'
  | 'routes/ressources+/lists+/create'
  | 'routes/ressources+/lists+/delete'
  | 'routes/ressources+/lists+/edit'
  | 'routes/ressources+/lists+/value_create'
  | 'routes/ressources+/lists+/value_delete'
  | 'routes/ressources+/locales'
  | 'routes/ressources+/rule-snoozes+/read.$ruleSnoozeId'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule'
  | 'routes/ressources+/scenarios+/$scenarioId+/testrun+/$testRunId+/cancel'
  | 'routes/ressources+/scenarios+/$scenarioId+/testrun+/create'
  | 'routes/ressources+/scenarios+/$scenarioId+/validate-ast'
  | 'routes/ressources+/scenarios+/create'
  | 'routes/ressources+/scenarios+/update'
  | 'routes/ressources+/settings+/api-keys+/create'
  | 'routes/ressources+/settings+/api-keys+/delete'
  | 'routes/ressources+/settings+/edit-org-default-timezone'
  | 'routes/ressources+/settings+/inboxes+/create'
  | 'routes/ressources+/settings+/inboxes+/delete'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.create'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.delete'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.update'
  | 'routes/ressources+/settings+/inboxes+/update'
  | 'routes/ressources+/settings+/tags+/create'
  | 'routes/ressources+/settings+/tags+/delete'
  | 'routes/ressources+/settings+/tags+/update'
  | 'routes/ressources+/settings+/users+/create'
  | 'routes/ressources+/settings+/users+/delete'
  | 'routes/ressources+/settings+/users+/update'
  | 'routes/ressources+/settings+/webhooks+/create'
  | 'routes/ressources+/settings+/webhooks+/delete'
  | 'routes/ressources+/settings+/webhooks+/update'
  | 'routes/ressources+/user+/language'
  | 'routes/transfercheck+/_layout'
  | 'routes/transfercheck+/$'
  | 'routes/transfercheck+/_index'
  | 'routes/transfercheck+/alerts+/_.received.$alertId'
  | 'routes/transfercheck+/alerts+/_.sent.$alertId'
  | 'routes/transfercheck+/alerts+/_layout'
  | 'routes/transfercheck+/alerts+/_index'
  | 'routes/transfercheck+/alerts+/received'
  | 'routes/transfercheck+/alerts+/sent'
  | 'routes/transfercheck+/ressources+/alert.create'
  | 'routes/transfercheck+/ressources+/alert.update'
  | 'routes/transfercheck+/ressources+/alert.update.status'
  | 'routes/transfercheck+/transfers+/$transferId'
  | 'routes/transfercheck+/transfers+/_index';
