/**
 * Marble Core API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
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
        partner_id?: string;
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
export type OutcomeDto = "approve" | "review" | "decline" | "block_and_review" | "unknown";
export type ReviewStatusDto = "pending" | "approve" | "decline";
export type Pagination = {
    has_next_page: boolean;
    start_index: number;
    end_index: number;
};
export type CaseStatusDto = "pending" | "investigating" | "closed" | "waiting_for_action" | "snoozed";
export type CaseContributorDto = {
    id: string;
    case_id: string;
    user_id: string;
    created_at: string;
};
export type CaseTagDto = {
    id: string;
    case_id: string;
    tag_id: string;
    created_at: string;
};
export type CaseDto = {
    id: string;
    created_at: string;
    decisions_count: number;
    name: string;
    status: CaseStatusDto;
    outcome: "false_positive" | "valuable_alert" | "confirmed_risk" | "unset";
    inbox_id: string;
    contributors: CaseContributorDto[];
    tags: CaseTagDto[];
    snoozed_until?: string;
    assigned_to?: string;
};
export type Error = {
    code: number;
    message: string;
};
export type PivotValueDto = {
    pivot_id: string | null;
    pivot_value: string | null;
};
export type DecisionDto = {
    id: string;
    "case"?: CaseDto;
    created_at: string;
    error?: Error;
    outcome: OutcomeDto;
    pivot_values: PivotValueDto[];
    review_status?: ReviewStatusDto;
    scenario: {
        id: string;
        description: string;
        name: string;
        scenario_iteration_id: string;
        version: number;
    };
    score: number;
    trigger_object: {
        [key: string]: any;
    };
    trigger_object_type: string;
    scheduled_execution_id?: string;
};
export type CreateDecisionBody = {
    scenario_id: string;
    trigger_object: object;
    object_type: string;
};
export type ConstantDto = ((string | null) | (number | null) | (boolean | null) | (ConstantDto[] | null) | ({
    [key: string]: ConstantDto;
} | null)) | null;
export type EvaluationErrorCodeDto = "UNEXPECTED_ERROR" | "UNDEFINED_FUNCTION" | "WRONG_NUMBER_OF_ARGUMENTS" | "MISSING_NAMED_ARGUMENT" | "ARGUMENTS_MUST_BE_INT_OR_FLOAT" | "ARGUMENTS_MUST_BE_INT_FLOAT_OR_TIME" | "ARGUMENT_MUST_BE_INTEGER" | "ARGUMENT_MUST_BE_STRING" | "ARGUMENT_MUST_BE_BOOLEAN" | "ARGUMENT_MUST_BE_LIST" | "ARGUMENT_MUST_BE_CONVERTIBLE_TO_DURATION" | "ARGUMENT_MUST_BE_TIME" | "ARGUMENT_REQUIRED" | "ARGUMENT_INVALID_TYPE" | "LIST_NOT_FOUND" | "DATABASE_ACCESS_NOT_FOUND" | "PAYLOAD_FIELD_NOT_FOUND" | "NULL_FIELD_READ" | "NO_ROWS_READ" | "DIVISION_BY_ZERO" | "PAYLOAD_FIELD_NOT_FOUND" | "RUNTIME_EXPRESSION_ERROR";
export type EvaluationErrorDto = {
    error: EvaluationErrorCodeDto;
    message: string;
    argument_index?: number;
    argument_name?: string;
};
export type NodeEvaluationDto = {
    return_value: {
        value?: ConstantDto;
        is_omitted: boolean;
    };
    errors: EvaluationErrorDto[] | null;
    children?: NodeEvaluationDto[];
    named_children?: {
        [key: string]: NodeEvaluationDto;
    };
    skipped?: boolean;
};
export type RuleExecutionDto = {
    error?: Error;
    description: string;
    name: string;
    outcome: "hit" | "no_hit" | "snoozed" | "error";
    result: boolean;
    rule_id: string;
    score_modifier: number;
    rule_evaluation?: NodeEvaluationDto;
};
export type DecisionDetailDto = DecisionDto & {
    rules: RuleExecutionDto[];
};
export type ComponentsSchemasTagEntityAnnotationDtoAllOf0 = {
    id: string;
    case_id: string;
    annotated_by: string;
    created_at: string;
    object_type: string;
    object_id: string;
};
export type CommentEntityAnnotationDto = ComponentsSchemasTagEntityAnnotationDtoAllOf0 & {
    "type": "comment";
    payload: {
        /** body of the comment */
        text: string;
    };
};
export type TagEntityAnnotationDto = {
    id: string;
    case_id: string;
    annotated_by: string;
    created_at: string;
    object_type: string;
    object_id: string;
} & {
    "type": "tag";
    payload: {
        tag_id: string;
    };
};
export type FileEntityAnnotationDto = ComponentsSchemasTagEntityAnnotationDtoAllOf0 & {
    "type": "file";
    payload: {
        caption: string;
        files: {
            id: string;
            filename: string;
        }[];
    };
};
export type CreateCaseBodyDto = {
    name: string;
    inbox_id: string;
    decision_ids?: string[];
};
export type CaseDecisionDto = {
    id: string;
    created_at: string;
    trigger_object: {
        [key: string]: any;
    };
    trigger_object_type: string;
    outcome: OutcomeDto;
    pivot_values: PivotValueDto[];
    review_status?: ReviewStatusDto;
    scenario: {
        id: string;
        name: string;
        description: string;
        scenario_iteration_id: string;
        version: number;
    };
    score: number;
    error?: Error;
};
export type CaseEventDtoBase = {
    id: string;
    case_id: string;
    created_at: string;
    event_type: string;
};
export type CaseCreatedEventDto = {
    event_type: "case_created";
} & CaseEventDtoBase & {
    user_id?: string;
};
export type CaseStatusForCaseEventDto = "pending" | "investigating" | "closed" | "open" | "discarded" | "resolved";
export type CaseStatusUpdatedEventDto = {
    event_type: "status_updated";
} & CaseEventDtoBase & {
    new_value: CaseStatusForCaseEventDto;
    user_id: string;
};
export type Outcome = "false_positive" | "valuable_alert" | "confirmed_risk" | "unset";
export type CaseOutcomeUpdatedEventDto = {
    event_type: "outcome_updated";
} & CaseEventDtoBase & {
    new_value: Outcome;
    user_id: string;
};
export type DecisionAddedEventDto = {
    event_type: "decision_added";
} & CaseEventDtoBase & {
    user_id?: string;
};
export type CommentAddedEventDto = {
    event_type: "comment_added";
} & CaseEventDtoBase & {
    additional_note: string;
    user_id: string;
};
export type NameUpdatedEventDto = {
    event_type: "name_updated";
} & CaseEventDtoBase & {
    new_value: string;
    user_id: string;
};
export type CaseTagsUpdatedEventDto = {
    event_type: "tags_updated";
} & CaseEventDtoBase & {
    /** comma separated list of tag ids */
    new_value: string;
    user_id: string;
};
export type FileAddedEventDto = {
    event_type: "file_added";
} & CaseEventDtoBase & {
    additional_note: string;
    user_id: string;
};
export type InboxChangedEventDto = {
    event_type: "inbox_changed";
} & CaseEventDtoBase & {
    new_value: string;
    user_id: string;
};
export type RuleSnoozeCreatedDto = {
    event_type: "rule_snooze_created";
} & CaseEventDtoBase & {
    additional_note: string;
    resource_id: string;
    resource_type: string;
    user_id: string;
};
export type DecisionReviewedEventDto = {
    event_type: "decision_reviewed";
} & CaseEventDtoBase & {
    /** The note added by the user to justify the review */
    additional_note: string;
    /** The new review_status of the decision */
    new_value: "approve" | "decline";
    /** The previous review_status of the decision */
    previous_value: string;
    /** The id of the decision being reviewed */
    resource_id: string;
    resource_type: "decision";
    user_id: string;
};
export type CaseSnoozedDto = {
    event_type: "case_snoozed";
} & CaseEventDtoBase & {
    user_id: string;
    new_value: string;
    previous_value?: string;
};
export type CaseUnsnoozedDto = {
    event_type: "case_unsnoozed";
} & CaseEventDtoBase & {
    user_id: string;
    new_value: string;
    previous_value?: string;
};
export type CaseAssignedEventDto = {
    event_type: "case_assigned";
} & CaseEventDtoBase & {
    /** ID of the user the case was assigned to */
    new_value: string;
    user_id?: string;
};
export type SarCreatedEventDto = {
    event_type: "sar_created";
} & CaseEventDtoBase & {
    user_id?: string;
    /** Resource being created, should be `sar` */
    resource_type: string;
    /** ID of the suspicious activity report being created */
    resource_id: string;
};
export type SarDeletedEventDto = {
    event_type: "sar_deleted";
} & CaseEventDtoBase & {
    user_id?: string;
    /** Resource being deleted, should be `sar` */
    resource_type: string;
    /** ID of the suspicious activity report being deleted */
    resource_id: string;
};
export type SarStatusChangedEventDto = {
    event_type: "sar_status_changed";
} & CaseEventDtoBase & {
    /** New status for the suspicious activity report */
    new_value: string;
    user_id?: string;
    /** Resource being modified, should be `sar` */
    resource_type: string;
    /** ID of the suspicious activity report being modified */
    resource_id: string;
};
export type SarFileUploadedEventDto = {
    event_type: "sar_file_uploaded";
} & CaseEventDtoBase & {
    /** Name of the file that was uploaded */
    new_value: string;
    user_id?: string;
    /** Resource being modified, should be `sar` */
    resource_type: string;
    /** ID of the suspicious activity report the file was uploaded to */
    resource_id: string;
};
export type EntityAnnotatedEventDto = {
    event_type: "entity_annotated";
} & CaseEventDtoBase & {
    /** Name of the file that was uploaded */
    new_value: string;
    user_id?: string;
    /** Resource being modified, should be `annotation` */
    resource_type: string;
    /** ID of the annotation */
    resource_id: string;
    /** The type of annotation */
    additional_note: string;
};
export type CaseEventDto = CaseCreatedEventDto | CaseStatusUpdatedEventDto | CaseOutcomeUpdatedEventDto | DecisionAddedEventDto | CommentAddedEventDto | NameUpdatedEventDto | CaseTagsUpdatedEventDto | FileAddedEventDto | InboxChangedEventDto | RuleSnoozeCreatedDto | DecisionReviewedEventDto | CaseSnoozedDto | CaseUnsnoozedDto | CaseAssignedEventDto | SarCreatedEventDto | SarDeletedEventDto | SarStatusChangedEventDto | SarFileUploadedEventDto | EntityAnnotatedEventDto;
export type CaseFileDto = {
    id: string;
    case_id: string;
    created_at: string;
    file_name: string;
};
export type CaseDetailDto = CaseDto & {
    decisions: CaseDecisionDto[];
    events: CaseEventDto[];
    files: CaseFileDto[];
};
export type UpdateCaseBodyDto = {
    name?: string;
    inbox_id?: string;
    status?: CaseStatusDto;
    outcome?: Outcome;
};
export type AssignCaseBodyDto = {
    user_id: string;
};
export type GroupedAnnotations = {
    comments: CommentEntityAnnotationDto[];
    tags: TagEntityAnnotationDto[];
    files: FileEntityAnnotationDto[];
};
export type ClientObjectDetailDto = {
    /** Metadata of the object, in particular the ingestion date. Only present if the object has actually been ingested. */
    metadata: {
        valid_from?: string;
        /** object type in the data model that the data corresponds to */
        object_type: string;
        /** Whether the object can be annotated or not. True for all objects that have been ingested, and for pivot objects that have the "object_id" field from a link. */
        can_be_annotated: boolean;
    };
    /** The actual data of the object, as described in the client data model. */
    data: {
        object_id?: string;
        updated_at?: string;
        [key: string]: any;
    };
    related_objects: {
        /** The name of the link pointing to the object */
        link_name?: string;
        related_object_detail?: ClientObjectDetailDto;
    }[];
    annotations?: GroupedAnnotations;
};
export type PivotObjectDto = {
    /** The "object_id" field of the pivot object. Can be null if the pivot type is "field" or if the pivot does point to another unique field than "object_id", and the object has not been ingested yet. */
    pivot_object_id?: string;
    /** The actual pivot value, as on the decision. This value is used for grouping decisions. */
    pivot_value: string;
    pivot_id?: string;
    pivot_type: "field" | "object";
    /** Name of the entity on which the pivot value is found. */
    pivot_object_name: string;
    /** Name of the field used as a pivot value */
    pivot_field_name: string;
    /** Whether the pivot object has been ingested or not (only for pivot type "object") */
    is_ingested: boolean;
    pivot_object_data: ClientObjectDetailDto;
    /** Number of decisions that have this pivot value */
    number_of_decisions: number;
};
export type NextCaseIdDto = {
    id: string;
};
export type CaseReviewOkDto = {
    ok: true;
};
export type CaseReviewNotOkDto = {
    ok: false;
    sanity_check: string;
};
export type CaseReviewDto = {
    output: string;
    thought?: string;
} & (CaseReviewOkDto | CaseReviewNotOkDto);
export type SuspiciousActivityReportDto = {
    id: string;
    status: "pending" | "completed";
    has_file: boolean;
    created_by: string;
    created_at: string;
};
export type SuspiciousActivityReportBodyDto = {
    status?: "pending" | "completed";
    file?: Blob;
};
export type Tag = {
    id: string;
    name: string;
    color: string;
    organization_id: string;
    created_at: string;
    cases_count?: number;
};
export type ScheduledExecutionDto = {
    finished_at: string | null;
    id: string;
    /** Whether the execution was manual or not */
    manual: boolean;
    /** Number of decisions who were created (matched the trigger condition) */
    number_of_created_decisions: number;
    /** Number of decisions who were executed (even if they did not match the trigger condition) */
    number_of_evaluated_decisions: number;
    /** Number of decisions who have been planned (using the preliminary filter of ingsted entities in the DB). Null before the execution initial filter has run. */
    number_of_planned_decisions: number | null;
    scenario_id: string;
    scenario_iteration_id: string;
    scenario_name: string;
    scenario_trigger_object_type: string;
    started_at: string;
    status: "pending" | "processing" | "success" | "failure" | "partial_failure";
};
export type RuleSnoozeDto = {
    id: string;
    pivot_value: string;
    starts_at: string;
    ends_at: string;
    created_by_user: string;
    created_from_decision_id?: string;
    created_from_rule_id: string;
};
export type RuleSnoozeWithRuleIdDto = RuleSnoozeDto & {
    rule_id: string;
};
export type SnoozesOfDecisionDto = {
    decision_id: string;
    rule_snoozes: RuleSnoozeWithRuleIdDto[];
};
export type SnoozeDecisionInputDto = {
    rule_id: string;
    duration: string;
    comment?: string;
};
export type UploadLog = {
    started_at: string;
    finished_at: string;
    status: "success" | "failure" | "progressing" | "pending";
    lines_processed: number;
    num_rows_ingested: number;
};
export type DataModelObjectDto = {
    data: {
        [key: string]: any;
    };
    metadata: {
        valid_from: string;
    };
};
export type ComponentsSchemasTagEntityAnnotationDtoAllOf1 = {
    "type": "tag";
    payload: {
        tag_id: string;
    };
};
export type ComponentsSchemasCommentEntityAnnotationDtoAllOf1 = {
    "type": "comment";
    payload: {
        /** body of the comment */
        text: string;
    };
};
export type CreateAnnotationDto = (ComponentsSchemasTagEntityAnnotationDtoAllOf1 | ComponentsSchemasCommentEntityAnnotationDtoAllOf1) & {
    caseId?: string;
};
export type ClientDataListRequestBody = {
    exploration_options: {
        /** The table from which we want to start the exploration. */
        source_table_name: string;
        /** The main field on which we want to filter the objects */
        filter_field_name: string;
        /** The value of the main field on which we want to filter the objects, based on the 'source' object used as a reference. */
        filter_field_value: string | number;
        /** The field on which we want to order the objects (in descending order) */
        ordering_field_name: string;
    };
    /** The id of the object after which to paginate, using ordering by the specified field in 'exploration_options' */
    cursor_id?: string | number;
    /** The maximum number of objects to return */
    limit?: number;
};
export type FieldStatisticsDtoBase = object;
export type StringFieldStatisticsDto = {
    "type": "String";
} & FieldStatisticsDtoBase & {
    max_length?: number;
    format?: string;
};
export type BoolFieldStatisticsDto = {
    "type": "Bool";
} & FieldStatisticsDtoBase;
export type FloatFieldStatisticsDto = {
    "type": "Float";
} & FieldStatisticsDtoBase & {
    max_length?: number;
};
export type TimestampFieldStatisticsDto = {
    "type": "Timestamp";
} & FieldStatisticsDtoBase;
export type FieldStatisticsDto = StringFieldStatisticsDto | BoolFieldStatisticsDto | FloatFieldStatisticsDto | TimestampFieldStatisticsDto;
export type ClientDataListResponseDto = {
    data: ClientObjectDetailDto[];
    metadata: {
        field_statistics: {
            [key: string]: FieldStatisticsDto;
        };
    };
    pagination: {
        /** The id of the object after which to paginate, using ordering by the specified field in 'exploration_options' */
        next_cursor_id?: string | number;
        /** Whether there are more objects to paginate */
        has_next_page: boolean;
    };
};
export type CustomListDto = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    /** Count of values in a custom list */
    values_count: {
        count: number;
        has_more: boolean;
    };
};
export type CreateCustomListBodyDto = {
    name: string;
    description: string;
};
export type CustomListValueDto = {
    id: string;
    value: string;
};
export type CustomListWithValuesDto = CustomListDto & {
    values: CustomListValueDto[];
};
export type UpdateCustomListBodyDto = {
    name: string;
    description: string;
};
export type CreateCustomListValueBody = {
    value: string;
};
export type NodeDto = {
    id?: string;
    name?: string;
    constant?: ConstantDto;
    children?: NodeDto[];
    named_children?: {
        [key: string]: NodeDto;
    };
};
export type ScenarioDto = {
    id: string;
    created_at: string;
    decision_to_case_inbox_id?: string;
    decision_to_case_outcomes: OutcomeDto[];
    decision_to_case_workflow_type: "DISABLED" | "CREATE_CASE" | "ADD_TO_CASE_IF_POSSIBLE";
    decision_to_case_name_template?: (NodeDto) | null;
    description: string;
    live_version_id?: string;
    name: string;
    organization_id: string;
    trigger_object_type: string;
};
export type ScenarioCreateInputDto = {
    description: string;
    name: string;
    trigger_object_type: string;
};
export type ScenarioUpdateInputDto = {
    decision_to_case_inbox_id?: string;
    decision_to_case_outcomes?: OutcomeDto[];
    decision_to_case_workflow_type?: "DISABLED" | "CREATE_CASE" | "ADD_TO_CASE_IF_POSSIBLE";
    decision_to_case_name_template?: NodeDto;
    description?: string;
    name?: string;
};
export type ScenarioAstValidateInputDto = {
    node?: NodeDto;
    expected_return_type?: "string" | "int" | "float" | "bool";
};
export type ScenarioValidationErrorCodeDto = "DATA_MODEL_NOT_FOUND" | "TRIGGER_OBJECT_NOT_FOUND" | "TRIGGER_CONDITION_REQUIRED" | "RULE_FORMULA_REQUIRED" | "FORMULA_MUST_RETURN_BOOLEAN" | "FORMULA_INCORRECT_RETURN_TYPE" | "SCORE_THRESHOLD_MISSING" | "SCORE_THRESHOLDS_MISMATCH";
export type ScenarioValidationErrorDto = {
    error: ScenarioValidationErrorCodeDto;
    message: string;
};
export type AstValidationDto = {
    errors: ScenarioValidationErrorDto[];
    evaluation: NodeEvaluationDto;
};
export type ScenarioRuleLatestVersion = {
    "type": "rule" | "screening";
    stable_id: string;
    name: string;
    latest_version: string;
};
export type ScenarioIterationDto = {
    id: string;
    scenario_id: string;
    version: number | null;
    created_at: string;
    updated_at: string;
};
export type SanctionCheckConfigDto = {
    id?: string;
    name?: string;
    description?: string;
    rule_group?: string;
    datasets?: string[];
    threshold?: number;
    forced_outcome?: OutcomeDto;
    trigger_rule?: NodeDto;
    entity_type?: "Thing" | "Person" | "Organization" | "Vehicle";
    /** Mapping from OpenSanction entity field to AST node. All entity types support the `name` field. Additional field will depend on the selected entity type. */
    query?: {
        name: NodeDto;
        [key: string]: NodeDto;
    };
    counterparty_id_expression?: NodeDto;
    /** Configuration of preprocessing steps for the counterparty name */
    preprocessing?: {
        /** Whether the counterparty name should go through Name Entity Recognition */
        use_ner?: boolean;
        /** Whether to skip the rule if the counterparty name is under X characters */
        skip_if_under?: number;
        /** Whether to strip numbers from the counterparty name */
        remove_numbers?: boolean;
        /** Whether to strip items from a custom list from the counterparty name */
        ignore_list_id?: string;
    };
};
export type ScenarioIterationRuleDto = {
    id: string;
    scenario_iteration_id: string;
    display_order: number;
    name: string;
    description: string;
    rule_group: string;
    formula_ast_expression: (NodeDto) | null;
    score_modifier: number;
    created_at: string;
};
export type ScenarioIterationWithBodyDto = ScenarioIterationDto & {
    body: {
        sanction_check_configs?: SanctionCheckConfigDto[];
        trigger_condition_ast_expression?: (NodeDto) | null;
        score_review_threshold?: number;
        score_block_and_review_threshold?: number;
        score_decline_threshold?: number;
        rules: ScenarioIterationRuleDto[];
        schedule?: string;
    };
};
export type CreateScenarioIterationRuleBodyDto = {
    scenario_iteration_id: string;
    display_order: number;
    name: string;
    description: string;
    rule_group: string;
    formula_ast_expression: (NodeDto) | null;
    score_modifier: number;
};
export type CreateScenarioIterationBody = {
    scenario_id: string;
    body?: {
        trigger_condition_ast_expression?: (NodeDto) | null;
        score_review_threshold?: number;
        score_block_and_review_threshold?: number;
        score_decline_threshold?: number;
        rules?: CreateScenarioIterationRuleBodyDto[];
    };
};
export type UpdateScenarioIterationBody = {
    body?: {
        trigger_condition_ast_expression?: (NodeDto) | null;
        score_review_threshold?: number;
        score_block_and_review_threshold?: number;
        score_decline_threshold?: number;
        schedule?: string;
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
export type RuleSnoozeInformationDto = {
    rule_id: string;
    snooze_group_id: string;
    has_snoozes_active: boolean;
};
export type SnoozesOfIterationDto = {
    iteration_id: string;
    rule_snoozes: RuleSnoozeInformationDto[];
};
export type SanctionCheckEntityDto = "Thing" | "Address" | "Airplane" | "Asset" | "Associate" | "Company" | "CryptoWallet" | "Debt" | "Directorship" | "Employment" | "Family" | "Identification" | "LegalEntity" | "Membership" | "Occupancy" | "Organization" | "Ownership" | "Passport" | "Payment" | "Person" | "Position" | "PublicBody" | "Representation" | "Sanction" | "Security" | "Succession" | "UnknownLink" | "Vessel" | "Vehicle";
export type Items = {
    schema: SanctionCheckEntityDto;
    properties: {
        [key: string]: string[];
    };
};
export type SanctionCheckRequestDto = {
    threshold: number;
    limit: number;
    search_input: {
        queries: {
            [key: string]: Items;
        };
    };
};
export type SanctionCheckSanctionEntityDto = {
    id: string;
    schema: "Sanction";
    properties: {
        [key: string]: string[];
    };
};
export type SanctionCheckMatchPayloadDto = {
    id: string;
    match: boolean;
    score: number;
    schema: SanctionCheckEntityDto;
    caption: string;
    properties: {
        sanctions?: SanctionCheckSanctionEntityDto[];
    } & {
        [key: string]: string[];
    };
};
export type SanctionCheckMatchDto = {
    id: string;
    entity_id: string;
    query_ids: string[];
    status: "pending" | "confirmed_hit" | "no_hit" | "skipped";
    datasets: any;
    unique_counterparty_identifier?: string;
    payload: SanctionCheckMatchPayloadDto;
    enriched: boolean;
    comments: {
        id: string;
        author_id: string;
        comment: string;
        created_at: string;
    }[];
};
export type SanctionCheckSuccessDto = {
    id: string;
    config: {
        name: string;
    };
    decision_id: string;
    status: "in_review" | "confirmed_hit";
    request: SanctionCheckRequestDto;
    initial_query?: Items[];
    partial: boolean;
    is_manual: boolean;
    matches: SanctionCheckMatchDto[];
};
export type SanctionCheckErrorDto = {
    id: string;
    config: {
        name: string;
    };
    decision_id: string;
    status: "error";
    request?: SanctionCheckRequestDto;
    initial_query?: {
        schema: SanctionCheckEntityDto;
        properties: {
            [key: string]: string[];
        };
    }[];
    partial: boolean;
    is_manual: boolean;
    matches: SanctionCheckMatchDto[];
    error_codes: "all_fields_null_or_empty"[];
};
export type SanctionCheckDto = SanctionCheckSuccessDto | {
    id: string;
    config: {
        name: string;
    };
    decision_id: string;
    status: "no_hit";
    request?: SanctionCheckRequestDto;
    initial_query?: Items[];
    partial: boolean;
    is_manual: boolean;
    matches: SanctionCheckMatchDto[];
} | SanctionCheckErrorDto;
export type OpenSanctionsCatalogDataset = {
    name: string;
    title: string;
    tag?: string;
};
export type OpenSanctionsCatalogSection = {
    name: string;
    title: string;
    datasets: OpenSanctionsCatalogDataset[];
};
export type OpenSanctionsCatalogDto = {
    sections: OpenSanctionsCatalogSection[];
};
export type SanctionCheckFileDto = {
    id: string;
    filename: string;
    created_at: string;
};
export type UpdateSanctionCheckMatchDto = {
    status: "confirmed_hit" | "no_hit";
    comment?: string;
    whitelist?: boolean;
};
export type SanctionCheckRefineDto = object;
export type OpenSanctionsUpstreamDatasetFreshnessDto = {
    version: string;
    name: string;
    last_export: string;
};
export type OpenSanctionsDatasetFreshnessDto = {
    upstream: OpenSanctionsUpstreamDatasetFreshnessDto;
    version: string;
    up_to_date: boolean;
};
export type UpdateScenarioIterationRuleBodyDto = {
    display_order?: number;
    name?: string;
    description?: string;
    rule_group?: string;
    formula_ast_expression?: (NodeDto) | null;
    score_modifier?: number;
};
export type PublicationAction = "publish" | "unpublish";
export type ScenarioPublication = {
    id: string;
    created_at: string;
    scenario_iteration_id: string;
    publication_action: PublicationAction;
};
export type CreateScenarioPublicationBody = {
    scenario_iteration_id: string;
    publication_action: PublicationAction;
};
export type ScenarioPublicationStatusDto = {
    preparation_status: "required" | "ready_to_activate";
    preparation_service_status: "available" | "occupied";
};
export type FieldDto = {
    id: string;
    data_type: "Bool" | "Int" | "Float" | "String" | "Timestamp" | "unknown";
    description: string;
    is_enum: boolean;
    name: string;
    nullable: boolean;
    table_id: string;
    values?: (string | number)[];
    unicity_constraint: "no_unicity_constraint" | "pending_unique_constraint" | "active_unique_constraint";
};
export type LinkToSingleDto = {
    id: string;
    parent_table_name: string;
    parent_table_id: string;
    parent_field_name: string;
    parent_field_id: string;
    child_table_name: string;
    child_table_id: string;
    child_field_name: string;
    child_field_id: string;
};
export type NavigationOptionDto = {
    /** name of the table we use as a starting point to explore "many" entries from another table, by correlating fields. */
    source_table_name: string;
    source_table_id: string;
    /** name of the field whose value we use as a filter on this object. */
    source_field_name: string;
    source_field_id: string;
    /** name of the table for which we explore "many" entries from a reference object. May be the same as the parent table. */
    target_table_name: string;
    target_table_id: string;
    /** name of the field on which to filter the target table (on the "many" side of the relation) */
    filter_field_name: string;
    filter_field_id: string;
    /** name of the field on which to order the target table (on the "many" side of the relation) */
    ordering_field_name: string;
    ordering_field_id: string;
    /** status of the index that is created in the database to allow data exploration on the child table. */
    status: "pending" | "valid" | "invalid";
};
export type TableDto = {
    id: string;
    name: string;
    description: string;
    fields: {
        [key: string]: FieldDto;
    };
    links_to_single?: {
        [key: string]: LinkToSingleDto;
    };
    navigation_options?: NavigationOptionDto[];
};
export type DataModelDto = {
    tables: {
        [key: string]: TableDto;
    };
};
export type CreateTableBody = {
    name: string;
    description: string;
};
export type UpdateTableBody = {
    description?: string;
};
export type CreateTableFieldDto = {
    name: string;
    description: string;
    "type": "Bool" | "Int" | "Float" | "String" | "Timestamp";
    nullable: boolean;
    is_enum?: boolean;
    is_unique?: boolean;
};
export type UpdateTableFieldDto = {
    description?: string;
    is_enum?: boolean;
    is_unique?: boolean;
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
export type PivotDto = {
    id: string;
    created_at: string;
    base_table: string;
    base_table_id: string;
    pivot_table: string;
    pivot_table_id: string;
    field: string;
    field_id: string;
    path_links: string[];
    path_link_ids: string[];
};
export type CreatePivotInputDto = {
    base_table_id: string;
    field_id?: string;
    path_link_ids?: string[];
};
export type CreateNavigationOptionDto = {
    source_field_id?: string;
    target_table_id?: string;
    filter_field_id?: string;
    ordering_field_id?: string;
};
export type DataModelTableOptionsDto = {
    /** List of field IDs to display when navigating the table */
    displayed_fields?: string[];
    /** List of field IDs in their display order */
    field_order: string[];
};
export type SetDataModelTableOptionsBodyDto = {
    /** List of field IDs to display when navigating the table */
    displayed_fields?: string[];
    /** List of field IDs in their display order */
    field_order: string[];
};
export type AnalyticsDto = {
    embedding_type: "global_dashboard" | "unknown_embedding_type";
    signed_embedding_url: string;
};
export type AppConfigDto = {
    version: string;
    status: {
        migrations: boolean;
        has_org: boolean;
        has_user: boolean;
    };
    urls: {
        marble: string;
        metabase: string;
    };
    auth: {
        firebase: {
            is_emulator: boolean;
            emulator_host: string;
            project_id: string;
            api_key: string;
            auth_domain: string;
        };
    };
    features: {
        sso: boolean;
        segment: boolean;
    };
    is_managed_marble: boolean;
};
export type ApiKeyDto = {
    id: string;
    description: string;
    organization_id: string;
    /** 3 first characters of the API key */
    prefix: string;
    role: string;
};
export type CreateApiKeyBody = {
    description: string;
    role: string;
};
export type CreatedApiKeyDto = ApiKeyDto & {
    key: string;
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
    first_name: string;
    last_name: string;
};
export type UpdateUser = {
    email: string;
    role: string;
    organization_id: string;
    first_name: string;
    last_name: string;
};
export type OrganizationDto = {
    id: string;
    /** (Immutable) name of the organization */
    name: string;
    /** Timezone (IANA format) used by default for scenarios of this organization, when interpreting timestamps as datetimes. */
    default_scenario_timezone?: string;
    /** Threshold for screenings */
    sanctions_threshold?: number;
    /** Limit for screenings */
    sanctions_limit?: number;
    /** Maximum number of assignable cases for a user */
    auto_assign_queue_limit?: number;
};
export type CreateOrganizationBodyDto = {
    name: string;
};
export type UpdateOrganizationBodyDto = {
    default_scenario_timezone?: string;
    sanctions_threshold?: number;
    sanctions_limit?: number;
    auto_assign_queue_limit?: number;
};
export type InboxUserDto = {
    id: string;
    inbox_id: string;
    user_id: string;
    role: string;
    auto_assignable: boolean;
};
export type InboxDto = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: "active" | "archived";
    users?: InboxUserDto[];
    cases_count?: number;
    escalation_inbox_id?: string;
    auto_assign_enabled: boolean;
};
export type CreateInboxBodyDto = {
    name: string;
};
export type InboxMetadataDto = {
    id: string;
    name: string;
};
export type AddInboxUserBodyDto = {
    user_id: string;
    role: string;
    auto_assignable: boolean;
};
export type WebhookDto = {
    id: string;
    event_types?: string[];
    url: string;
    http_timeout?: number;
    rate_limit?: number;
    rate_limit_duration?: number;
};
export type WebhookRegisterBodyDto = {
    event_types: string[];
    url: string;
    http_timeout?: number;
    rate_limit?: number;
    rate_limit_duration?: number;
};
export type WebhookSecretDto = {
    id?: string;
    created_at?: string;
    deleted_at?: string;
    expires_at?: string;
    updated_at?: string;
    value?: string;
};
export type WebhookWithSecretDto = WebhookDto & {
    secrets?: WebhookSecretDto[];
};
export type WebhookUpdateBodyDto = {
    event_types?: string[];
    url?: string;
    http_timeout?: number;
    rate_limit?: number;
    rate_limit_duration?: number;
};
export type TestRunStatusDto = "pending" | "up" | "down" | "unknown";
export type TestRunDto = {
    id: string;
    scenario_id: string;
    ref_iteration_id: string;
    test_iteration_id: string;
    start_date: string;
    end_date: string;
    creator_id: string;
    status: TestRunStatusDto;
};
export type TestRunCreateInputDto = {
    scenario_id: string;
    test_iteration_id: string;
    end_date: string;
};
export type TestRunDecisionDataDto = {
    version: string;
    outcome: OutcomeDto;
    score?: number;
    total: number;
};
export type TestRunRuleExecutionDataDto = {
    version: string;
    name: string;
    status: "hit" | "no_hit" | "error" | "snoozed";
    total: number;
    stable_rule_id?: string;
};
export type WorkflowRuleDto = {
    id: string;
    name: string;
    fallthrough: boolean;
};
export type AlwaysMatches = {
    "function": "always";
};
export type NeverMatches = {
    "function": "never";
};
export type IfOutcomeIn = {
    "function": "outcome_in";
    params: OutcomeDto[];
};
export type WorkflowConditionDetailDto = AlwaysMatches | NeverMatches | IfOutcomeIn | {
    "function": "rule_hit";
    params: {
        /** ID of a rule that must match */
        rule_id: string;
    };
} | {
    "function": "payload_evaluates";
    params: {
        expression: NodeDto;
    };
};
export type WorkflowConditionDto = {
    id: string;
} & WorkflowConditionDetailDto;
export type ActionDoNothing = {
    action: "DISABLED";
};
export type ActionCreateOrAddToACase = {
    action: "CREATE_CASE" | "ADD_TO_CASE_IF_POSSIBLE";
    params: {
        inbox_id: string;
        any_inbox?: boolean;
        title_template?: NodeDto;
    };
};
export type WorkflowActionDetailDto = ActionDoNothing | ActionCreateOrAddToACase;
export type WorkflowActionDto = {
    id: string;
} & WorkflowActionDetailDto;
export type CreateWorkflowRuleDto = {
    scenario_id: string;
    name: string;
    fallthrough: boolean;
};
export type PersonalSettingsUnavailableDto = {
    until: string;
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
        headers: oazapfts.mergeHeaders(opts?.headers, {
            "X-API-Key": xApiKey,
            Authorization: authorization
        })
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
export function listDecisions({ caseId, endDate, hasCase, outcome, pivotValue, scenarioId, caseInboxId, reviewStatus, scheduledExecutionId, startDate, triggerObject, limit, offsetId, order, sorting }: {
    caseId?: string[];
    endDate?: string;
    hasCase?: boolean;
    outcome?: OutcomeDto[];
    pivotValue?: string;
    scenarioId?: string[];
    caseInboxId?: string[];
    reviewStatus?: ReviewStatusDto[];
    scheduledExecutionId?: string[];
    startDate?: string;
    triggerObject?: string[];
    limit?: number;
    offsetId?: string;
    order?: "ASC" | "DESC";
    sorting?: "created_at";
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Pagination & {
            items: DecisionDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/decisions/with-ranks${QS.query(QS.explode({
        "case_id[]": caseId,
        end_date: endDate,
        has_case: hasCase,
        "outcome[]": outcome,
        pivot_value: pivotValue,
        "scenario_id[]": scenarioId,
        "case_inbox_id[]": caseInboxId,
        "review_status[]": reviewStatus,
        "scheduled_execution_id[]": scheduledExecutionId,
        start_date: startDate,
        "trigger_object[]": triggerObject,
        limit,
        offset_id: offsetId,
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
        data: DecisionDetailDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/decisions/with-ranks", oazapfts.json({
        ...opts,
        method: "POST",
        body: createDecisionBody
    })));
}
/**
 * Get an annotation by ID
 */
export function getAnnotation(annotationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CommentEntityAnnotationDto | TagEntityAnnotationDto | FileEntityAnnotationDto;
    }>(`/client_data/annotations/${encodeURIComponent(annotationId)}`, {
        ...opts
    }));
}
/**
 * List cases
 */
export function listCases({ status, inboxId, startDate, endDate, sorting, name, offsetId, limit, order, includeSnoozed, excludeAssigned, assigneeId }: {
    status?: CaseStatusDto[];
    inboxId?: string[];
    startDate?: string;
    endDate?: string;
    sorting?: "created_at";
    name?: string;
    offsetId?: string;
    limit?: number;
    order?: "ASC" | "DESC";
    includeSnoozed?: boolean;
    excludeAssigned?: boolean;
    assigneeId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Pagination & {
            items: CaseDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/cases${QS.query(QS.explode({
        "status[]": status,
        "inbox_id[]": inboxId,
        start_date: startDate,
        end_date: endDate,
        sorting,
        name,
        offset_id: offsetId,
        limit,
        order,
        include_snoozed: includeSnoozed,
        exclude_assigned: excludeAssigned,
        assignee_id: assigneeId
    }))}`, {
        ...opts
    }));
}
/**
 * Create a case
 */
export function createCase(createCaseBodyDto: CreateCaseBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
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
        body: createCaseBodyDto
    })));
}
/**
 * Get a case by id
 */
export function getCase(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CaseDetailDto;
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
export function updateCase(caseId: string, updateCaseBodyDto: UpdateCaseBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
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
        body: updateCaseBodyDto
    })));
}
/**
 * Assign a user to a case
 */
export function assignUser(caseId: string, assignCaseBodyDto: AssignCaseBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/assignee`, oazapfts.json({
        ...opts,
        method: "POST",
        body: assignCaseBodyDto
    })));
}
/**
 * Unassign a user from a case
 */
export function unassignUser(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/assignee`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List a case decisions
 */
export function getPaginatedCaseDecisions(caseId: string, { cursorId, limit }: {
    cursorId?: string;
    limit?: number;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            decisions: CaseDecisionDto[];
            pagination: {
                has_more?: boolean;
                cursor_id?: string;
            };
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
    }>(`/cases/${encodeURIComponent(caseId)}/decisions${QS.query(QS.explode({
        cursor_id: cursorId,
        limit
    }))}`, {
        ...opts
    }));
}
/**
 * Add decisions to a case
 */
export function addDecisionsToCase(caseId: string, body: {
    /** List of decision IDs to add to the case */
    decision_ids: string[];
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
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
    }>(`/cases/${encodeURIComponent(caseId)}/decisions`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Add a comment to a case
 */
export function addCommentToCase(caseId: string, body: {
    comment: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
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
    }>(`/cases/${encodeURIComponent(caseId)}/comments`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Snooze a case
 */
export function snoozeCase(caseId: string, body: {
    until: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/snooze`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Snooze a case
 */
export function unsnoozeCase(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/snooze`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Define tags for a case
 */
export function updateTagsForCase(caseId: string, body: {
    /** List of all tag IDs for the case */
    tag_ids: string[];
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
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
    }>(`/cases/${encodeURIComponent(caseId)}/case_tags`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Download a case file
 */
export function downloadCaseFile(caseFileId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            /** Signed url to download the case file's content */
            url: string;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/cases/files/${encodeURIComponent(caseFileId)}/download_link`, {
        ...opts
    }));
}
/**
 * Review a decision
 */
export function reviewDecision(body: {
    decision_id: string;
    review_comment: string;
    review_status: ReviewStatusDto;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            "case": CaseDetailDto;
        };
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/cases/review_decision", oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Get case pivot objects
 */
export function getPivotObjectsForCase(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            pivot_objects?: PivotObjectDto[];
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
    }>(`/cases/${encodeURIComponent(caseId)}/pivot_objects`, {
        ...opts
    }));
}
/**
 * Get cases related to a pivot from a pivot value
 */
export function getPivotRelatedCases(pivotValue: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CaseDto[];
    }>(`/cases/related/pivot/${encodeURIComponent(pivotValue)}`, {
        ...opts
    }));
}
/**
 * Get the next unassigned case
 */
export function getNextCase(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: NextCaseIdDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/next`, {
        ...opts
    }));
}
/**
 * Escalate a case
 */
export function escalateCase(caseId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/cases/${encodeURIComponent(caseId)}/escalate`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Get the most recent AI generated review (if present) for a case
 */
export function getMostRecentCaseReview(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CaseReviewDto[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/review`, {
        ...opts
    }));
}
/**
 * Enqueue a review for a case powered by AI
 */
export function enqueueReviewForCase(caseId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/cases/${encodeURIComponent(caseId)}/review/enqueue`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Download a case data for investigation
 */
export function downloadCaseData(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Blob;
    } | {
        status: 401;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/data_for_investigation`, {
        ...opts
    }));
}
/**
 * List suspicious activity reports for a case
 */
export function sarList(caseId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SuspiciousActivityReportDto[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/sar`, {
        ...opts
    }));
}
/**
 * Create a suspicious activity report
 */
export function sarCreate(caseId: string, suspiciousActivityReportBodyDto: SuspiciousActivityReportBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: SuspiciousActivityReportDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/sar`, oazapfts.multipart({
        ...opts,
        method: "POST",
        body: suspiciousActivityReportBodyDto
    })));
}
/**
 * Update a suspicious activity report
 */
export function sarUpdate(caseId: string, reportId: string, suspiciousActivityReportBodyDto: SuspiciousActivityReportBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SuspiciousActivityReportDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/cases/${encodeURIComponent(caseId)}/sar/${encodeURIComponent(reportId)}`, oazapfts.multipart({
        ...opts,
        method: "PATCH",
        body: suspiciousActivityReportBodyDto
    })));
}
/**
 * Delete a suspicious activity report
 */
export function sarDelete(caseId: string, reportId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/cases/${encodeURIComponent(caseId)}/sar/${encodeURIComponent(reportId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Download a suspicious activity report file
 */
export function sarDownload(caseId: string, reportId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            url: string;
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
    }>(`/cases/${encodeURIComponent(caseId)}/sar/${encodeURIComponent(reportId)}/download`, {
        ...opts
    }));
}
/**
 * List tags
 */
export function listTags({ target, withCaseCount }: {
    target?: "case" | "object";
    withCaseCount?: boolean;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            tags: Tag[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/tags${QS.query(QS.explode({
        target,
        withCaseCount
    }))}`, {
        ...opts
    }));
}
/**
 * Create a tag
 */
export function createTag(body: {
    name: string;
    color: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            tag: Tag;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/tags", oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Update a tag
 */
export function updateTag(tagId: string, body: {
    name: string;
    color: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            tag: Tag;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/tags/${encodeURIComponent(tagId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    })));
}
/**
 * Delete a tag
 */
export function deleteTag(tagId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: Tag;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/tags/${encodeURIComponent(tagId)}`, {
        ...opts,
        method: "DELETE"
    }));
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
            scheduled_executions: ScheduledExecutionDto[];
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
        data: DecisionDetailDto;
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
 * Get active snoozes for a decision
 */
export function getDecisionActiveSnoozes(decisionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            snoozes: SnoozesOfDecisionDto;
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
    }>(`/decisions/${encodeURIComponent(decisionId)}/active-snoozes`, {
        ...opts
    }));
}
/**
 * Create a snooze for a decision
 */
export function createSnoozeForDecision(decisionId: string, snoozeDecisionInputDto: SnoozeDecisionInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            snoozes: SnoozesOfDecisionDto;
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
    }>(`/decisions/${encodeURIComponent(decisionId)}/snooze`, oazapfts.json({
        ...opts,
        method: "POST",
        body: snoozeDecisionInputDto
    })));
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
 * Get an ingested object based on the tableId and objectId passed
 */
export function getIngestedObject(tableName: string, objectId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: DataModelObjectDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/client_data/${encodeURIComponent(tableName)}/${encodeURIComponent(objectId)}`, {
        ...opts
    }));
}
/**
 * Create an annotation on client data
 */
export function createAnnotation(tableName: string, objectId: string, createAnnotationDto: CreateAnnotationDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    } | {
        status: 422;
        data: object;
    }>(`/client_data/${encodeURIComponent(tableName)}/${encodeURIComponent(objectId)}/annotations`, oazapfts.json({
        ...opts,
        method: "POST",
        body: createAnnotationDto
    })));
}
/**
 * Get a list of objects from a table, given a starting object, a set of filters & ordering field matching the exploration options available on the starting object, and optional cursor pagination.
 */
export function listClientObjects(tableName: string, clientDataListRequestBody: ClientDataListRequestBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ClientDataListResponseDto;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    } | {
        status: 422;
        data: object;
    }>(`/client_data/${encodeURIComponent(tableName)}/list`, oazapfts.json({
        ...opts,
        method: "POST",
        body: clientDataListRequestBody
    })));
}
/**
 * Removes an annotation by ID
 */
export function deleteAnnotation(annotationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
    } | {
        status: 400;
        data: string;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    } | {
        status: 422;
        data: object;
    }>(`/annotations/${encodeURIComponent(annotationId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Download an annotation file
 */
export function downloadAnnotationFile(annotationId: string, fileId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            /** Signed url to download the case file's content */
            url: string;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/annotations/file/${encodeURIComponent(annotationId)}/${encodeURIComponent(fileId)}`, {
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
            custom_lists: CustomListDto[];
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
export function createCustomList(createCustomListBodyDto: CreateCustomListBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list: CustomListDto;
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
        body: createCustomListBodyDto
    })));
}
/**
 * Get values of the corresponding custom list
 */
export function getCustomList(customListId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list: CustomListWithValuesDto;
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
export function updateCustomList(customListId: string, updateCustomListBodyDto: UpdateCustomListBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list: CustomListDto;
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
    }>(`/custom-lists/${encodeURIComponent(customListId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateCustomListBodyDto
    })));
}
/**
 * Delete a custom list
 */
export function deleteCustomList(customListId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: CustomListDto;
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
 * Download a custom list values as a CSV file
 */
export function downloadListValuesAsCsvFile(customListId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: string;
    } | {
        status: 401;
        data: string;
    }>(`/custom-lists/${encodeURIComponent(customListId)}/values`, {
        ...opts
    }));
}
/**
 * Create a custom list value
 */
export function createCustomListValue(customListId: string, createCustomListValueBody: CreateCustomListValueBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            custom_list_value: CustomListValueDto;
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
        data: CustomListValueDto;
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
        data: ScenarioDto[];
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
export function createScenario(scenarioCreateInputDto: ScenarioCreateInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioDto;
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
        body: scenarioCreateInputDto
    })));
}
/**
 * Get a scenario by id
 */
export function getScenario(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioDto;
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
export function updateScenario(scenarioId: string, scenarioUpdateInputDto: ScenarioUpdateInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioDto;
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
        body: scenarioUpdateInputDto
    })));
}
/**
 * Validate an AST
 */
export function validateAstNode(scenarioId: string, scenarioAstValidateInputDto?: ScenarioAstValidateInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            ast_validation: AstValidationDto;
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
    }>(`/scenarios/${encodeURIComponent(scenarioId)}/validate-ast`, oazapfts.json({
        ...opts,
        method: "POST",
        body: scenarioAstValidateInputDto
    })));
}
/**
 * Get latest rules references for a scenario
 */
export function scenarioRuleLatestVersions(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioRuleLatestVersion[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenarios/${encodeURIComponent(scenarioId)}/rules/latest`, {
        ...opts
    }));
}
/**
 * List iterations
 */
export function listScenarioIterations({ scenarioId }: {
    scenarioId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioIterationWithBodyDto[];
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
        scenario_id: scenarioId
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
 * Validate a scenario iteration by id. A rule or trigger can be override in the body
 */
export function validateScenarioIteration(scenarioIterationId: string, body?: {
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
 * Get active snoozes for a scenario iteration
 */
export function getScenarioIterationActiveSnoozes(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            snoozes: SnoozesOfIterationDto;
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
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/active-snoozes`, {
        ...opts
    }));
}
/**
 * Commit a scenario iteration
 */
export function commitScenarioIteration(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/commit`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Create a screening for a scenario iteration
 */
export function createSanctionCheckConfig(scenarioIterationId: string, sanctionCheckConfigDto?: SanctionCheckConfigDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckConfigDto;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/sanction-check`, oazapfts.json({
        ...opts,
        method: "POST",
        body: sanctionCheckConfigDto
    })));
}
/**
 * Delete a screening for a scenario iteration
 */
export function deleteSanctionCheckConfig(scenarioIterationId: string, sanctionCheckConfigId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/sanction-check/${encodeURIComponent(sanctionCheckConfigId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Update a screening for a scenario iteration
 */
export function upsertSanctionCheckConfig(scenarioIterationId: string, sanctionCheckConfigId: string, sanctionCheckConfigDto?: SanctionCheckConfigDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckConfigDto;
    }>(`/scenario-iterations/${encodeURIComponent(scenarioIterationId)}/sanction-check/${encodeURIComponent(sanctionCheckConfigId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: sanctionCheckConfigDto
    })));
}
/**
 * List screenings for a decision
 */
export function listSanctionChecks(decisionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckDto[];
    }>(`/sanction-checks${QS.query(QS.explode({
        decision_id: decisionId
    }))}`, {
        ...opts
    }));
}
/**
 * List Open Sanction Dataset
 */
export function listOpenSanctionDatasets(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: OpenSanctionsCatalogDto;
    }>("/sanction-checks/datasets", {
        ...opts
    }));
}
/**
 * List files for screening
 */
export function listSanctionCheckFiles(screeningId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckFileDto[];
    }>(`/sanction-checks/${encodeURIComponent(screeningId)}/files`, {
        ...opts
    }));
}
/**
 * Upload a file to a screening
 */
export function uploadScreeningFile(screeningId: string, body?: {
    file?: Blob;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchText(`/sanction-checks/${encodeURIComponent(screeningId)}/files`, oazapfts.multipart({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Download a screening uploaded file
 */
export function downloadScreeningFile(screeningId: string, fileId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            /** Signed url to download the screening file's content */
            url: string;
        };
    } | {
        status: 401;
        data: string;
    }>(`/sanction-checks/${encodeURIComponent(screeningId)}/files/${encodeURIComponent(fileId)}`, {
        ...opts
    }));
}
/**
 * Update the status of a screening match
 */
export function updateSanctionCheckMatch(matchId: string, updateSanctionCheckMatchDto: UpdateSanctionCheckMatchDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckMatchDto;
    }>(`/sanction-checks/matches/${encodeURIComponent(matchId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateSanctionCheckMatchDto
    })));
}
/**
 * Enrich the match payload with complete data
 */
export function enrichSanctionCheckMatch(matchId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckMatchDto;
    } | {
        status: 404;
        data: string;
    } | {
        status: 409;
        data: string;
    }>(`/sanction-checks/matches/${encodeURIComponent(matchId)}/enrich`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Search possible matches
 */
export function searchSanctionCheckMatches(sanctionCheckRefineDto?: SanctionCheckRefineDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckMatchPayloadDto[];
    }>("/sanction-checks/search", oazapfts.json({
        ...opts,
        method: "POST",
        body: sanctionCheckRefineDto
    })));
}
/**
 * Try refine the search
 */
export function refineSanctionCheck(sanctionCheckRefineDto?: SanctionCheckRefineDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SanctionCheckDto;
    }>("/sanction-checks/refine", oazapfts.json({
        ...opts,
        method: "POST",
        body: sanctionCheckRefineDto
    })));
}
/**
 * Retrieve the freshness of sanction datasets
 */
export function getDatasetsFreshness(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: OpenSanctionsDatasetFreshnessDto;
    }>("/sanction-checks/freshness", {
        ...opts
    }));
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
export function createScenarioIterationRule(createScenarioIterationRuleBodyDto: CreateScenarioIterationRuleBodyDto, opts?: Oazapfts.RequestOpts) {
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
        body: createScenarioIterationRuleBodyDto
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
export function updateScenarioIterationRule(ruleId: string, updateScenarioIterationRuleBodyDto: UpdateScenarioIterationRuleBodyDto, opts?: Oazapfts.RequestOpts) {
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
        body: updateScenarioIterationRuleBodyDto
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
export function listScenarioPublications({ scenarioId, scenarioIterationId }: {
    scenarioId?: string;
    scenarioIterationId?: string;
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
        scenario_id: scenarioId,
        scenario_iteration_id: scenarioIterationId
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
 * Get scenario publication preparation status
 */
export function getScenarioPublicationPreparationStatus(scenarioIterationId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ScenarioPublicationStatusDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/scenario-publications/preparation${QS.query(QS.explode({
        scenario_iteration_id: scenarioIterationId
    }))}`, {
        ...opts
    }));
}
/**
 * Start scenario publication preparation
 */
export function startScenarioPublicationPreparation(body: {
    scenario_iteration_id: string;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 202;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/scenario-publications/preparation", oazapfts.json({
        ...opts,
        method: "POST",
        body
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
export function postDataModelTableField(tableId: string, createTableFieldDto: CreateTableFieldDto, opts?: Oazapfts.RequestOpts) {
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
        body: createTableFieldDto
    })));
}
/**
 * Update data model field
 */
export function patchDataModelField(fieldId: string, updateTableFieldDto: UpdateTableFieldDto, opts?: Oazapfts.RequestOpts) {
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
        body: updateTableFieldDto
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
 * Get the current version of the OpenAPI specification of the client specific API for data ingestion and decision making
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
 * Get the OpenAPI specification of the client specific API for data ingestion and decision making for a specific version
 */
export function getDataModelOpenApiOfVersion(version: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: OpenApiSpec;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/data-model/openapi/${encodeURIComponent(version)}`, {
        ...opts
    }));
}
/**
 * Get the pivots associated with the current organization (can be filtered by table_id)
 */
export function listDataModelPivots({ tableId }: {
    tableId?: string;
} = {}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            pivots: PivotDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/data-model/pivots${QS.query(QS.explode({
        table_id: tableId
    }))}`, {
        ...opts
    }));
}
/**
 * Create a pivot
 */
export function createDataModelPivot(createPivotInputDto: CreatePivotInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            pivot: PivotDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/data-model/pivots", oazapfts.json({
        ...opts,
        method: "POST",
        body: createPivotInputDto
    })));
}
/**
 * Create a new navigation option (one to many link) from a table from the data model. Under the hood, this creates (concurrently) a new index on the target table, which may take some time if there is already data in the table.
 */
export function postDataModelTableNavigationOption(tableId: string, createNavigationOptionDto: CreateNavigationOptionDto, opts?: Oazapfts.RequestOpts) {
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
    }>(`/data-model/tables/${encodeURIComponent(tableId)}/navigation_options`, oazapfts.json({
        ...opts,
        method: "POST",
        body: createNavigationOptionDto
    })));
}
/**
 * Get display options for data model tables
 */
export function getDataModelTableOptions(tableId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: DataModelTableOptionsDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/data-model/tables/${encodeURIComponent(tableId)}/options`, {
        ...opts
    }));
}
/**
 * Set display options for data model tables
 */
export function setDataModelTableOptions(tableId: string, setDataModelTableOptionsBodyDto: SetDataModelTableOptionsBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/data-model/tables/${encodeURIComponent(tableId)}/options`, oazapfts.json({
        ...opts,
        method: "POST",
        body: setDataModelTableOptionsBodyDto
    })));
}
/**
 * List analytics associated with the current organization (present in the JWT)
 */
export function listAnalytics(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            analytics: AnalyticsDto[];
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
    }>("/analytics", {
        ...opts
    }));
}
/**
 * Retrieves the configuration of the frontend app
 */
export function getAppConfig(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: AppConfigDto;
    }>("/config", {
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
            api_keys: ApiKeyDto[];
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
 * Create an api key
 */
export function createApiKey(createApiKeyBody: CreateApiKeyBody, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            api_key: CreatedApiKeyDto;
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
    }>("/apikeys", oazapfts.json({
        ...opts,
        method: "POST",
        body: createApiKeyBody
    })));
}
/**
 * Delete an api key
 */
export function deleteApiKey(apiKeyId: string, opts?: Oazapfts.RequestOpts) {
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
    }>(`/apikeys/${encodeURIComponent(apiKeyId)}`, {
        ...opts,
        method: "DELETE"
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
 * Update a user
 */
export function updateUser(userId: string, updateUser: UpdateUser, opts?: Oazapfts.RequestOpts) {
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
    }>(`/users/${encodeURIComponent(userId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: updateUser
    })));
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
 * List all inboxes
 */
export function listInboxes({ withCaseCount }: {
    withCaseCount?: boolean;
} = {}, opts?: Oazapfts.RequestOpts) {
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
    }>(`/inboxes${QS.query(QS.explode({
        withCaseCount
    }))}`, {
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
 * Get an inbox metadata by id
 */
export function listInboxesMetadata(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: InboxMetadataDto[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>("/inboxes/metadata", {
        ...opts
    }));
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
 * Update an inbox
 */
export function updateInbox(inboxId: string, body: {
    name: string;
    escalation_inbox_id?: string;
    auto_assign_enabled?: boolean;
}, opts?: Oazapfts.RequestOpts) {
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
    }>(`/inboxes/${encodeURIComponent(inboxId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    })));
}
/**
 * Delete an inbox
 */
export function deleteInbox(inboxId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/inboxes/${encodeURIComponent(inboxId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Get an inbox metadata by id
 */
export function getInboxMetadata(inboxId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: InboxMetadataDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
        data: string;
    }>(`/inboxes/${encodeURIComponent(inboxId)}/metadata`, {
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
 * List all inbox users
 */
export function listAllInboxUsers(opts?: Oazapfts.RequestOpts) {
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
    }>("/inbox_users", {
        ...opts
    }));
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
/**
 * Update an inbox user
 */
export function updateInboxUser(inboxUserId: string, body: {
    role: string;
    auto_assignable: boolean;
}, opts?: Oazapfts.RequestOpts) {
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
    }>(`/inbox_users/${encodeURIComponent(inboxUserId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body
    })));
}
/**
 * Delete an inbox user
 */
export function deleteInboxUser(inboxUserId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/inbox_users/${encodeURIComponent(inboxUserId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * List all webhooks
 */
export function listWebhooks(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            webhooks: WebhookDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/webhooks", {
        ...opts
    }));
}
/**
 * Create a webhook
 */
export function createWebhook(webhookRegisterBodyDto: WebhookRegisterBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: {
            webhook: WebhookWithSecretDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/webhooks", oazapfts.json({
        ...opts,
        method: "POST",
        body: webhookRegisterBodyDto
    })));
}
/**
 * Get a webhook by id
 */
export function getWebhook(webhookId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            webhook: WebhookWithSecretDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/webhooks/${encodeURIComponent(webhookId)}`, {
        ...opts
    }));
}
/**
 * Update a webhook
 */
export function updateWebhook(webhookId: string, webhookUpdateBodyDto: WebhookUpdateBodyDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            webhook: WebhookDto;
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/webhooks/${encodeURIComponent(webhookId)}`, oazapfts.json({
        ...opts,
        method: "PATCH",
        body: webhookUpdateBodyDto
    })));
}
/**
 * Delete a webhook
 */
export function deleteWebhook(webhookId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/webhooks/${encodeURIComponent(webhookId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Get a rule snooze by id
 */
export function getRuleSnooze(ruleSnoozeId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            snooze: RuleSnoozeDto;
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
    }>(`/rule-snoozes/${encodeURIComponent(ruleSnoozeId)}`, {
        ...opts
    }));
}
/**
 * List all test runs for a scenario
 */
export function listTestRuns(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scenario_test_runs: TestRunDto[];
        };
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/scenario-testrun${QS.query(QS.explode({
        scenario_id: scenarioId
    }))}`, {
        ...opts
    }));
}
/**
 * Create a test run
 */
export function createTestRun(testRunCreateInputDto: TestRunCreateInputDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: {
            scenario_test_run: TestRunDto;
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
    }>("/scenario-testrun", oazapfts.json({
        ...opts,
        method: "POST",
        body: testRunCreateInputDto
    })));
}
/**
 * Get a test run by id
 */
export function getTestRun(testRunId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scenario_test_run: TestRunDto;
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
    }>(`/scenario-testruns/${encodeURIComponent(testRunId)}`, {
        ...opts
    }));
}
/**
 * Cancel a test run by id
 */
export function cancelTestRun(testRunId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            scenario_test_run: TestRunDto;
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
    }>(`/scenario-testruns/${encodeURIComponent(testRunId)}/cancel`, {
        ...opts,
        method: "POST"
    }));
}
/**
 * Get decisions by score and outcome
 */
export function getDecisionData(testRunId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            decisions: TestRunDecisionDataDto[];
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
    }>(`/scenario-testruns/${encodeURIComponent(testRunId)}/decision_data_by_score`, {
        ...opts
    }));
}
/**
 * Get rules execution distribution by status (hit, no hit, etxc)
 */
export function getRuleData(testRunId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: {
            rules: TestRunRuleExecutionDataDto[];
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
    }>(`/scenario-testruns/${encodeURIComponent(testRunId)}/data_by_rule_execution`, {
        ...opts
    }));
}
/**
 * List workflows for a scenario
 */
export function listWorkflows(scenarioId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: (WorkflowRuleDto & {
            conditions: WorkflowConditionDto[];
            actions: WorkflowActionDto[];
        })[];
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/${encodeURIComponent(scenarioId)}`, {
        ...opts
    }));
}
/**
 * Reorder workflow rules for a scenario
 */
export function reorderWorkflows(scenarioId: string, body?: string[], opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/${encodeURIComponent(scenarioId)}/reorder`, oazapfts.json({
        ...opts,
        method: "POST",
        body
    })));
}
/**
 * Create a workflow rule
 */
export function createWorkflowRule(createWorkflowRuleDto?: CreateWorkflowRuleDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: WorkflowRuleDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/workflows/rule", oazapfts.json({
        ...opts,
        method: "POST",
        body: createWorkflowRuleDto
    })));
}
/**
 * Update a workflow rule
 */
export function updateWorkflowRule(ruleId: string, body?: {
    name: string;
    fallthrough: boolean;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: WorkflowRuleDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}`, oazapfts.json({
        ...opts,
        method: "PUT",
        body
    })));
}
/**
 * Delete a workflow rule
 */
export function deleteWorkflowRule(ruleId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Create a workflow condition
 */
export function createWorkflowCondition(ruleId: string, workflowConditionDetailDto?: WorkflowConditionDetailDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: WorkflowConditionDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/condition`, oazapfts.json({
        ...opts,
        method: "POST",
        body: workflowConditionDetailDto
    })));
}
/**
 * Update a workflow condition
 */
export function updateWorkflowCondition(ruleId: string, conditionId: string, workflowConditionDetailDto?: WorkflowConditionDetailDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: WorkflowConditionDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/condition/${encodeURIComponent(conditionId)}`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: workflowConditionDetailDto
    })));
}
/**
 * Delete a workflow condition
 */
export function deleteWorkflowCondition(ruleId: string, conditionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/condition/${encodeURIComponent(conditionId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Create a workflow action
 */
export function createWorkflowAction(ruleId: string, workflowActionDetailDto?: WorkflowActionDetailDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 201;
        data: WorkflowActionDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/action`, oazapfts.json({
        ...opts,
        method: "POST",
        body: workflowActionDetailDto
    })));
}
/**
 * Update a workflow action
 */
export function updateWorkflowAction(ruleId: string, actionId: string, workflowActionDetailDto?: WorkflowActionDetailDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: WorkflowActionDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/action/${encodeURIComponent(actionId)}`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: workflowActionDetailDto
    })));
}
/**
 * Delete a workflow action
 */
export function deleteWorkflowAction(ruleId: string, actionId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>(`/workflows/rule/${encodeURIComponent(ruleId)}/action/${encodeURIComponent(actionId)}`, {
        ...opts,
        method: "DELETE"
    }));
}
/**
 * Get the current unavailability
 */
export function getUnavailability(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: PersonalSettingsUnavailableDto;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    } | {
        status: 404;
    }>("/settings/me/unavailable", {
        ...opts
    }));
}
/**
 * Set a user as unavailable until a date
 */
export function setUnavailability(personalSettingsUnavailableDto: PersonalSettingsUnavailableDto, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/settings/me/unavailable", oazapfts.json({
        ...opts,
        method: "POST",
        body: personalSettingsUnavailableDto
    })));
}
/**
 * Cancel the current or planned unavailability
 */
export function cancelUnavailability(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
    } | {
        status: 401;
        data: string;
    } | {
        status: 403;
        data: string;
    }>("/settings/me/unavailable", {
        ...opts,
        method: "DELETE"
    }));
}
