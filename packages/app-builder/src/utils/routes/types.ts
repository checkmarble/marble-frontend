export type RoutePath =
  | '/'
  | '/*'
  | '/create-password'
  | '/email-verification'
  | '/sign-in-email'
  | '/sign-in'
  | '/analytics'
  | '/api'
  | '/cases/:caseId'
  | '/cases/:caseId/d/:decisionId/screenings/:screeningId'
  | '/cases/:caseId/d/:decisionId/screenings/:screeningId/files'
  | '/cases/:caseId/d/:decisionId/screenings/:screeningId/hits'
  | '/cases'
  | '/cases/inboxes'
  | '/cases/inboxes/:inboxId'
  | '/data'
  | '/data/list'
  | '/data/schema'
  | '/data/view'
  | '/data/view/:tableName/:objectId'
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
  | '/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId'
  | '/scenarios/:scenarioId/scheduled-executions'
  | '/scenarios/:scenarioId/test-run'
  | '/scenarios/:scenarioId/test-run/:testRunId'
  | '/scenarios/:scenarioId/workflow'
  | '/settings'
  | '/settings/api-keys'
  | '/settings/data-display'
  | '/settings/inboxes/:inboxId'
  | '/settings/inboxes'
  | '/settings/scenarios'
  | '/settings/tags'
  | '/settings/users'
  | '/settings/webhooks'
  | '/settings/webhooks/:webhookId'
  | '/upload/:objectType'
  | '/app-router'
  | '/healthcheck'
  | '/ressources/annotations/download-file/:annotationId/:fileId'
  | '/ressources/auth/logout'
  | '/ressources/auth/refresh'
  | '/ressources/cases/:caseId/enqueue-review'
  | '/ressources/cases/add-comment'
  | '/ressources/cases/add-rule-snooze'
  | '/ressources/cases/add-to-case'
  | '/ressources/cases/close-case'
  | '/ressources/cases/create-case'
  | '/ressources/cases/download-data/:caseId'
  | '/ressources/cases/download-file/:fileId'
  | '/ressources/cases/edit-assignee'
  | '/ressources/cases/edit-inbox'
  | '/ressources/cases/edit-name'
  | '/ressources/cases/edit-suspicion'
  | '/ressources/cases/edit-tags'
  | '/ressources/cases/escalate-case'
  | '/ressources/cases/open-case'
  | '/ressources/cases/pivot/related/:pivotValue'
  | '/ressources/cases/review-decision'
  | '/ressources/cases/review-sanction-match'
  | '/ressources/cases/sar/download/:caseId/:reportId'
  | '/ressources/cases/snooze-case'
  | '/ressources/data/:tableId/createNavigationOption'
  | '/ressources/data/:tableName/list-objects'
  | '/ressources/data/create-annotation'
  | '/ressources/data/create-pivot'
  | '/ressources/data/createField'
  | '/ressources/data/createLink'
  | '/ressources/data/createTable'
  | '/ressources/data/delete-annotation/:annotationId'
  | '/ressources/data/editField'
  | '/ressources/data/editTable'
  | '/ressources/decisions/list-scheduled-execution'
  | '/ressources/files/upload-file'
  | '/ressources/ingestion/upload/:objectType'
  | '/ressources/lists/create'
  | '/ressources/lists/delete'
  | '/ressources/lists/download-csv-file/:listId'
  | '/ressources/lists/edit'
  | '/ressources/lists/upload/:listId'
  | '/ressources/lists/value_create'
  | '/ressources/lists/value_delete'
  | '/ressources/locales'
  | '/ressources/opensanctions/dataset-freshness'
  | '/ressources/rule-snoozes/read/:ruleSnoozeId'
  | '/ressources/sanction-check/enrich-match/:matchId'
  | '/ressources/sanction-check/refine'
  | '/ressources/sanction-check/search'
  | '/ressources/scenarios/:scenarioId/:iterationId/activate'
  | '/ressources/scenarios/:scenarioId/:iterationId/commit'
  | '/ressources/scenarios/:scenarioId/:iterationId/create_draft'
  | '/ressources/scenarios/:scenarioId/:iterationId/deactivate'
  | '/ressources/scenarios/:scenarioId/:iterationId/prepare'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/create'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/delete'
  | '/ressources/scenarios/:scenarioId/:iterationId/rules/duplicate'
  | '/ressources/scenarios/:scenarioId/:iterationId/sanctions/:sanctionId/delete'
  | '/ressources/scenarios/:scenarioId/:iterationId/sanctions/create'
  | '/ressources/scenarios/:scenarioId/:iterationId/validate-with-given-trigger-or-rule'
  | '/ressources/scenarios/:scenarioId/builder-options'
  | '/ressources/scenarios/:scenarioId/testrun/:testRunId/cancel'
  | '/ressources/scenarios/:scenarioId/testrun/create'
  | '/ressources/scenarios/:scenarioId/validate-ast'
  | '/ressources/scenarios/create'
  | '/ressources/scenarios/update'
  | '/ressources/screenings/download/:screeningId/:fileId'
  | '/ressources/screenings/upload/:screeningId'
  | '/ressources/settings/api-keys/create'
  | '/ressources/settings/api-keys/delete'
  | '/ressources/settings/inboxes/create'
  | '/ressources/settings/inboxes/delete'
  | '/ressources/settings/inboxes/inbox-users/create'
  | '/ressources/settings/inboxes/inbox-users/delete'
  | '/ressources/settings/inboxes/inbox-users/update'
  | '/ressources/settings/inboxes/update'
  | '/ressources/settings/organization/update'
  | '/ressources/settings/personal/unavailability'
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
  | '/ressources/workflows/:scenarioId'
  | '/ressources/workflows/:scenarioId/reorder'
  | '/ressources/workflows/inboxes'
  | '/ressources/workflows/rule/:ruleId'
  | '/ressources/workflows/rule/:ruleId/condition/:conditionId'
  | '/ressources/workflows/rule/:ruleId/rename'
  | '/ressources/workflows/rule'
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
  | '/transfercheck/transfers';

export type RouteID =
  | 'root'
  | 'routes/$'
  | 'routes/_auth+/_layout'
  | 'routes/_auth+/create-password'
  | 'routes/_auth+/email-verification'
  | 'routes/_auth+/sign-in-email'
  | 'routes/_auth+/sign-in'
  | 'routes/_builder+/_layout'
  | 'routes/_builder+/analytics'
  | 'routes/_builder+/api'
  | 'routes/_builder+/cases+/$caseId+/_index'
  | 'routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_layout'
  | 'routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/_index'
  | 'routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/files'
  | 'routes/_builder+/cases+/$caseId+/d+/$decisionId+/screenings+/$screeningId+/hits'
  | 'routes/_builder+/cases+/_index'
  | 'routes/_builder+/cases+/inboxes._layout'
  | 'routes/_builder+/cases+/inboxes.$inboxId'
  | 'routes/_builder+/data+/_layout'
  | 'routes/_builder+/data+/_index'
  | 'routes/_builder+/data+/list'
  | 'routes/_builder+/data+/schema'
  | 'routes/_builder+/data+/view'
  | 'routes/_builder+/data+/view.$tableName.$objectId'
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
  | 'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/sanctions.$sanctionId'
  | 'routes/_builder+/scenarios+/$scenarioId+/scheduled-executions'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/_layout'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId+/index'
  | 'routes/_builder+/scenarios+/$scenarioId+/test-run+/index'
  | 'routes/_builder+/scenarios+/$scenarioId+/workflow'
  | 'routes/_builder+/scenarios+/_index'
  | 'routes/_builder+/settings+/_layout'
  | 'routes/_builder+/settings+/_index'
  | 'routes/_builder+/settings+/api-keys'
  | 'routes/_builder+/settings+/data-display'
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
  | 'routes/ressources+/annotations+/download-file.$annotationId.$fileId'
  | 'routes/ressources+/auth+/logout'
  | 'routes/ressources+/auth+/refresh'
  | 'routes/ressources+/cases+/$caseId.enqueue-review'
  | 'routes/ressources+/cases+/add-comment'
  | 'routes/ressources+/cases+/add-rule-snooze'
  | 'routes/ressources+/cases+/add-to-case'
  | 'routes/ressources+/cases+/close-case'
  | 'routes/ressources+/cases+/create-case'
  | 'routes/ressources+/cases+/download-data.$caseId'
  | 'routes/ressources+/cases+/download-file.$fileId'
  | 'routes/ressources+/cases+/edit-assignee'
  | 'routes/ressources+/cases+/edit-inbox'
  | 'routes/ressources+/cases+/edit-name'
  | 'routes/ressources+/cases+/edit-suspicion'
  | 'routes/ressources+/cases+/edit-tags'
  | 'routes/ressources+/cases+/escalate-case'
  | 'routes/ressources+/cases+/open-case'
  | 'routes/ressources+/cases+/pivot+/related+/$pivotValue._index'
  | 'routes/ressources+/cases+/review-decision'
  | 'routes/ressources+/cases+/review-sanction-match'
  | 'routes/ressources+/cases+/sar+/download.$caseId.$reportId'
  | 'routes/ressources+/cases+/snooze-case'
  | 'routes/ressources+/data+/$tableId.createNavigationOption'
  | 'routes/ressources+/data+/$tableName.list-objects'
  | 'routes/ressources+/data+/create-annotation'
  | 'routes/ressources+/data+/create-pivot'
  | 'routes/ressources+/data+/createField'
  | 'routes/ressources+/data+/createLink'
  | 'routes/ressources+/data+/createTable'
  | 'routes/ressources+/data+/delete-annotation.$annotationId'
  | 'routes/ressources+/data+/editField'
  | 'routes/ressources+/data+/editTable'
  | 'routes/ressources+/decisions+/list-scheduled-execution'
  | 'routes/ressources+/files+/upload-file'
  | 'routes/ressources+/ingestion+/upload.$objectType'
  | 'routes/ressources+/lists+/create'
  | 'routes/ressources+/lists+/delete'
  | 'routes/ressources+/lists+/download-csv-file.$listId'
  | 'routes/ressources+/lists+/edit'
  | 'routes/ressources+/lists+/upload.$listId'
  | 'routes/ressources+/lists+/value_create'
  | 'routes/ressources+/lists+/value_delete'
  | 'routes/ressources+/locales'
  | 'routes/ressources+/opensanctions+/dataset-freshness'
  | 'routes/ressources+/rule-snoozes+/read.$ruleSnoozeId'
  | 'routes/ressources+/sanction-check+/enrich-match.$matchId'
  | 'routes/ressources+/sanction-check+/refine'
  | 'routes/ressources+/sanction-check+/search'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/create'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/$sanctionId+/delete'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/create'
  | 'routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule'
  | 'routes/ressources+/scenarios+/$scenarioId+/builder-options'
  | 'routes/ressources+/scenarios+/$scenarioId+/testrun+/$testRunId+/cancel'
  | 'routes/ressources+/scenarios+/$scenarioId+/testrun+/create'
  | 'routes/ressources+/scenarios+/$scenarioId+/validate-ast'
  | 'routes/ressources+/scenarios+/create'
  | 'routes/ressources+/scenarios+/update'
  | 'routes/ressources+/screenings+/download.$screeningId.$fileId'
  | 'routes/ressources+/screenings+/upload.$screeningId'
  | 'routes/ressources+/settings+/api-keys+/create'
  | 'routes/ressources+/settings+/api-keys+/delete'
  | 'routes/ressources+/settings+/inboxes+/create'
  | 'routes/ressources+/settings+/inboxes+/delete'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.create'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.delete'
  | 'routes/ressources+/settings+/inboxes+/inbox-users.update'
  | 'routes/ressources+/settings+/inboxes+/update'
  | 'routes/ressources+/settings+/organization+/update'
  | 'routes/ressources+/settings+/personal+/unavailability+/_index'
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
  | 'routes/ressources+/workflows+/$scenarioId/_index'
  | 'routes/ressources+/workflows+/$scenarioId.reorder'
  | 'routes/ressources+/workflows+/inboxes'
  | 'routes/ressources+/workflows+/rule+/$ruleId+/_index'
  | 'routes/ressources+/workflows+/rule+/$ruleId+/condition+/$conditionId'
  | 'routes/ressources+/workflows+/rule+/$ruleId+/rename'
  | 'routes/ressources+/workflows+/rule+/_index'
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
