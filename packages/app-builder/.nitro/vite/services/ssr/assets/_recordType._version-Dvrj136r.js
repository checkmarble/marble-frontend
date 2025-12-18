import { O as useRouter, r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { N as useAgnosticNavigation, b as useNavigate, a6 as buildPayloadAccessorsFromDataModel, a7 as buildDatabaseAccessorsFromDataModel, a8 as Route, t as useLoaderData } from "./router-vb7i5euz.js";
import { c as commitScoringRulesetFn, b as listRulesetVersionsFn, p as prepareScoringRulesetFn } from "./scoring-NycAI253.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useUpdateScoringRulesetMutation, S as ScoringLevelThresholds } from "./ScoringLevelThresholds-bJ2AGLf_.js";
import { u as updateScoringRulesetPayloadSchema } from "./user-scoring-BwKPLq1i.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useTranslation, t as useFormatDateTime, dZ as SelectV2, B as Button, e as Icon, dD as Tooltip, e0 as NumberInput, j as Tag, e1 as Input, d as cn, e8 as MenuCommand } from "./format-NPGUXq-g.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { bJ as NewConstantAstNode, a_ as NewUndefinedAstNode, bK as v7, bL as isConstant, bM as isAggregation, bN as isPayload, bO as NewRecordHasPastAlertsAstNode, bP as NewTagCheckAstNode, M, bQ as monitoringListCheckAstNodeName, bR as recordHasTagsAstNodeName, bS as isRecordHasPastAlertAstNode, bT as isMonitoringListCheckAstNode, bU as isRecordHasTagsAstNode, bV as isMainAstBinaryNode, bW as isCustomListAccess, bX as NewCustomListAstNode, bY as secondsToDisplay, aN as SECONDS_PER_UNIT, bz as getDataTypeIcon, bZ as NewAggregatorAstNode, aV as SCREENING_CATEGORIES, bI as SCREENING_CATEGORY_I18N_KEY_MAP, b_ as topicsToCategories, j as NewPayloadAstNode, b$ as RISK_TYPES, c0 as NewAstNode } from "./services-middleware-DR8Hua1Y.js";
import { i as isMaxRiskLevelInRange, s as scoringLevelEntries, S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS } from "./display-TKj7AN5a.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useRoot, A as AstBuilderNodeSharpFactory, a as AggregationEditContent, t, g as getAstNodeDisplayName, b as AstBuilder } from "./index-DCH5hwXA.js";
import { u as useOrganizationObjectTags } from "./organization-object-tags-C9Gf0Ixc.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./useBaseQuery-CMboOtTR.js";
import "./array-BFSjnO9c.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./use-callback-ref-AfyBSz95.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./isArray-gJc74O_I.js";
import "./join-BeQTfqAC.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./Callout-DX4NBXlG.js";
import "./ExternalLink-CG_77QdX.js";
import "./documentation-href-uAe88WFl.js";
import "./scenario-validation-error-messages-CB3GcwJ8.js";
import "./flatMap-CbF5uMEQ.js";
import "./Nudge-C1ux5IUa.js";
import "./hovercard-provider-BchUL2eY.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./organization-detail-YGkE0F4y.js";
import "./create-context-CYc8deix.js";
import "./isNonNullish-DgEqPJBU.js";
const switchAstNodeName = "Switch";
function isSwitchAstNode(node) {
  return node.name === switchAstNodeName;
}
function NewSwitchAstNode(ruleType, field) {
  return {
    id: v7(),
    name: switchAstNodeName,
    constant: void 0,
    children: [],
    namedChildren: {
      field: field ?? NewUndefinedAstNode(),
      type: NewConstantAstNode({ constant: ruleType })
    }
  };
}
const scoreComputationAstNodeName = "ScoreComputation";
function isScoreComputationAstNode(node) {
  return node.name === scoreComputationAstNodeName;
}
const allowedRuleSourceTypes = ["Bool", "Int", "Float", "String"];
function isAllowedScoringRuleType(type) {
  return allowedRuleSourceTypes.includes(type);
}
function getAggregationReturnType(aggregationNode, dataModel) {
  const aggregator = aggregationNode.namedChildren.aggregator.constant;
  if (aggregator === "COUNT" || aggregator === "COUNT_DISTINCT") return "Int";
  const tableName = aggregationNode.namedChildren.tableName.constant;
  const fieldName = aggregationNode.namedChildren.fieldName.constant;
  if (!tableName || !fieldName) return "Undefined";
  const field = dataModel.find((t2) => t2.name === tableName)?.fields.find((f) => f.name === fieldName);
  if (!field) return "Undefined";
  if (aggregator === "SUM" || aggregator === "AVG" || aggregator === "PCTILE") {
    return field.dataType === "Int" ? "Int" : "Float";
  }
  if (aggregator === "MIN" || aggregator === "MAX") {
    return isAllowedScoringRuleType(field.dataType) ? field.dataType : null;
  }
  return null;
}
function getOperationType(entityType, dataModel, node) {
  const entityTable = dataModel.find((table) => table.name === entityType);
  if (!entityTable || !node.namedChildren.type || !isConstant(node.namedChildren.type)) {
    return null;
  }
  switch (node.namedChildren.type.constant) {
    case "user_attribute": {
      const astField = node.namedChildren.field;
      if (!astField || !isPayload(astField)) {
        return "Undefined";
      }
      const field = entityTable.fields.find((f) => f.name === astField.children[0].constant);
      if (!field || !isAllowedScoringRuleType(field.dataType)) {
        return null;
      }
      return field.dataType;
    }
    case "aggregate": {
      const astField = node.namedChildren.field;
      if (!astField || !isAggregation(astField)) return "Undefined";
      return getAggregationReturnType(astField, dataModel ?? []);
    }
    default:
      return null;
  }
}
function transformAstNodeToModel(node, entityType, dataModel) {
  if (!isSwitchAstNode(node)) return null;
  return transformSwitchAstNodeToModel(node, entityType, dataModel);
}
function transformSwitchAstNodeToModel(node, entityType, dataModel) {
  if (!isConstant(node.namedChildren.type)) return null;
  const type = node.namedChildren.type.constant;
  if (type !== "user_attribute" && type !== "aggregate" && type !== "screening_tags" && type !== "entity_tags" && type !== "past_alerts")
    return null;
  if (type === "past_alerts") {
    const scoreComputationNodes2 = node.children.filter(isScoreComputationAstNode);
    if (scoreComputationNodes2.length === 0) {
      return { type: "past_alerts", conditions: { type: "bool", ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } } };
    }
    const conditions2 = parsePastAlertsBranches(scoreComputationNodes2);
    if (!conditions2) return null;
    return { type: "past_alerts", conditions: conditions2 };
  }
  if (type === "screening_tags" || type === "entity_tags") {
    const scoreComputationNodes2 = node.children.filter(isScoreComputationAstNode);
    if (scoreComputationNodes2.length === 0) {
      return {
        type,
        conditions: { type: "tags", branches: [{ value: [], impact: { modifier: 0 } }], default: { modifier: 0 } }
      };
    }
    const conditions2 = parseTagsBranches(scoreComputationNodes2);
    if (!conditions2) return null;
    return { type, conditions: conditions2 };
  }
  const scoreComputationNodes = node.children.filter(isScoreComputationAstNode);
  if (scoreComputationNodes.length === 0) return { type, field: null, conditions: null };
  const fieldType = entityType && dataModel ? getOperationType(entityType, dataModel, node) : null;
  const conditions = M(fieldType).with("Bool", () => parseBoolBranches(scoreComputationNodes)).with("String", () => parseStringBranches(scoreComputationNodes)).with("Int", "Float", () => parseNumberBranches(scoreComputationNodes)).otherwise(() => null);
  if (!conditions) return null;
  if (type === "user_attribute") {
    if (!isPayload(node.namedChildren.field)) return null;
    return { type: "user_attribute", field: node.namedChildren.field, conditions };
  }
  if (type === "aggregate") {
    if (!isAggregation(node.namedChildren.field)) return null;
    return { type: "aggregate", field: node.namedChildren.field, conditions };
  }
  return null;
}
function buildAstNodeFromModel(model, ctx = {}) {
  if (model.type === "past_alerts") {
    return {
      id: v7(),
      name: switchAstNodeName,
      constant: void 0,
      namedChildren: {
        field: NewConstantAstNode({ constant: null }),
        type: NewConstantAstNode({ constant: model.type })
      },
      children: buildPastAlertsSwitchChildren(model.conditions)
    };
  }
  if (model.type === "screening_tags" || model.type === "entity_tags") {
    if (!ctx.entityType) {
      throw new Error(`buildAstNodeFromModel: entityType is required to build a "${model.type}" rule`);
    }
    return {
      id: v7(),
      name: switchAstNodeName,
      constant: void 0,
      namedChildren: {
        field: NewConstantAstNode({ constant: null }),
        type: NewConstantAstNode({ constant: model.type })
      },
      children: buildTagsSwitchChildren(model.type, model.conditions, ctx.entityType)
    };
  }
  const children = buildConditionChildren(model.field, model.conditions);
  return {
    id: v7(),
    name: switchAstNodeName,
    constant: void 0,
    namedChildren: {
      field: model.field,
      type: NewConstantAstNode({ constant: model.type })
    },
    children
  };
}
function buildPastAlertsSwitchChildren(conditions) {
  return [
    buildScoreComputationAstNode(NewRecordHasPastAlertsAstNode(), conditions.ifTrue),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.ifFalse)
  ];
}
function parsePastAlertsBranches(nodes) {
  if (nodes.length !== 2) return null;
  const [trueNode, falseNode] = nodes;
  const trueCondition = trueNode.children[0];
  if (!trueCondition || !isRecordHasPastAlertAstNode(trueCondition)) return null;
  const falseCondition = falseNode.children[0];
  if (!falseCondition || !isConstant(falseCondition) || falseCondition.constant !== true) return null;
  const ifTrue = { modifier: trueNode.namedChildren.modifier.constant };
  if (trueNode.namedChildren.floor) ifTrue.floor = trueNode.namedChildren.floor.constant;
  const ifFalse = { modifier: falseNode.namedChildren.modifier.constant };
  if (falseNode.namedChildren.floor) ifFalse.floor = falseNode.namedChildren.floor.constant;
  return { type: "bool", ifTrue, ifFalse };
}
function buildTagsSwitchChildren(type, conditions, entityType) {
  const branchNodes = conditions.branches.map((branch) => {
    const config = { targetTableName: entityType, topicFilters: branch.value };
    const branchCondition = type === "screening_tags" ? NewTagCheckAstNode(monitoringListCheckAstNodeName, config) : NewTagCheckAstNode(recordHasTagsAstNodeName, config);
    return buildScoreComputationAstNode(branchCondition, branch.impact);
  });
  return [...branchNodes, buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default)];
}
function parseTagsBranches(nodes) {
  const lastNode = nodes[nodes.length - 1];
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;
  const defaultImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;
  const branches = nodes.slice(0, -1).map((branchNode) => {
    const branchImpact = { modifier: branchNode.namedChildren.modifier.constant };
    if (branchNode.namedChildren.floor) branchImpact.floor = branchNode.namedChildren.floor.constant;
    const conditionNode = branchNode.children[0];
    let tagValues = [];
    if (conditionNode && (isMonitoringListCheckAstNode(conditionNode) || isRecordHasTagsAstNode(conditionNode))) {
      tagValues = conditionNode.namedChildren.config.constant.topicFilters;
    }
    return { value: tagValues, impact: branchImpact };
  });
  return { type: "tags", branches, default: defaultImpact };
}
function buildConditionChildren(field, conditions) {
  switch (conditions.type) {
    case "number":
      return buildNumberSwitchChildren(field, conditions);
    case "bool":
      return buildBoolSwitchChildren(field, conditions);
    case "string":
      return buildStringSwitchChildren(field, conditions);
  }
}
function buildNumberSwitchChildren(field, conditions) {
  return [
    ...conditions.branches.map(
      (branch) => buildScoreComputationAstNode(buildLessThanOrEqualNode(field, branch.value), branch.impact)
    ),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default)
  ];
}
function buildLessThanOrEqualNode(field, threshold) {
  return {
    id: v7(),
    name: "<=",
    constant: void 0,
    children: [{ ...field, id: v7() }, NewConstantAstNode({ constant: threshold })],
    namedChildren: {}
  };
}
function buildBoolSwitchChildren(field, conditions) {
  return [
    buildScoreComputationAstNode(buildEqualNode(field, true), conditions.ifTrue),
    buildScoreComputationAstNode(buildEqualNode(field, false), conditions.ifFalse)
  ];
}
function buildEqualNode(field, value) {
  return {
    id: v7(),
    name: "=",
    constant: void 0,
    children: [{ ...field, id: v7() }, NewConstantAstNode({ constant: value })],
    namedChildren: {}
  };
}
function buildStringSwitchChildren(field, conditions) {
  return [
    ...conditions.branches.map(
      (branch) => buildScoreComputationAstNode(buildStringOperatorNode(field, branch.value), branch.impact)
    ),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default)
  ];
}
function buildStringOperatorNode(field, operation) {
  const lhs = { ...field, id: v7() };
  if (operation.op === "IsInList" || operation.op === "IsNotInList") {
    const rhs = operation.value.type === "customList" ? NewCustomListAstNode(operation.value.listId) : NewConstantAstNode({ constant: operation.value.values });
    return { id: v7(), name: operation.op, constant: void 0, children: [lhs, rhs], namedChildren: {} };
  }
  return {
    id: v7(),
    name: operation.op,
    constant: void 0,
    children: [lhs, NewConstantAstNode({ constant: operation.value })],
    namedChildren: {}
  };
}
const stringOps = /* @__PURE__ */ new Set([
  "=",
  "≠",
  "StringContains",
  "StringNotContain",
  "StringStartsWith",
  "StringEndsWith",
  "IsInList",
  "IsNotInList"
]);
function parseStringBranches(nodes) {
  if (nodes.length === 0) return null;
  const lastNode = nodes[nodes.length - 1];
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;
  const nonDefaultNodes = nodes.slice(0, -1);
  const branches = [];
  for (const n of nonDefaultNodes) {
    const condition = n.children[0];
    if (!condition || !isMainAstBinaryNode(condition) || !stringOps.has(condition.name)) return null;
    const rhs = condition.children[1];
    const impact = { modifier: n.namedChildren.modifier.constant };
    if (n.namedChildren.floor) impact.floor = n.namedChildren.floor.constant;
    const isListOp = condition.name === "IsInList" || condition.name === "IsNotInList";
    if (isListOp) {
      if (isCustomListAccess(rhs)) {
        branches.push({
          value: {
            op: condition.name,
            value: { type: "customList", listId: rhs.namedChildren.customListId.constant }
          },
          impact
        });
      } else if (isConstant(rhs) && Array.isArray(rhs.constant) && rhs.constant.every((s) => typeof s === "string")) {
        branches.push({
          value: {
            op: condition.name,
            value: { type: "stringList", values: rhs.constant }
          },
          impact
        });
      } else {
        return null;
      }
    } else {
      if (!isConstant(rhs) || typeof rhs.constant !== "string") return null;
      branches.push({ value: { op: condition.name, value: rhs.constant }, impact });
    }
  }
  const defaultImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;
  return { type: "string", branches, default: defaultImpact };
}
function parseNumberBranchValues(nodes) {
  const branches = [];
  for (const n of nodes) {
    const condition = n.children[0];
    if (!condition || !isMainAstBinaryNode(condition) || condition.name !== "<=") return null;
    const valueNode = condition.children[1];
    if (!isConstant(valueNode) || typeof valueNode.constant !== "number") return null;
    const impact = { modifier: n.namedChildren.modifier.constant };
    if (n.namedChildren.floor) impact.floor = n.namedChildren.floor.constant;
    branches.push({ value: valueNode.constant, impact });
  }
  return branches;
}
function parseNumberBranches(nodes) {
  if (nodes.length === 0) return null;
  const lastNode = nodes[nodes.length - 1];
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;
  const nonDefaultNodes = nodes.slice(0, -1);
  const branches = parseNumberBranchValues(nonDefaultNodes);
  if (!branches) return null;
  const defaultImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;
  return { type: "number", branches, default: defaultImpact };
}
function parseBoolBranches(nodes) {
  if (nodes.length !== 2) return null;
  const [trueNode, falseNode] = nodes;
  const trueCondition = trueNode.children[0];
  const falseCondition = falseNode.children[0];
  if (!trueCondition || !isMainAstBinaryNode(trueCondition) || trueCondition.name !== "=" || !falseCondition || !isMainAstBinaryNode(falseCondition) || falseCondition.name !== "=")
    return null;
  const trueRhs = trueCondition.children[1];
  const falseRhs = falseCondition.children[1];
  if (!isConstant(trueRhs) || trueRhs.constant !== true) return null;
  if (!isConstant(falseRhs) || falseRhs.constant !== false) return null;
  const ifTrue = { modifier: trueNode.namedChildren.modifier.constant };
  if (trueNode.namedChildren.floor) ifTrue.floor = trueNode.namedChildren.floor.constant;
  const ifFalse = { modifier: falseNode.namedChildren.modifier.constant };
  if (falseNode.namedChildren.floor) ifFalse.floor = falseNode.namedChildren.floor.constant;
  return { type: "bool", ifTrue, ifFalse };
}
function buildScoreComputationAstNode(conditionNode, impact) {
  const namedChildren = {
    modifier: NewConstantAstNode({ constant: impact.modifier })
  };
  if (impact.floor !== void 0) {
    namedChildren.floor = NewConstantAstNode({ constant: impact.floor });
  }
  return {
    id: v7(),
    name: scoreComputationAstNodeName,
    constant: void 0,
    children: [conditionNode],
    namedChildren
  };
}
const RULE_TYPES = ["user_attribute", "aggregate", "screening_tags", "entity_tags", "past_alerts"];
function isCompleteRule(model) {
  if (model.type === "user_attribute" || model.type === "aggregate") {
    return model.field !== null && model.conditions !== null;
  }
  return true;
}
const useCommitScoringRulesetMutation = () => {
  const commitScoringRuleset = useServerFn(commitScoringRulesetFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["scoring", "commit-ruleset"],
    mutationFn: async (recordType) => {
      await commitScoringRuleset({ data: { recordType } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring"] });
    }
  });
};
const useListScoringRulesetVersionsQuery = (recordType) => {
  const listRulesetVersions = useServerFn(listRulesetVersionsFn);
  return useQuery({
    queryKey: ["scoring", "ruleset-versions", recordType],
    queryFn: async () => {
      const result = await listRulesetVersions({ data: { recordType } });
      return result;
    },
    enabled: !!recordType
  });
};
const usePrepareScoringRulesetMutation = () => {
  const prepareScoringRuleset = useServerFn(prepareScoringRulesetFn);
  const router = useRouter();
  return useMutation({
    mutationKey: ["scoring", "prepare-ruleset"],
    mutationFn: async (recordType) => {
      await prepareScoringRuleset({ data: { recordType } });
    },
    onSuccess: () => {
      router.invalidate();
    }
  });
};
function formatDuration(seconds, t2) {
  const { value, unit } = secondsToDisplay(seconds);
  if (!unit) return null;
  return `${value} ${t2(`common:duration_unit.${unit}`)}`;
}
function GeneralInfoCard({ ruleset, settings, preparationStatus }) {
  const { t: t2 } = useTranslation(["user-scoring", "common"]);
  const navigate = useAgnosticNavigation();
  const formatDateTime = useFormatDateTime();
  const prepareMutation = usePrepareScoringRulesetMutation();
  const commitMutation = useCommitScoringRulesetMutation();
  const cooldownLabel = formatDuration(ruleset.cooldownSeconds, t2);
  const scoringIntervalLabel = formatDuration(ruleset.scoringIntervalSeconds, t2);
  const versionsQuery = useListScoringRulesetVersionsQuery(ruleset.recordType);
  const versionOptions = (versionsQuery.data?.versions ?? []).map((v) => ({
    value: v.status === "committed" ? v.version.toString() : "draft",
    label: v.status === "committed" ? `V${v.version}` : "draft"
  }));
  const [editPanelOpen, setEditPanelOpen] = reactExports.useState(false);
  const handleVersionChange = (version) => {
    navigate(`/user-scoring/${ruleset.recordType}/${version}`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md p-md flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-h3 font-semibold text-grey-primary", children: t2("user-scoring:ruleset.title") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectV2,
          {
            options: versionOptions,
            placeholder: t2("user-scoring:ruleset.version_placeholder"),
            value: ruleset.status === "draft" ? "draft" : ruleset.version.toString(),
            onChange: handleVersionChange,
            variant: "tag",
            menuClassName: "min-w-30"
          }
        ),
        preparationStatus ? preparationStatus.status === "required" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: preparationStatus.serviceStatus === "occupied" || prepareMutation.isPending || ruleset.rules.length === 0,
            onClick: () => prepareMutation.mutate(ruleset.recordType, {
              onError: () => zt.error(t2("common:errors.unknown"))
            }),
            children: t2("user-scoring:ruleset.prepare")
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: commitMutation.isPending || ruleset.rules.length === 0,
            onClick: () => commitMutation.mutate(ruleset.recordType, {
              onError: () => zt.error(t2("common:errors.unknown"))
            }),
            children: t2("user-scoring:ruleset.commit")
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", onClick: () => setEditPanelOpen(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md text-s text-grey-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        t2("user-scoring:ruleset.last_update"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: formatDateTime(ruleset.createdAt, { dateStyle: "medium", timeStyle: "short" }) })
      ] }),
      cooldownLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-border", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          t2("user-scoring:ruleset.cooldown"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: cooldownLabel })
        ] })
      ] }) : null,
      scoringIntervalLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-border", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          t2("user-scoring:ruleset.score_renew"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: scoringIntervalLabel })
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RiskLevelBadges, { maxRiskLevel: settings.maxRiskLevel, thresholds: ruleset.thresholds }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: editPanelOpen, onOpenChange: setEditPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditGeneralSettingsPanel, { ruleset, maxRiskLevel: settings.maxRiskLevel }) })
  ] });
}
function DurationDaysField({
  value,
  onChange
}) {
  const { t: t2 } = useTranslation(["common"]);
  const [days, setDays] = reactExports.useState(value !== void 0 ? value / SECONDS_PER_UNIT.days : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NumberInput,
      {
        className: "max-w-15",
        borderColor: days < 1 ? "redfigma-47" : "greyfigma-90",
        value: days,
        onChange: (v) => {
          setDays(v);
          onChange(v > 0 ? v * SECONDS_PER_UNIT.days : void 0);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t2("common:duration_unit.days") })
  ] });
}
function EditGeneralSettingsPanel({
  ruleset,
  maxRiskLevel
}) {
  const { t: t2 } = useTranslation(["common", "user-scoring"]);
  const router = useRouter();
  const navigate = useNavigate();
  const updateMutation = useUpdateScoringRulesetMutation();
  const panelSharp = PanelSharpFactory.useSharp();
  const form = useForm({
    defaultValues: {
      id: ruleset.id,
      recordType: ruleset.recordType,
      name: ruleset.name,
      thresholds: ruleset.thresholds,
      cooldownSeconds: ruleset.cooldownSeconds,
      scoringIntervalSeconds: ruleset.scoringIntervalSeconds,
      rules: ruleset.rules.map((r) => ({
        stableId: r.stableId,
        name: r.name,
        description: r.description,
        riskType: r.riskType,
        ast: r.ast
      }))
    },
    validators: {
      onChange: updateScoringRulesetPayloadSchema
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        try {
          await updateMutation.mutateAsync(value);
          zt.success(t2("common:success.save"));
          panelSharp.actions.close();
          await router.invalidate();
          navigate({
            to: "/user-scoring/$recordType/$version",
            params: { recordType: ruleset.recordType, version: "draft" }
          });
        } catch {
          zt.error(t2("common:errors.unknown"));
        }
      }
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { className: "contents", onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("user-scoring:ruleset.edit_settings_title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        t2("user-scoring:section.create_panel.general_settings"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-md p-md grid grid-cols-[1fr_repeat(3,_auto)] gap-x-sm gap-y-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("user-scoring:section.create_panel.lower_score_duration") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "cooldownSeconds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(DurationDaysField, { value: field.state.value, onChange: field.handleChange }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("user-scoring:section.create_panel.lower_score_duration_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "helpcenter", className: "size-5 text-grey-secondary" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("user-scoring:section.create_panel.recalculation_duration") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoringIntervalSeconds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(DurationDaysField, { value: field.state.value, onChange: field.handleChange }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("user-scoring:section.create_panel.recalculation_duration_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "helpcenter", className: "size-5 text-grey-secondary" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "thresholds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScoringLevelThresholds,
        {
          maxRiskLevel,
          thresholds: field.state.value,
          onThresholdsChange: field.handleChange
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          variant: "secondary",
          onClick: () => panelSharp.actions.close(),
          label: t2("user-scoring:section.create_panel.cancel")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (s) => [s.canSubmit, s.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          disabled: !canSubmit,
          isLoading: isSubmitting,
          type: "submit",
          label: t2("user-scoring:section.create_panel.validate")
        }
      ) })
    ] })
  ] }) }) });
}
function RiskLevelBadges({ maxRiskLevel, thresholds }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  if (!isMaxRiskLevelInRange(maxRiskLevel)) {
    return null;
  }
  const colorEntries = scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel]);
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t2("user-scoring:ruleset.risk_level") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: colorEntries.map(([level, color], i) => {
      const isLast = i === colorEntries.length - 1;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs h-6 px-xs rounded-full border", style: { borderColor: color }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3 rounded-full shrink-0", style: { backgroundColor: color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-primary", children: t2(labelKeys[level] ?? "") })
        ] }),
        !isLast ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-grey-placeholder", children: `≤ ${thresholds[i]} <` }) : null
      ] }, level);
    }) })
  ] });
}
function FieldPill({ field, fieldType }) {
  const typeIcon = isAllowedScoringRuleType(fieldType) ? getDataTypeIcon(fieldType) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", className: "gap-sm", children: [
    getFieldLabel(field),
    typeIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: typeIcon, className: "size-4" }) : null
  ] });
}
function getFieldLabel(field) {
  if (isPayload(field)) return field.children[0].constant;
  if (isAggregation(field)) return field.namedChildren["fieldName"].constant;
  return "…";
}
function SwitchCaseRow({ impact, children, maxRiskLevel }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const colors = isMaxRiskLevelInRange(maxRiskLevel) ? SCORING_LEVELS_COLORS[maxRiskLevel] : {};
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "flex items-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ms-md list-item list-disc whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-sm", children: [
      children,
      " ",
      t2("user-scoring:switch.then")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", children: [
      "score ",
      impact.modifier > 0 ? "+" : "",
      impact.modifier
    ] }),
    impact.floor !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.and") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", className: "gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.floor_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full size-3", style: { backgroundColor: colors[impact.floor] } })
      ] })
    ] }) : null
  ] }) }) });
}
function RiskLevelSelect({ floor, maxRiskLevel, onChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const levelEntries = isMaxRiskLevelInRange(maxRiskLevel) ? scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel]) : [];
  const options = [
    { label: t2("user-scoring:switch.add_floor"), value: null },
    ...levelEntries.map(([level, color]) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-xs items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          t2("user-scoring:switch.floor_label"),
          " "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full shrink-0", style: { backgroundColor: color } })
      ] }),
      value: level
    }))
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectV2,
    {
      value: floor ?? null,
      placeholder: t2("user-scoring:switch.add_floor"),
      options,
      onChange: (v) => onChange(v ?? void 0),
      className: "w-30"
    }
  );
}
function BoolSwitchEdit({ conditions, maxRiskLevel, onChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const setIfTrue = (impact) => onChange({ ...conditions, ifTrue: impact });
  const setIfFalse = (impact) => onChange({ ...conditions, ifFalse: impact });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BoolRow,
      {
        label: t2("user-scoring:switch.bool.if_true"),
        showThen: true,
        impact: conditions.ifTrue,
        maxRiskLevel,
        onImpactChange: setIfTrue
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BoolRow,
      {
        label: t2("user-scoring:switch.bool.if_false"),
        impact: conditions.ifFalse,
        maxRiskLevel,
        onImpactChange: setIfFalse
      }
    )
  ] });
}
function BoolRow({ label, showThen = false, impact, maxRiskLevel, onImpactChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[164px_minmax(auto,_40px)_70px_auto] items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-purple-primary", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center text-grey-secondary", children: showThen ? t2("user-scoring:switch.bool.then") : "" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: impact.modifier, onChange: (value) => onImpactChange({ ...impact, modifier: value }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RiskLevelSelect,
      {
        floor: impact.floor,
        maxRiskLevel,
        onChange: (floor) => onImpactChange({ ...impact, floor })
      }
    )
  ] });
}
function createDefaultConditions(fieldType) {
  switch (fieldType) {
    case "Int":
    case "Float":
      return {
        type: "number",
        branches: [{ value: 0, impact: { modifier: 0 } }],
        default: { modifier: 0 }
      };
    case "String":
      return {
        type: "string",
        branches: [{ value: { op: "=", value: "" }, impact: { modifier: 0 } }],
        default: { modifier: 0 }
      };
    case "Bool":
      return { type: "bool", ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } };
  }
}
function NumberSwitchEdit({ conditions, maxRiskLevel, onChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const { branches, default: defaultImpact } = conditions;
  const setThreshold = (idx, value) => {
    const next = branches.map((b, i) => i === idx ? { ...b, value } : b);
    onChange({ ...conditions, branches: next });
  };
  const setImpact = (idx, impact) => {
    if (idx === "default") {
      onChange({ ...conditions, default: impact });
    } else {
      const next = branches.map((b, i) => i === idx ? { ...b, impact } : b);
      onChange({ ...conditions, branches: next });
    }
  };
  const addBranch = () => {
    const lastValue = branches.at(-1)?.value ?? 0;
    onChange({ ...conditions, branches: [...branches, { value: lastValue + 1, impact: { modifier: 0 } }] });
  };
  const removeBranch = (idx) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };
  const swapImpacts = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= branches.length) return;
    const next = branches.map((b, i) => {
      if (i === idx) return { ...b, impact: branches[target].impact };
      if (i === target) return { ...b, impact: branches[idx].impact };
      return b;
    });
    onChange({ ...conditions, branches: next });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    branches[0] && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BranchRow,
      {
        variant: "first",
        threshold: branches[0].value,
        impact: branches[0].impact,
        maxRiskLevel,
        onThresholdChange: (v) => setThreshold(0, v),
        onImpactChange: (imp) => setImpact(0, imp)
      }
    ),
    branches.slice(1).map((branch, i) => {
      const realIdx = i + 1;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        BranchRow,
        {
          variant: "middle",
          rangeStart: branches[realIdx - 1].value + 1,
          threshold: branch.value,
          impact: branch.impact,
          maxRiskLevel,
          onThresholdChange: (v) => setThreshold(realIdx, v),
          onImpactChange: (imp) => setImpact(realIdx, imp),
          onMoveUp: () => swapImpacts(realIdx, "up"),
          onMoveDown: () => swapImpacts(realIdx, "down"),
          onDelete: () => removeBranch(realIdx)
        },
        realIdx
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BranchRow,
      {
        variant: "default",
        rangeStart: branches.at(-1) != null ? branches.at(-1).value + 1 : null,
        impact: defaultImpact,
        maxRiskLevel,
        onImpactChange: (imp) => setImpact("default", imp)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addBranch, className: "self-start shadow-sm", appearance: "stroked", children: t2("user-scoring:switch.add_condition") })
  ] });
}
function BranchRow({
  variant,
  threshold,
  rangeStart,
  impact,
  maxRiskLevel,
  onThresholdChange,
  onImpactChange,
  onMoveUp,
  onMoveDown,
  onDelete
}) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const label = variant === "first" ? t2("user-scoring:switch.number.first") : variant === "middle" ? t2("user-scoring:switch.number.middle") : t2("user-scoring:switch.number.default");
  const reorderButtons = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onMoveUp, className: "leading-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-2-up", className: "size-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onMoveDown, className: "leading-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-2-down", className: "size-4" }) })
  ] });
  let conditionRow;
  if (variant === "middle") {
    conditionRow = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[24px_164px_70px_minmax(auto,_40px)_70px_1fr_24px] items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: reorderButtons }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-purple-primary", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: rangeStart ?? "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center text-grey-secondary", children: t2("user-scoring:switch.number.and") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: threshold ?? 0, onChange: (value) => onThresholdChange?.(value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onDelete, className: "text-grey-secondary hover:text-red-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5" }) })
    ] });
  } else {
    conditionRow = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[24px_164px_70px] items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "invisible flex flex-col", children: reorderButtons }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-purple-primary", children: label }),
      variant === "first" ? /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: threshold ?? 0, onChange: (value) => onThresholdChange?.(value) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: rangeStart ?? "" })
    ] });
  }
  const impactRow = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[24px_164px_minmax(auto,_40px)_70px_auto] items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center text-grey-secondary", children: t2("user-scoring:switch.number.then") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { value: impact.modifier, onChange: (value) => onImpactChange({ ...impact, modifier: value }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RiskLevelSelect,
      {
        floor: impact.floor,
        maxRiskLevel,
        onChange: (floor) => onImpactChange({ ...impact, floor })
      }
    )
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    conditionRow,
    impactRow
  ] });
}
function ListValueInput({ value, customLists, onChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [inputText, setInputText] = reactExports.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = reactExports.useState(false);
  const containerRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleMouseDown = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);
  const isCustomListSelected = value.type === "customList" && value.listId !== "";
  const stringValues = value.type === "stringList" ? value.values : [];
  const isStringListMode = stringValues.length > 0;
  const filteredLists = reactExports.useMemo(
    () => customLists.filter((l) => l.name.toLowerCase().includes(inputText.toLowerCase())),
    [customLists, inputText]
  );
  const shouldShowDropdown = isDropdownOpen && !isStringListMode && !isCustomListSelected && filteredLists.length > 0;
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputText.trim()) {
      e.preventDefault();
      onChange({ type: "stringList", values: [...stringValues, inputText.trim()] });
      setInputText("");
      setIsDropdownOpen(false);
    }
    if (e.key === "Backspace" && inputText === "" && stringValues.length > 0) {
      onChange({ type: "stringList", values: stringValues.slice(0, -1) });
    }
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };
  if (isCustomListSelected) {
    const list = customLists.find((l) => l.id === value.listId);
    const listName = list?.name ?? value.listId;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex flex-1 items-center gap-sm rounded-md border border-grey-border px-xs h-10 cursor-pointer hover:bg-grey-bg",
        onClick: () => {
          onChange({ type: "customList", listId: "" });
          setInputText(listName);
          setTimeout(() => inputRef.current?.focus(), 0);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-s text-grey-primary", children: listName })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-wrap items-center gap-xs rounded-md border border-grey-border px-xs py-2xs min-h-10 cursor-text",
        onClick: () => inputRef.current?.focus(),
        children: [
          stringValues.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "flex items-center gap-xs rounded-full border border-grey-border bg-grey-bg px-xs py-0.5 text-xs text-grey-primary",
              children: [
                v,
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.stopPropagation();
                      onChange({ type: "stringList", values: stringValues.filter((_, j) => j !== i) });
                    },
                    className: "text-grey-secondary hover:text-grey-primary",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-3" })
                  }
                )
              ]
            },
            i
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              value: inputText,
              onChange: (e) => {
                setInputText(e.target.value);
                setIsDropdownOpen(true);
              },
              onKeyDown: handleKeyDown,
              className: "flex-1 min-w-20 bg-transparent text-s text-grey-primary outline-none",
              placeholder: stringValues.length === 0 ? t2("user-scoring:switch.string.search_placeholder") : ""
            }
          )
        ]
      }
    ),
    shouldShowDropdown && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-50 mt-xs w-full rounded-md border border-grey-border bg-white shadow-md max-h-48 overflow-y-auto", children: filteredLists.map((list) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "w-full px-md py-xs text-left text-s text-grey-primary hover:bg-grey-bg flex items-center gap-sm",
        onMouseDown: (e) => {
          e.preventDefault();
          onChange({ type: "customList", listId: list.id });
          setInputText("");
          setIsDropdownOpen(false);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "list", className: "size-4" }),
          list.name
        ]
      },
      list.id
    )) })
  ] });
}
function StringSwitchEdit({ conditions, maxRiskLevel, onChange, customLists = [] }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const { branches, default: defaultImpact } = conditions;
  const opOptions = [
    { label: t2("user-scoring:switch.string.op.eq"), value: "=" },
    { label: t2("user-scoring:switch.string.op.neq"), value: "≠" },
    { label: t2("user-scoring:switch.string.op.contains"), value: "StringContains" },
    { label: t2("user-scoring:switch.string.op.not_contains"), value: "StringNotContain" },
    { label: t2("user-scoring:switch.string.op.starts_with"), value: "StringStartsWith" },
    { label: t2("user-scoring:switch.string.op.ends_with"), value: "StringEndsWith" },
    { label: t2("user-scoring:switch.string.op.in_list"), value: "IsInList" },
    { label: t2("user-scoring:switch.string.op.not_in_list"), value: "IsNotInList" }
  ];
  const setOp = (idx, op) => {
    const isListOp = op === "IsInList" || op === "IsNotInList";
    const defaultValue = isListOp ? { type: "customList", listId: "" } : "";
    const next = branches.map(
      (b, i) => i === idx ? { ...b, value: { op, value: defaultValue } } : b
    );
    onChange({ ...conditions, branches: next });
  };
  const setValue = (idx, value) => {
    const next = branches.map((b, i) => {
      if (i !== idx) return b;
      return { ...b, value: { ...b.value, value } };
    });
    onChange({ ...conditions, branches: next });
  };
  const setImpact = (idx, impact) => {
    if (idx === "default") {
      onChange({ ...conditions, default: impact });
    } else {
      const next = branches.map((b, i) => i === idx ? { ...b, impact } : b);
      onChange({ ...conditions, branches: next });
    }
  };
  const addBranch = () => {
    onChange({
      ...conditions,
      branches: [...branches, { value: { op: "=", value: "" }, impact: { modifier: 0 } }]
    });
  };
  const removeBranch = (idx) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    branches.map((branch, idx) => {
      const op = branch.value.op;
      const isListOp = op === "IsInList" || op === "IsNotInList";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              value: op,
              placeholder: "=",
              options: opOptions,
              onChange: (v) => v && setOp(idx, v),
              className: "w-[200px]"
            }
          ),
          isListOp ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListValueInput,
            {
              value: branch.value.value,
              customLists,
              onChange: (v) => setValue(idx, v)
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "flex-1",
              value: branch.value.value,
              onChange: (e) => setValue(idx, e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => removeBranch(idx),
              className: "text-grey-secondary hover:text-red-primary",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[200px_minmax(auto,_40px)_70px_auto] items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center text-grey-secondary", children: t2("user-scoring:switch.string.then") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            NumberInput,
            {
              value: branch.impact.modifier,
              onChange: (value) => setImpact(idx, { ...branch.impact, modifier: value })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RiskLevelSelect,
            {
              floor: branch.impact.floor,
              maxRiskLevel,
              onChange: (floor) => setImpact(idx, { ...branch.impact, floor })
            }
          )
        ] })
      ] }, idx);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[200px_minmax(auto,_40px)_70px_auto] items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-purple-primary", children: t2("user-scoring:switch.string.else") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          value: defaultImpact.modifier,
          onChange: (value) => setImpact("default", { ...defaultImpact, modifier: value })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RiskLevelSelect,
        {
          floor: defaultImpact.floor,
          maxRiskLevel,
          onChange: (floor) => setImpact("default", { ...defaultImpact, floor })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addBranch, className: "self-start shadow-sm", appearance: "stroked", children: t2("user-scoring:switch.add_condition") })
  ] });
}
function InlineAggregationEditorContent({ onChange }) {
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AggregationEditContent, { onChange: () => onChange(t(nodeSharp.value.node)) });
}
function InlineAggregationEditor({
  node,
  onChange
}) {
  const nodeSharp = useRoot({ node, validation: { errors: [], evaluation: [] } }, false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderNodeSharpFactory.Provider, { value: nodeSharp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(InlineAggregationEditorContent, { onChange }) });
}
function AggregateRuleEdit({
  model,
  maxRiskLevel,
  dataModel,
  customLists,
  onModelChange
}) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [conditions, setConditions] = reactExports.useState(model.conditions);
  const [aggregationNode, setAggregationNode] = reactExports.useState(model.field);
  const handleAggregationChange = (updatedNode) => {
    const newReturnType = getAggregationReturnType(updatedNode, dataModel);
    const prevReturnType = aggregationNode ? getAggregationReturnType(aggregationNode, dataModel) : null;
    let newConditions = conditions;
    if (!newConditions || newReturnType !== prevReturnType) {
      newConditions = newReturnType && isAllowedScoringRuleType(newReturnType) ? createDefaultConditions(newReturnType) : null;
      setConditions(newConditions);
    }
    setAggregationNode(updatedNode);
    onModelChange?.({ type: "aggregate", field: updatedNode, conditions: newConditions });
  };
  const handleConditionsChange = (next) => {
    setConditions(next);
    onModelChange?.({ type: "aggregate", field: aggregationNode, conditions: next });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.depending_on") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md bg-grey-background-light border border-grey-border rounded-md flex flex-col gap-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        InlineAggregationEditor,
        {
          node: aggregationNode ?? NewAggregatorAstNode("SUM"),
          onChange: handleAggregationChange
        }
      ) })
    ] }),
    conditions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.apply_conditions") }),
      M(conditions).with({ type: "number" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(NumberSwitchEdit, { conditions: c, maxRiskLevel, onChange: handleConditionsChange })).with({ type: "bool" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoolSwitchEdit, { conditions: c, maxRiskLevel, onChange: handleConditionsChange })).with({ type: "string" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        StringSwitchEdit,
        {
          conditions: c,
          maxRiskLevel,
          customLists,
          onChange: handleConditionsChange
        }
      )).exhaustive()
    ] }) : null
  ] });
}
function PastAlertsRuleEdit({ model, maxRiskLevel, onModelChange }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [conditions, setConditions] = reactExports.useState(model.conditions);
  const handleConditionsChange = (next) => {
    setConditions(next);
    onModelChange?.({ type: "past_alerts", conditions: next });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.past_alerts.depending_on") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.apply_conditions") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BoolSwitchEdit, { conditions, maxRiskLevel, onChange: handleConditionsChange })
  ] });
}
function TagsSwitchEdit({ options, conditions, maxRiskLevel, onChange, normalizeValue }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const { branches, default: defaultImpact } = conditions;
  const setBranch = (idx, branch) => {
    onChange({ ...conditions, branches: branches.map((b, i) => i === idx ? branch : b) });
  };
  const addBranch = () => {
    onChange({ ...conditions, branches: [...branches, { value: [], impact: { modifier: 0 } }] });
  };
  const removeBranch = (idx) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };
  const setDefaultImpact = (impact) => {
    onChange({ ...conditions, default: impact });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    branches.map((branch, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_minmax(auto,_40px)_70px_auto_auto] items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectV2,
        {
          multiple: true,
          options,
          placeholder: t2("user-scoring:switch.screening_tags.tags_placeholder"),
          value: normalizeValue ? normalizeValue(branch.value) : branch.value,
          onChange: (values) => setBranch(idx, { ...branch, value: values }),
          className: "flex-1"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center text-grey-secondary", children: t2("user-scoring:switch.then") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          value: branch.impact.modifier,
          onChange: (value) => setBranch(idx, { ...branch, impact: { ...branch.impact, modifier: value } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RiskLevelSelect,
        {
          floor: branch.impact.floor,
          maxRiskLevel,
          onChange: (floor) => setBranch(idx, { ...branch, impact: { ...branch.impact, floor } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => removeBranch(idx),
          className: "text-grey-secondary hover:text-red-primary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-5" })
        }
      )
    ] }, idx)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_minmax(auto,_40px)_70px_auto_auto] items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-purple-primary", children: t2("user-scoring:switch.else") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          value: defaultImpact.modifier,
          onChange: (value) => setDefaultImpact({ ...defaultImpact, modifier: value })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RiskLevelSelect,
        {
          floor: defaultImpact.floor,
          maxRiskLevel,
          onChange: (floor) => setDefaultImpact({ ...defaultImpact, floor })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addBranch, className: "self-start shadow-sm", appearance: "stroked", children: t2("user-scoring:switch.screening_tags.add_branch") })
  ] });
}
function TagsRuleEdit({ model, maxRiskLevel, onModelChange }) {
  const { t: t2 } = useTranslation(["user-scoring", "scenarios"]);
  const { orgObjectTags } = useOrganizationObjectTags();
  const [conditions, setConditions] = reactExports.useState(model.conditions);
  const handleConditionsChange = (next) => {
    setConditions(next);
    onModelChange?.({ type: model.type, conditions: next });
  };
  const tagOptions = M(model).with(
    { type: "screening_tags" },
    () => SCREENING_CATEGORIES.map((cat) => ({
      value: cat,
      label: t2(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[cat]}`)
    }))
  ).with({ type: "entity_tags" }, () => orgObjectTags.map((tag) => ({ value: tag.id, label: tag.name }))).exhaustive();
  const normalizeValue = model.type === "screening_tags" ? topicsToCategories : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: M(model).with({ type: "screening_tags" }, () => t2("user-scoring:switch.screening_tags.depending_on")).with({ type: "entity_tags" }, () => t2("user-scoring:switch.entity_tags.depending_on")).exhaustive() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.apply_conditions") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TagsSwitchEdit,
      {
        conditions,
        maxRiskLevel,
        options: tagOptions,
        normalizeValue,
        onChange: handleConditionsChange
      }
    )
  ] });
}
function UserAttributeRuleEdit({
  model,
  maxRiskLevel,
  dataModel,
  entityType,
  customLists,
  onModelChange
}) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [conditions, setConditions] = reactExports.useState(model.conditions);
  const [selectedField, setSelectedField] = reactExports.useState(() => model.field?.children[0].constant ?? null);
  const handleFieldChange = (newField) => {
    setSelectedField(newField);
    const entityTable = dataModel.find((t22) => t22.name === entityType);
    const fieldDef = newField ? entityTable?.fields.find((f) => f.name === newField) : void 0;
    const fieldType = fieldDef && isAllowedScoringRuleType(fieldDef.dataType) ? fieldDef.dataType : null;
    const newConditions = fieldType ? createDefaultConditions(fieldType) : null;
    setConditions(newConditions);
    onModelChange?.({
      type: "user_attribute",
      field: newField ? NewPayloadAstNode(newField) : null,
      conditions: newConditions
    });
  };
  const handleConditionsChange = (next) => {
    setConditions(next);
    onModelChange?.({
      type: "user_attribute",
      field: selectedField ? NewPayloadAstNode(selectedField) : null,
      conditions: next
    });
  };
  const fieldOptions = reactExports.useMemo(() => {
    const entityTable = dataModel.find((t22) => t22.name === entityType);
    if (!entityTable) return [];
    return entityTable.fields.filter((f) => isAllowedScoringRuleType(f.dataType)).map((f) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
        getDataTypeIcon(f.dataType) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: getDataTypeIcon(f.dataType), className: "size-4 shrink-0" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.name })
      ] }),
      value: f.name
    }));
  }, [dataModel, entityType]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.depending_on") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectV2,
        {
          value: selectedField,
          placeholder: "—",
          options: fieldOptions,
          onChange: handleFieldChange,
          className: "w-[164px]"
        }
      )
    ] }),
    conditions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2("user-scoring:switch.apply_conditions") }),
      M(conditions).with({ type: "number" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(NumberSwitchEdit, { conditions: c, maxRiskLevel, onChange: handleConditionsChange })).with({ type: "bool" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoolSwitchEdit, { conditions: c, maxRiskLevel, onChange: handleConditionsChange })).with({ type: "string" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        StringSwitchEdit,
        {
          conditions: c,
          maxRiskLevel,
          customLists,
          onChange: handleConditionsChange
        }
      )).exhaustive()
    ] }) : null
  ] });
}
function SwitchNodeEdit({
  node,
  maxRiskLevel,
  dataModel,
  entityType,
  customLists,
  onModelChange
}) {
  const model = transformAstNodeToModel(node, entityType, dataModel);
  if (!model) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm text-s text-grey-secondary", children: M(model).with({ type: "user_attribute" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    UserAttributeRuleEdit,
    {
      model: m,
      maxRiskLevel,
      dataModel,
      entityType,
      customLists,
      onModelChange
    }
  )).with({ type: "aggregate" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    AggregateRuleEdit,
    {
      model: m,
      maxRiskLevel,
      dataModel,
      customLists,
      onModelChange
    }
  )).with({ type: "screening_tags" }, { type: "entity_tags" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(TagsRuleEdit, { model: m, maxRiskLevel, onModelChange })).with({ type: "past_alerts" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(PastAlertsRuleEdit, { model: m, maxRiskLevel, onModelChange })).exhaustive() });
}
function BoolSwitchDescription({ conditions, maxRiskLevel }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: conditions.ifTrue, maxRiskLevel, children: t2("user-scoring:switch.description.if_true") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: conditions.ifFalse, maxRiskLevel, children: t2("user-scoring:switch.description.if_false") })
  ] });
}
function NumberSwitchDescription({ conditions, maxRiskLevel }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
    conditions.branches.map((branch, idx) => {
      const label = idx === 0 ? t2("user-scoring:switch.description.if_value_lte", { value: branch.value }) : t2("user-scoring:switch.description.if_value_between", {
        from: conditions.branches[idx - 1].value + 1,
        to: branch.value
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: branch.impact, maxRiskLevel, children: label }, idx);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: conditions.default, maxRiskLevel, children: t2("user-scoring:switch.description.else") })
  ] });
}
function StringOperationValue({ operation, customLists }) {
  if (operation.op === "IsInList" || operation.op === "IsNotInList") {
    const listValue = operation.value;
    if (listValue.type === "customList") {
      const list = customLists.find((l) => l.id === listValue.listId);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", className: "flex items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "list", className: "size-3" }),
        list?.name ?? listValue.listId
      ] });
    }
    const MAX_VISIBLE = 3;
    const visible = listValue.values.slice(0, MAX_VISIBLE);
    const overflow = listValue.values.length - MAX_VISIBLE;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex flex-wrap items-center gap-xs", children: [
      visible.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: v }, i)),
      overflow > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", children: [
        "+",
        overflow
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: operation.value });
}
function StringSwitchDescription({ conditions, maxRiskLevel, customLists = [] }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const opLabels = {
    "=": t2("user-scoring:switch.string.op.eq"),
    "≠": t2("user-scoring:switch.string.op.neq"),
    StringContains: t2("user-scoring:switch.string.op.contains"),
    StringNotContain: t2("user-scoring:switch.string.op.not_contains"),
    StringStartsWith: t2("user-scoring:switch.string.op.starts_with"),
    StringEndsWith: t2("user-scoring:switch.string.op.ends_with"),
    IsInList: t2("user-scoring:switch.string.op.in_list"),
    IsNotInList: t2("user-scoring:switch.string.op.not_in_list")
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
    conditions.branches.map((branch, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: branch.impact, maxRiskLevel, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
      t2("user-scoring:switch.description.if_value", { op: opLabels[branch.value.op] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StringOperationValue, { operation: branch.value, customLists })
    ] }) }, idx)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: conditions.default, maxRiskLevel, children: t2("user-scoring:switch.description.else") })
  ] });
}
function TagsSwitchDescription({ conditions, maxRiskLevel, getTagLabel }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col gap-sm", children: [
    conditions.branches.map((branch, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchCaseRow, { impact: branch.impact, maxRiskLevel, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.screening_tags.if_tags_include") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex flex-wrap gap-xs", children: branch.value.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: getTagLabel(tag) }, tag)) })
    ] }, idx)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCaseRow, { impact: conditions.default, maxRiskLevel, children: t2("user-scoring:switch.description.else") })
  ] });
}
function SwitchNodeView({ node, dataModel, entityType, maxRiskLevel, customLists }) {
  const { t: tAstBuilder } = useTranslation(["common", "scenarios"]);
  const {
    t: t2,
    i18n: { language }
  } = useTranslation(["user-scoring", "scenarios"]);
  const { getTagById } = useOrganizationObjectTags();
  const fieldType = isSwitchAstNode(node) ? getOperationType(entityType, dataModel, node) : null;
  const model = transformAstNodeToModel(node, entityType, dataModel);
  const hasChildren = isSwitchAstNode(node) ? node.children.length > 0 : true;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm ps-2xl text-xs text-grey-secondary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-sm", children: model ? M(model).with(
      { type: "user_attribute" },
      (m) => isCompleteRule(m) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.depending_on") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldPill, { field: m.field, fieldType }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          ", ",
          t2("user-scoring:switch.apply_conditions")
        ] })
      ] }) : null
    ).with(
      { type: "aggregate" },
      (m) => isCompleteRule(m) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.depending_on") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", className: "gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getAstNodeDisplayName(m.field, {
            customLists: [],
            language,
            t: tAstBuilder
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "function", className: "size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          ", ",
          t2("user-scoring:switch.apply_conditions")
        ] })
      ] }) : null
    ).with({ type: "screening_tags" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.screening_tags.depending_on") })).with({ type: "entity_tags" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.entity_tags.depending_on") })).with({ type: "past_alerts" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:switch.past_alerts.depending_on") })).exhaustive() : null }),
    !hasChildren ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "italic text-grey-placeholder", children: t2("user-scoring:switch.no_condition") }) : model && isCompleteRule(model) ? M(model).with(
      { type: "user_attribute" },
      { type: "aggregate" },
      (m) => M(m.conditions).with({ type: "number" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(NumberSwitchDescription, { conditions: c, maxRiskLevel })).with({ type: "bool" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoolSwitchDescription, { conditions: c, maxRiskLevel })).with({ type: "string" }, (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(StringSwitchDescription, { conditions: c, maxRiskLevel, customLists })).exhaustive()
    ).with({ type: "screening_tags" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      TagsSwitchDescription,
      {
        conditions: m.conditions,
        maxRiskLevel,
        getTagLabel: (value) => {
          const cats = topicsToCategories([value]);
          const cat = cats[0];
          return cat ? t2(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[cat]}`) : value;
        }
      }
    )).with({ type: "entity_tags" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      TagsSwitchDescription,
      {
        conditions: m.conditions,
        maxRiskLevel,
        getTagLabel: (value) => getTagById(value)?.name ?? value
      }
    )).with({ type: "past_alerts" }, (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(BoolSwitchDescription, { conditions: m.conditions, maxRiskLevel })).exhaustive() : null
  ] });
}
function SwitchNode({
  node,
  mode,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists,
  onModelChange
}) {
  if (mode === "view")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchNodeView,
      {
        node,
        dataModel,
        entityType,
        maxRiskLevel,
        customLists
      }
    );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SwitchNodeEdit,
    {
      node,
      maxRiskLevel,
      dataModel,
      entityType,
      customLists,
      onModelChange
    }
  );
}
function ScoringRuleEditPanel({
  rule,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists = [],
  hasValidLicense,
  onChange,
  onDelete
}) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const sharp = PanelSharpFactory.useSharp();
  const payloadAccessors = reactExports.useMemo(
    () => buildPayloadAccessorsFromDataModel(dataModel, entityType),
    [dataModel, entityType]
  );
  const databaseAccessors = reactExports.useMemo(
    () => buildDatabaseAccessorsFromDataModel(dataModel, entityType),
    [dataModel, entityType]
  );
  const builderOptionsData = reactExports.useMemo(
    () => ({
      dataModel,
      triggerObjectType: entityType,
      customLists,
      databaseAccessors,
      payloadAccessors,
      hasValidLicense,
      hasContinuousScreening: false,
      screeningConfigs: [],
      hasScoringRuleset: false,
      scoringSettings: null
    }),
    [dataModel, entityType, customLists, databaseAccessors, payloadAccessors, hasValidLicense]
  );
  const nameInputRef = reactExports.useRef(null);
  const [name, setName] = reactExports.useState(rule.name);
  const [nameTouched, setNameTouched] = reactExports.useState(false);
  const [riskType, setRiskType] = reactExports.useState(rule.riskType);
  reactExports.useEffect(() => {
    if (!rule.name) {
      const id = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, []);
  const [currentModel, setCurrentModel] = reactExports.useState(
    () => transformAstNodeToModel(rule.ast, entityType, dataModel)
  );
  const RISK_TYPE_OPTIONS = RISK_TYPES.map((v) => ({
    value: v,
    label: t2(`user-scoring:risk_type.${v}`)
  }));
  const isValid = !!name.trim() && !!riskType && !!currentModel && isCompleteRule(currentModel);
  const handleValidate = async () => {
    if (isValid && currentModel && isCompleteRule(currentModel) && onChange) {
      const result = await onChange({
        ...rule,
        name,
        riskType,
        ast: buildAstNodeFromModel(currentModel, { entityType })
      });
      if (result) {
        sharp.actions.close();
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.StaticProvider, { data: builderOptionsData, mode: "edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Header, { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: nameInputRef,
            className: cn(
              "text-h2 font-semibold outline-none h-6",
              nameTouched && !name.trim() ? "border-b border-red-primary" : ""
            ),
            value: name,
            onChange: (e) => setName(e.target.value),
            onBlur: () => setNameTouched(true),
            placeholder: t2("user-scoring:rule_edit.name_placeholder")
          }
        ),
        nameTouched && !name.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-primary mt-1", children: t2("user-scoring:rule_edit.name_required") }) : null
      ] }),
      onDelete ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onDelete,
          className: "ms-auto flex size-6 shrink-0 items-center justify-center rounded-lg border border-red-primary text-red-primary hover:bg-red-primary hover:text-white",
          "aria-label": "Delete rule",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" })
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 pb-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: entityType }),
      currentModel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: M(currentModel).with({ type: "user_attribute" }, () => t2("user-scoring:rule_edit.model_type.user_attribute")).with({ type: "aggregate" }, () => t2("user-scoring:rule_edit.model_type.aggregate")).with({ type: "screening_tags" }, () => t2("user-scoring:rule_edit.model_type.screening_tags")).with({ type: "entity_tags" }, () => t2("user-scoring:rule_edit.model_type.entity_tags")).with({ type: "past_alerts" }, () => t2("user-scoring:rule_edit.model_type.past_alerts")).exhaustive() }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectV2,
        {
          variant: "tag",
          options: RISK_TYPE_OPTIONS,
          value: riskType,
          onChange: setRiskType,
          placeholder: t2("user-scoring:rule_edit.risk_type_placeholder"),
          menuClassName: "min-w-40"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md p-md border border-grey-border rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchNode,
      {
        mode: "edit",
        node: rule.ast,
        dataModel,
        entityType,
        maxRiskLevel,
        customLists,
        onModelChange: (model) => setCurrentModel(model)
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          variant: "secondary",
          onClick: sharp.actions.close,
          label: t2("user-scoring:rule_edit.cancel")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          variant: "primary",
          onClick: handleValidate,
          disabled: !isValid,
          label: t2("user-scoring:rule_edit.save")
        }
      )
    ] })
  ] }) }) });
}
function AddRuleMenuContent({ onConfirm, onCancel }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [selectedType, setSelectedType] = reactExports.useState("user_attribute");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { align: "end", sideOffset: 4, className: "min-w-80", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { heading: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-md", children: t2("user-scoring:ruleset.rule_type_heading") }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: RULE_TYPES.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.HeadlessItem, { value, onSelect: () => setSelectedType(value), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "border-purple-primary flex size-4 shrink-0 items-center justify-center rounded-full border",
            selectedType === value ? "bg-purple-primary" : "bg-white"
          ),
          children: selectedType === value && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-white" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: cn("text-s text-grey-primary", selectedType === value ? "font-semibold" : "font-normal"),
          children: t2(`user-scoring:ruleset.rule_type.${value}`)
        }
      )
    ] }) }, value)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex items-center justify-end gap-sm border-t p-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "small", onClick: onCancel, children: t2("user-scoring:ruleset.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "small", onClick: () => onConfirm(selectedType), children: t2("user-scoring:ruleset.create_rule") })
    ] })
  ] });
}
function RulesTable({ ruleset, maxRiskLevel, customLists, hasValidLicense }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const router = useRouter();
  const navigate = useNavigate();
  const { rules, recordType: entityType } = ruleset;
  const [open, setOpen] = reactExports.useState(false);
  const [panelRule, setPanelRule] = reactExports.useState(null);
  const dataModelQuery = useDataModelQuery();
  const mutation = useUpdateScoringRulesetMutation();
  const handleConfirm = (ruleType) => {
    const ast = M(ruleType).with("user_attribute", () => NewSwitchAstNode(ruleType, NewAstNode())).with("aggregate", () => NewSwitchAstNode(ruleType, NewAggregatorAstNode("SUM"))).with(
      "screening_tags",
      "entity_tags",
      () => buildAstNodeFromModel(
        {
          type: ruleType,
          conditions: {
            type: "tags",
            branches: [{ value: [], impact: { modifier: 0 } }],
            default: { modifier: 0 }
          }
        },
        { entityType }
      )
    ).with(
      "past_alerts",
      () => buildAstNodeFromModel({
        type: "past_alerts",
        conditions: { type: "bool", ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } }
      })
    ).exhaustive();
    setPanelRule({
      stableId: v7(),
      name: "",
      description: "",
      riskType: "customer_features",
      ast
    });
    setOpen(false);
  };
  const onSaveSuccess = async (ruleset2) => {
    zt.success(t2("common:success.save"));
    await router.invalidate();
    if (ruleset2) {
      navigate({
        to: "/user-scoring/$recordType/$version",
        params: {
          recordType: ruleset2.recordType,
          version: "draft"
        }
      });
    }
    return true;
  };
  const onSaveError = async () => {
    zt.error(t2("common:errors.unknown"));
    return false;
  };
  const handleRuleChange = async (stableId, newRule) => {
    return mutation.mutateAsync({
      id: ruleset.id,
      recordType: ruleset.recordType,
      name: ruleset.name,
      thresholds: ruleset.thresholds,
      cooldownSeconds: ruleset.cooldownSeconds,
      scoringIntervalSeconds: ruleset.scoringIntervalSeconds,
      rules: ruleset.rules.map(
        (r) => r.stableId === stableId ? {
          stableId: r.stableId,
          name: newRule.name,
          description: newRule.description,
          riskType: newRule.riskType,
          ast: newRule.ast
        } : { stableId: r.stableId, name: r.name, description: r.description, riskType: r.riskType, ast: r.ast }
      )
    }).then(onSaveSuccess).catch(onSaveError);
  };
  const handleRuleAdd = async (newRule) => {
    return mutation.mutateAsync({
      id: ruleset.id,
      recordType: ruleset.recordType,
      name: ruleset.name,
      thresholds: ruleset.thresholds,
      cooldownSeconds: ruleset.cooldownSeconds,
      scoringIntervalSeconds: ruleset.scoringIntervalSeconds,
      rules: [
        ...ruleset.rules.map((r) => ({
          stableId: r.stableId,
          name: r.name,
          description: r.description,
          riskType: r.riskType,
          ast: r.ast
        })),
        {
          stableId: newRule.stableId,
          name: newRule.name,
          description: newRule.description,
          riskType: newRule.riskType,
          ast: newRule.ast
        }
      ]
    }).then((ruleset2) => {
      setPanelRule(null);
      return onSaveSuccess(ruleset2);
    }).catch(onSaveError);
  };
  const handleRuleDelete = (stableId) => {
    mutation.mutateAsync({
      id: ruleset.id,
      recordType: ruleset.recordType,
      name: ruleset.name,
      thresholds: ruleset.thresholds,
      cooldownSeconds: ruleset.cooldownSeconds,
      scoringIntervalSeconds: ruleset.scoringIntervalSeconds,
      rules: ruleset.rules.filter((r) => r.stableId !== stableId).map((r) => ({
        stableId: r.stableId,
        name: r.name,
        description: r.description,
        riskType: r.riskType,
        ast: r.ast
      }))
    }).then(onSaveSuccess).catch(onSaveError);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border rounded-md overflow-hidden border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex items-center justify-between border-b px-md py-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-secondary grid flex-1 grid-cols-[150px_1fr] gap-md font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:ruleset.risk_types_column") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("user-scoring:ruleset.rules_column") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, persistOnSelect: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
            t2("user-scoring:ruleset.add_rule")
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AddRuleMenuContent, { onConfirm: handleConfirm, onCancel: () => setOpen(false) })
        ] })
      ] }),
      rules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary flex items-center justify-center py-xl", children: t2("user-scoring:ruleset.no_rules") }) : M(dataModelQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, {}) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-red-primary flex items-center justify-center py-xl", children: t2("user-scoring:ruleset.error") })).with(
        { isSuccess: true },
        ({ data: { dataModel } }) => rules.map((rule) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          RuleRow,
          {
            rule,
            dataModel,
            entityType,
            maxRiskLevel,
            customLists,
            hasValidLicense,
            onRuleChange: (newRule) => handleRuleChange(rule.stableId, newRule),
            onRuleDelete: () => handleRuleDelete(rule.stableId)
          },
          rule.stableId
        ))
      ).exhaustive()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.Root,
      {
        open: panelRule !== null,
        onOpenChange: (isOpen) => {
          if (!isOpen) setPanelRule(null);
        },
        children: panelRule && dataModelQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ScoringRuleEditPanel,
          {
            rule: panelRule,
            dataModel: dataModelQuery.data.dataModel,
            entityType,
            maxRiskLevel,
            customLists,
            hasValidLicense,
            onChange: handleRuleAdd
          }
        ) : null
      }
    )
  ] });
}
function RuleRow({
  rule,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists,
  hasValidLicense,
  onRuleChange,
  onRuleDelete
}) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex border-b last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-[150px] shrink-0 items-center px-md py-sm", children: rule.riskType ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t2(`user-scoring:risk_type.${rule.riskType}`) }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm px-md py-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-s font-medium", children: rule.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchNode,
        {
          node: rule.ast,
          mode: "view",
          dataModel,
          entityType,
          maxRiskLevel,
          customLists
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-end px-md py-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "border-purple-primary text-purple-primary flex size-6 items-center justify-center rounded-lg border shadow-sm",
          "aria-label": "Edit rule",
          onClick: () => setIsEditing(true),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "size-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: isEditing, onOpenChange: setIsEditing, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScoringRuleEditPanel,
        {
          rule,
          dataModel,
          entityType,
          maxRiskLevel,
          customLists,
          hasValidLicense,
          onChange: onRuleChange,
          onDelete: onRuleDelete ? () => {
            onRuleDelete();
            setIsEditing(false);
          } : void 0
        }
      ) })
    ] })
  ] });
}
function ScoringRulesetPage({
  ruleset,
  settings,
  customLists,
  preparationStatus,
  hasValidLicense
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralInfoCard, { ruleset, settings, preparationStatus }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RulesTable,
      {
        ruleset,
        maxRiskLevel: settings.maxRiskLevel,
        customLists,
        hasValidLicense
      }
    )
  ] });
}
function UserScoringRulesetRoute() {
  const loaderData = Route.useLoaderData();
  const parentData = useLoaderData({
    from: "/_app/_builder/user-scoring"
  });
  if (!loaderData || !parentData?.settings) return null;
  const {
    ruleset,
    customLists,
    preparationStatus,
    hasValidLicense
  } = loaderData;
  const {
    settings
  } = parentData;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringRulesetPage, { ruleset, settings, customLists, preparationStatus, hasValidLicense });
}
export {
  UserScoringRulesetRoute as component
};
