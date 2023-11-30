/**
 * Marble API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts/lib/runtime";
import * as QS from "oazapfts/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "http://localhost:8080",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    localDevlopmentServer: "http://localhost:8080"
};
export type Token = {
    access_token: string;
    token_type: string;
    expires_at: string;
};
export type CredentialsDto = {
    credentials: {
        organization_id: string;
        role: string;
        actor_identity: {
            user_id?: string;
            email?: string;
            first_name?: string;
            last_name?: string;
            api_key_name?: string;
        };
        permissions: string[];
    };
};
export type Outcome = "approve" | "review" | "decline" | "null" | "unknown";
export type Pagination = {
    startIndex: number;
    endIndex: number;
    total: number;
};
export type Error = {
    code: number;
    message: string;
};
export type Decision = {
    id: string;
    created_at: string;
    trigger_object: object;
    trigger_object_type: string;
    outcome: Outcome;
    scenario: {
        id: string;
        name: string;
        description: string;
        version: number;
    };
    rules: {
        name: string;
        description: string;
        score_modifier: number;
        result: boolean;
        error?: Error;
    }[];
    score: number;
    error?: Error;
};
export type CaseStatus = "open" | "investigating" | "discarded" | "resolved";
export type CaseContributor = {
    id: string;
    case_id: string;
    user_id: string;
    created_at: string;
};
export type Case = {
    id: string;
    created_at: string;
    decisions_count: number;
    name: string;
    status: CaseStatus;
    inbox_id: string;
    contributors: CaseContributor[];
};
export type DecisionDetail = Decision & {
    "case"?: Case;
};
export type CreateDecisionBody = {
    scenario_id: string;
    trigger_object: object;
    object_type: string;
};
export type CreateCaseBody = {
    name: string;
    inbox_id: string;
    decision_ids?: string[];
};
export type CaseEventBase = {
    id: string;
    case_id: string;
    user_id: string;
    created_at: string;
    event_type: string;
};
export type CaseCreatedEvent = {
    event_type: "case_created";
} & CaseEventBase;
export type CaseStatusUpdatedEvent = {
    event_type: "status_updated";
} & CaseEventBase & {
    new_value: CaseStatus;
};
export type DecisionAddedEvent = {
    event_type: "decision_added";
} & CaseEventBase;
export type CommentAddedEvent = {
    event_type: "comment_added";
} & CaseEventBase & {
    additional_note: string;
};
export type NameUpdatedEvent = {
    event_type: "name_updated";
} & CaseEventBase & {
    new_value: string;
};
export type CaseEvent = CaseCreatedEvent | CaseStatusUpdatedEvent | DecisionAddedEvent | CommentAddedEvent | NameUpdatedEvent;
export type CaseDetail = Case & {
    decisions: Decision[];
    events: CaseEvent[];
};
export type UpdateCaseBody = {
    name?: string;
    decision_ids?: string[];
    status?: CaseStatus;
};
export type ScheduledExecution = {
    id: string;
    scenario_iteration_id: string;
    status: string;
    started_at: string;
    finished_at: string | null;
    number_of_created_decisions: number;
    scenario_id: string;
    scenario_name: string;
    scenario_trigger_object_type: string;
};
export type UploadLog = {
    started_at: string;
    finished_at: string;
    status: string;
    lines_processed: number;
};
export type CustomList = {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};
export type CreateCustomListBody = {
    name: string;
    description: string;
};
export type CustomListValue = {
    id: string;
    value: string;
};
export type CustomListWithValues = CustomList & {
    values?: CustomListValue[];
};
export type UpdateCustomListBody = {
    name: string;
    description: string;
};
export type CreateCustomListValueBody = {
    value: string;
};
export type Scenario = {
    id: string;
    name: string;
    description: string;
    triggerObjectType: string;
    createdAt: string;
    liveVersionId?: string;
};
export type CreateScenarioBody = {
    name: string;
    description: string;
    triggerObjectType: string;
};
export type UpdateScenarioBody = {
    name?: string;
    description?: string;
};
export type ScenarioIterationDto = {
    id: string;
    scenarioId: string;
    version: number | null;
    createdAt: string;
    updatedAt: string;
};
export type ConstantDto = (string | number | boolean | ConstantDto[] | {
    [key: string]: ConstantDto;
}) | null;
export type NodeDto = {
    name?: string;
    constant?: ConstantDto;
    children?: NodeDto[];
    named_children?: {
        [key: string]: NodeDto;
    };
};
export type CreateScenarioIterationRuleBody = {
    scenarioIterationId: string;
    displayOrder: number;
    name: string;
    description: string;
    formula_ast_expression: (NodeDto) | null;
    scoreModifier: number;
};
export type CreateScenarioIterationBody = {
    scenarioId: string;
    body?: {
        trigger_condition_ast_expression?: (NodeDto) | null;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
        rules?: CreateScenarioIterationRuleBody[];
    };
};
export type ScenarioIterationRuleDto = {
    id: string;
    scenarioIterationId: string;
    displayOrder: number;
    name: string;
    description: string;
    formula_ast_expression: (NodeDto) | null;
    scoreModifier: number;
    createdAt: string;
};
export type ScenarioIterationWithBodyDto = ScenarioIterationDto & {
    body: {
        trigger_condition_ast_expression?: (NodeDto) | null;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
        rules: ScenarioIterationRuleDto[];
        schedule?: string;
    };
};
export type UpdateScenarioIterationBody = {
    body?: {
        trigger_condition_ast_expression?: (NodeDto) | null;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
        schedule?: string;
    };
};
export type ScenarioValidationErrorCodeDto = "DATA_MODEL_NOT_FOUND" | "TRIGGER_OBJECT_NOT_FOUND" | "TRIGGER_CONDITION_REQUIRED" | "RULE_FORMULA_REQUIRED" | "SCORE_REVIEW_THRESHOLD_REQUIRED" | "SCORE_REJECT_THRESHOLD_REQUIRED" | "SCORE_REJECT_REVIEW_THRESHOLDS_MISSMATCH";
export type ScenarioValidationErrorDto = {
    error: ScenarioValidationErrorCodeDto;
    message: string;
};
export type EvaluationErrorCodeDto = "UNEXPECTED_ERROR" | "UNDEFINED_FUNCTION" | "WRONG_NUMBER_OF_ARGUMENTS" | "MISSING_NAMED_ARGUMENT" | "ARGUMENTS_MUST_BE_INT_OR_FLOAT" | "ARGUMENTS_MUST_BE_INT_FLOAT_OR_TIME" | "ARGUMENT_MUST_BE_INTEGER" | "ARGUMENT_MUST_BE_STRING" | "ARGUMENT_MUST_BE_BOOLEAN" | "ARGUMENT_MUST_BE_LIST" | "ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION" | "ARGUMENT_MUST_BE_TIME" | "ARGUMENT_REQUIRED" | "ARGUMENT_INVALID_TYPE" | "LIST_NOT_FOUND" | "DATABASE_ACCESS_NOT_FOUND" | "PAYLOAD_FIELD_NOT_FOUND";
export type EvaluationErrorDto = {
    error: EvaluationErrorCodeDto;
    message: string;
    argument_index?: number;
    argument_name?: string;
};
export type NodeEvaluationDto = {
    return_value: ConstantDto;
    errors: EvaluationErrorDto[] | null;
    children?: NodeEvaluationDto[];
    named_children?: {
        [key: string]: NodeEvaluationDto;
    };
};
export type ScenarioValidationDto = {
    trigger: {
        errors: ScenarioValidationErrorDto[];
        trigger_evaluation: NodeEvaluationDto;
    };
    rules: {
        errors: ScenarioValidationErrorDto[];
        rules: {
            [key: string]: {
                errors: ScenarioValidationErrorDto[];
                rule_evaluation: NodeEvaluationDto;
            };
        };
    };
    decision: {
        errors: ScenarioValidationErrorDto[];
    };
};
export type UpdateScenarioIterationRuleBody = {
    displayOrder?: number;
    name?: string;
    description?: string;
    formula_ast_expression?: (NodeDto) | null;
    scoreModifier?: number;
};
export type PublicationAction = "publish" | "unpublish";
export type ScenarioPublication = {
    id: string;
    createdAt: string;
    scenarioIterationId: string;
    publicationAction: PublicationAction;
};
export type CreateScenarioPublicationBody = {
    scenarioIterationId: string;
    publicationAction: PublicationAction;
};
export type DataModelFieldDto = {
    id?: string;
    name: string;
    data_type: "Bool" | "Int" | "Float" | "String" | "Timestamp" | "unknown";
    nullable: boolean;
    description: string;
    is_enum: boolean;
    values?: (string | number)[];
};
export type LinkToSingleDto = {
    linked_table_name: string;
    parent_field_name: string;
    child_field_name: string;
};
export type DataModelDto = {
    tables: {
        [key: string]: {
            id?: string;
            name: string;
            fields: {
                [key: string]: DataModelFieldDto;
            };
            links_to_single?: {
                [key: string]: LinkToSingleDto;
            };
            description: string;
        };
    };
};
export type CreateTableBody = {
    name: string;
    description: string;
};
export type UpdateTableBody = {
    description?: string;
};
export type CreateTableFieldBody = {
    name: string;
    description: string;
    "type": "Bool" | "Int" | "Float" | "String" | "Timestamp";
    nullable: boolean;
    is_enum?: boolean;
};
export type UpdateTableFieldBody = {
    description?: string;
    is_enum?: boolean;
};
export type CreateTableLinkBody = {
    name: string;
    parent_table_id: string;
    parent_field_id: string;
    child_table_id: string;
    child_field_id: string;
};
export type OpenApiSpec = {
    info?: object;
    openapi: string;
    tags: object[];
    paths: object;
    components?: {
        schemas?: object;
        securitySchemes?: object;
    };
};
export type ApiKey = {
    api_key_id: string;
    organization_id: string;
    key: string;
    role: string;
};
export type UserDto = {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_id: string;
};
export type CreateUser = {
    email: string;
    role: string;
    organization_id: string;
};
export type OrganizationDto = {
    id: string;
    name: string;
    database_name: string;
    export_scheduled_execution_s3?: string;
};
export type CreateOrganizationBodyDto = {
    name: string;
    database_name: string;
};
export type UpdateOrganizationBodyDto = {
    name?: string;
    database_name?: string;
};
export type FuncAttributes = {
    name: string;
    number_of_arguments: number;
    named_arguments?: string[];
};
export type InboxUserDto = {
    id: string;
    inbox_id: string;
    user_id: string;
    role: "member" | "admin";
};
export type InboxDto = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: "active" | "archived";
    users?: InboxUserDto[];
};
export type CreateInboxBodyDto = {
    name: string;
};
export type AddInboxUserBodyDto = {
    user_id: string;
    role: "member" | "admin";
};
/**
 * Get an access token
 */
export function postToken({ xApiKey, authorization }: {
    xApiKey?: string;
    authorization?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Token;
    } | {
        status: 401;
        data: string;
    }>("/token", {
        ...opts,
        method: "POST",
        headers: {
            ...opts && opts.headers,
            "X-API-Key": xApiKey,
            Authorization: authorization
        }
    }));
}
/**
 * Get user credentials included in the token
 */
export function getCredentials(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CredentialsDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/credentials", {
        ...opts
    }));
}
/**
 * List decisions
 */
export function listDecisions({ outcome, scenarioId, triggerObject, startDate, endDate, offsetId, previous, next, limit, order, sorting }: {
    outcome?: Outcome[];
    scenarioId?: string[];
    triggerObject?: string[];
    startDate?: string;
    endDate?: string;
    offsetId?: string;
    previous?: boolean;
    next?: boolean;
    limit?: number;
    order?: "ASC" | "DESC";
    sorting?: "created_at";
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Pagination & {
            items: DecisionDetail[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/decisions${QS.query(QS.explode({
        "outcome[]": outcome,
        "scenarioId[]": scenarioId,
        "triggerObject[]": triggerObject,
        startDate,
        endDate,
        offsetId,
        previous,
        next,
        limit,
        order,
        sorting
    }))}`, {
        ...opts
    }));
}
/**
 * Create a decision
 */
export function createDecision(createDecisionBody: CreateDecisionBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Decision;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/decisions", oazapfts.json({
        ...opts,
        method: "POST",
        body: createDecisionBody
    })));
}
/**
 * List cases
 */
export function listCases({ statuses, startDate, endDate }: {
    statuses?: CaseStatus[];
    startDate?: string;
    endDate?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Case[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/cases${QS.query(QS.explode({
        "statuses[]": statuses,
        startDate,
        endDate
    }))}`, {
        ...opts
    }));
}
/**
 * Create a case
 */
export function createCase(createCaseBody: CreateCaseBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": Case;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/cases", oazapfts.json({
        ...opts,
        method: "POST",
        body: createCaseBody
    })));
}
/**
 * Get a case by id
 */
export function getCase(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CaseDetail;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}`, {
        ...opts
    }));
}
/**
 * Update a case
 */
export function updateCase(caseId: string, updateCaseBody: UpdateCaseBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetail;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateCaseBody
    })));
}
/**
 * List Scheduled Executions
 */
export function listScheduledExecutions({ scenarioId }: {
    scenarioId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scheduled_executions: ScheduledExecution[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/scheduled-executions${QS.query(QS.explode({
        scenario_id: scenarioId
    }))}`, {
        ...opts
    }));
}
/**
 * Get a decision by id
 */
export function getDecision(decisionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: DecisionDetail;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/decisions/${encodeURIComponent(decisionId)}`, {
        ...opts
    }));
}
/**
 * Ingest some data
 */
export function createIngestion(objectType: string, body: object, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 422;
        data: object;
    }>(`/ingestion/${encodeURIComponent(objectType)}`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Get ingestion upload logs for an object type
 */
export function getIngestionUploadLogs(objectType: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: UploadLog[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/ingestion/${encodeURIComponent(objectType)}/upload-logs`, {
        ...opts
    }));
}
/**
 * List custom list
 */
export function listCustomLists(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_lists: CustomList[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/custom-lists", {
        ...opts
    }));
}
/**
 * Create a custom list
 */
export function createCustomList(createCustomListBody: CreateCustomListBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list: CustomList;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 422;
        data: object;
    }>("/custom-lists", oazapfts.json({
        ...opts,
        method: "POST",
        body: createCustomListBody
    })));
}
/**
 * Get values of the corresponding custom list
 */
export function getCustomList(customListId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list: CustomListWithValues;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/custom-lists/${encodeURIComponent(customListId)}`, {
        ...opts
    }));
}
/**
 * Update a custom list
 */
export function updateCustomList(customListId: string, updateCustomListBody: UpdateCustomListBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CustomList;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/custom-lists/${encodeURIComponent(customListId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateCustomListBody
    })));
}
/**
 * Delete a custom list
 */
export function deleteCustomList(customListId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CustomList;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/custom-lists/${encodeURIComponent(customListId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Create a custom list value
 */
export function createCustomListValue(customListId: string, createCustomListValueBody: CreateCustomListValueBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list_value: CustomListValue;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 409;
        data: string;
    } | {
        status: 422;
        data: object;
    }>(`/custom-lists/${encodeURIComponent(customListId)}/values`, oazapfts.json({
        ...opts,
        method: "POST",
        body: createCustomListValueBody
    })));
}
/**
 * Delete a custom list value
 */
export function deleteCustomListValue(customListId: string, customListValueId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CustomListValue;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/custom-lists/${encodeURIComponent(customListId)}/values/${encodeURIComponent(customListValueId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List scenarios
 */
export function listScenarios(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Scenario[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/scenarios", {
        ...opts
    }));
}
/**
 * Create a scenario
 */
export function createScenario(createScenarioBody: CreateScenarioBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Scenario;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 422;
        data: object;
    }>("/scenarios", oazapfts.json({
        ...opts,
        method: "POST",
        body: createScenarioBody
    })));
}
/**
 * Get a scenario by id
 */
export function getScenario(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Scenario;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenarios/${encodeURIComponent(scenarioId)}`, {
        ...opts
    }));
}
/**
 * Update a scenario
 */
export function updateScenario(scenarioId: string, updateScenarioBody: UpdateScenarioBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Scenario;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenarios/${encodeURIComponent(scenarioId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateScenarioBody
    })));
}
/**
 * List iterations
 */
export function listScenarioIterations({ scenarioId }: {
    scenarioId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationDto[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations${QS.query(QS.explode({
        scenarioId
    }))}`, {
        ...opts
    }));
}
/**
 * Create a scenario iteration
 */
export function createScenarioIteration(createScenarioIterationBody: CreateScenarioIterationBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBodyDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/scenario-iterations", oazapfts.json({
        ...opts,
        method: "POST",
        body: createScenarioIterationBody
    })));
}
/**
 * Get a scenario iteration by id
 */
export function getScenarioIteration(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBodyDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}`, {
        ...opts
    }));
}
/**
 * Create draft from a scenario iteration
 */
export function createDraftFromScenarioIteration(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBodyDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Update a scenario iteration
 */
export function updateScenarioIteration(scenarioIterationId: string, updateScenarioIterationBody: UpdateScenarioIterationBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            iteration: ScenarioIterationWithBodyDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateScenarioIterationBody
    })));
}
/**
 * Schedule a scenario execution
 */
export function scheduleScenarioExecution(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/schedule-execution`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Validate a scenario iteration by id
 */
export function validateScenarioIteration(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scenario_validation: ScenarioValidationDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/validate`, {
        ...opts
    }));
}
/**
 * Validate a scenario iteration using the rule or trigger passed in body
 */
export function validateScenarioIterationWithGivenTriggerOrRule(scenarioIterationId: string, body: {
    trigger_or_rule: NodeDto;
    rule_id: string | null;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scenario_validation: ScenarioValidationDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/validate`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * List rules
 */
export function listScenarioIterationRules({ scenarioIterationId }: {
    scenarioIterationId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationRuleDto[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iteration-rules${QS.query(QS.explode({
        scenarioIterationId
    }))}`, {
        ...opts
    }));
}
/**
 * Create a scenario iteration rule
 */
export function createScenarioIterationRule(createScenarioIterationRuleBody: CreateScenarioIterationRuleBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            rule: ScenarioIterationRuleDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/scenario-iteration-rules", oazapfts.json({
        ...opts,
        method: "POST",
        body: createScenarioIterationRuleBody
    })));
}
/**
 * Get a scenario iteration rule by id
 */
export function getScenarioIterationRule(ruleId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            rule: ScenarioIterationRuleDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iteration-rules/${encodeURIComponent(ruleId)}`, {
        ...opts
    }));
}
/**
 * Update a scenario iteration rule
 */
export function updateScenarioIterationRule(ruleId: string, updateScenarioIterationRuleBody: UpdateScenarioIterationRuleBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            rule: ScenarioIterationRuleDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iteration-rules/${encodeURIComponent(ruleId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateScenarioIterationRuleBody
    })));
}
/**
 * Delete a scenario iteration rule
 */
export function deleteScenarioIterationRule(ruleId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-iteration-rules/${encodeURIComponent(ruleId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List scenario publications
 */
export function listScenarioPublications({ scenarioId, scenarioIterationId, publicationAction }: {
    scenarioId?: string;
    scenarioIterationId?: string;
    publicationAction?: PublicationAction;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioPublication[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-publications${QS.query(QS.explode({
        scenarioId,
        scenarioIterationId,
        publicationAction
    }))}`, {
        ...opts
    }));
}
/**
 * Create a scenario publication
 */
export function createScenarioPublication(createScenarioPublicationBody: CreateScenarioPublicationBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioPublication[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/scenario-publications", oazapfts.json({
        ...opts,
        method: "POST",
        body: createScenarioPublicationBody
    })));
}
/**
 * Get a scenario publication by id
 */
export function getScenarioPublication(scenarioPublicationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioPublication;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-publications/${encodeURIComponent(scenarioPublicationId)}`, {
        ...opts
    }));
}
/**
 * Get the data model associated with the current organization (present in the JWT)
 */
export function getDataModel(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            data_model: DataModelDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/data-model", {
        ...opts
    }));
}
/**
 * Create a new table on the data model
 */
export function postDataModelTable(createTableBody: CreateTableBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/data-model/tables", oazapfts.json({
        ...opts,
        method: "POST",
        body: createTableBody
    })));
}
/**
 * Update data model table
 */
export function patchDataModelTable(tableId: string, updateTableBody: UpdateTableBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/data-model/tables/${encodeURIComponent(tableId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateTableBody
    })));
}
/**
 * Create a new field on a table from the data model
 */
export function postDataModelTableField(tableId: string, createTableFieldBody: CreateTableFieldBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/data-model/tables/${encodeURIComponent(tableId)}/fields`, oazapfts.json({
        ...opts,
        method: "POST",
        body: createTableFieldBody
    })));
}
/**
 * Update data model field
 */
export function patchDataModelField(fieldId: string, updateTableFieldBody: UpdateTableFieldBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/data-model/fields/${encodeURIComponent(fieldId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateTableFieldBody
    })));
}
/**
 * Create a new link on a table from the data model
 */
export function postDataModelTableLink(createTableLinkBody: CreateTableLinkBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/data-model/links", oazapfts.json({
        ...opts,
        method: "POST",
        body: createTableLinkBody
    })));
}
/**
 * Get the OpenAPI specification of the client specific API for data ingestion and decision making
 */
export function getDataModelOpenApi(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: OpenApiSpec;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/data-model/openapi", {
        ...opts
    }));
}
/**
 * List api keys associated with the current organization (present in the JWT)
 */
export function listApiKeys(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            api_keys: ApiKey[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/apikeys", {
        ...opts
    }));
}
/**
 * List all users present in the database
 */
export function listUsers(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            users: UserDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/users", {
        ...opts
    }));
}
/**
 * Create a user
 */
export function createUser(createUser: CreateUser, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            user: UserDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/users", oazapfts.json({
        ...opts,
        method: "POST",
        body: createUser
    })));
}
/**
 * Get a user by id
 */
export function getUser(userId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            user: UserDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/users/${encodeURIComponent(userId)}`, {
        ...opts
    }));
}
/**
 * Delete a user by id
 */
export function deleteUser(userId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/users/${encodeURIComponent(userId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List all organizations present in the database
 */
export function listOrganizations(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organizations: OrganizationDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/organizations", {
        ...opts
    }));
}
/**
 * Create an organization
 */
export function createOrganization(createOrganizationBodyDto: CreateOrganizationBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organization: OrganizationDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/organizations", oazapfts.json({
        ...opts,
        method: "POST",
        body: createOrganizationBodyDto
    })));
}
/**
 * Get an organization by id
 */
export function getOrganization(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organization: OrganizationDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}`, {
        ...opts
    }));
}
/**
 * Update an organization by id
 */
export function updateOrganization(organizationId: string, updateOrganizationBodyDto: UpdateOrganizationBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organization: OrganizationDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateOrganizationBodyDto
    })));
}
/**
 * Delete an organization by id
 */
export function deleteOrganization(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List all users of an organization
 */
export function listOrganizationUsers(organizationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            users: UserDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/organizations/${encodeURIComponent(organizationId)}/users`, {
        ...opts
    }));
}
/**
 * List all identifiers
 */
export function listIdentifiers(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            database_accessors: NodeDto[];
            payload_accessors: NodeDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/editor/${encodeURIComponent(scenarioId)}/identifiers`, {
        ...opts
    }));
}
/**
 * List all operators
 */
export function listOperators(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            operators_accessors: FuncAttributes[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/editor/${encodeURIComponent(scenarioId)}/operators`, {
        ...opts
    }));
}
/**
 * List all inboxes
 */
export function listInboxes(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inboxes: InboxDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/inboxes", {
        ...opts
    }));
}
/**
 * Create an inbox
 */
export function createInbox(createInboxBodyDto: CreateInboxBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inbox: InboxDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/inboxes", oazapfts.json({
        ...opts,
        method: "POST",
        body: createInboxBodyDto
    })));
}
/**
 * Get an inbox by id
 */
export function getInbox(inboxId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inbox: InboxDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/inboxes/${encodeURIComponent(inboxId)}`, {
        ...opts
    }));
}
/**
 * List all users of an inbox
 */
export function listInboxUsers(inboxId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inbox_users: InboxUserDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/inboxes/${encodeURIComponent(inboxId)}/users`, {
        ...opts
    }));
}
/**
 * Add a user to an inbox
 */
export function addInboxUser(inboxId: string, addInboxUserBodyDto: AddInboxUserBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inbox_user: InboxUserDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/inboxes/${encodeURIComponent(inboxId)}/users`, oazapfts.json({
        ...opts,
        method: "POST",
        body: addInboxUserBodyDto
    })));
}
/**
 * Get an inbox user by id
 */
export function getInboxUser(inboxUserId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            inbox_user: InboxUserDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/inbox_users/${encodeURIComponent(inboxUserId)}`, {
        ...opts
    }));
}
