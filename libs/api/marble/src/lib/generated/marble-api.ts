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
    expires_in: string;
};
export type Credentials = {
    credentials: {
        organization_id: string;
        role: string;
        actor_identity: {
            user_id?: string;
            email?: string;
            api_key_name?: string;
        };
    };
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
    outcome: "approve" | "review" | "decline" | "null" | "unknown";
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
export type CreateDecisionBody = {
    scenario_id: string;
    trigger_object: object;
    object_type: string;
};
export type CustomList = {
    id: string;
    name: string;
    description: string;
};
export type CreateCustomListBody = {
    name: string;
    description: string;
};
export type CustomListValue = {
    id: string;
    value: string;
};
export type UpdateCustomListBody = {
    name: string;
    description: string;
};
export type CreateCustomListValueBody = {
    value: string;
};
export type DeleteCustomListValueBody = {
    id: string;
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
export type ScenarioIteration = {
    id: string;
    scenarioId: string;
    version?: number;
    createdAt: string;
    updatedAt: string;
};
export type AndOperator = {
    "type": "AND";
    children: Operator[];
};
export type BoolConstantOperator = {
    "type": "BOOL_CONSTANT";
    staticData: {
        value: boolean;
    };
};
export type DbFieldBoolOperator = {
    "type": "DB_FIELD_BOOL";
    staticData: {
        triggerTableName: string;
        path: string[];
        fieldName: string;
    };
};
export type DbFieldFloatOperator = {
    "type": "DB_FIELD_FLOAT";
    staticData: {
        triggerTableName: string;
        path: string[];
        fieldName: string;
    };
};
export type DbFieldStringOperator = {
    "type": "DB_FIELD_STRING";
    staticData: {
        triggerTableName: string;
        path: string[];
        fieldName: string;
    };
};
export type DivideFloatOperator = {
    "type": "DIVIDE_FLOAT";
    children: Operator[];
};
export type EqualBoolOperator = {
    "type": "EQUAL_BOOL";
    children: Operator[];
};
export type EqualStringOperator = {
    "type": "EQUAL_STRING";
    children: Operator[];
};
export type EqualFloatOperator = {
    "type": "EQUAL_FLOAT";
    children: Operator[];
};
export type FloatConstantOperator = {
    "type": "FLOAT_CONSTANT";
    staticData: {
        value: number;
    };
};
export type GreaterFloatOperator = {
    "type": "GREATER_FLOAT";
    children: Operator[];
};
export type GreaterOrEqualFloatOperator = {
    "type": "GREATER_OR_EQUAL_FLOAT";
    children: Operator[];
};
export type LesserFloatOperator = {
    "type": "LESSER_FLOAT";
    children: Operator[];
};
export type LesserOrEqualFloatOperator = {
    "type": "LESSER_OR_EQUAL_FLOAT";
    children: Operator[];
};
export type NotOperator = {
    "type": "NOT";
    children: Operator[];
};
export type OrOperator = {
    "type": "OR";
    children: Operator[];
};
export type PayloadFieldBoolOperator = {
    "type": "PAYLOAD_FIELD_BOOL";
    staticData: {
        fieldName: string;
    };
};
export type PayloadFieldFloatOperator = {
    "type": "PAYLOAD_FIELD_FLOAT";
    staticData: {
        fieldName: string;
    };
};
export type PayloadFieldStringOperator = {
    "type": "PAYLOAD_FIELD_STRING";
    staticData: {
        fieldName: string;
    };
};
export type ProductFloatOperator = {
    "type": "PRODUCT_FLOAT";
    children: Operator[];
};
export type RoundFloatOperator = {
    "type": "ROUND_FLOAT";
    children: Operator[];
    staticData: {
        level: number;
    };
};
export type StringIsInListOperator = {
    "type": "STRING_IS_IN_LIST";
    children: Operator[];
};
export type StringListConstantOperator = {
    "type": "STRING_LIST_CONSTANT";
    staticData: {
        value: string[];
    };
};
export type StringConstantOperator = {
    "type": "STRING_CONSTANT";
    staticData: {
        value: string;
    };
};
export type SubstractFloatOperator = {
    "type": "SUBTRACT_FLOAT";
    children: Operator[];
};
export type SumFloatOperator = {
    "type": "SUM_FLOAT";
    children: Operator[];
};
export type Operator = AndOperator | BoolConstantOperator | DbFieldBoolOperator | DbFieldFloatOperator | DbFieldStringOperator | DivideFloatOperator | EqualBoolOperator | EqualStringOperator | EqualFloatOperator | FloatConstantOperator | GreaterFloatOperator | GreaterOrEqualFloatOperator | LesserFloatOperator | LesserOrEqualFloatOperator | NotOperator | OrOperator | PayloadFieldBoolOperator | PayloadFieldFloatOperator | PayloadFieldStringOperator | ProductFloatOperator | RoundFloatOperator | StringIsInListOperator | StringListConstantOperator | StringConstantOperator | SubstractFloatOperator | SumFloatOperator;
export type CreateScenarioIterationRuleBody = {
    scenarioIterationId: string;
    displayOrder: number;
    name: string;
    description: string;
    formula: Operator;
    scoreModifier: number;
};
export type CreateScenarioIterationBody = {
    scenarioId: string;
    body?: {
        triggerCondition?: Operator;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
        rules?: CreateScenarioIterationRuleBody[];
    };
};
export type ScenarioIterationRule = {
    id: string;
    scenarioIterationId: string;
    displayOrder: number;
    name: string;
    description: string;
    formula: Operator;
    scoreModifier: number;
    createdAt: string;
};
export type ScenarioIterationWithBody = ScenarioIteration & {
    body: {
        triggerCondition?: Operator;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
        rules: ScenarioIterationRule[];
    };
};
export type UpdateScenarioIterationBody = {
    body?: {
        triggerCondition?: Operator;
        scoreReviewThreshold?: number;
        scoreRejectThreshold?: number;
    };
};
export type UpdateScenarioIterationRuleBody = {
    displayOrder?: number;
    name?: string;
    description?: string;
    formula?: object;
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
export type DataModel = {
    tables: {
        [key: string]: {
            name: string;
            fields: {
                [key: string]: {
                    name: string;
                    dataType: "Bool" | "Int" | "Float" | "String" | "Timestamp" | "unknown";
                };
            };
            linksToSingle: {
                [key: string]: {
                    linkedTableName: string;
                    parentFieldName: string;
                    childFieldName: string;
                };
            };
        };
    };
};
export type ApiKey = {
    api_key_id: string;
    organization_id: string;
    key: string;
    role: string;
};
export type User = {
    user_id: string;
    email: string;
    role: string;
    organization_id: string;
};
export type CreateUser = {
    email: string;
    role: string;
    organization_id: string;
};
export type Organization = {
    id: string;
    name: string;
    database_name: string;
};
export type CreateOrganizationBodyDto = {
    name: string;
    database_name: string;
};
export type UpdateOrganizationBodyDto = {
    name?: string;
    database_name?: string;
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
        data: Credentials;
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
export function listDecisions(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Decision[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/decisions", {
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
 * Get a decision by id
 */
export function getDecision(decisionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Decision;
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
 * List custom list
 */
export function listCustomLists(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CustomList[];
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
        data: CustomList;
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
        data: CustomListValue[];
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
        data: CustomListValue;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
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
export function deleteCustomListValue(customListId: string, deleteCustomListValueBody: DeleteCustomListValueBody, opts?: Oazapfts.RequestOpts) {
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
    }>(`/custom-lists/${encodeURIComponent(customListId)}/values`, oazapfts.json({
        ...opts,
        method: "DELETE",
        body: deleteCustomListValueBody
    })));
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
export function updateScenarioDeprecated(scenarioId: string, updateScenarioBody: UpdateScenarioBody, opts?: Oazapfts.RequestOpts) {
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
        method: "PUT",
        body: updateScenarioBody
    })));
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
        data: ScenarioIteration[];
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
        data: ScenarioIterationWithBody;
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
        data: ScenarioIterationWithBody;
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
 * Update a scenario iteration
 */
export function updateScenarioIterationDeprecated(scenarioIterationId: string, updateScenarioIterationBody: UpdateScenarioIterationBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBody;
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
        method: "PUT",
        body: updateScenarioIterationBody
    })));
}
/**
 * Update a scenario iteration
 */
export function updateScenarioIteration(scenarioIterationId: string, updateScenarioIterationBody: UpdateScenarioIterationBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBody;
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
 * List rules
 */
export function listScenarioIterationRules({ scenarioIterationId }: {
    scenarioIterationId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationRule[];
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
        data: ScenarioIterationRule;
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
        data: ScenarioIterationRule;
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
export function updateScenarioIterationRuleDeprecated(ruleId: string, updateScenarioIterationRuleBody: UpdateScenarioIterationRuleBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationRule;
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
        method: "PUT",
        body: updateScenarioIterationRuleBody
    })));
}
/**
 * Update a scenario iteration rule
 */
export function updateScenarioIterationRule(ruleId: string, updateScenarioIterationRuleBody: UpdateScenarioIterationRuleBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationRule;
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
            data_model: DataModel;
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
            users: User[];
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
            user: User;
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
            user: User;
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
            organizations: Organization[];
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
            organization: Organization;
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
            organization: Organization;
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
export function updateOrganizationDeprecated(organizationId: string, updateOrganizationBodyDto: UpdateOrganizationBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organization: Organization;
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
        method: "PUT",
        body: updateOrganizationBodyDto
    })));
}
/**
 * Update an organization by id
 */
export function updateOrganization(organizationId: string, updateOrganizationBodyDto: UpdateOrganizationBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            organization: Organization;
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
            users: User;
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
