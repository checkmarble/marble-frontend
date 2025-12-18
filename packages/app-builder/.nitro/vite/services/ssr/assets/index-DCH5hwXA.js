import { R as jsxRuntimeExports, r as reactExports, S as React } from "../server.js";
import { t as t$1, a0 as t$2, bN as isPayload, c1 as findDataModelField, c2 as isDatabaseAccess, c3 as findDataModelTable, bH as assertNever, bL as isConstant, c4 as isDataAccessorAstNode, c5 as isStringTemplateAstNode, c6 as isFuzzyMatchComparator, c7 as isIsMultipleOf, c8 as isTimestampExtract, c9 as isTimeNow, ca as isTimeAdd, cb as isIpHasFlag, cc as validTimestampExtractParts, cd as validIpFlags, ce as isMainAstOperatorFunction, cf as isAggregationFilterOperator, cg as undefinedAstNodeName, _ as t$3, u as t$4, bW as isCustomListAccess, bM as isAggregation, ch as isFuzzyMatchFilterOptionsAstNode, bT as isMonitoringListCheckAstNode, ci as isRecordRiskLevelCheckAstNode, cj as isUndefinedAstNode, o as t$6, p as t$7, v as n$1, T as Temporal, b_ as topicsToCategories, bI as SCREENING_CATEGORY_I18N_KEY_MAP, ck as e$6, cl as createBaseFuzzyMatchConfig, bZ as NewAggregatorAstNode, cm as NewFuzzyMatchComparatorAstNode, cn as NewTimeAddAstNode, co as NewTimestampExtractAstNode, cp as NewTimeNowAstNode, cq as NewIsMultipleOfAstNode, cr as NewIpHasFlagAstNode, a_ as NewUndefinedAstNode, bP as NewTagCheckAstNode, bQ as monitoringListCheckAstNodeName, cs as NewRecordRiskLevelCheckAstNode, bX as NewCustomListAstNode, bJ as NewConstantAstNode, M, $ as t$8, ct as t$9, cu as findDataModelTableByName, aM as t$a, aX as z, bz as getDataTypeIcon, cv as getDataTypeTKey, cw as isUnaryAggregationFilter, cx as recordRiskLevelCheckAstNodeName, cy as injectIdToNode, cz as stripIdFromNode, cA as getConstantDataTypeTKey, cB as isEditableAstNode, cC as isBinaryAggregationFilter, cD as isComplexAggregationFilter, cE as getEnumValues, cF as aggregationFilterOperators, cG as isUnaryAggregationFilterOperator, cH as isBinaryAggregationFilterOperator, cI as NewFuzzyMatchFilterOptionsAstNode, l as isKnownOperandAstNode, cJ as NewAggregatorFilterAstNode, cK as AggregationFuzzyMatchConfig, cL as isIpFieldAstNode, aV as SCREENING_CATEGORIES, cM as fromPathToTarget, cN as fromLinkedTableChecks, cO as toMonitoringListCheckConfig, cP as STRING_TEMPLATE_VARIABLE_REGEXP, cQ as isTimestampFieldAstNode, B as isAdmin, bV as isMainAstBinaryNode, cR as isMainAstNode, cS as isMainAstUnaryNode, cT as isUnaryMainAstOperatorFunction, cU as isBinaryMainAstOperatorFunction, cV as NewAndAstNode, cW as isAndAstNode, cX as isOrWithAndAstNode } from "./services-middleware-DR8Hua1Y.js";
import { w as formatDateTimeWithoutPresets, dA as formatNumber, u as useTranslation, d as cn, e8 as MenuCommand, dD as Tooltip, e as Icon, f as cva, e4 as Modal, s as Trans, et as HovercardAnchor, eu as Hovercard, b as clsx, q as useFormatLanguage, B as Button, e1 as Input, dE as Logo, eF as Select, dZ as SelectV2, eg as Checkbox, e6 as Radio, ep as Stepper, j as Tag } from "./format-NPGUXq-g.js";
import { u as useCallbackRef$1 } from "./use-callback-ref-AfyBSz95.js";
import { a9 as validateAstFn, aa as getBuilderOptionsFn, H as Highlight, w as matchSorter, ab as scenarioI18n, L as Link } from "./router-vb7i5euz.js";
import { i as invariant, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { B, g } from "./sharpstate.es-CeF1Mf5b.js";
import { d as dateTimeDataTypeSchema } from "./dataTypeSchema-DvqJgdgd.js";
import { e as e$4 } from "./isArray-gJc74O_I.js";
import { e as e$5 } from "./isNullish-B8pc8Ntu.js";
import { t as t$5 } from "./join-BeQTfqAC.js";
import { H as HoverCard, a as HoverCardTrigger, b as HoverCardPortal, c as HoverCardContent } from "./index-CtZTigeT.js";
import { i as isMaxRiskLevelInRange, S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS, s as scoringLevelEntries } from "./display-TKj7AN5a.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { b as aggregationDocHref, f as fuzzyMatchingDocHref, c as stringTemplatingDocHref, d as dateDocHref } from "./documentation-href-uAe88WFl.js";
import { a as adaptEvaluationErrorViewModels, c as commonErrorMessages } from "./scenario-validation-error-messages-CB3GcwJ8.js";
import { t as t$b } from "./flatMap-CbF5uMEQ.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { H as HovercardProvider } from "./hovercard-provider-BchUL2eY.js";
import { u as useCreateNavigationOptionForAstMutation } from "./create-navigation-option-DrtWhyLE.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { e as e$7 } from "./isNonNullish-DgEqPJBU.js";
function t(...t2) {
  return t$1(n, t2);
}
function n(e2, t2 = [], n2 = []) {
  if (typeof e2 == `function`) return e2;
  if (typeof e2 != `object` || !e2) return structuredClone(e2);
  let a2 = Object.getPrototypeOf(e2);
  if (!Array.isArray(e2) && a2 !== null && a2 !== Object.prototype) return structuredClone(e2);
  let o = t2.indexOf(e2);
  return o === -1 ? (t2.push(e2), Array.isArray(e2) ? i$1(e2, t2, n2) : r$1(e2, t2, n2)) : n2[o];
}
function r$1(e2, t2, r2) {
  let i2 = {};
  r2.push(i2);
  for (let [a2, o] of Object.entries(e2)) i2[a2] = n(o, t2, r2);
  return i2;
}
function i$1(e2, t2, r2) {
  let i2 = [];
  r2.push(i2);
  for (let [a2, o] of e2.entries()) i2[a2] = n(o, t2, r2);
  return i2;
}
const e$3 = (e2) => Object.assign(e2, { single: true });
function r(...t2) {
  return t$1(i, t2, e$3(a));
}
const i = (e2, t2) => e2.find(t2), a = (e2) => (n2, r2, i2) => e2(n2, r2, i2) ? { done: true, hasNext: true, next: n2 } : t$2;
function e$2(e2) {
  return typeof e2 == `boolean`;
}
function e$1(e2) {
  return typeof e2 == `number` && !Number.isNaN(e2);
}
function e(e2) {
  return typeof e2 == `string`;
}
function getDataAccessorAstNodeField(astNode, context) {
  if (isPayload(astNode)) {
    return findDataModelField({
      table: context.triggerObjectTable,
      fieldName: astNode.children[0].constant
    });
  }
  if (isDatabaseAccess(astNode)) {
    const table = findDataModelTable({
      dataModel: context.dataModel,
      tableName: astNode.namedChildren.tableName.constant,
      path: astNode.namedChildren.path.constant
    });
    return findDataModelField({
      table,
      fieldName: astNode.namedChildren.fieldName.constant
    });
  }
  assertNever("Unsupported DataAccessorAstNode", astNode);
}
function getAstNodeDataType(astNode, context) {
  if (isConstant(astNode)) {
    return getConstantAstNodeDataType(astNode);
  }
  if (isDataAccessorAstNode(astNode)) {
    const field = getDataAccessorAstNodeField(astNode, context);
    return field.dataType;
  }
  if (isStringTemplateAstNode(astNode)) {
    return "String";
  }
  if (isFuzzyMatchComparator(astNode) || isIsMultipleOf(astNode)) {
    return "Bool";
  }
  if (isTimestampExtract(astNode)) {
    return "Int";
  }
  if (isTimeNow(astNode) || isTimeAdd(astNode)) {
    return "Timestamp";
  }
  if (isIpHasFlag(astNode)) {
    return "Bool";
  }
  return "unknown";
}
function getConstantAstNodeDataType(astNode) {
  const { constant } = astNode;
  if (e(constant)) {
    const parsedConstant = dateTimeDataTypeSchema.safeParse(constant);
    if (parsedConstant.success) {
      return "Timestamp";
    }
    return "String";
  }
  if (e$1(constant)) {
    return Number.isInteger(constant) ? "Int" : "Float";
  }
  if (e$2(constant)) {
    return "Bool";
  }
  if (e$4(constant)) {
    if (constant.every(e)) return "String[]";
    if (constant.every(e$1)) {
      return constant.every(Number.isInteger) ? "Int[]" : "Float[]";
    }
    if (constant.every(e$2)) return "Bool[]";
  }
  return "unknown";
}
const aggregatorOperators = [
  "AVG",
  "COUNT",
  "COUNT_DISTINCT",
  "MAX",
  "MIN",
  "SUM",
  "STDDEV",
  "PCTILE",
  "MEDIAN"
];
function isAggregatorOperator(value) {
  return aggregatorOperators.includes(value);
}
const aggregatorsWithParams = ["PCTILE"];
function aggregatorHasParams(aggregator) {
  return aggregatorsWithParams.includes(aggregator);
}
const restrictedAggregators = ["STDDEV", "PCTILE", "MEDIAN"];
function isRestrictedAggregator(aggregator) {
  return restrictedAggregators.includes(aggregator);
}
const performanceHeavyAggregators = ["PCTILE", "MEDIAN"];
function isPerformanceHeavyAggregator(aggregator) {
  return performanceHeavyAggregators.includes(aggregator);
}
const timeAddOperators = ["+", "-"];
function isTimeAddOperator(value) {
  return timeAddOperators.includes(value);
}
function isTimestampPart(value) {
  return validTimestampExtractParts.includes(value);
}
function isIpFlag(value) {
  return validIpFlags.includes(value);
}
function isOperatorOption(value) {
  return value == "Undefined" || isMainAstOperatorFunction(value) || isAggregationFilterOperator(value) || isTimeAddOperator(value) || isAggregatorOperator(value) || isTimestampPart(value) || isIpFlag(value);
}
function getOperatorName(t2, operatorName, isAggregationFilter) {
  if (isOperatorOption(operatorName)) {
    switch (operatorName) {
      case "+":
        return "+";
      case "-":
        return "-";
      case "<":
        return isAggregationFilter ? t2("scenarios:operator.filter_lt") : "<";
      case "=":
        return isAggregationFilter ? t2("scenarios:operator.filter_eq") : "=";
      case "≠":
      case "!=":
        return isAggregationFilter ? t2("scenarios:operator.filter_neq") : "≠";
      case ">":
        return isAggregationFilter ? t2("scenarios:operator.filter_gt") : ">";
      case ">=":
        return isAggregationFilter ? t2("scenarios:operator.filter_gte") : "≥";
      case "<=":
        return isAggregationFilter ? t2("scenarios:operator.filter_lte") : "≤";
      case "*":
        return "×";
      case "/":
        return "÷";
      case "IsInList":
        return isAggregationFilter ? t2("scenarios:operator.filter_is_in") : t2("scenarios:operator.is_in");
      case "IsEmpty":
        return isAggregationFilter ? t2("scenarios:operator.filter_is_empty") : t2("scenarios:operator.is_empty");
      case "IsNotEmpty":
        return isAggregationFilter ? t2("scenarios:operator.filter_is_not_empty") : t2("scenarios:operator.is_not_empty");
      case "IsNotInList":
        return isAggregationFilter ? t2("scenarios:operator.filter_is_not_in") : t2("scenarios:operator.is_not_in");
      case "StringContains":
        return isAggregationFilter ? t2("scenarios:operator.filter_contains") : t2("scenarios:operator.contains");
      case "StringNotContain":
        return isAggregationFilter ? t2("scenarios:operator.filter_does_not_contain") : t2("scenarios:operator.does_not_contain");
      case "StringStartsWith":
        return isAggregationFilter ? t2("scenarios:operator.filter_starts_with") : t2("scenarios:operator.starts_with");
      case "StringEndsWith":
        return isAggregationFilter ? t2("scenarios:operator.filter_ends_with") : t2("scenarios:operator.ends_with");
      case "ContainsAnyOf":
        return isAggregationFilter ? t2("scenarios:operator.filter_contains_any_of") : t2("scenarios:operator.contains_any_of");
      case "ContainsNoneOf":
        return isAggregationFilter ? t2("scenarios:operator.filter_contains_none_of") : t2("scenarios:operator.contains_none_of");
      case "FuzzyMatch":
        return isAggregationFilter ? t2("scenarios:operator.filter_fuzzy-match") : "≈";
      case "AVG":
        return t2("scenarios:aggregator.average");
      case "COUNT":
        return t2("scenarios:aggregator.count");
      case "COUNT_DISTINCT":
        return t2("scenarios:aggregator.count_distinct");
      case "MAX":
        return t2("scenarios:aggregator.max");
      case "MIN":
        return t2("scenarios:aggregator.min");
      case "SUM":
        return t2("scenarios:aggregator.sum");
      case "STDDEV":
        return t2("scenarios:aggregator.stddev");
      case "PCTILE":
        return t2("scenarios:aggregator.pctile");
      case "MEDIAN":
        return t2("scenarios:aggregator.median");
      case "year":
        return t2("scenarios:timestamp_part.year");
      case "month":
        return t2("scenarios:timestamp_part.month");
      case "day_of_month":
        return t2("scenarios:timestamp_part.day_of_month");
      case "day_of_week":
        return t2("scenarios:timestamp_part.day_of_week");
      case "hour":
        return t2("scenarios:timestamp_part.hour");
      case "abuse":
        return t2("scenarios:ip_flag.abuse");
      case "vpn":
        return t2("scenarios:ip_flag.vpn");
      case "tor_exit_node":
        return t2("scenarios:ip_flag.tor_exit_node");
      case "cloud_provider":
        return t2("scenarios:ip_flag.cloud_provider");
      case undefinedAstNodeName:
        return "...";
      default:
        assertNever("Untranslated operator", operatorName);
    }
  }
  return operatorName;
}
function formatConstant(constant, context) {
  if (e$5(constant)) return "NULL";
  if (e$4(constant)) {
    return `[${constant.map((constant2) => formatConstant(constant2, context)).join(", ")}]`;
  }
  if (e(constant)) {
    const parsedConstant = dateTimeDataTypeSchema.safeParse(constant);
    if (parsedConstant.success) {
      return formatDateTimeWithoutPresets(parsedConstant.data, {
        language: context.language,
        dateStyle: "short",
        timeStyle: "short"
      });
    }
    return `"${constant.toString()}"`;
  }
  if (e$1(constant)) {
    return formatNumber(constant, {
      language: context.language,
      maximumFractionDigits: 2
    });
  }
  if (e$2(constant)) {
    return context.t(`common:${constant}`);
  }
  return JSON.stringify(t$3(constant, (constant2) => formatConstant(constant2, context)));
}
function getCustomListAccessCustomList(astNode, context) {
  return t$4(
    context.customLists,
    r(({ id }) => id === astNode.namedChildren.customListId.constant)
  );
}
function getAstNodeDisplayName(astNode, context) {
  if (isConstant(astNode)) {
    return formatConstant(astNode.constant, context);
  }
  if (isCustomListAccess(astNode)) {
    const customList = getCustomListAccessCustomList(astNode, context);
    return customList?.name ?? context.t("scenarios:custom_list.unknown");
  }
  if (isDataAccessorAstNode(astNode)) {
    return getDataAccessorDisplayName(astNode);
  }
  if (isAggregation(astNode)) {
    return getAggregatorDisplayName(astNode, context);
  }
  if (isTimeAdd(astNode)) {
    return getTimeAddDisplayName(astNode, context);
  }
  if (isTimeNow(astNode)) {
    return context.t("scenarios:edit_date.now");
  }
  if (isTimestampExtract(astNode)) {
    return getTimestampExtractDisplayName(astNode, context);
  }
  if (isIpHasFlag(astNode)) {
    return getIpHasFlagDisplayName(astNode, context);
  }
  if (isFuzzyMatchComparator(astNode)) {
    return getFuzzyMatchComparatorDisplayName(astNode, context);
  }
  if (isIsMultipleOf(astNode)) {
    return getIsMultipleOfDisplayName(astNode, context);
  }
  if (isStringTemplateAstNode(astNode)) {
    return getStringTemplateDisplayName(astNode, context);
  }
  if (isFuzzyMatchFilterOptionsAstNode(astNode)) {
    return getAstNodeDisplayName(astNode.namedChildren.value, context);
  }
  if (isMonitoringListCheckAstNode(astNode)) {
    return getMonitoringListCheckDisplayName(astNode, context);
  }
  if (isRecordRiskLevelCheckAstNode(astNode)) {
    return context.t("scenarios:record_risk_level_check.menu_label");
  }
  if (isUndefinedAstNode(astNode)) {
    return "";
  }
  if (!astNode.name) return "🤷";
  const childrenArgs = t$4(
    astNode.children,
    t$6((child) => getAstNodeDisplayName(child, context)),
    t$5(", ")
  );
  const namedChildrenArgs = t$4(
    t$7(astNode.namedChildren),
    t$6(([name, child]) => `${name}: ${getAstNodeDisplayName(child, context)}`),
    t$5(", ")
  );
  const args = t$4(
    [childrenArgs, namedChildrenArgs],
    n$1((arg) => arg !== ""),
    t$5(", ")
  );
  return `${astNode.name}(${args})`;
}
function getDataAccessorDisplayName(astNode) {
  if (isDatabaseAccess(astNode)) {
    const { path, fieldName } = astNode.namedChildren;
    return [...path.constant, fieldName.constant].join(".");
  }
  if (isPayload(astNode)) {
    return astNode.children[0].constant;
  }
  throw invariant("never encountered");
}
function getTimeAddDisplayName(astNode, context) {
  const sign = astNode.namedChildren["sign"]?.constant ?? "";
  const isoDuration = astNode.namedChildren["duration"]?.constant ?? "";
  const timestampField = astNode.namedChildren["timestampField"];
  const timestamp = getAstNodeDisplayName(timestampField, context);
  if (sign === "" || isoDuration === "" || timestamp === "") {
    return context.t("scenarios:edit_date.date");
  }
  const temporalDuration = Temporal.Duration.from(isoDuration);
  return `${timestamp} ${sign} ${temporalDurationToString(temporalDuration)}`;
}
const temporalDurationToString = (temporalDuration) => {
  let durationString = "";
  if (temporalDuration.days !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.days, "day")}`;
  }
  if (temporalDuration.hours !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.hours, "hour")}`;
  }
  if (temporalDuration.minutes !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.minutes, "minute")}`;
  }
  if (temporalDuration.seconds !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.seconds, "second")}`;
  }
  if (durationString === "") {
    durationString += `${pluralizeTemporalDurationUnit(temporalDuration.seconds, "second")}`;
  }
  return durationString;
};
const pluralizeTemporalDurationUnit = (unit, type) => {
  if (unit === 1) {
    return `${unit} ${type}`;
  }
  return `${unit} ${type}s`;
};
function getAggregatorDisplayName(astNode, context) {
  const { aggregator, label } = astNode.namedChildren;
  if (label?.constant !== void 0 && label?.constant !== "") {
    return label?.constant;
  }
  const aggregatorName = aggregator.constant;
  if (isAggregatorOperator(aggregatorName)) {
    return getOperatorName(context.t, aggregatorName);
  }
  return aggregatorName;
}
function getFuzzyMatchComparatorDisplayName(astNode, context) {
  const fuzzyMatch = astNode.children[0];
  const left = fuzzyMatch.children[0];
  const right = fuzzyMatch.children[1];
  if (isUndefinedAstNode(left) && isUndefinedAstNode(right)) {
    return context.t("scenarios:edit_fuzzy_match.string_similarity");
  }
  const formatLeft = getAstNodeDisplayName(left, context) || "?";
  const formatRight = getAstNodeDisplayName(right, context) || "?";
  return `${formatLeft} ≈ ${formatRight}`;
}
function getTimestampExtractDisplayName(astNode, context) {
  const part = astNode.namedChildren["part"]?.constant ?? "";
  const timestamp = astNode.namedChildren["timestamp"];
  const timestampStr = getAstNodeDisplayName(timestamp, context);
  if (timestampStr === "") {
    return context.t("scenarios:edit_timestamp_extract.title");
  }
  return context.t("scenarios:edit_timestamp_extract.display_name", {
    replace: {
      operator: getOperatorName(context.t, part),
      timestamp: timestampStr
    }
  });
}
function getIpHasFlagDisplayName(astNode, context) {
  const flag = astNode.namedChildren["flag"]?.constant ?? "";
  const ip = astNode.namedChildren["ip"];
  const ipStr = getAstNodeDisplayName(ip, context);
  if (ipStr === "") {
    return context.t("scenarios:edit_ip_has_flag.title");
  }
  return context.t("scenarios:edit_ip_has_flag.display_name", {
    replace: {
      flag: getOperatorName(context.t, flag),
      ip: ipStr
    }
  });
}
function getIsMultipleOfDisplayName(astNode, context) {
  const value = astNode.namedChildren.value;
  const divider = astNode.namedChildren.divider.constant;
  const valueStr = getAstNodeDisplayName(value, context);
  if (valueStr === "") {
    return context.t("scenarios:edit_is_multiple_of.title");
  }
  return context.t("scenarios:edit_is_multiple_of.display_name", {
    replace: {
      value: valueStr,
      divider: formatNumber(divider, {
        language: context.language,
        style: void 0
      })
    }
  });
}
function getStringTemplateDisplayName(astNode, context) {
  const value = astNode.children[0]?.constant ?? "";
  if (!value) {
    return context.t("scenarios:edit_string_template.title");
  }
  return value;
}
function getMonitoringListCheckDisplayName(astNode, context) {
  const config = astNode.namedChildren.config.constant;
  const objectTableName = config.targetTableName;
  const topicFilters = config.topicFilters;
  if (!objectTableName) {
    return context.t("scenarios:monitoring_list_check.title");
  }
  if (topicFilters.length === 0) {
    return context.t("scenarios:monitoring_list_check.display_name_any", {
      replace: { objectTableName }
    });
  }
  const categories = topicsToCategories(topicFilters);
  const hitTypes = categories.map(
    (category) => context.t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[category]}`)
  ).join(", ");
  return context.t("scenarios:monitoring_list_check.display_name", {
    replace: { hitTypes, objectTableName }
  });
}
function getAstNodeOperandType(astNode, context) {
  if (isConstant(astNode)) {
    const { constant } = astNode;
    if (e$6(context.enumValues) && context.enumValues.length > 0 && (e$1(constant) || e(constant)) && context.enumValues.includes(constant)) {
      return "Enum";
    }
    return "Constant";
  }
  if (isCustomListAccess(astNode)) {
    return "CustomList";
  }
  if (isMonitoringListCheckAstNode(astNode)) {
    return "ClientRisk";
  }
  if (isDataAccessorAstNode(astNode)) {
    return "Field";
  }
  if (isAggregation(astNode) || isTimeAdd(astNode) || isTimeNow(astNode) || isFuzzyMatchComparator(astNode) || isTimestampExtract(astNode) || isIsMultipleOf(astNode) || isStringTemplateAstNode(astNode) || isIpHasFlag(astNode)) {
    return "Function";
  }
  if (isUndefinedAstNode(astNode)) {
    return "Undefined";
  }
  return "unknown";
}
const ComparatorFuzzyMatchConfig = createBaseFuzzyMatchConfig({
  algorithms: /* @__PURE__ */ new Set(["ratio", "token_set_ratio", "bag_of_words_similarity"]),
  defaultAlgorithm: "ratio",
  editablesAlgorithms: /* @__PURE__ */ new Set(["ratio", "token_set_ratio"]),
  defaultEditableAlgorithm: "token_set_ratio",
  thresholds: {
    low: 55,
    medium: 70,
    high: 85
  },
  defaultLevel: "high",
  examples: [
    {
      left: "Cabinet Dupond",
      right: "Jean-Charles Dupond",
      resultsScores: {
        ratio: 61,
        token_set_ratio: 61
      }
    },
    {
      left: "Mr Mrs John Jane OR Doe Smith",
      right: "John Doe",
      resultsScores: {
        ratio: 43,
        token_set_ratio: 100
      }
    },
    {
      left: "the dog was walking on the sidewalk",
      right: "the d og as walkin' on the side alk",
      resultsScores: {
        ratio: 91,
        token_set_ratio: 72
      }
    }
  ]
});
const fuzzyMatchConfig$2 = ComparatorFuzzyMatchConfig;
const FUNCTIONS_OPTIONS = [
  NewFuzzyMatchComparatorAstNode({ funcName: "FuzzyMatch", config: fuzzyMatchConfig$2 }),
  NewTimeAddAstNode(),
  NewTimestampExtractAstNode(),
  NewTimeNowAstNode(),
  NewIsMultipleOfAstNode(),
  NewIpHasFlagAstNode()
].map((n2) => ({ astNode: n2 }));
const MODELING_OPTIONS = ({
  currentNode,
  t: t2
}) => [
  {
    astNode: NewUndefinedAstNode({
      children: [currentNode, NewUndefinedAstNode()]
    }),
    dataType: "unknown",
    operandType: "Modeling",
    displayName: t2("scenarios:edit_operand.modeling.open_nesting"),
    // searchShortcut: '(',
    icon: "parentheses"
  }
];
const AST_BUILDER_STATIC_OPTIONS = [
  ...aggregatorOperators.map((operator) => ({
    astNode: NewAggregatorAstNode(operator)
  })),
  ...FUNCTIONS_OPTIONS
];
const CLIENT_RISK_OPTIONS = ({
  t: t2
}) => [
  {
    astNode: NewTagCheckAstNode(monitoringListCheckAstNodeName),
    displayName: t2("scenarios:monitoring_list_check.menu_label"),
    operandType: "ClientRisk",
    dataType: "Bool"
  },
  {
    astNode: NewRecordRiskLevelCheckAstNode(),
    displayName: t2("scenarios:record_risk_level_check.menu_label"),
    operandType: "ClientRisk",
    dataType: "Bool"
  }
];
function getFieldName(astNode) {
  return M(astNode).when(isDatabaseAccess, (n2) => n2.namedChildren.fieldName.constant).when(isPayload, (n2) => n2.children[0].constant).otherwise(() => "unknown");
}
function getDataAccessorPath(astNode) {
  if (isDatabaseAccess(astNode)) {
    const { tableName, path } = astNode.namedChildren;
    return [tableName.constant, ...path.constant].join(".");
  }
  return null;
}
function getOperandMenuOptions(params) {
  const mapOption = createMapOption({
    enumValues: params.enums,
    triggerObjectTable: params.triggerObjectTable,
    dataModel: params.data.dataModel,
    customLists: params.data.customLists,
    language: params.language,
    t: params.t
  });
  return [
    ...AST_BUILDER_STATIC_OPTIONS,
    ...params.data.databaseAccessors.filter((a2) => !params.excludeFields?.includes(getFieldName(a2))).map((a2) => ({
      astNode: a2,
      displayName: a2.namedChildren.fieldName.constant
    })),
    ...params.data.payloadAccessors.filter((a2) => !params.excludeFields?.includes(getFieldName(a2))).map((a2) => ({
      astNode: a2
    })),
    ...params.data.customLists.map((l) => ({
      astNode: NewCustomListAstNode(l.id)
    })),
    ...(params.enums ?? []).map((enumValue) => ({
      astNode: NewConstantAstNode({ constant: enumValue })
    })),
    ...MODELING_OPTIONS({ currentNode: params.node, t: params.t }),
    ...CLIENT_RISK_OPTIONS({ t: params.t })
  ].map(mapOption);
}
function groupByOperandType(operandMenuOptions, context) {
  return t$4(
    operandMenuOptions,
    t$8((option) => option.operandType),
    // biome-ignore lint/suspicious/noShadowRestrictedNames: <TBD>
    ({ Enum, CustomList, Function, Field, Modeling, ClientRisk }) => {
      const fieldOptions = Field ? t$4(
        Field,
        t$8((option) => {
          const path = getDataAccessorPath(option.astNode);
          if (path) return path;
          if (isPayload(option.astNode)) {
            return context.triggerObjectTable.name;
          }
        }),
        t$3((value) => t$9(value, (opt) => getFieldName(opt.astNode))),
        t$7(),
        t$9(([path]) => path)
      ) : [];
      return {
        fieldOptions,
        enumOptions: Enum ?? [],
        customListOptions: CustomList ?? [],
        functionOptions: Function ?? [],
        modelingOptions: Modeling ?? [],
        clientRiskOptions: ClientRisk ?? []
      };
    }
  );
}
function createMapOption({ enumValues, customLists, language, t: t2, ...modelData }) {
  return function({ astNode, operandType, displayName, dataType, ...rest }) {
    return {
      astNode,
      operandType: operandType ?? getAstNodeOperandType(astNode, {
        enumValues
      }),
      displayName: displayName ?? getAstNodeDisplayName(astNode, {
        customLists,
        language,
        t: t2
      }),
      dataType: dataType ?? getAstNodeDataType(astNode, modelData),
      ...rest
    };
  };
}
function getOptionDisplayName(option, context) {
  return option.displayName ?? getAstNodeDisplayName(option.astNode, context);
}
function getEvaluationForNode(evaluation, nodeId) {
  return evaluation.filter((e2) => e2.relatedIds.includes(nodeId));
}
function getErrorsForNode(validation, nodeIds, direct = false) {
  if (!nodeIds) return [];
  const nodeIdsArr = typeof nodeIds === "string" ? [nodeIds] : nodeIds;
  return validation.evaluation.filter(
    (e2) => direct ? nodeIdsArr.includes(e2.nodeId) : nodeIdsArr.some((nodeId) => e2.relatedIds.includes(nodeId))
  ).flatMap((e2) => e2.errors);
}
function getValidationStatus(validation, nodeIds, direct = false) {
  const errors = getErrorsForNode(validation, nodeIds, direct);
  return errors.length > 0 ? "error" : "valid";
}
function useValidateAstMutation(params) {
  const validateAst = useServerFn(validateAstFn);
  return useMutation({
    mutationFn: async (payload) => {
      if (!params.scenarioId) {
        return { errors: [], evaluation: [] };
      }
      const result = await validateAst({
        data: {
          scenarioId: params.scenarioId,
          node: payload.node,
          expectedReturnType: payload.expectedReturnType
        }
      });
      return result.flat;
    }
  });
}
function useBuilderOptionsQuery(params) {
  const getBuilderOptions = useServerFn(getBuilderOptionsFn);
  const queryKey = ["resources", "builder-options", fromUUIDtoSUUID(params.scenarioId)];
  return useQuery({
    queryKey,
    queryFn: async () => getBuilderOptions({ data: { scenarioId: params.scenarioId } }),
    initialData: params.initialData
  });
}
const AstBuilderDataSharpFactory = B({
  name: "AstBuilderData",
  initializer(init) {
    return { ...init };
  }
}).withComputed({
  triggerObjectTable(state) {
    return findDataModelTableByName({
      dataModel: state.data.dataModel,
      tableName: state.data.triggerObjectType
    });
  }
});
function AstBuilderInternalProvider(props) {
  const store = AstBuilderDataSharpFactory.createSharp({
    scenarioId: props.scenarioId,
    data: props.data,
    mode: props.mode,
    showValues: props.showValues
  });
  reactExports.useEffect(() => {
    store.value.showValues = props.showValues;
  }, [store, props.showValues]);
  reactExports.useEffect(() => {
    store.value.data = props.data;
  }, [store, props.data]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderDataSharpFactory.Provider, { value: store, children: props.children });
}
function AstBuilderStaticProvider(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AstBuilderInternalProvider,
    {
      scenarioId: void 0,
      data: props.data,
      mode: props.mode ?? "edit",
      showValues: props.showValues ?? false,
      children: props.children
    }
  );
}
function AstBuilderProvider(props) {
  const builderOptionsQuery = useBuilderOptionsQuery(props);
  if (builderOptionsQuery.isLoading || builderOptionsQuery.isPending) {
    return props.renderLoading ? props.renderLoading() : "Loading...";
  }
  if (builderOptionsQuery.isError) {
    return props.renderError ? props.renderError(builderOptionsQuery.error) : "Error...";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AstBuilderInternalProvider,
    {
      mode: props.mode ?? "view",
      scenarioId: props.scenarioId,
      data: builderOptionsQuery.data,
      showValues: props.showValues ?? false,
      children: props.children
    }
  );
}
function parsePath(stringPath) {
  const rawPath = stringPath.split(".");
  const root = rawPath.shift();
  if (root !== "root") throw new Error("root path is missing");
  const path = [];
  while (rawPath.length > 0) {
    const type = rawPath.shift();
    invariant(type);
    const value = rawPath.shift();
    invariant(value);
    switch (type) {
      case "children": {
        const index = parseInt(value, 10);
        if (Number.isNaN(index)) {
          throw new Error("invalid path: index must be a number");
        }
        path.push({ type: "children", index });
        break;
      }
      case "namedChildren": {
        path.push({ type: "namedChildren", key: value });
        break;
      }
      default:
        throw new Error(`invalid path: unknown type ${type}`);
    }
  }
  return path;
}
function getParentPath(path) {
  if (t$a(path, 1)) {
    return {
      path: path.slice(0, -1),
      childPathSegment: path[path.length - 1]
    };
  }
  return void 0;
}
function getAtPathSegment(tree, pathSegment) {
  switch (pathSegment.type) {
    case "children": {
      const { index } = pathSegment;
      return tree.children[index];
    }
    case "namedChildren": {
      const { key } = pathSegment;
      return tree.namedChildren[key];
    }
  }
}
function getAtPath(tree, path) {
  const [pathSegment, ...restPath] = path;
  if (pathSegment === void 0) {
    return tree;
  }
  const child = getAtPathSegment(tree, pathSegment);
  if (child === void 0) {
    return void 0;
  }
  return getAtPath(child, restPath);
}
const AstBuilderNodeSharpFactory = B({
  name: "AstBuilderNode",
  initializer({
    initialNode,
    initialValidation,
    validationFn,
    updateFn
  }) {
    return {
      node: t(initialNode),
      validation: initialValidation,
      copiedNode: null,
      validationFn,
      updateFn
    };
  }
}).withActions({
  setNodeAtPath(api, path, newNode) {
    const parentPath = getParentPath(parsePath(path));
    if (!parentPath) {
      api.value.node = newNode;
    } else {
      const parentNode = getAtPath(api.value.node, parentPath.path);
      if (!parentNode) {
        return;
      }
      M(parentPath.childPathSegment).with({ type: "children", index: z.select() }, (index) => {
        parentNode.children[index] = newNode;
      }).with({ type: "namedChildren", key: z.select() }, (key) => {
        parentNode.namedChildren[key] = newNode;
      }).exhaustive();
    }
    api.value.updateFn?.(t(api.value.node));
  },
  async validate(api) {
    try {
      const evaluation = await api.value.validationFn(api.value.node);
      api.batch(() => {
        api.value.validation = evaluation;
      });
    } catch (err) {
      if (err === "VALIDATION_ABORTED") {
        return;
      }
      throw err;
    }
  },
  copyNode(api, node) {
    api.value.copiedNode = t(node);
  },
  triggerUpdate(api) {
    api.value.updateFn?.(t(api.value.node));
  }
});
function useRoot(props, autoValidate = true) {
  const scenarioId = AstBuilderDataSharpFactory.select((s) => s.scenarioId);
  const onStoreChange = useCallbackRef(props.onStoreChange);
  const onValidationUpdate = useCallbackRef(props.onValidationUpdate);
  const onUpdate = useCallbackRef(props.onUpdate);
  const mutation = useValidateAstMutation({ scenarioId });
  const mutationAbortController = reactExports.useRef(null);
  const validationFn = useCallbackRef(async (node) => {
    if (!scenarioId) {
      const empty = { errors: [], evaluation: [] };
      onValidationUpdate(empty);
      return empty;
    }
    if (mutationAbortController.current) {
      mutationAbortController.current.abort("VALIDATION_ABORTED");
    }
    mutationAbortController.current = new AbortController();
    const result = await mutation.mutateAsync({
      node,
      expectedReturnType: props.returnType,
      ac: mutationAbortController.current
    }).finally(() => {
      mutationAbortController.current = null;
    });
    onValidationUpdate(result);
    return result;
  });
  const updateFn = useCallbackRef(async (node) => {
    onUpdate(node);
  });
  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode: props.node,
    initialValidation: props.validation ?? { errors: [], evaluation: [] },
    validationFn,
    updateFn
  });
  reactExports.useEffect(() => {
    if (autoValidate) {
      nodeStore.actions.validate();
    }
  }, [autoValidate, nodeStore, onValidationUpdate]);
  reactExports.useEffect(() => {
    onStoreChange(nodeStore);
    return () => {
      onStoreChange(null);
    };
  }, [onStoreChange, nodeStore]);
  return nodeStore;
}
const aggregatorMetadata = {
  COUNT: {
    tooltipKey: "scenarios:aggregator.count.tooltip",
    dataTypeRequirement: "any"
  },
  COUNT_DISTINCT: {
    tooltipKey: "scenarios:aggregator.count_distinct.tooltip",
    dataTypeRequirement: "any"
  },
  AVG: {
    tooltipKey: "scenarios:aggregator.average.tooltip",
    dataTypeRequirement: "numeric"
  },
  SUM: {
    tooltipKey: "scenarios:aggregator.sum.tooltip",
    dataTypeRequirement: "numeric"
  },
  MIN: {
    tooltipKey: "scenarios:aggregator.min.tooltip",
    dataTypeRequirement: "numeric-or-timestamp"
  },
  MAX: {
    tooltipKey: "scenarios:aggregator.max.tooltip",
    dataTypeRequirement: "numeric-or-timestamp"
  },
  STDDEV: {
    tooltipKey: "scenarios:aggregator.stddev.tooltip",
    dataTypeRequirement: "numeric"
  },
  PCTILE: {
    tooltipKey: "scenarios:aggregator.pctile.tooltip",
    dataTypeRequirement: "numeric"
  },
  MEDIAN: {
    tooltipKey: "scenarios:aggregator.median.tooltip",
    dataTypeRequirement: "numeric"
  }
};
const EditionEvaluationErrors = reactExports.memo(function(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useOptionalSharp();
  const evaluation = nodeSharp?.select((s) => s.validation.evaluation);
  const errors = g(() => {
    if (!evaluation) return [];
    return t$4(
      evaluation,
      n$1((row) => props.direct ? row.nodeId === props.id : row.relatedIds.includes(props.id)),
      t$b((row) => row.errors),
      n$1((err) => !(props.filterOut ?? []).includes(err.error))
    );
  });
  const errorModels = adaptEvaluationErrorViewModels(errors.value);
  const translateError = commonErrorMessages(t2);
  if (errorModels.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-row flex-wrap gap-sm", props.className), children: errorModels.map((errorModel, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "bg-red-background text-s text-red-primary flex h-8 items-center justify-center rounded-sm border border-transparent px-xs py-2xs font-medium dark:bg-transparent dark:border-red-primary",
      children: translateError(errorModel)
    },
    i2
  )) });
});
EditionEvaluationErrors.displayName = "EditionEvaluationErrors";
const operatorContainerClassnames = cva(
  [
    "flex h-10 min-w-[40px] items-center justify-between outline-hidden gap-sm rounded-sm px-xs border",
    "bg-surface-card disabled:border-transparent disabled:bg-grey-background-light",
    "radix-state-open:border-purple-primary  radix-state-open:bg-purple-background-light"
  ],
  {
    variants: {
      validationStatus: {
        valid: "border-grey-border focus:border-purple-primary",
        error: "border-red-primary focus:border-purple-primary"
      }
    },
    defaultVariants: {
      validationStatus: "valid"
    }
  }
);
function OperatorTooltip({ tooltipKey }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltip.Default,
    {
      className: "max-h-none overflow-visible",
      content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s max-w-xs whitespace-pre-wrap", children: t2(tooltipKey) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4" }) })
    }
  );
}
function OperatorSelect({
  options: options2,
  operator,
  onOperatorChange,
  validationStatus,
  isFilter = false,
  hideArrow = false,
  featureAccess,
  isOperatorRestricted
}) {
  const [open, setOpen] = reactExports.useState(false);
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const mappedOptions = mapOptions(options2);
  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  const isRestricted = featureAccess && featureAccess !== "allowed";
  const isCurrentRestricted = _value ? isOperatorRestricted?.(_value) ?? false : false;
  const showTriggerNudge = isCurrentRestricted && isRestricted && featureAccess;
  const currentTooltipKey = _value ? mappedOptions.find((op) => op.value === _value)?.tooltipKey : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: operatorContainerClassnames({ validationStatus }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary w-full text-center font-medium", children: _value ? getOperatorName(t2, _value, isFilter) : "..." }),
      currentTooltipKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(OperatorTooltip, { tooltipKey: currentTooltipKey }) : null,
      showTriggerNudge ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: featureAccess, content: t2("common:premium"), className: "size-5" }) : null,
      !showTriggerNudge && !hideArrow ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Arrow, {}) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sameWidth: true, sideOffset: 4, align: "start", className: "min-w-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: mappedOptions.map((op) => {
        const isOpRestricted = isOperatorRestricted?.(op.value) ?? false;
        const showNudge = isOpRestricted && isRestricted && featureAccess;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.Item,
          {
            keywords: op.keywords ?? [op.value],
            selected: operator === op.value,
            onSelect: () => onOperatorChange(op.value),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: getOperatorName(t2, op.value, isFilter) }),
                op.tooltipKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(OperatorTooltip, { tooltipKey: op.tooltipKey }) : null
              ] }),
              showNudge ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: featureAccess, content: t2("common:premium"), className: "size-5" }) : null
            ] })
          },
          op.value
        );
      }) })
    ] })
  ] });
}
function mapOptions(options2) {
  const isOpSelect = isOperationSelectOptions(options2);
  const values = isOpSelect ? Object.keys(options2) : options2;
  return values.map((value) => {
    if (isOpSelect) {
      return { value, ...options2[value] };
    } else {
      return { value };
    }
  });
}
function isOperationSelectOptions(opts) {
  return !Array.isArray(opts);
}
function OperandEditModalContainer({ className, ...props }) {
  const { t: t2 } = useTranslation(["common"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const handleOpenChange = useCallbackRef((open) => {
    if (!open) {
      props.onCancel();
    }
  });
  const handleImplicitClose = useCallbackRef((event) => {
    event.preventDefault();
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: true, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: props.size, onInteractOutside: handleImplicitClose, onEscapeKeyDown: handleImplicitClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: props.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-md p-md", className), children: props.children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: props.saveLabel ?? t2("common:save"),
          onClick: () => props.onSave(nodeSharp.value.node),
          disabled: props.saveDisabled
        }
      )
    ] })
  ] }) });
}
function getDataModelFieldLabel(dataModelField) {
  if (!dataModelField?.fieldName || !dataModelField.tableName) {
    return { rawValue: null, value: null };
  }
  return {
    rawValue: dataModelField,
    value: [dataModelField?.tableName, dataModelField?.fieldName].filter(Boolean).join(".")
  };
}
const EditDataModelField = ({
  disabled,
  tableName,
  value,
  dataModel,
  onChange,
  placeholder
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [open, setOpen] = reactExports.useState(false);
  const options2 = dataModel.flatMap(
    (table) => table.fields.map((field) => ({
      tableName: table.name,
      fieldName: field.name,
      field
    }))
  );
  const groups = t$8(options2, (option) => option.tableName ?? "");
  const optionsEntries = t$7(groups);
  const { rawValue, value: selectedValue } = getDataModelFieldLabel(value);
  const showPlaceholder = !selectedValue;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        disabled,
        className: "border-grey-border text-s bg-surface-card aria-disabled:bg-grey-background-light text-grey-primary flex h-10 items-center justify-between rounded-sm border px-xs",
        children: [
          showPlaceholder ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: placeholder }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t2, i18nKey: "scenarios:edit_aggregation.field_in_table", values: rawValue }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-2-down", className: "size-5" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "text-s w-[300px]", align: "start", sideOffset: 4, children: !tableName ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: optionsEntries.map(([tableName2, fields]) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SubMenu, { trigger: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tableName2 }), className: "text-s w-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditDataModelFieldTableMenu, { tableName: tableName2, fields, onChange }) }, tableName2);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EditDataModelFieldTableMenu, { tableName, fields: options2, onChange }) })
  ] });
};
const EditDataModelFieldTableMenu = ({ tableName, fields, onChange }) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.Group,
    {
      heading: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary mb-sm items-center px-sm pb-sm text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t2, i18nKey: "scenarios:edit_aggregation.available_fields", values: { tableName } }) }),
      children: fields.map((field) => {
        const typeIcon = getDataTypeIcon(field.field.dataType);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          MenuCommand.Item,
          {
            className: "data-active-item:bg-purple-background-light group grid w-full select-none grid-cols-[20px_1fr] gap-xs rounded-xs p-sm outline-hidden",
            onSelect: () => onChange(field),
            children: [
              typeIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: typeIcon, className: "col-start-1 size-5 shrink-0" }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-start-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: field.fieldName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldInfo, { field: field.field })
              ] })
            ]
          },
          field.fieldName
        );
      })
    }
  ) });
};
function FieldInfo({ field }) {
  const { i18n } = useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    HovercardProvider,
    {
      showTimeout: 0,
      hideTimeout: 0,
      placement: i18n.dir() === "ltr" ? "right-start" : "left-start",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HovercardAnchor, { tabIndex: -1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: "tip",
            className: "hover:group-hover:text-purple-primary group-hover:text-purple-disabled size-5 shrink-0 text-transparent transition-colors"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Hovercard,
          {
            unmountOnHide: true,
            gutter: 24,
            shift: -8,
            portal: true,
            className: "bg-surface-card border-grey-border text-s flex max-h-[min(var(--popover-available-height),400px)] max-w-(--popover-available-width) rounded-sm border shadow-md",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: field.description })
          }
        )
      ]
    }
  );
}
const RemoveButton = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: clsx(
        "size-fit rounded-xs border p-xs text-xs transition-colors duration-200 ease-in-out",
        "bg-surface-card text-grey-secondary border-grey-border",
        "hover:text-grey-white hover:border-red-primary hover:bg-red-primary",
        "active:bg-red-hover active:border-red-hover",
        className
      ),
      ...props,
      tabIndex: -1,
      ref,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-3" })
    }
  );
});
RemoveButton.displayName = "RemoveButton";
function getOperandTypeIcon(operandType) {
  switch (operandType) {
    case "CustomList":
      return "list";
    case "Field":
      return "field";
    case "Function":
      return "function";
    case "Enum":
      return "enum";
    case "Modeling":
      return "modeling";
    case "ClientRisk":
      return "scan-eye";
    default:
      return void 0;
  }
}
function getOperandTypeTKey(operandType) {
  switch (operandType) {
    case "CustomList":
      return "edit_operand.operator_type.list";
    case "Field":
      return "edit_operand.operator_type.field";
    case "Function":
      return "edit_operand.operator_type.function";
    case "Enum":
      return "edit_operand.operator_type.enum";
    case "Modeling":
      return "edit_operand.operator_type.modeling";
    case "ClientRisk":
      return "edit_operand.operator_type.client_risk";
    default:
      return void 0;
  }
}
const logicalOperatorClassnames = cva(
  "flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-xs rounded-sm p-sm border",
  {
    variants: {
      type: {
        text: "",
        contained: "bg-grey-background-light"
      },
      validationStatus: {
        valid: "text-grey-secondary",
        error: "text-red-primary border-red-primary"
      }
    },
    compoundVariants: [
      {
        type: "text",
        validationStatus: "valid",
        className: "border-transparent"
      },
      {
        type: "contained",
        validationStatus: "valid",
        className: "border-transparent"
      }
    ]
  }
);
function LogicalOperatorLabel({
  operator,
  type = "text",
  validationStatus = "valid",
  className
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: logicalOperatorClassnames({
        type,
        validationStatus,
        className
      }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s w-full text-center font-semibold", children: t2(`scenarios:logical_operator.${operator}`) })
    }
  );
}
const viewingOperandLabelClassnames = cva(
  [
    "group",
    "size-fit min-h-[40px] min-w-[40px] rounded-sm outline-hidden",
    "flex flex-row items-center justify-between gap-sm px-xs",
    "bg-grey-background-light"
  ],
  {
    variants: {
      validationStatus: {
        valid: "border border-transparent",
        error: "border border-red-primary",
        "light-error": "border border-red-secondary"
      }
    },
    defaultVariants: {
      validationStatus: "valid"
    }
  }
);
function ViewingAstBuilderOperand({ validationStatus, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: viewingOperandLabelClassnames({ validationStatus }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(OperandDisplayName, { interactionMode: "viewer", ...props }) });
}
function ViewingOperator({ operator, isFilter = false }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background-light flex h-10 min-w-[40px] items-center justify-between gap-sm rounded-sm px-xs outline-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary w-full text-center font-medium", children: _value ? getOperatorName(t2, _value, isFilter) : "..." }) });
}
const MAX_ENUM_VALUES = 50;
const contentClassnames = clsx([
  "flex flex-col w-full flex-1 overflow-hidden z-50",
  "bg-surface-card border-grey-border rounded-sm border shadow-md outline-hidden"
]);
function OperandInfos(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCard, { openDelay: 50, closeDelay: 200, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "tip",
        className: "hover:group-hover:text-purple-primary group-hover:text-purple-disabled data-[state=open]:text-purple-primary size-5 shrink-0 text-transparent"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardContent, { side: "right", align: "start", sideOffset: 20, alignOffset: -8, className: contentClassnames, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card flex flex-col gap-sm overflow-auto p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TypeInfos, { operandType: props.operandType, dataType: props.dataType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s text-ellipsis hyphens-auto font-normal", children: props.displayName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OperandDescription, { node: props.node })
    ] }) }) })
  ] });
}
function TypeInfos({ operandType, dataType }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const typeInfos = [
    {
      icon: getOperandTypeIcon(operandType),
      tKey: getOperandTypeTKey(operandType)
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType)
    }
  ];
  if (typeInfos.filter(({ tKey }) => !!tKey).length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-sm", children: typeInfos.map(({ icon, tKey }) => {
    if (!tKey) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-disabled inline-flex items-center gap-2xs text-xs font-normal", children: [
      icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-3" }) : null,
      t2(tKey, { count: 1 })
    ] }, tKey);
  }) });
}
function OperandDescription({ node }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((s) => s.data);
  if (isAggregation(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AggregatorDescription, { node });
  }
  if (isFuzzyMatchComparator(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FuzzyMatchComparatorDescription, { node });
  }
  if (isCustomListAccess(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CustomListAccessDescription, { node, customLists: data.customLists });
  }
  if (isDataAccessorAstNode(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataAccessorDescription,
      {
        node,
        dataModel: data.dataModel,
        triggerObjectTable: dataSharp.computed.triggerObjectTable.value
      }
    );
  }
  if (isTimeAdd(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { description: t2("scenarios:edit_date.now.description") });
  }
  if (isIpHasFlag(node)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { description: t2("scenarios:edit_ip_has_flag.description") });
  }
  if (isRecordRiskLevelCheckAstNode(node) && node.children[0].constant.length > 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordRiskLevelDescription, { node });
  }
}
function Description({ description }) {
  return description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-secondary max-w-[300px] text-xs font-normal first-letter:capitalize", children: description }) : null;
}
function RecordRiskLevelDescription({ node }) {
  const { t: t2 } = useTranslation(["user-scoring"]);
  const scoringSettings = AstBuilderDataSharpFactory.select((s) => s.data.scoringSettings);
  if (!scoringSettings || !isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)) {
    return null;
  }
  const levelColorsMap = SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel];
  const levelLabelsMap = SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs items-center", children: node.children[0].constant.map((level) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex gap-xs items-center border rounded-full px-sm py-xs text-small",
      style: { borderColor: levelColorsMap[level] },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full", style: { backgroundColor: levelColorsMap[level] } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2(levelLabelsMap[level]) })
      ]
    },
    level
  )) }) });
}
function AggregatorDescription({ node }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const { aggregator, tableName, fieldName, filters, percentile } = node.namedChildren;
  if (!tableName.constant && !fieldName.constant && filters.children.length === 0) return null;
  const aggregatedFieldName = `${tableName.constant}.${fieldName.constant}`;
  const percentileValue = percentile?.constant;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[min-content_1fr] items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary text-center font-bold", children: aggregator.constant }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: aggregatedFieldName }),
    percentileValue !== void 0 && aggregator.constant === "PCTILE" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-50 text-xs", children: t2("scenarios:edit_aggregation.percentile_value") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-00 text-xs font-medium", children: [
        percentileValue * 100,
        "%"
      ] })
    ] }) : null,
    filters.children.map((filter, index) => {
      const { operator, fieldName: fieldName2 } = filter.namedChildren;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: index === 0 ? "where" : "and", type: "text" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "bg-grey-background-light whitespace-nowrap p-sm text-end", children: fieldName2.constant ?? "..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingOperator, { operator: operator.constant, isFilter: true }),
          !isUnaryAggregationFilter(filter) ? /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderOperand, { node: filter.namedChildren.value }) : null
        ] })
      ] }, `filter_${index}`);
    })
  ] });
}
function FuzzyMatchComparatorDescription({ node }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const threshold = node.children[1]?.constant;
  const level = threshold !== void 0 ? ComparatorFuzzyMatchConfig.adaptLevel(threshold) : void 0;
  if (!level) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-50 text-xs", children: t2("scenarios:edit_fuzzy_match.level.label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-00 text-xs font-medium uppercase", children: t2(`scenarios:edit_fuzzy_match.level.${level}`) })
  ] });
}
function CustomListAccessDescription({ node, customLists }) {
  const customList = customLists.find((list) => list.id === node.namedChildren.customListId.constant);
  if (!customList) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { description: customList.description });
}
function DataAccessorDescription({ node, dataModel, triggerObjectTable }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const field = getDataAccessorAstNodeField(node, { triggerObjectTable, dataModel });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { description: field.description }),
    field.isEnum && field.values && field.values.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-secondary flex max-w-[300px] flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s", children: t2("scenarios:enum_options") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-col", children: [
        field.values.slice(0, MAX_ENUM_VALUES).sort().map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "truncate text-xs font-normal", children: value }, value)),
        field.values.length > MAX_ENUM_VALUES ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs font-normal", children: "..." }) : null
      ] })
    ] }) : null
  ] });
}
const operandTypeInfosClassnames = cva("flex items-center justify-center rounded-xs p-xs text-grey-primary", {
  variants: {
    interactionMode: {
      viewer: "bg-grey-border",
      editor: "bg-grey-background-light group-aria-expanded:bg-purple-background group-aria-expanded:text-purple-primary dark:group-aria-expanded:bg-purple-primary/10"
    }
  },
  defaultVariants: {
    interactionMode: "editor"
  }
});
function OperandTypeInfos({ t: t2, operandType, dataType, interactionMode }) {
  const typeInfos = [
    {
      icon: getOperandTypeIcon(operandType),
      tKey: getOperandTypeTKey(operandType)
    },
    {
      icon: getDataTypeIcon(dataType),
      tKey: getDataTypeTKey(dataType)
    }
  ];
  if (typeInfos.filter(({ icon }) => icon !== void 0).length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-xs", children: typeInfos.map(({ icon, tKey }) => {
    if (!icon) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: operandTypeInfosClassnames({ interactionMode }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-4 shrink-0", "aria-label": tKey ? t2(`scenarios:${tKey}`) : void 0 }) }, tKey);
  }) });
}
const operandDisplayNameClassnames = cva(
  "text-s font-medium group-aria-expanded:text-purple-primary break-all max-w-[200px] @xl:max-w-[300px] truncate",
  {
    variants: {
      type: {
        placeholder: "text-grey-disabled",
        value: "text-grey-primary"
      }
    },
    defaultVariants: {
      type: "value"
    }
  }
);
function OperandDisplayName({ node, enumValues, interactionMode, returnValue }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((s) => s.data);
  const showValues = dataSharp.select((s) => s.showValues);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable.value;
  const shouldDisplayReturnValue = showValues && returnValue !== void 0;
  const displayName = getAstNodeDisplayName(node, {
    t: t2,
    language,
    customLists: data.customLists
  });
  const dataType = getAstNodeDataType(node, {
    triggerObjectTable,
    dataModel: data.dataModel
  });
  const operandType = getAstNodeOperandType(node, {
    enumValues
  });
  return shouldDisplayReturnValue ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: operandDisplayNameClassnames(), children: returnValue }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OperandInfos, { dataType, displayName, node, operandType })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OperandTypeInfos, { interactionMode, t: t2, dataType, operandType }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: operandDisplayNameClassnames(), children: displayName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OperandInfos, { dataType, displayName, node, operandType })
  ] });
}
function MenuOption({
  option,
  value,
  onSelect,
  rightElement,
  highlightSearch = true,
  showFieldPath = false
}) {
  const { t: t2 } = useTranslation(["common"]);
  const searchValue = MenuCommand.State.useSharp().value.search;
  const leftIcon = option.icon ?? getDataTypeIcon(option.dataType);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const fieldPath = showFieldPath ? getDataAccessorPath(option.astNode) : null;
  const hasContinuousScreening = AstBuilderDataSharpFactory.select((s) => s.data.hasContinuousScreening);
  const hasScoringRuleset = AstBuilderDataSharpFactory.select((s) => s.data.hasScoringRuleset);
  const isRestrictedOption = isAggregation(option.astNode) && isRestrictedAggregator(option.astNode.namedChildren.aggregator.constant);
  const isRestrictedClientRisk = option.operandType === "ClientRisk" && option.astNode.name === monitoringListCheckAstNodeName && !hasContinuousScreening;
  const showNudge = isRestrictedOption && !hasValidLicense || isRestrictedClientRisk;
  const showIpNudge = isIpHasFlag(option.astNode) && !hasValidLicense;
  const disabledScoringCheck = option.astNode.name === recordRiskLevelCheckAstNodeName && !hasScoringRuleset;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuCommand.Item,
    {
      disabled: disabledScoringCheck,
      className: "group",
      value,
      onSelect: () => onSelect(injectIdToNode(option.astNode)),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full grid-cols-[20px_1fr] gap-xs", children: [
        leftIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": "true", className: "col-start-1 size-5 shrink-0", icon: leftIcon }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-start-2 flex flex-row gap-xs overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s w-full break-all text-start font-normal", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: searchValue && highlightSearch ? /* @__PURE__ */ jsxRuntimeExports.jsx(Highlight, { text: option.displayName, query: searchValue }) : option.displayName }),
            fieldPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary ms-xs", children: [
              "(",
              fieldPath,
              ")"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ms-auto flex shrink-0 items-center gap-xs", children: [
            rightElement ?? /* @__PURE__ */ jsxRuntimeExports.jsx(
              OperandInfos,
              {
                node: option.astNode,
                dataType: option.dataType,
                operandType: option.operandType,
                displayName: option.displayName
              }
            ),
            showNudge ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: "restricted", content: t2("common:premium"), className: "size-5" }) : null,
            showIpNudge ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: "restricted", content: t2("common:premium"), className: "size-5" }) : null
          ] })
        ] })
      ] })
    }
  );
}
function DiscoveryList({ onSelect }) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const options2 = EditionOperandSharpFactory.useSharp().computed.filteredOptions.value;
  const enumValues = EditionOperandSharpFactory.useSharp().value.enumValues;
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const groupedOptions = reactExports.useMemo(() => {
    return groupByOperandType(options2, {
      triggerObjectTable: triggerObjectTable.value
    });
  }, [triggerObjectTable.value, enumValues, options2]);
  const { enumOptions, fieldOptions, functionOptions, modelingOptions, customListOptions, clientRiskOptions } = groupedOptions;
  const subMenus = [
    { options: customListOptions, type: "CustomList" },
    { options: clientRiskOptions, type: "ClientRisk" },
    { options: functionOptions, type: "Function" },
    { options: modelingOptions, type: "Modeling" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    enumOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubMenu,
      {
        onSelect,
        trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuTitle, { operandType: "Enum", count: enumOptions.length }),
        options: enumOptions
      }
    ) : null,
    fieldOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Group,
      {
        forceMount: true,
        heading: /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuTitle,
          {
            operandType: "Field",
            count: fieldOptions.reduce((acc, [_, subOpts]) => acc + subOpts.length, 0),
            className: "min-h-10 p-sm"
          }
        ),
        children: fieldOptions.map(([_path, options22]) => {
          const path = _path.split(".");
          const label = path.pop() ?? "";
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            SubMenu,
            {
              value: _path,
              onSelect,
              trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(SubMenuFieldTrigger, { ...{ label, depth: path.length, options: options22 } }),
              options: options22
            },
            _path
          );
        })
      }
    ) : null,
    subMenus.map(
      (subMenu) => subMenu.options.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        SubMenu,
        {
          onSelect,
          trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuTitle, { operandType: subMenu.type, count: subMenu.options.length }),
          options: subMenu.options
        },
        subMenu.type
      ) : null
    )
  ] }) });
}
function SubMenuFieldTrigger(props) {
  const { t: t2 } = useTranslation("scenarios");
  const padding = 24 + Math.max(props.depth - 1, 0) * 20 + (props.depth > 0 ? 8 : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: "text-grey-primary text-s flex select-none flex-row items-baseline gap-xs break-all",
      style: { paddingLeft: `${padding}px` },
      children: [
        props.depth === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            t: t2,
            i18nKey: "edit_operand.operator_discovery.from",
            components: {
              Path: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold" })
            },
            values: { path: props.label }
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-baseline gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "subdirectory-arrow-right",
              className: "text-grey-disabled group-aria-selected/menu-item:text-grey-primary size-4 shrink-0 self-center"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 shrink font-semibold", children: props.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled shrink-0 text-xs font-medium", children: props.options.length })
      ]
    }
  ) });
}
function MenuTitle({ operandType, count, className }) {
  const { t: t2 } = useTranslation("scenarios");
  const icon = getOperandTypeIcon(operandType);
  const tKey = getOperandTypeTKey(operandType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("flex grow select-none flex-row items-center gap-xs", className), children: [
    icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": "true", className: "text-purple-primary size-5 shrink-0", icon }) : null,
    tKey ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary text-m flex flex-1 flex-row items-baseline gap-xs break-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: t2(tKey, { count }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-xs font-medium", children: count })
    ] }) : null
  ] });
}
function SubMenu({ value, trigger, options: options2, onSelect }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const customLists = AstBuilderDataSharpFactory.useSharp().value.data.customLists;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SubMenu, { value, forceMount: true, trigger, className: "w-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { children: options2.map((option) => {
    const displayName = getOptionDisplayName(option, {
      customLists,
      language,
      t: t2
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuOption, { option, onSelect }, displayName);
  }) }) }) });
}
function coerceToConstantAstNode(search, options2) {
  const { isCoerceableToBoolean, coerceToBoolean } = getBooleanCoercionLogic(options2.booleans);
  const results = [];
  const searchLowerCase = search.trim().toLocaleLowerCase();
  if (searchLowerCase.length === 0) {
    return [];
  }
  const parsedNumber = Number(searchLowerCase);
  if (Number.isFinite(parsedNumber)) {
    const astNode2 = NewConstantAstNode({
      constant: parsedNumber
    });
    results.push(stripIdFromNode(astNode2));
  }
  if (isCoerceableToBoolean(searchLowerCase)) {
    const astNode2 = NewConstantAstNode({
      constant: coerceToBoolean(searchLowerCase)
    });
    results.push(stripIdFromNode(astNode2));
  }
  results.push(...coerceToConstantArray(search));
  const astNode = NewConstantAstNode({
    constant: search
  });
  results.push(stripIdFromNode(astNode));
  return results;
}
const isNumberArray = /^\[(\s*(\d+(\.\d+)?)\s*,?)*(\s*|\])$/;
const isStringArray = /^\[(\s*"?([^",[\]]+)"?\s*,?)*\s*\]?$/;
const captureNumbers = /(?:\s*(?<numbers>\d+(\.\d+)?)\s*,?)/g;
const captureStrings = /(?:\s*"?(?<strings>[^",[\]]*[^",[\]\s])"?\s*,?)/g;
function coerceToConstantArray(search) {
  const trimSearch = search.trim();
  if (isNumberArray.test(trimSearch)) {
    const astNode = t$4(
      Array.from(trimSearch.matchAll(captureNumbers)),
      t$6((match) => match.groups?.["numbers"]),
      n$1(e$7),
      t$6(Number),
      (constant) => NewConstantAstNode({
        constant
      })
    );
    return [astNode];
  }
  if (isStringArray.test(trimSearch)) {
    const astNode = t$4(
      Array.from(trimSearch.matchAll(captureStrings)),
      t$6((match) => match.groups?.["strings"]),
      n$1(e$7),
      (constant) => NewConstantAstNode({
        constant
      })
    );
    return [astNode];
  }
  return [];
}
function getBooleanCoercionLogic(options2) {
  const sanitizedOptions = {
    true: options2.true.map((value) => value.trim().toLocaleLowerCase()),
    false: options2.false.map((value) => value.trim().toLocaleLowerCase())
  };
  return {
    isCoerceableToBoolean: (search) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return sanitizedOptions.true.includes(sanitizedSearch) || sanitizedOptions.false.includes(sanitizedSearch);
    },
    coerceToBoolean: (search) => {
      const sanitizedSearch = search.trim().toLocaleLowerCase();
      return sanitizedOptions.true.includes(sanitizedSearch);
    }
  };
}
function getUniqueOptionKey(astNode, displayName, dataType, operandType) {
  const path = getDataAccessorPath(astNode);
  if (path) {
    if (isDatabaseAccess(astNode)) {
      const fieldName = astNode.namedChildren.fieldName.constant;
      return `${path}.${fieldName}-${dataType}-${operandType}`;
    }
  }
  if (isPayload(astNode)) {
    return `payload.${astNode.children[0].constant}-${dataType}-${operandType}`;
  }
  return `${displayName}-${dataType}-${operandType}`;
}
function SearchResults({ onSelect, search }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const options2 = EditionOperandSharpFactory.useSharp().computed.filteredOptions.value;
  const coerceDataType = EditionOperandSharpFactory.select((s) => s.coerceDataType);
  const matchOptions = reactExports.useMemo(() => {
    return matchSorter(options2, search, {
      keys: ["displayName", "searchShortcut"]
    }).map(({ astNode, ...option }) => {
      const uniqueKey = getUniqueOptionKey(astNode, option.displayName, option.dataType, option.operandType);
      return {
        key: uniqueKey,
        ...option,
        astNode,
        onClick: () => {
          onSelect(injectIdToNode(astNode));
        }
      };
    });
  }, [onSelect, options2, search]);
  const coercedOptions = reactExports.useMemo(() => {
    const coerceOpts = coerceToConstantAstNode(search, {
      booleans: {
        true: ["true", t2("common:true")],
        false: ["false", t2("common:false")]
      }
    }).map(
      (node) => ({
        astNode: node,
        displayName: formatConstant(node.constant, { t: t2, language }),
        operandType: "Constant",
        dataType: getConstantAstNodeDataType(node)
      })
    );
    return coerceDataType ? coerceOpts.filter((o) => coerceDataType.includes(o.dataType)) : coerceOpts;
  }, [t2, language, search, coerceDataType]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
    coercedOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { forceMount: true, children: coercedOptions.map((option) => {
      const dataTypeTkey = getConstantDataTypeTKey(option.dataType);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuOption,
        {
          highlightSearch: false,
          value: `${option.displayName}-${option.dataType}`,
          option,
          onSelect,
          rightElement: dataTypeTkey ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-purple-primary font-semibold", children: t2(`scenarios:${dataTypeTkey}`) }) : void 0
        },
        `${option.displayName}-${option.dataType}-${option.operandType}`
      );
    }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { forceMount: true, heading: /* @__PURE__ */ jsxRuntimeExports.jsx(ResultTitle, { count: matchOptions.length }), children: matchOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuOption, { value: option.key, option, onSelect, showFieldPath: true }, option.key)) })
  ] });
}
function ResultTitle({ count }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-10 select-none flex-row items-center gap-xs p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-baseline gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-m flex items-baseline whitespace-pre font-semibold", children: "Results" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-disabled text-xs font-medium", children: count })
  ] }) });
}
function AstBuilderOperandMenu({
  children,
  defaultOpen = false,
  onSelect,
  bottomActions
}) {
  const [open, setOpen] = reactExports.useState(defaultOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { sameWidth: true, sideOffset: 4, align: "start", className: "w-96", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: "Select or create an operand" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SmartMenuList, { onSelect }),
      bottomActions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex gap-sm overflow-x-auto border-t p-sm", children: bottomActions.map((action) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.HeadlessItem, { forceMount: true, onSelect: action.onSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", children: [
          action.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: action.icon, className: "size-4" }) : null,
          action.label
        ] }) }, action.id);
      }) }) : null
    ] })
  ] });
}
function SmartMenuList(props) {
  const search = MenuCommand.State.useSharp().value.search;
  return search.trim().length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(DiscoveryList, { ...props }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SearchResults, { search, ...props });
}
const editionOperandLabelClassnames = cva(
  [
    "group",
    "size-fit min-h-10 min-w-10 rounded-sm outline-hidden",
    "flex flex-row items-center justify-between gap-sm px-xs",
    "bg-surface-card aria-expanded:bg-purple-background-light aria-expanded:border-purple-primary"
  ],
  {
    variants: {
      validationStatus: {
        valid: "border enabled:border-grey-border enabled:aria-[expanded=false]:focus:border-purple-primary",
        error: "border enabled:border-red-primary enabled:aria-[expanded=false]:focus:border-purple-primary",
        "light-error": "border enabled:border-red-secondary enabled:aria-[expanded=false]:focus:border-purple-primary"
      }
    },
    defaultVariants: {
      validationStatus: "valid"
    }
  }
);
const EditionOperandSharpFactory = B({
  name: "EditionOperand",
  initializer: (initialData) => ({
    ...initialData
  })
}).withActions({
  setEnumsAndOptions(api, enums, options2, excludeFields) {
    api.batch(() => {
      api.value.enumValues = enums;
      api.value.options = options2;
      api.value.excludeFields = excludeFields;
    });
  }
}).withComputed({
  filteredOptions(state) {
    const dataTypes = state.optionsDataType;
    const excludeFields = state.excludeFields;
    return state.options.filter((option) => {
      const matchesDataType = dataTypes ? typeof dataTypes === "function" ? dataTypes(option) : dataTypes.includes(option.dataType) : true;
      const fieldName = getFieldName(option.astNode);
      const isExcludedField = fieldName !== "unknown" ? excludeFields?.includes(fieldName) : false;
      return matchesDataType && !isExcludedField;
    });
  }
});
function EditionAstBuilderOperand({ onChange, ...props }) {
  const { node } = props;
  const { t: t$12 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const nodeSharp = AstBuilderNodeSharpFactory.useOptionalSharp();
  const [editedNode, setEditedNode] = reactExports.useState(null);
  const data = dataSharp.select((s) => s.$data);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const validationStatus = props.validationStatus;
  const operandSharp = EditionOperandSharpFactory.createSharp({
    enumValues: props.enumValues,
    options: getOperandMenuOptions({
      enums: props.enumValues,
      data: data.value,
      triggerObjectTable: triggerObjectTable.value,
      node,
      language,
      t: t$12,
      excludeFields: props.excludeFields
    }),
    optionsDataType: props.optionsDataType,
    coerceDataType: props.coerceDataType,
    excludeFields: props.excludeFields
  });
  const onSelect = useCallbackRef$1(onChange);
  const onCreateSelect = useCallbackRef$1((node2) => {
    if (isEditableAstNode(node2)) {
      setEditedNode(node2);
    } else {
      onSelect(node2);
    }
  });
  const onEditSave = useCallbackRef$1((node2) => {
    onSelect(node2);
    setEditedNode(null);
  });
  reactExports.useEffect(() => {
    operandSharp.actions.setEnumsAndOptions(
      props.enumValues,
      getOperandMenuOptions({
        enums: props.enumValues,
        data: data.value,
        triggerObjectTable: triggerObjectTable.value,
        node,
        language,
        t: t$12,
        excludeFields: props.excludeFields
      }),
      props.excludeFields
    );
  }, [operandSharp, props.enumValues, props.excludeFields, data.value, triggerObjectTable.value, node, t$12, language]);
  const bottomActions = [
    ...!isUndefinedAstNode(node) ? [
      {
        id: "clean",
        label: t$12("scenarios:edit_operand.clear_operand"),
        icon: "restart-alt",
        onSelect: () => onSelect(NewUndefinedAstNode())
      }
    ] : [],
    ...isEditableAstNode(node) ? [
      {
        id: "edit",
        label: t$12("common:edit"),
        icon: "edit-square",
        onSelect: () => {
          setEditedNode(t(node));
        }
      }
    ] : [],
    ...nodeSharp && !isUndefinedAstNode(node) ? [
      {
        id: "copy",
        label: t$12("common:copy"),
        icon: "copy",
        onSelect: () => {
          nodeSharp.actions.copyNode(node);
        }
      }
    ] : [],
    ...nodeSharp && nodeSharp.value.copiedNode ? [
      {
        id: "paste",
        label: t$12("common:paste"),
        icon: "paste",
        onSelect: () => {
          if (nodeSharp.value.copiedNode) {
            onSelect(injectIdToNode(nodeSharp.value.copiedNode));
          }
        }
      }
    ] : []
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EditionOperandSharpFactory.Provider, { value: operandSharp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex flex-col gap-sm self-start", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderOperandMenu, { onSelect: onCreateSelect, bottomActions, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: editionOperandLabelClassnames({ validationStatus }), children: [
      M(node).when(isUndefinedAstNode, () => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: operandDisplayNameClassnames({
            type: "placeholder"
          }),
          children: props.placeholder ?? t$12("scenarios:edit_operand.placeholder")
        }
      )).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(OperandDisplayName, { interactionMode: "editor", ...props })),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Arrow, {})
    ] }) }) }),
    editedNode ? /* @__PURE__ */ jsxRuntimeExports.jsx(OperandEditModal, { node: editedNode, onSave: onEditSave, onCancel: () => setEditedNode(null) }) : null,
    props.showErrors ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id }) : null
  ] }) });
}
function EditFilters({ aggregatedField, dataModel, onChange }) {
  const { t: t$12 } = useTranslation(scenarioI18n);
  const { t: stringifyContextT } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const customLists = AstBuilderDataSharpFactory.select((s) => s.data.customLists);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const filters = nodeSharp.select((s) => s.node.namedChildren.filters.children);
  const evaluation = nodeSharp.select((s) => s.validation);
  const [filterEditedIndex, setEditedFilterIndex] = reactExports.useState(null);
  const tableName = aggregatedField?.tableName;
  const options2 = reactExports.useMemo(() => {
    return tableName ? dataModel.find((t2) => t2.name === tableName)?.fields.map((f) => ({ tableName, fieldName: f.name, field: f })) : null;
  }, [tableName, dataModel]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-m", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t$12,
        i18nKey: tableName ? "scenarios:edit_aggregation.filters_in" : "scenarios:edit_aggregation.filters",
        values: { tableName }
      }
    ) }),
    filters.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: filters.map((filter, filterIndex) => {
      const binaryFilter = isBinaryAggregationFilter(filter);
      const complexFilter = isComplexAggregationFilter(filter);
      const isLastFilter = filterIndex === filters.length - 1;
      const filteredFieldErrors = getErrorsForNode(evaluation, [
        filter.namedChildren.fieldName.id,
        filter.namedChildren.tableName.id
      ]);
      const operatorErrors = getErrorsForNode(evaluation, filter.namedChildren.operator.id);
      const valueErrors = binaryFilter ? getErrorsForNode(evaluation, filter.namedChildren.value.id, true) : [];
      const displayName = complexFilter && !isUndefinedAstNode(filter.namedChildren.value.namedChildren.value) ? getAstNodeDisplayName(filter.namedChildren.value, {
        t: stringifyContextT,
        language,
        customLists
      }) : "...";
      const enumValues = filter.namedChildren.tableName.constant && filter.namedChildren.fieldName.constant ? getEnumValues(
        dataModel,
        filter.namedChildren.tableName.constant,
        filter.namedChildren.fieldName.constant
      ) : [];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex flex-col gap-md rounded-md border-[0.5px] p-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-grey-secondary flex items-center gap-sm ps-sm text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t$12("scenarios:edit_aggregation.filter_field_label") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldSelect,
                {
                  tableName,
                  options: options2,
                  trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: clsx(
                        "text-s aria-disabled:bg-grey-background-light text-grey-primary flex h-10 items-center justify-between rounded-sm border px-xs",
                        {
                          "border-grey-border": filteredFieldErrors.length === 0,
                          "border-red-primary": filteredFieldErrors.length > 0
                        }
                      ),
                      children: [
                        filter.namedChildren.fieldName.constant,
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-2-down", className: "size-5" })
                      ]
                    }
                  ),
                  onChange: (filteredField) => {
                    nodeSharp.update(() => {
                      filter.namedChildren.tableName.constant = filteredField.tableName;
                      filter.namedChildren.fieldName.constant = filteredField.fieldName;
                    });
                    nodeSharp.actions.validate();
                    onChange?.();
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t$12("scenarios:edit_aggregation.filter_operator_label") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                OperatorSelect,
                {
                  isFilter: true,
                  options: aggregationFilterOperators,
                  operator: filter.namedChildren.operator.constant,
                  onOperatorChange: (operator) => {
                    nodeSharp.update(() => {
                      if (isUnaryAggregationFilterOperator(operator)) {
                        filter.namedChildren = {
                          tableName: filter.namedChildren.tableName,
                          fieldName: filter.namedChildren.fieldName,
                          operator: NewConstantAstNode({ constant: operator })
                        };
                        return;
                      }
                      if (isBinaryAggregationFilterOperator(operator)) {
                        const valueNode2 = M(filter).when(
                          isBinaryAggregationFilter,
                          (binFilter) => binFilter.namedChildren.value
                        ).when(
                          isComplexAggregationFilter,
                          (compFilter) => compFilter.namedChildren.value.namedChildren.value
                        ).otherwise(() => NewUndefinedAstNode());
                        filter.namedChildren = {
                          tableName: filter.namedChildren.tableName,
                          fieldName: filter.namedChildren.fieldName,
                          operator: NewConstantAstNode({ constant: operator }),
                          value: valueNode2
                        };
                        return;
                      }
                      const valueNode = M(filter).when(
                        isBinaryAggregationFilter,
                        (binFilter) => binFilter.namedChildren.value
                      ).when(
                        isComplexAggregationFilter,
                        (compFilter) => compFilter.namedChildren.value.namedChildren.value
                      ).otherwise(() => NewUndefinedAstNode());
                      filter.namedChildren = {
                        tableName: filter.namedChildren.tableName,
                        fieldName: filter.namedChildren.fieldName,
                        operator: NewConstantAstNode({ constant: operator }),
                        value: NewFuzzyMatchFilterOptionsAstNode({ value: valueNode })
                      };
                    });
                    nodeSharp.actions.validate();
                    onChange?.();
                  },
                  validationStatus: operatorErrors.length > 0 ? "error" : "valid"
                }
              ),
              binaryFilter && filter.namedChildren.operator.constant ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t$12("scenarios:edit_aggregation.filter_value_label") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  EditionAstBuilderOperand,
                  {
                    node: filter.namedChildren.value,
                    onChange: (node) => {
                      if (isKnownOperandAstNode(node)) {
                        filter.namedChildren.value = node;
                        nodeSharp.actions.validate();
                        onChange?.();
                      }
                    },
                    optionsDataType: (opt) => opt.operandType !== "Modeling",
                    validationStatus: valueErrors.length > 0 ? "error" : "valid",
                    enumValues: ["=", "!="].includes(filter.namedChildren.operator.constant) ? enumValues : void 0
                  }
                )
              ] }) : null,
              complexFilter && filter.namedChildren.operator.constant ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => setEditedFilterIndex(filterIndex), children: displayName }),
                filter.namedChildren.value && filterEditedIndex === filterIndex ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OperandEditModal,
                  {
                    node: t(filter.namedChildren.value),
                    onSave: (astNode) => {
                      if (isFuzzyMatchFilterOptionsAstNode(astNode)) {
                        filter.namedChildren.value = astNode;
                        nodeSharp.actions.validate();
                        onChange?.();
                      }
                      setEditedFilterIndex(null);
                    },
                    onCancel: () => {
                      setEditedFilterIndex(null);
                    }
                  }
                ) : null
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              RemoveButton,
              {
                onClick: () => {
                  filters.splice(filterIndex, 1);
                  onChange?.();
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: filter.id })
        ] }),
        !isLastFilter ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary text-xs", children: t$12("scenarios:logical_operator.and") }) : null
      ] }, filterIndex);
    }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row justify-start gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FieldSelect,
        {
          tableName,
          options: options2,
          trigger: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !tableName, className: "h-fit", variant: "secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
            t$12("scenarios:edit_aggregation.add_filter")
          ] }),
          onChange: (filteredField) => {
            filters.push(
              NewAggregatorFilterAstNode({
                namedChildren: {
                  fieldName: NewConstantAstNode({ constant: filteredField.fieldName }),
                  tableName: NewConstantAstNode({ constant: filteredField.tableName }),
                  operator: NewConstantAstNode({ constant: null }),
                  value: NewUndefinedAstNode()
                }
              })
            );
            onChange?.();
          }
        }
      ),
      filters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: t$12("scenarios:edit_aggregation.add_filter.callout") }) : null
    ] })
  ] });
}
function FieldSelect({
  tableName,
  options: options2,
  trigger,
  onChange
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: trigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { children: tableName && options2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditDataModelFieldTableMenu, { tableName, fields: options2, onChange }) : null })
  ] });
}
function AggregationEditContent({ onChange } = {}) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const currentAggregator = node.namedChildren.aggregator.constant;
  const isCurrentRestricted = isRestrictedAggregator(currentAggregator);
  const isCurrentPerformanceHeavy = isPerformanceHeavyAggregator(currentAggregator);
  const aggregatedField = g(() => {
    const tableName = node.namedChildren.tableName.constant;
    const fieldName = node.namedChildren.fieldName.constant;
    const dataModelField = dataModel.find((t22) => t22.name === tableName)?.fields.find((f) => f.name === fieldName);
    return dataModelField ? {
      tableName,
      fieldName,
      field: dataModelField
    } : null;
  });
  const aggregatorOptions = aggregatorOperators.reduce(
    (acc, op) => {
      acc[op] = { tooltipKey: aggregatorMetadata[op].tooltipKey };
      return acc;
    },
    {}
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "aggregation.label", children: t2("scenarios:edit_aggregation.label_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "text",
            id: "aggregation.label",
            placeholder: t2("scenarios:edit_aggregation.label_placeholder"),
            value: node.namedChildren.label.constant,
            onChange: (e2) => {
              node.namedChildren.label.constant = e2.target.value;
              onChange?.();
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `grid ${aggregatorHasParams(currentAggregator) ? "grid-cols-[240px_120px_1fr]" : "grid-cols-[240px_1fr]"} gap-sm`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("scenarios:edit_aggregation.function_title") }),
            aggregatorHasParams(currentAggregator) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:edit_aggregation.percentile_value") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tooltip.Default,
                {
                  className: "max-h-none overflow-visible",
                  content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s max-w-xs whitespace-pre-wrap", children: t2("scenarios:edit_aggregation.percentile_value_tooltip") }),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4" }) })
                }
              )
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("scenarios:edit_aggregation.object_field_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              OperatorSelect,
              {
                options: aggregatorOptions,
                operator: node.namedChildren.aggregator.constant,
                onOperatorChange: (aggregator) => {
                  node.namedChildren.aggregator.constant = aggregator;
                  if (aggregatorHasParams(aggregator)) {
                    if (!node.namedChildren.percentile) {
                      node.namedChildren.percentile = NewConstantAstNode({ constant: 0.5 });
                    }
                  } else {
                    delete node.namedChildren.percentile;
                  }
                  nodeSharp.actions.validate();
                  onChange?.();
                },
                featureAccess: hasValidLicense ? void 0 : "restricted",
                isOperatorRestricted: isRestrictedAggregator
              }
            ) }),
            aggregatorHasParams(currentAggregator) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "text",
                id: "aggregation.percentile_value",
                defaultValue: String((node.namedChildren.percentile?.constant ?? 0.5) * 100),
                onBlur: (e2) => {
                  const normalizedValue = e2.target.value.replace(",", ".");
                  const value = parseFloat(normalizedValue);
                  if (!isNaN(value)) {
                    const clamped = Math.max(0, Math.min(100, value));
                    node.namedChildren.percentile = NewConstantAstNode({ constant: clamped / 100 });
                    e2.target.value = String(clamped);
                    onChange?.();
                  }
                }
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                EditDataModelField,
                {
                  placeholder: t2("scenarios:edit_aggregation.select_a_field"),
                  value: aggregatedField.value,
                  dataModel,
                  onChange: (aggregatedField2) => {
                    nodeSharp.update(() => {
                      node.namedChildren.tableName.constant = aggregatedField2.tableName;
                      node.namedChildren.fieldName.constant = aggregatedField2.fieldName;
                    });
                    nodeSharp.actions.validate();
                    onChange?.();
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { direct: true, id: node.namedChildren.fieldName.id })
            ] })
          ]
        }
      ),
      isCurrentRestricted && !hasValidLicense ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { icon: "lock", variant: "outlined", color: "red", children: t2("scenarios:edit_aggregation.premium_callout") }) : null,
      isCurrentPerformanceHeavy && hasValidLicense ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { icon: "warning", variant: "outlined", color: "yellow", children: t2("scenarios:edit_aggregation.performance_warning") }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditFilters, { aggregatedField: aggregatedField.value, dataModel, onChange })
  ] });
}
function EditAggregation(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const isCurrentRestricted = isRestrictedAggregator(node.namedChildren.aggregator.constant);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    OperandEditModalContainer,
    {
      ...props,
      saveDisabled: isCurrentRestricted && !hasValidLicense,
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-center gap-md", children: [
        t2("scenarios:edit_aggregation.title"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { logo: "logo", className: "size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs font-light", children: t2("scenarios:edit_aggregation.subtitle") })
        ] })
      ] }),
      size: "large",
      className: "max-h-[70dvh] gap-2xl overflow-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            t: t2,
            i18nKey: "scenarios:edit_aggregation.description",
            components: {
              DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: aggregationDocHref })
            }
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AggregationEditContent, {})
      ]
    }
  );
}
function EditAlgorithm({ fuzzyMatchConfig: fuzzyMatchConfig2, algorithm, onChange }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const onValueChange = useCallbackRef(onChange);
  if (fuzzyMatchConfig2.isEditableAlgorithm(algorithm)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "algorithm", className: "text-m text-grey-primary font-normal", children: t2("scenarios:edit_fuzzy_match.algorithm.label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select.Root, { value: algorithm, onValueChange, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select.Trigger, { id: "algorithm", className: operatorContainerClassnames(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary w-full text-center font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Value, { placeholder: "..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2(`scenarios:edit_fuzzy_match.algorithm.description.${algorithm}`), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "tip",
              className: "hover:text-purple-primary text-purple-disabled size-5 shrink-0 transition-colors"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Content, { className: "max-h-60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Viewport, { children: Array.from(fuzzyMatchConfig2.editablesAlgorithms).map((fuzzyMatchAlgorithm) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select.Item,
            {
              className: "flex min-w-[110px] flex-col gap-xs",
              value: fuzzyMatchAlgorithm,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Select.ItemText, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FuzzyMatchAlgorithmLabel,
                  {
                    fuzzyMatchConfig: fuzzyMatchConfig2,
                    fuzzyMatchAlgorithm
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t2(`scenarios:edit_fuzzy_match.algorithm.description.${fuzzyMatchAlgorithm}`) })
              ]
            },
            fuzzyMatchAlgorithm
          );
        }) }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m text-grey-primary font-normal", children: t2("scenarios:edit_fuzzy_match.threshold.label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background-light border-grey-border flex h-10 items-center justify-center rounded-sm border p-sm text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FuzzyMatchAlgorithmLabel, { fuzzyMatchConfig: fuzzyMatchConfig2, fuzzyMatchAlgorithm: algorithm }) })
  ] });
}
function FuzzyMatchAlgorithmLabel({
  fuzzyMatchConfig: fuzzyMatchConfig2,
  fuzzyMatchAlgorithm
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: fuzzyMatchConfig2.getAlgorithmName(t2, fuzzyMatchAlgorithm) });
}
function EditLevel({ config, level, setLevel }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "level", className: "text-m text-grey-primary font-normal", children: t2("scenarios:edit_fuzzy_match.level.label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectV2,
      {
        value: level,
        onChange: setLevel,
        placeholder: "...",
        className: operatorContainerClassnames(),
        options: config.getLevels().map((level2) => ({
          label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold uppercase", children: t2(`scenarios:edit_fuzzy_match.level.${level2}`, {
            defaultValue: level2
          }) }),
          value: level2
        }))
      }
    )
  ] });
}
function EditThreshold({ threshold, setThreshold }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "threshold", className: "text-m text-grey-primary font-normal", children: t2("scenarios:edit_fuzzy_match.threshold.label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        id: "threshold",
        type: "number",
        value: threshold,
        onChange: (e2) => {
          const newThreshold = parseInt(e2.target.value, 10);
          if (isNaN(newThreshold)) {
            setThreshold(0);
            return;
          }
          if (newThreshold < 0) {
            setThreshold(0);
            return;
          }
          if (newThreshold > 100) {
            setThreshold(100);
            return;
          }
          setThreshold(newThreshold);
        },
        min: 0,
        max: 100
      }
    )
  ] });
}
function Examples$1({
  config,
  algorithm,
  threshold
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  if (!config.isEditableAlgorithm(algorithm)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "border-grey-border table-auto border-collapse border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { className: "sr-only", children: t2("scenarios:edit_fuzzy_match.examples.caption") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-grey-primary bg-grey-background-light border-grey-border border px-xs text-start text-xs font-normal", children: t2("scenarios:edit_fuzzy_match.examples.left") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-grey-primary bg-grey-background-light border-grey-border border px-xs text-start text-xs font-normal", children: t2("scenarios:edit_fuzzy_match.examples.right") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-grey-primary bg-grey-background-light border-grey-border border px-xs text-start text-xs font-normal", children: t2("scenarios:edit_fuzzy_match.examples.result") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: config.examples.map(({ left, right, resultsScores }) => {
      if (!(algorithm in resultsScores)) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-grey-primary border-grey-border border px-xs text-xs font-normal", children: left }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-grey-primary border-grey-border border px-xs text-xs font-normal", children: right }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-grey-primary border-grey-border border px-xs text-xs font-normal", children: t2(`common:${resultsScores[algorithm] > threshold}`) })
      ] }, `${left}-${right}`);
    }) })
  ] });
}
function InnerEditFuzzyMatchModal(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const evaluation = nodeSharp.select((s) => s.validation);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:edit_fuzzy_match.description",
        components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: fuzzyMatchingDocHref })
        }
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditAlgorithm,
          {
            fuzzyMatchConfig: props.fuzzMatchConfig,
            algorithm: props.algorithm,
            onChange: (value) => {
              props.onAlorithmChange(value);
            }
          }
        ),
        props.threshold.mode === "level" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditLevel,
          {
            config: props.fuzzMatchConfig,
            level: props.threshold.level,
            setLevel: (level) => {
              props.onThresholdChange({ mode: "level", level });
            }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditThreshold,
          {
            threshold: props.threshold.value,
            setThreshold: (newValue) => {
              props.onThresholdChange({ mode: "threshold", value: newValue });
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Examples$1, { config: props.fuzzMatchConfig, algorithm: props.algorithm, threshold: props.threshold.value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "level", className: "text-m text-grey-primary font-normal", children: t2("scenarios:edit_fuzzy_match.operands.label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        props.left ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            EditionAstBuilderOperand,
            {
              node: props.left,
              coerceDataType: ["String"],
              optionsDataType: ["String"],
              onChange: (newNode) => {
                props.onLeftChange?.(newNode);
              },
              validationStatus: getValidationStatus(evaluation, props.left.id)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border bg-grey-background-light flex h-10 w-fit min-w-[40px] items-center justify-center rounded-sm border p-sm text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-medium", children: props.operatorDisplay }) })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditionAstBuilderOperand,
          {
            node: props.right,
            coerceDataType: ["String", "String[]"],
            optionsDataType: props.rightOperandFilter,
            onChange: (newNode) => {
              props.onRightChange(newNode);
            },
            validationStatus: getValidationStatus(evaluation, props.right.id)
          }
        )
      ] })
    ] })
  ] });
}
const fuzzyMatchConfig$1 = AggregationFuzzyMatchConfig;
function EditFuzzyMatchAggregation(props) {
  const defaultAlgorithm = fuzzyMatchConfig$1.defaultAlgorithm;
  const defaultThreshold = fuzzyMatchConfig$1.getDefaultThreshold();
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const fuzzyMatchNode = nodeSharp.select((s) => s.node);
  const algorithmNode = fuzzyMatchNode.namedChildren.algorithm;
  const thresholdNode = fuzzyMatchNode.namedChildren.threshold;
  const thresholdField = g(() => {
    const thresholdValue = thresholdNode.constant ?? defaultThreshold;
    const level = fuzzyMatchConfig$1.adaptLevel(thresholdValue);
    return level !== void 0 ? { mode: "level", value: thresholdValue, level } : { mode: "threshold", value: thresholdValue };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_fuzzy_match.title.aggregation"), size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    InnerEditFuzzyMatchModal,
    {
      fuzzMatchConfig: fuzzyMatchConfig$1,
      right: fuzzyMatchNode.namedChildren.value,
      algorithm: algorithmNode.constant ?? defaultAlgorithm,
      threshold: thresholdField.value,
      rightOperandFilter: (option) => ["String", "String[]"].includes(option.dataType) && option.operandType === "Field",
      onRightChange: (newNode) => {
        nodeSharp.update(() => {
          if (isKnownOperandAstNode(newNode)) {
            fuzzyMatchNode.namedChildren.value = newNode;
          }
        });
        nodeSharp.actions.validate();
      },
      onAlorithmChange: (algorithm) => {
        algorithmNode.constant = algorithm;
      },
      onThresholdChange: (params) => {
        if (params.mode === "threshold") {
          thresholdNode.constant = params.value;
        } else {
          thresholdNode.constant = fuzzyMatchConfig$1.adaptThreshold(params.level);
        }
      }
    }
  ) });
}
const funcNameTKeys = {
  FuzzyMatch: "scenarios:edit_fuzzy_match.fuzzy_match",
  FuzzyMatchAnyOf: "scenarios:edit_fuzzy_match.fuzzy_match_any_of"
};
const fuzzyMatchConfig = ComparatorFuzzyMatchConfig;
function EditFuzzyMatchComparator(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const dataModel = dataSharp.select((s) => s.data.dataModel);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable;
  const node = nodeSharp.select((s) => s.node);
  const fuzzyMatchNode = node.children[0];
  const algorithmNode = fuzzyMatchNode.namedChildren.algorithm;
  const thresholdNode = node.children[1];
  const thresholdField = g(() => {
    const thresholdValue = thresholdNode.constant ?? fuzzyMatchConfig.getDefaultThreshold();
    const level = fuzzyMatchConfig.adaptLevel(thresholdValue);
    return level !== void 0 ? { mode: "level", value: thresholdValue, level } : { mode: "threshold", value: thresholdValue };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_fuzzy_match.title"), size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    InnerEditFuzzyMatchModal,
    {
      fuzzMatchConfig: fuzzyMatchConfig,
      operatorDisplay: t2(funcNameTKeys[fuzzyMatchNode.name]),
      left: fuzzyMatchNode.children[0],
      right: fuzzyMatchNode.children[1],
      algorithm: algorithmNode.constant ?? fuzzyMatchConfig.defaultAlgorithm,
      threshold: thresholdField.value,
      rightOperandFilter: (option) => option.operandType === "CustomList" || ["String", "String[]"].includes(option.dataType),
      onLeftChange: (newNode) => {
        fuzzyMatchNode.children[0] = newNode;
        nodeSharp.actions.validate();
      },
      onRightChange: (newNode) => {
        nodeSharp.update(() => {
          fuzzyMatchNode.name = getAstNodeDataType(newNode, {
            dataModel,
            triggerObjectTable: triggerObjectTable.value
          }) === "String" ? "FuzzyMatch" : "FuzzyMatchAnyOf";
          fuzzyMatchNode.children[1] = newNode;
        });
        nodeSharp.actions.validate();
      },
      onAlorithmChange: (algorithm) => {
        algorithmNode.constant = algorithm;
      },
      onThresholdChange: (params) => {
        if (params.mode === "threshold") {
          thresholdNode.constant = params.value;
        } else {
          thresholdNode.constant = fuzzyMatchConfig.adaptThreshold(params.level);
        }
      }
    }
  ) });
}
function EditIpHasFlag(props) {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const evaluation = nodeSharp.select((s) => s.validation);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    OperandEditModalContainer,
    {
      ...props,
      saveDisabled: !hasValidLicense,
      title: t2("scenarios:edit_ip_has_flag.title"),
      size: "medium",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: t2("scenarios:edit_ip_has_flag.description") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:uppercase", children: t2("scenarios:edit_ip_has_flag.extract") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              OperatorSelect,
              {
                options: validIpFlags,
                operator: node.namedChildren.flag.constant,
                onOperatorChange: (part) => {
                  node.namedChildren.flag.constant = part;
                  nodeSharp.actions.validate();
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:edit_ip_has_flag.from") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EditionAstBuilderOperand,
              {
                node: node.namedChildren.ip,
                onChange: (newNode) => {
                  if (isIpFieldAstNode(newNode)) {
                    node.namedChildren.ip = newNode;
                    nodeSharp.actions.validate();
                  }
                },
                optionsDataType: ["IpAddress"],
                coerceDataType: ["IpAddress"],
                validationStatus: getValidationStatus(evaluation, node.namedChildren.ip.id)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id, filterOut: ["FUNCTION_ERROR"] })
        ] }),
        !hasValidLicense ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { icon: "lock", variant: "outlined", color: "red", children: t2("scenarios:edit_ip_has_flag.premium_callout") }) : null
      ]
    }
  );
}
function Examples({ divider }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "border-grey-border table-auto border-collapse border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { className: "sr-only", children: t2("scenarios:edit_is_multiple_of.examples.caption") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-grey-primary bg-grey-background-light border-grey-border border px-xs text-start text-xs font-normal capitalize", children: t2("scenarios:edit_is_multiple_of.examples.value") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-grey-primary bg-grey-background-light border-grey-border border px-xs text-start text-xs font-normal capitalize", children: t2("scenarios:edit_is_multiple_of.examples.result") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
      {
        left: 5
      },
      {
        left: 20
      },
      {
        left: 700
      },
      {
        left: 2e3
      },
      {
        left: 38e4
      },
      {
        left: 380002
      },
      {
        left: 380002.1
      }
    ].map(({ left }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-grey-primary border-grey-border border px-xs text-xs font-normal", children: formatNumber(left, {
        language,
        style: void 0
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-grey-primary border-grey-border border px-xs text-xs font-normal", children: t2(`common:${left % divider === 0}`) })
    ] }, `${left}`)) })
  ] });
}
const dividerOptions = [
  { value: 1 },
  { value: 10 },
  { value: 100 },
  { value: 1e3 },
  { value: 1e4 },
  { value: 1e5 },
  { value: 1e6 },
  { value: 1e7 },
  { value: 1e8 },
  { value: 1e9 }
];
function EditIsMultipleOf(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const language = useFormatLanguage();
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const evaluation = nodeSharp.select((s) => s.validation);
  const divider = node.namedChildren.divider.constant ?? 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_is_multiple_of.title"), size: "large", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditionAstBuilderOperand,
          {
            node: node.namedChildren.value,
            optionsDataType: ["Int", "Float"],
            coerceDataType: ["Int"],
            onChange: (newValue) => {
              if (isKnownOperandAstNode(newValue)) {
                node.namedChildren.value = newValue;
                nodeSharp.actions.validate();
              }
            },
            validationStatus: getValidationStatus(evaluation, node.namedChildren.value.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border bg-grey-background-light flex h-10 w-fit min-w-[40px] items-center justify-center rounded-sm border p-sm text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-medium", children: t2("scenarios:edit_is_multiple_of.label") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { children: formatNumber(divider, {
            language,
            style: void 0
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Group, { children: dividerOptions.map((dividerOption) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Item,
            {
              onSelect: () => {
                node.namedChildren.divider.constant = dividerOption.value;
              },
              children: formatNumber(dividerOption.value, {
                language,
                style: void 0
              })
            },
            dividerOption.value
          )) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id, filterOut: ["FUNCTION_ERROR"] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Examples, { divider }) })
  ] }) });
}
const downFkField = (o) => o.navigationOptionRef?.targetFieldName ?? o.baseNavRef?.targetFieldName ?? "";
const getOptionKey = (o) => [o.direction, o.tableName, o.fieldPath[0]?.linkName ?? "", downFkField(o)].join("::");
const checkMatchesOption = (check, option) => {
  if (check.tableName !== option.tableName || check.direction !== option.direction) {
    return false;
  }
  const optionLinkName = option.fieldPath[0]?.linkName ?? "";
  const checkLinkName = check.fieldPath[0]?.linkName ?? "";
  if (optionLinkName && checkLinkName) {
    return optionLinkName === checkLinkName;
  }
  const optionFkField = downFkField(option);
  return optionFkField !== "" && optionFkField === (check.navigationOptionRef?.targetFieldName ?? "");
};
const AdvancedSetupsSection = ({
  dataModel,
  selectedTable,
  screeningConfigs,
  linkedObjectChecks,
  onLinkedObjectChecksChange,
  onPendingNavigationOptionAdd
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const monitoredTableNames = reactExports.useMemo(() => {
    return new Set(screeningConfigs.flatMap((config) => config.objectTypes));
  }, [screeningConfigs]);
  const linkedTableOptions = reactExports.useMemo(() => {
    const options2 = [];
    for (const link of selectedTable.linksToSingle) {
      if (monitoredTableNames.has(link.parentTableName)) {
        options2.push({
          tableName: link.parentTableName,
          fieldPath: [{ linkName: link.name, tableName: link.parentTableName }],
          direction: "up",
          displayLabel: link.parentTableName,
          linkDescription: t2("scenarios:monitoring_list_check.linked_up", {
            tableName: link.parentTableName,
            selectedTable: selectedTable.name
          }),
          linkToSingleName: link.name,
          hasNavigationOptions: false
        });
      }
    }
    for (const table of dataModel) {
      if (table.name === selectedTable.name) {
        continue;
      }
      for (const link of table.linksToSingle) {
        if (link.parentTableName === selectedTable.name && monitoredTableNames.has(table.name)) {
          const navOption = selectedTable.navigationOptions?.find(
            (nav) => nav.sourceTableName === selectedTable.name && nav.targetTableName === table.name && nav.filterFieldName === link.childFieldName
          );
          const hasNavOptions = !!navOption;
          const timestampFields = table.fields.filter((f) => f.dataType === "Timestamp").map((f) => ({ name: f.name, id: f.id }));
          const navigationOptionRef = navOption ? {
            targetTableName: navOption.targetTableName,
            targetFieldName: navOption.filterFieldName,
            sourceTableName: navOption.sourceTableName,
            sourceFieldName: navOption.sourceFieldName,
            orderingFieldName: navOption.orderingFieldName
          } : void 0;
          const baseNavRef = {
            targetTableName: table.name,
            targetFieldName: link.childFieldName,
            sourceTableName: selectedTable.name,
            sourceFieldName: link.parentFieldName
          };
          options2.push({
            tableName: table.name,
            fieldPath: [{ linkName: link.name, tableName: table.name }],
            direction: "down",
            displayLabel: table.name,
            linkDescription: t2("scenarios:monitoring_list_check.linked_down", {
              tableName: table.name,
              selectedTable: selectedTable.name
            }),
            navigationOptionRef,
            baseNavRef: hasNavOptions ? void 0 : baseNavRef,
            timestampFields,
            hasNavigationOptions: hasNavOptions,
            link: hasNavOptions ? void 0 : link
          });
        }
      }
    }
    return options2;
  }, [dataModel, selectedTable, monitoredTableNames, t2]);
  const getCheckForOption = (option) => {
    return linkedObjectChecks.find((c) => checkMatchesOption(c, option));
  };
  const handleToggleCheck = (option, enabled) => {
    const existingCheck = getCheckForOption(option);
    if (enabled) {
      if (existingCheck) {
        onLinkedObjectChecksChange(
          linkedObjectChecks.map((c) => checkMatchesOption(c, option) ? { ...c, enabled: true } : c)
        );
      } else {
        const newCheck = {
          tableName: option.tableName,
          fieldPath: option.fieldPath,
          direction: option.direction,
          enabled: true,
          // "up" direction is always validated, "down" with pre-configured navOptions is also validated
          validated: option.direction === "up" || option.hasNavigationOptions,
          // Store the navigation option ref for "down" direction
          navigationOptionRef: option.direction === "down" ? option.navigationOptionRef : void 0
        };
        onLinkedObjectChecksChange([...linkedObjectChecks, newCheck]);
      }
    } else {
      onLinkedObjectChecksChange(
        linkedObjectChecks.map((c) => checkMatchesOption(c, option) ? { ...c, enabled: false } : c)
      );
    }
  };
  const handleNavigationFieldChange = (orderingFieldName, option) => {
    const navigationOptionRef = option.baseNavRef ? { ...option.baseNavRef, orderingFieldName } : option.navigationOptionRef;
    onLinkedObjectChecksChange(
      linkedObjectChecks.map((check) => {
        if (!checkMatchesOption(check, option)) {
          return check;
        }
        return {
          ...check,
          validated: true,
          navigationOptionRef,
          orderingFieldName
        };
      })
    );
  };
  if (linkedTableOptions.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary", children: t2("scenarios:monitoring_list_check.no_linked_objects") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s font-medium text-grey-primary", children: t2("scenarios:monitoring_list_check.advanced_question", { tableName: selectedTable.name }) }),
    linkedTableOptions.map((option) => {
      const check = getCheckForOption(option);
      const isEnabled = check?.enabled ?? false;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        LinkedObjectCheckItem,
        {
          option,
          check,
          isEnabled,
          onToggle: (enabled) => handleToggleCheck(option, enabled),
          onNavigationFieldChange: (fieldName) => handleNavigationFieldChange(fieldName, option),
          onPendingNavigationOptionAdd
        },
        getOptionKey(option)
      );
    })
  ] });
};
const LinkedObjectCheckItem = ({
  option,
  check,
  isEnabled,
  onToggle,
  onNavigationFieldChange,
  onPendingNavigationOptionAdd
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [selectedFieldName, setSelectedFieldName] = reactExports.useState(check?.orderingFieldName ?? "");
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const needsNavigationConfig = option.direction === "down" && !option.hasNavigationOptions;
  const handleFieldChange = (fieldId, fieldName) => {
    setSelectedFieldName(fieldName);
    setMenuOpen(false);
    if (option.link) {
      onPendingNavigationOptionAdd({
        tableName: option.tableName,
        tableId: option.link.parentTableId,
        sourceFieldId: option.link.parentFieldId,
        targetTableId: option.link.childTableId,
        filterFieldId: option.link.childFieldId,
        orderingFieldId: fieldId
      });
    }
    onNavigationFieldChange(fieldName);
  };
  const displayValue = selectedFieldName || t2("scenarios:monitoring_list_check.select_field");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isEnabled, onCheckedChange: onToggle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-grey-primary", children: option.linkDescription }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: option.direction === "up" ? "arrow-up" : "arrow-down", className: "size-4 text-grey-secondary" })
    ] }),
    isEnabled && needsNavigationConfig && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ms-lg flex items-center gap-sm rounded-md bg-grey-background-light p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-primary", children: t2("scenarios:monitoring_list_check.order_by_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayValue }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: option.timestampFields?.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.Item,
          {
            selected: selectedFieldName === field.name,
            onSelect: () => handleFieldChange(field.id, field.name),
            children: field.name
          },
          field.id
        )) }) })
      ] })
    ] })
  ] });
};
function FilterSection({ selectedTopics, onTopicsChange }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [filterEnabled, setFilterEnabled] = reactExports.useState(selectedTopics.length > 0);
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const handleFilterToggle = (checked) => {
    setFilterEnabled(checked);
    if (!checked) {
      onTopicsChange([]);
    }
  };
  const handleTopicToggle = (topic, checked) => {
    if (checked) {
      onTopicsChange([...selectedTopics, topic]);
    } else {
      onTopicsChange(selectedTopics.filter((t22) => t22 !== topic));
    }
  };
  const selectedTopicsDisplay = reactExports.useMemo(() => {
    if (selectedTopics.length === 0) {
      return t2("scenarios:monitoring_list_check.select_hit_types");
    }
    return selectedTopics.map((topic) => t2(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[topic]}`)).join(", ");
  }, [selectedTopics, t2]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium text-grey-primary", children: t2("scenarios:monitoring_list_check.filter_question") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex shrink-0 cursor-pointer items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: filterEnabled, onCheckedChange: handleFilterToggle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t2("scenarios:monitoring_list_check.hit_types_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5 text-purple-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "flex-1", disabled: !filterEnabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: selectedTopicsDisplay }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "min-w-[250px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs p-sm", children: SCREENING_CATEGORIES.map((topic) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: "flex cursor-pointer items-center gap-sm rounded p-sm hover:bg-grey-02",
            onClick: (e2) => e2.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: selectedTopics.includes(topic),
                  onCheckedChange: (checked) => handleTopicToggle(topic, checked === true)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t2(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[topic]}`) })
            ]
          },
          topic
        )) }) })
      ] })
    ] })
  ] });
}
const ObjectSelector = ({
  dataModel,
  triggerObjectTable,
  screeningConfigs,
  currentTableName,
  currentPath,
  onChange
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const objectOptions = reactExports.useMemo(() => {
    const options2 = [];
    const visited = /* @__PURE__ */ new Set();
    const getActiveMonitorings = (tableName) => screeningConfigs.filter((config) => config.objectTypes.includes(tableName));
    const queue = [
      { table: triggerObjectTable, path: [], pathSegments: [triggerObjectTable.name] }
    ];
    while (queue.length > 0) {
      const { table, path, pathSegments } = queue.shift();
      options2.push({
        tableName: table.name,
        path,
        displayLabel: table.name,
        pathSegments,
        activeMonitorings: getActiveMonitorings(table.name)
      });
      for (const link of table.linksToSingle) {
        const visitKey = `${table.name}→${link.name}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        const linkedTable = dataModel.find((tbl) => tbl.name === link.parentTableName);
        if (linkedTable) {
          queue.push({
            table: linkedTable,
            path: [...path, { linkName: link.name, tableName: linkedTable.name }],
            pathSegments: [...pathSegments, linkedTable.name]
          });
        }
      }
    }
    return options2.filter((option) => option.activeMonitorings.length > 0);
  }, [dataModel, triggerObjectTable, screeningConfigs]);
  const currentValue = reactExports.useMemo(() => {
    const index = objectOptions.findIndex(
      (opt) => opt.tableName === currentTableName && opt.path.length === currentPath.length && opt.path.every((seg, i2) => seg.linkName === currentPath[i2]?.linkName)
    );
    return index >= 0 ? String(index) : "";
  }, [objectOptions, currentTableName, currentPath]);
  const handleChange = (value) => {
    const option = objectOptions[Number(value)];
    if (!option) return;
    onChange(option.tableName, option.path);
  };
  if (objectOptions.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-primary", children: t2("scenarios:monitoring_list_check.object_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-grey-secondary", children: t2("scenarios:monitoring_list_check.no_objects_under_monitoring") })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-primary", children: t2("scenarios:monitoring_list_check.object_label") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Root, { value: currentValue, onValueChange: handleChange, className: "flex flex-col gap-md", children: objectOptions.map((option, index) => {
      const value = String(index);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Item, { value }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-grey-primary", children: option.displayLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveMonitoringsTooltip, { monitorings: option.activeMonitorings })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathBreadcrumb, { segments: option.pathSegments })
        ] })
      ] }, value);
    }) })
  ] });
};
const PathBreadcrumb = ({ segments }) => {
  if (segments.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-xs", children: segments.map((segment, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: segment }),
    index < segments.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4 text-grey-secondary" })
  ] }, index)) });
};
const ActiveMonitoringsTooltip = ({ monitorings }) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  if (monitorings.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tooltip.Default,
      {
        content: t2("scenarios:monitoring_list_check.no_active_monitoring"),
        className: "border border-grey-border",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5 text-grey-disabled" })
      }
    );
  }
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: t2("scenarios:monitoring_list_check.active_monitorings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc ps-md", children: monitorings.map((config) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs", children: config.name }, config.id)) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content, className: "border border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5 text-purple-primary" }) });
};
const EditMonitoringListCheck = (props) => {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const scenarioId = AstBuilderDataSharpFactory.select((s) => s.scenarioId ?? "");
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const hasContinuousScreening = AstBuilderDataSharpFactory.select((s) => s.data.hasContinuousScreening);
  const screeningConfigs = AstBuilderDataSharpFactory.select((s) => s.data.screeningConfigs) ?? [];
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const [currentStep, setCurrentStep] = reactExports.useState(1);
  const config = node.namedChildren.config.constant;
  const [targetTableName, setTargetTableName] = reactExports.useState(config.targetTableName);
  const [pathToTarget, setPathToTarget] = reactExports.useState(
    () => fromPathToTarget(config.pathToTarget, dataModel, triggerObjectTable.name)
  );
  const [selectedTopics, setSelectedTopics] = reactExports.useState(
    () => topicsToCategories(config.topicFilters)
  );
  const [linkedObjectChecks, setLinkedObjectChecks] = reactExports.useState(
    () => fromLinkedTableChecks(config.linkedTableChecks)
  );
  const [pendingNavigationOptions, setPendingNavigationOptions] = reactExports.useState([]);
  const selectedTable = dataModel.find((t22) => t22.name === targetTableName);
  const createNavigationOptionMutation = useCreateNavigationOptionForAstMutation();
  const hasLinkedObjectsUnderMonitoring = reactExports.useMemo(() => {
    if (!selectedTable) return false;
    const monitoredTables = new Set(screeningConfigs.flatMap((config2) => config2.objectTypes));
    const hasParentUnderMonitoring = selectedTable.linksToSingle.some(
      (link) => monitoredTables.has(link.parentTableName)
    );
    const hasChildUnderMonitoring = dataModel.some((table) => {
      if (table.name === selectedTable.name) return false;
      return table.linksToSingle.some(
        (link) => link.parentTableName === selectedTable.name && monitoredTables.has(table.name)
      );
    });
    return hasParentUnderMonitoring || hasChildUnderMonitoring;
  }, [selectedTable, dataModel, screeningConfigs]);
  const totalSteps = hasLinkedObjectsUnderMonitoring ? 3 : 2;
  const steps = [
    { key: "object", label: t2("scenarios:monitoring_list_check.step_object") },
    { key: "options", label: t2("scenarios:monitoring_list_check.step_options") },
    ...hasLinkedObjectsUnderMonitoring ? [{ key: "advanced", label: t2("scenarios:monitoring_list_check.step_advanced") }] : []
  ];
  const handleObjectChange = (tableName, path) => {
    setTargetTableName(tableName);
    setPathToTarget(path);
    setLinkedObjectChecks([]);
  };
  const handlePendingNavigationOptionAdd = (pending) => {
    setPendingNavigationOptions((prev) => {
      const existing = prev.findIndex((p) => p.tableName === pending.tableName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = pending;
        return updated;
      }
      return [...prev, pending];
    });
  };
  const handleOpenChange = useCallbackRef((open) => {
    if (!open) {
      props.onCancel();
    }
  });
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSave = async () => {
    try {
      if (pendingNavigationOptions.length > 0) {
        await Promise.all(
          pendingNavigationOptions.map(
            (pending) => createNavigationOptionMutation.mutateAsync({
              scenarioId,
              tableId: pending.tableId,
              sourceFieldId: pending.sourceFieldId,
              targetTableId: pending.targetTableId,
              filterFieldId: pending.filterFieldId,
              orderingFieldId: pending.orderingFieldId
            })
          )
        );
      }
      const newConfig = toMonitoringListCheckConfig(targetTableName, pathToTarget, selectedTopics, linkedObjectChecks);
      const updatedNode = NewTagCheckAstNode(monitoringListCheckAstNodeName, newConfig);
      updatedNode.id = node.id;
      props.onSave(updatedNode);
    } catch {
      zt.error(t2("common:errors.unknown"));
    }
  };
  const canProceedFromStep1 = !!targetTableName;
  const isLastStep = currentStep === totalSteps;
  const hasUnvalidatedDownChecks = linkedObjectChecks.some(
    (check) => check.enabled && check.direction === "down" && !check.validated
  );
  const canSaveFromStep3 = !hasUnvalidatedDownChecks;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: true, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "medium", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("scenarios:monitoring_list_check.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-h-[70dvh] flex-col gap-lg overflow-auto p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { steps, currentStep: currentStep - 1 }),
      currentStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: t2("scenarios:monitoring_list_check.description") }) }),
      !hasContinuousScreening ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { icon: "lock", variant: "outlined", color: "red", children: t2("scenarios:monitoring_list_check.premium_callout") }) : null,
      currentStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ObjectSelector,
        {
          dataModel,
          triggerObjectTable,
          screeningConfigs,
          currentTableName: targetTableName,
          currentPath: pathToTarget,
          onChange: handleObjectChange
        }
      ),
      currentStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { selectedTopics, onTopicsChange: setSelectedTopics }),
      currentStep === 3 && selectedTable && /* @__PURE__ */ jsxRuntimeExports.jsx(
        AdvancedSetupsSection,
        {
          dataModel,
          selectedTable,
          screeningConfigs,
          linkedObjectChecks,
          onLinkedObjectChecksChange: setLinkedObjectChecks,
          onPendingNavigationOptionAdd: handlePendingNavigationOptionAdd
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      currentStep > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          variant: "secondary",
          label: t2("scenarios:monitoring_list_check.back"),
          onClick: handleBack
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
      isLastStep ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t2("scenarios:monitoring_list_check.validate"),
          onClick: handleSave,
          disabled: !hasContinuousScreening || createNavigationOptionMutation.isPending || currentStep === 3 && !canSaveFromStep3
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t2("scenarios:monitoring_list_check.next"),
          onClick: handleNext,
          disabled: !hasContinuousScreening || !canProceedFromStep1
        }
      )
    ] })
  ] }) });
};
function EditRecordRiskLevelCheck(props) {
  const { t: t2 } = useTranslation(["scenarios", "common", "user-scoring"]);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const scoringSettings = AstBuilderDataSharpFactory.select((s) => s.data.scoringSettings);
  const levelColorsEntries = scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel) ? scoringLevelEntries(SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel]) : null;
  const levelLabelsMap = scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel) ? SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel] : null;
  const levelsOptions = levelColorsEntries && levelLabelsMap ? levelColorsEntries.map(([level, color]) => {
    const label = t2(levelLabelsMap[level]);
    return {
      value: level,
      label: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full shrink-0", style: { backgroundColor: color } }),
        label
      ] })
    };
  }) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    OperandEditModalContainer,
    {
      ...props,
      saveDisabled: !hasValidLicense,
      title: t2("scenarios:edit_record_risk_level_check.title"),
      size: "medium",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: t2("scenarios:edit_record_risk_level_check.description") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:uppercase", children: t2("scenarios:edit_record_risk_level_check.match") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                multiple: true,
                options: levelsOptions,
                value: node.children[0].constant,
                placeholder: t2("scenarios:edit_record_risk_level_check.placeholder"),
                onChange: (value) => {
                  node.children[0].constant = value;
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id, filterOut: ["FUNCTION_ERROR"] })
        ] })
      ]
    }
  );
}
const extractVariablesNamesFromTemplate = (template) => {
  const res = template.matchAll(STRING_TEMPLATE_VARIABLE_REGEXP).toArray();
  return res.reduce((acc, match) => {
    return match[1] && !acc.includes(match[1]) ? [...acc, match[1]] : acc;
  }, []);
};
const StringTemplateForm = () => {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const template = node.children[0].constant;
  const handleTemplateChange = (event) => {
    node.children[0].constant = event.target.value;
  };
  const variableNames = extractVariablesNamesFromTemplate(template);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      t2("scenarios:edit_string_template.template_field.label"),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: template,
          onChange: handleTemplateChange,
          placeholder: t2("scenarios:edit_string_template.template_field.placeholder")
        }
      )
    ] }),
    variableNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      t2("scenarios:edit_string_template.variables.label"),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ms-xl grid grid-cols-[150px_1fr] gap-x-xs gap-y-2xs", children: variableNames.map((name) => {
        const variable = node.namedChildren[name];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s bg-grey-background-light text-purple-primary flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-xs rounded-sm p-sm font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[140px] truncate", title: name, children: name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            EditionAstBuilderOperand,
            {
              node: variable && isKnownOperandAstNode(variable) ? variable : NewUndefinedAstNode(),
              onChange: (newNode) => {
                if (isKnownOperandAstNode(newNode)) {
                  node.namedChildren[name] = newNode;
                }
              },
              optionsDataType: ["String", "Int", "Float"]
            }
          ) })
        ] }, name);
      }) })
    ] }) : null
  ] });
};
function EditStringTemplate(props) {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_string_template.title"), size: "medium", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:edit_string_template.description",
        components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: stringTemplatingDocHref })
        }
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StringTemplateForm, {})
  ] });
}
const options = ["seconds", "minutes", "hours", "days"];
function DurationUnitSelect({ value, disabled, onChange }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectV2,
    {
      disabled,
      value: value ?? void 0,
      onChange: (selectedValue) => {
        if (selectedValue === void 0) return;
        onChange(selectedValue);
      },
      placeholder: "...",
      className: "min-w-fit",
      options: options.map((option) => ({
        label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t2(`scenarios:edit_date.duration_unit_${option}`) }),
        value: option
      }))
    }
  );
}
const adaptDurationAndUnitFromTemporalDuration = (temporalDuration) => {
  if (temporalDuration.seconds > 0) {
    return {
      duration: temporalDuration.total("second"),
      durationUnit: "seconds"
    };
  } else if (temporalDuration.minutes > 0) {
    return {
      duration: temporalDuration.total("minute"),
      durationUnit: "minutes"
    };
  } else if (temporalDuration.hours > 0) {
    return {
      duration: temporalDuration.total("hour"),
      durationUnit: "hours"
    };
  }
  return {
    duration: temporalDuration.total("day"),
    durationUnit: "days"
  };
};
const defaultISO8601Duration = "PT0S";
function getTemporalDuration(duration, durationUnit) {
  return Temporal.Duration.from({ [durationUnit]: duration }).toString();
}
function EditTimeAdd(props) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const evaluation = nodeSharp.select((s) => s.validation);
  const durationData = g(() => {
    const durationNode = node.namedChildren.duration;
    const iso8601Duration = durationNode.constant !== "" ? durationNode.constant : defaultISO8601Duration;
    const temporalDuration = Temporal.Duration.from(iso8601Duration).round("seconds");
    return adaptDurationAndUnitFromTemporalDuration(temporalDuration);
  });
  const [selectedDurationUnit, setSelectedDurationUnit] = reactExports.useState(durationData.value.durationUnit);
  reactExports.useEffect(() => {
    node.namedChildren.duration.constant = getTemporalDuration(durationData.value.duration, selectedDurationUnit);
    nodeSharp.actions.validate();
  }, [nodeSharp, node, durationData.value.duration, selectedDurationUnit]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_date.title"), size: "small", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:edit_date.description",
        components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: dateDocHref })
        }
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditionAstBuilderOperand,
          {
            node: node.namedChildren.timestampField,
            onChange: (newNode) => {
              if (isTimestampFieldAstNode(newNode)) {
                node.namedChildren.timestampField = newNode;
                nodeSharp.actions.validate();
              }
            },
            coerceDataType: ["Timestamp"],
            optionsDataType: ["Timestamp"],
            validationStatus: getValidationStatus(evaluation, node.namedChildren.timestampField.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OperatorSelect,
          {
            options: timeAddOperators,
            operator: node.namedChildren.sign.constant,
            onOperatorChange: (sign) => {
              node.namedChildren.sign.constant = sign;
              nodeSharp.actions.validate();
            },
            validationStatus: getValidationStatus(evaluation, node.namedChildren.sign.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: durationData.value.duration ?? "",
            onChange: (e2) => {
              const value = Number.isFinite(e2.target.valueAsNumber) ? e2.target.valueAsNumber : 0;
              node.namedChildren.duration.constant = getTemporalDuration(value, durationData.value.durationUnit);
              nodeSharp.actions.validate();
            },
            min: "0",
            placeholder: "0",
            type: "number",
            className: "basis-[60px]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DurationUnitSelect, { value: selectedDurationUnit, onChange: setSelectedDurationUnit })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id, filterOut: ["FUNCTION_ERROR"] })
    ] })
  ] });
}
function getNoTimezoneSetupWarning(currentUser, t2) {
  return isAdmin(currentUser) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t: t2,
      i18nKey: "scenarios:edit_timestamp_extract.missing_default_timezone_admin",
      components: {
        SettingsLink: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            className: "text-m hover:text-purple-hover focus:text-purple-hover text-purple-primary relative font-normal hover:underline focus:underline",
            to: "/settings/scenarios"
          }
        )
      }
    }
  ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-primary", children: t2("scenarios:edit_timestamp_extract.missing_default_timezone_non_admin") });
}
function returnTimestampExtractInformation(t2, part) {
  switch (part) {
    case "year":
      return t2(`scenarios:edit_timestamp_extract.explanation.year`);
    case "month":
      return t2(`scenarios:edit_timestamp_extract.explanation.month`);
    case "day_of_month":
      return t2(`scenarios:edit_timestamp_extract.explanation.day_of_month`);
    case "day_of_week":
      return t2(`scenarios:edit_timestamp_extract.explanation.day_of_week`);
    case "hour":
      return t2(`scenarios:edit_timestamp_extract.explanation.hour`);
    default:
      assertNever("Untranslated operator", part);
  }
}
function EditTimestampExtract(props) {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const { org, currentUser } = useOrganizationDetails();
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node);
  const evaluation = nodeSharp.select((s) => s.validation);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(OperandEditModalContainer, { ...props, title: t2("scenarios:edit_timestamp_extract.title"), size: "medium", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:edit_timestamp_extract.description",
        components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: dateDocHref })
        }
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:uppercase", children: t2("scenarios:edit_timestamp_extract.extract_the") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OperatorSelect,
          {
            options: validTimestampExtractParts,
            operator: node.namedChildren.part.constant,
            onOperatorChange: (part) => {
              node.namedChildren.part.constant = part;
              nodeSharp.actions.validate();
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:edit_timestamp_extract.from") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditionAstBuilderOperand,
          {
            node: node.namedChildren.timestamp,
            onChange: (newNode) => {
              if (isTimestampFieldAstNode(newNode)) {
                node.namedChildren.timestamp = newNode;
                nodeSharp.actions.validate();
              }
            },
            optionsDataType: ["Timestamp"],
            coerceDataType: ["Timestamp"],
            validationStatus: getValidationStatus(evaluation, node.namedChildren.timestamp.id)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: node.id, filterOut: ["FUNCTION_ERROR"] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: returnTimestampExtractInformation(t2, node.namedChildren.part.constant) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: org.defaultScenarioTimezone ? t2("scenarios:edit_timestamp_extract.interpreted_in_timezone", {
      replace: { timezone: org.defaultScenarioTimezone }
    }) : getNoTimezoneSetupWarning(currentUser, t2) })
  ] });
}
function OperandEditModal({ node, ...props }) {
  const validation = AstBuilderNodeSharpFactory.useOptionalSharp()?.select((s) => s.validation);
  const nodeSharp = useRoot(
    {
      node,
      validation: {
        errors: [],
        evaluation: getEvaluationForNode(validation?.evaluation ?? [], node.id)
      }
    },
    false
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderNodeSharpFactory.Provider, { value: nodeSharp, children: M(node).when(isIsMultipleOf, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditIsMultipleOf, { ...props })).when(isTimeAdd, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditTimeAdd, { ...props })).when(isTimestampExtract, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditTimestampExtract, { ...props })).when(isFuzzyMatchComparator, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditFuzzyMatchComparator, { ...props })).when(isAggregation, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditAggregation, { ...props })).when(isStringTemplateAstNode, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditStringTemplate, { ...props })).when(isFuzzyMatchFilterOptionsAstNode, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditFuzzyMatchAggregation, { ...props })).when(isMonitoringListCheckAstNode, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditMonitoringListCheck, { ...props })).when(isIpHasFlag, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditIpHasFlag, { ...props })).when(isRecordRiskLevelCheckAstNode, () => /* @__PURE__ */ jsxRuntimeExports.jsx(EditRecordRiskLevelCheck, { ...props })).exhaustive() });
}
function AstBuilderOperand(props) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderOperand, { ...props }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderOperand, { ...props });
}
const AddLogicalOperatorButton = React.forwardRef(
  function AddLogicalOperatorButton2({ className, operator, ...props }, ref) {
    const { t: t2 } = useTranslation(["scenarios"]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: clsx(
          "flex size-fit flex-row items-center justify-center gap-xs rounded-sm border px-sm py-xs outline-hidden text-xs font-semibold",
          "bg-transparent border-purple-primary text-purple-primary",
          "hover:bg-purple-background hover:border-purple-hover hover:text-purple-hover",
          "disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled",
          "dark:border-purple-hover dark:text-purple-hover",
          "dark:hover:bg-transparent dark:hover:border-purple-hover dark:hover:text-purple-hover",
          "dark:disabled:bg-transparent dark:disabled:border-purple-disabled dark:disabled:text-purple-disabled",
          className
        ),
        ...props,
        ref,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
          t2(`scenarios:logical_operator.${operator}_button`)
        ]
      }
    );
  }
);
function NodeTypeError() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-background text-red-primary border-red-primary h-10 w-fit min-w-10 rounded-sm border-[0.5px] p-sm", children: "Wrong node type" });
}
function useSiblings(stringPath) {
  const rootNode = AstBuilderNodeSharpFactory.useSharp().value.node;
  const path = parsePath(stringPath);
  const parentPath = getParentPath(path);
  if (!parentPath || parentPath.childPathSegment?.type !== "children") {
    return [];
  }
  const childIndex = parentPath.childPathSegment.index;
  const parentNode = getAtPath(rootNode, parentPath.path);
  if (!parentNode || parentNode.name !== "=") {
    return [];
  }
  return [...parentNode.children.slice(0, childIndex), ...parentNode.children.slice(childIndex + 1)];
}
const allMainAstOperatorFunctionsOptions = {
  "=": {},
  "≠": { keywords: ["!="] },
  "<": {},
  "<=": {},
  ">": {},
  ">=": {},
  "+": {},
  "-": {},
  "*": {},
  "/": {},
  IsInList: {},
  IsNotInList: {},
  StringContains: {},
  StringNotContain: {},
  StringStartsWith: {},
  StringEndsWith: {},
  ContainsAnyOf: {},
  ContainsNoneOf: {},
  IsEmpty: {},
  IsNotEmpty: {}
};
const EditionAstBuilderNode = reactExports.memo(function EditionAstBuilderNode2(props) {
  const operandProps = {
    coerceDataType: props.coerceDataType,
    optionsDataType: props.optionsDataType,
    excludeFields: props.excludeFields
  };
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.value.$data.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = g(() => getAtPath(nodeSharp.value.node, parsePath(props.path)));
  invariant(node.value, `Couldn't find node at path: ${props.path}`);
  const siblings = useSiblings(props.path);
  const enumValues = g(() => {
    const enums = [];
    const triggerTable = data.dataModel.find((t2) => t2.name === data.triggerObjectType);
    if (!triggerTable) {
      return;
    }
    for (const neighbourNode of siblings) {
      if (isDataAccessorAstNode(neighbourNode)) {
        const field = getDataAccessorAstNodeField(neighbourNode, {
          dataModel: data.dataModel,
          triggerObjectTable: triggerTable
        });
        if (field.isEnum) {
          enums.push(...field.values ?? []);
        }
      }
    }
    return enums;
  });
  const setNode = (newNode) => {
    nodeSharp.actions.setNodeAtPath(props.path, newNode);
    nodeSharp.actions.validate();
  };
  const setOperator = (operator) => {
    if (node.value) {
      node.value.name = operator;
      if (isUnaryMainAstOperatorFunction(operator) && node.value.children.length > 1) {
        node.value.children = [node.value.children[0]];
      } else if (isBinaryMainAstOperatorFunction(operator) && node.value.children.length < 2) {
        node.value.children = [node.value.children[0], NewUndefinedAstNode()];
      }
      nodeSharp.actions.triggerUpdate();
      nodeSharp.actions.validate();
    }
  };
  const children = M(node.value).when(isMainAstBinaryNode, (node2) => {
    const hasNestedLeftChild = isMainAstNode(node2.children[0]) && node2.children[0].children.length > 0;
    const hasNestedRightChild = isMainAstNode(node2.children[1]) && node2.children[1].children.length > 0;
    const hasAllNestedChildren = hasNestedLeftChild && hasNestedRightChild;
    const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node2.id, true).length > 0;
    const showBrackets = !props.root || hasAllNestedChildren;
    const children2 = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderNode2, { path: `${props.path}.children.0`, ...operandProps }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OperatorSelect,
        {
          hideArrow: true,
          options: allMainAstOperatorFunctionsOptions,
          validationStatus: hasDirectError ? "error" : "valid",
          operator: node2.name,
          onOperatorChange: setOperator
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderNode2, { path: `${props.path}.children.1`, ...operandProps })
    ] });
    const wrappedChildren = showBrackets ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Brackets$1,
      {
        removeNesting: () => {
          setNode(node2.children[0]);
          nodeSharp.actions.validate();
        },
        addNesting: () => {
          setNode(NewUndefinedAstNode({ children: [node2, NewUndefinedAstNode()] }));
        },
        invertOperands: () => {
          const left = node2.children[0];
          const right = node2.children[1];
          nodeSharp.update(() => {
            node2.children[0] = right;
            node2.children[1] = left;
          });
        },
        children: children2
      }
    ) : children2;
    return props.root ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex flex-row flex-wrap items-center gap-sm", children: wrappedChildren }) : wrappedChildren;
  }).when(isMainAstUnaryNode, (node2) => {
    const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node2.id, true).length > 0;
    const showBrackets = !props.root;
    const children2 = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderNode2, { path: `${props.path}.children.0`, ...operandProps }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        OperatorSelect,
        {
          hideArrow: true,
          options: allMainAstOperatorFunctionsOptions,
          validationStatus: hasDirectError ? "error" : "valid",
          operator: node2.name,
          onOperatorChange: setOperator
        }
      )
    ] });
    const wrappedChildren = showBrackets ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Brackets$1,
      {
        unary: true,
        removeNesting: () => {
          setNode(node2.children[0]);
          nodeSharp.actions.validate();
        },
        addNesting: () => {
          setNode(NewUndefinedAstNode({ children: [node2, NewUndefinedAstNode()] }));
        },
        children: children2
      }
    ) : children2;
    return props.root ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex flex-row flex-wrap items-center gap-sm", children: wrappedChildren }) : wrappedChildren;
  }).when(isKnownOperandAstNode, (node2) => {
    const hasDirectError = getErrorsForNode(nodeSharp.value.validation, node2.id, true).length > 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditionAstBuilderOperand,
      {
        node: node2,
        onChange: setNode,
        enumValues: enumValues.value,
        validationStatus: hasDirectError ? "error" : "valid",
        ...operandProps
      }
    );
  }).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(NodeTypeError, {}));
  return children;
});
EditionAstBuilderNode.displayName = "EditionAstBuilderNode";
function Brackets$1({ children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/nest contents", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Bracket, { ...props, children: "(" }),
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Bracket, { ...props, children: ")" })
  ] });
}
const Bracket = ({ children, removeNesting, addNesting, ...props }) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-grey-primary border-grey-border [.group\\/nest:hover:not(:has(.group\\/nest:hover))_>_&]:bg-grey-background [.group\\/nest:hover:not(:has(.group\\/nest:hover))_>_&]:border-grey-placeholder flex h-10 items-center justify-center rounded-sm border px-xs", children }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
      !props.unary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        MenuCommand.Item,
        {
          onSelect: props.invertOperands,
          className: "data-active-item:bg-purple-background-light grid w-full select-none grid-cols-[20px_1fr] gap-xs rounded-xs p-sm outline-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": "true", className: "col-start-1 size-5 shrink-0", icon: "swap" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 flex flex-row gap-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-s w-full break-all text-start font-normal", children: t2("scenarios:nesting.swap_operands") }) })
          ]
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        MenuCommand.Item,
        {
          onSelect: addNesting,
          className: "data-active-item:bg-purple-background-light grid w-full select-none grid-cols-[20px_1fr] gap-xs rounded-xs p-sm outline-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": "true", className: "col-start-1 size-5 shrink-0", icon: "parentheses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 flex flex-row gap-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-s w-full break-all text-start font-normal", children: t2("scenarios:nesting.add_right_nesting") }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        MenuCommand.Item,
        {
          onSelect: removeNesting,
          className: "data-active-item:bg-red-background grid w-full select-none grid-cols-[20px_1fr] gap-xs rounded-xs p-sm outline-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": "true", className: "text-red-hover col-start-1 size-5 shrink-0", icon: "delete" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 flex flex-row gap-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary text-s w-full break-all text-start font-normal", children: t2("scenarios:nesting.remove") }) })
          ]
        }
      )
    ] }) })
  ] });
};
function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()]
  });
}
function EditionAstBuilderAndRoot(props) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const nodeStore = useRoot(props);
  const appendChild = () => {
    nodeStore.value.node.children.push(NewAndChild());
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };
  const removeChild = (index) => {
    nodeStore.value.node.children.splice(index, 1);
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderNodeSharpFactory.Provider, { value: nodeStore, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm lg:gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s bg-grey-background-light text-purple-primary col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-xs rounded-sm p-sm font-semibold", children: dataSharp.value.data.$triggerObjectType }),
      nodeStore.value.node.children.map((child, i2, children) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditionRootAndLine,
          {
            isFirst: i2 === 0,
            isLast: i2 === children.length - 1,
            path: `root.children.${i2}`,
            nodeId: child.id,
            removeNode: () => {
              removeChild(i2);
            }
          },
          child.id
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row flex-wrap gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddLogicalOperatorButton, { onClick: appendChild, operator: "and" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { direct: true, id: nodeStore.value.node.id, filterOut: ["ARGUMENT_MUST_BE_BOOLEAN"] })
    ] })
  ] }) });
}
function EditionRootAndLine({ isFirst, isLast, path, nodeId, removeNode }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("border-grey-border col-span-5 w-2 border-e", isFirst ? "h-4" : "h-2") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("border-grey-border col-start-1 border-e", isLast && "h-5") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border col-start-2 h-5 border-b" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: isFirst ? "where" : "and", className: "col-start-3", type: "contained" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("col-span-1 col-start-4 flex flex-col gap-sm px-sm"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderNode, { path, root: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: nodeId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-5 flex h-10 flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveButton, { onClick: removeNode }) })
  ] });
}
function EditionAstBuilderAnyRoot(props) {
  const nodeStore = useRoot(props);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AstBuilderNodeSharpFactory.Provider, { value: nodeStore, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditionAstBuilderNode,
      {
        root: true,
        path: "root",
        coerceDataType: props.coerceDataType,
        optionsDataType: props.optionsDataType,
        excludeFields: props.excludeFields
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: nodeStore.value.node.id })
  ] });
}
function NewChildForAnd() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()]
  });
}
function NewChildForOr() {
  return NewAndAstNode({
    children: [NewChildForAnd()]
  });
}
function EditionAstBuilderOrWithAndRoot(props) {
  const nodeStore = useRoot(props);
  const appendChild = () => {
    nodeStore.value.node.children.push(NewChildForOr());
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };
  const removeChild = (index) => {
    nodeStore.value.node.children.splice(index, 1);
    nodeStore.actions.validate();
    nodeStore.actions.triggerUpdate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderNodeSharpFactory.Provider, { value: nodeStore, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_max-content] gap-sm", children: [
    nodeStore.value.node.children.map((child, i2) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditionRootOrGroup,
        {
          isFirst: i2 === 0,
          path: `root.children.${i2}`,
          nodeId: child.id,
          removeNode: () => {
            removeChild(i2);
          }
        },
        child.id
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex flex-row flex-wrap gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddLogicalOperatorButton, { onClick: appendChild, operator: "or" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { direct: true, id: nodeStore.value.node.id })
    ] })
  ] }) });
}
function EditionRootOrGroup({ isFirst, path, removeNode }) {
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = g(() => getAtPath(nodeSharp.value.node, parsePath(path)));
  invariant(node.value);
  const appendChild = () => {
    if (!node.value) return;
    node.value.children.push(NewChildForAnd());
    nodeSharp.actions.validate();
  };
  const removeChild = (index) => {
    if (!node.value) return;
    if (node.value.children.length === 1) {
      removeNode();
      return;
    }
    node.value.children.splice(index, 1);
    nodeSharp.actions.validate();
    nodeSharp.actions.triggerUpdate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    !isFirst ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: "or", className: "uppercase", type: "contained" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex flex-1 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px w-full" }) })
    ] }) : null,
    node.value.children.map((child, i2) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditionRootOrWithAndLine,
        {
          isFirst: i2 === 0,
          path: `${path}.children.${i2}`,
          nodeId: child.id,
          removeNode: () => {
            removeChild(i2);
          }
        },
        child.id
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 col-start-2 flex flex-row flex-wrap gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddLogicalOperatorButton, { onClick: appendChild, operator: "and" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { direct: true, id: node.value.id, filterOut: ["ARGUMENT_MUST_BE_BOOLEAN"] })
    ] })
  ] });
}
function EditionRootOrWithAndLine({ isFirst, path, nodeId, removeNode }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: isFirst ? "if" : "and", type: "contained" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderNode, { path, root: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditionEvaluationErrors, { id: nodeId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveButton, { onClick: removeNode }) })
  ] });
}
const ViewingEvaluationErrors = reactExports.memo(function ViewingEvaluationErrors2({
  direct,
  id,
  className,
  evaluation
}) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const errors = reactExports.useMemo(() => {
    return evaluation.filter((row) => direct ? row.nodeId === id : row.relatedIds.includes(id)).flatMap((row) => row.errors);
  }, [evaluation, direct, id]);
  const errorModels = adaptEvaluationErrorViewModels(errors);
  const translateError = commonErrorMessages(t2);
  if (errorModels.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-row flex-wrap gap-sm", className), children: errorModels.map((errorModel, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "bg-red-background text-s text-red-primary flex h-8 items-center justify-center rounded-sm px-xs py-2xs font-medium",
      children: translateError(errorModel)
    },
    i2
  )) });
});
ViewingEvaluationErrors.displayName = "ViewingEvaluationErrors";
function formatReturnValue(returnValue, config) {
  if (returnValue?.isOmitted === false) {
    return formatConstant(returnValue.value, config);
  }
  return void 0;
}
function adaptBooleanOrNullReturnValue(returnValue) {
  if (typeof returnValue.value === "boolean" || returnValue.value === null) {
    return { value: returnValue.value, isBooleanOrNull: true };
  }
  return { isBooleanOrNull: false };
}
const ViewingAstBuilderNode = reactExports.memo(function ViewingAstBuilderNode2(props) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const children = M(props.node).when(isMainAstBinaryNode, (node) => {
    const hasNestedLeftChild = isMainAstNode(node.children[0]) && node.children[0].children.length > 0;
    const hasNestedRightChild = isMainAstNode(node.children[1]) && node.children[1].children.length > 0;
    const hasAllNestedChildren = hasNestedLeftChild && hasNestedRightChild;
    const showBrackets = !props.root || hasAllNestedChildren;
    const children2 = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ViewingAstBuilderNode2,
        {
          path: `${props.path}.children.0`,
          node: node.children[0],
          validation: props.validation
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingOperator, { operator: node.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ViewingAstBuilderNode2,
        {
          path: `${props.path}.children.1`,
          node: node.children[1],
          validation: props.validation
        }
      )
    ] });
    const wrappedChildren = showBrackets ? /* @__PURE__ */ jsxRuntimeExports.jsx(Brackets, { children: children2 }) : children2;
    return props.root ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex flex-row flex-wrap items-center gap-sm", children: wrappedChildren }) : wrappedChildren;
  }).when(isMainAstUnaryNode, (node) => {
    const showBrackets = !props.root;
    const children2 = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ViewingAstBuilderNode2,
        {
          path: `${props.path}.children.0`,
          node: node.children[0],
          validation: props.validation
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingOperator, { operator: node.name })
    ] });
    const wrappedChildren = showBrackets ? /* @__PURE__ */ jsxRuntimeExports.jsx(Brackets, { children: children2 }) : children2;
    return props.root ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex flex-row flex-wrap items-center gap-sm", children: wrappedChildren }) : wrappedChildren;
  }).when(isKnownOperandAstNode, (node) => {
    const directEvaluation = props.validation.evaluation.find((e2) => e2.nodeId === node.id);
    const hasDirectError = !!directEvaluation?.errors.length;
    const returnValue = formatReturnValue(directEvaluation?.returnValue, {
      t: t2,
      language
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ViewingAstBuilderOperand,
      {
        node,
        validationStatus: hasDirectError ? "error" : "valid",
        returnValue
      }
    );
  }).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(NodeTypeError, {}));
  return children;
});
ViewingAstBuilderNode.displayName = "ViewingAstBuilderNode";
function Brackets({ children }) {
  const className = "text-grey-primary border-grey-border [.group/nest:hover:not(:has(.group/nest:hover))_>_&]:bg-grey-background [.group/nest:hover:not(:has(.group/nest:hover))_>_&]:border-grey-placeholder flex h-10 items-center justify-center rounded border px-xs";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/nest contents", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className, children: "(" }),
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className, children: ")" })
  ] });
}
function ViewingAstBuilderAndRoot(props) {
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const validation = reactExports.useMemo(() => props.validation ?? { errors: [], evaluation: [] }, [props.validation]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm lg:gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s bg-grey-background-light text-purple-primary col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-xs rounded-sm p-sm font-semibold", children: dataSharp.value.data.$triggerObjectType }),
      props.node.children.map((child, i2, children) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          ViewingRootAndLine,
          {
            isFirst: i2 === 0,
            isLast: i2 === children.length - 1,
            path: `root.children.${i2}`,
            node: child,
            validation
          },
          child.id
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row flex-wrap gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingEvaluationErrors, { direct: true, id: props.node.id, evaluation: validation.evaluation }) })
  ] });
}
function ViewingRootAndLine({ isFirst, isLast, path, validation, node }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("border-grey-border col-span-5 w-2 border-e", isFirst ? "h-4" : "h-2") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("border-grey-border col-start-1 border-e", isLast && "h-5") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border col-start-2 h-5 border-b" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: isFirst ? "where" : "and", className: "col-start-3", type: "contained" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("col-span-2 col-start-4 flex flex-col gap-sm px-xs"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderNode, { path, node, validation, root: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingEvaluationErrors, { id: node.id, evaluation: validation.evaluation })
    ] })
  ] });
}
function ViewingAstBuilderOrWithAndRoot(props) {
  const validation = reactExports.useMemo(() => props.validation ?? { errors: [], evaluation: [] }, [props.validation]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_max-content] gap-sm", children: [
    props.node.children.map((child, i2) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ViewingRootOrGroup,
        {
          isFirst: i2 === 0,
          path: `root.children.${i2}`,
          node: child,
          validation
        },
        child.id
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingEvaluationErrors, { direct: true, id: props.node.id, evaluation: validation.evaluation, className: "col-span-3" })
  ] });
}
function ViewingRootOrGroup({ isFirst, path, node, validation }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    !isFirst ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: "or", className: "uppercase", type: "contained" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex flex-1 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px w-full" }) })
    ] }) : null,
    node.children.map((child, i2) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ViewingRootOrWithAndLine,
        {
          isFirst: i2 === 0,
          path: `${path}.children.${i2}`,
          node: child,
          validation
        },
        child.id
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ViewingEvaluationErrors,
      {
        direct: true,
        id: node.id,
        evaluation: validation.evaluation,
        className: "col-span-2 col-start-2"
      }
    )
  ] });
}
function ViewingRootOrWithAndLine({ isFirst, path, node, validation }) {
  const { t: t2 } = useTranslation(["common"]);
  const showValues = AstBuilderDataSharpFactory.select((s) => s.showValues);
  const directEvaluation = validation.evaluation.find((e2) => e2.nodeId === node.id);
  let rightComponent = null;
  if (showValues && directEvaluation) {
    const hasDirectError = directEvaluation.errors.length ?? 0 > 0;
    const isOmitted = directEvaluation.returnValue.isOmitted;
    if (!hasDirectError && !isOmitted) {
      const adaptedValue = adaptBooleanOrNullReturnValue(directEvaluation.returnValue);
      if (adaptedValue.isBooleanOrNull) {
        const { value } = adaptedValue;
        const tKey = value === null ? "null" : value;
        let color = "red";
        if (directEvaluation.skipped) {
          color = "grey";
        } else if (value === null) {
          color = "orange";
        } else if (value) {
          color = "green";
        }
        rightComponent = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-full", color, children: t2(`common:${directEvaluation.skipped ? "skipped" : tKey}`) }) });
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogicalOperatorLabel, { operator: isFirst ? "if" : "and", type: "text" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("flex flex-col gap-sm", rightComponent === null && "col-span-2"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderNode, { root: true, path, node, validation }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingEvaluationErrors, { id: node.id, evaluation: validation.evaluation })
    ] }),
    rightComponent
  ] });
}
function AstBuilderRoot({ node: _node, ...props }) {
  return M(_node).when(isAndAstNode, (node) => /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderAndRoot, { ...props, node })).when(isOrWithAndAstNode, (node) => /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderOrWithAndRoot, { ...props, node })).otherwise((node) => /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilderAnyRoot, { ...props, node }));
}
function AstBuilderAnyRoot(props) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderAnyRoot, { ...props }) : "view mode not supported yet!";
}
function AstBuilderOrWithAndRoot(props) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderOrWithAndRoot, { ...props }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderOrWithAndRoot, { ...props });
}
function AstBuilderAndRoot(props) {
  const builderMode = AstBuilderDataSharpFactory.select((s) => s.mode);
  return builderMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EditionAstBuilderAndRoot, { ...props }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ViewingAstBuilderAndRoot, { ...props });
}
const AstBuilder = {
  Root: AstBuilderRoot,
  Operand: AstBuilderOperand,
  Provider: AstBuilderProvider,
  StaticProvider: AstBuilderStaticProvider
};
export {
  AstBuilderNodeSharpFactory as A,
  AggregationEditContent as a,
  AstBuilder as b,
  getDataAccessorDisplayName as c,
  getAstNodeDisplayName as g,
  t,
  useRoot as u
};
