import { type AstNode, isUndefinedAstNode } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { type TFunction } from 'i18next';
import { match } from 'ts-pattern';
import { type z } from 'zod/v4';

type ScreeningEntityType = 'Person' | 'Organization' | 'Vehicle' | 'Thing';

/** Section-level targets for red card highlighting on the screening edit page. */
export type ScreeningValidationSectionId = 'trigger' | 'counterparty' | 'matchSettings' | 'datasets';

/**
 * Where a validation issue applies in the screening edit UI.
 * - `field`: TanStack form field path (e.g. `name`, `query.name`)
 * - `section`: card/region (trigger, match settings, etc.)
 */
export type ScreeningValidationSource =
  | { type: 'field'; field: string }
  | { type: 'section'; section: ScreeningValidationSectionId };

export type ScreeningValidationIssue = {
  message: string;
  source: ScreeningValidationSource;
};

const SCREENING_QUERY_FIELD_LABEL_KEYS: Record<string, string> = {
  name: 'scenarios:screening.filter.name',
  birthDate: 'scenarios:edit_sanction.birthdate',
  nationality: 'scenarios:edit_sanction.nationality',
  passportNumber: 'scenarios:edit_sanction.passport_number',
  address: 'scenarios:edit_sanction.address',
  country: 'scenarios:edit_sanction.country',
  registrationNumber: 'scenarios:edit_sanction.registrationnumber',
};

export function getScreeningQueryFieldLabel(fieldKey: string, t: TFunction): string {
  const labelKey = SCREENING_QUERY_FIELD_LABEL_KEYS[fieldKey];
  return labelKey ? t(labelKey) : fieldKey;
}

export function screeningValidationSourceKey(source: ScreeningValidationSource): string {
  return source.type === 'field' ? `field:${source.field}` : `section:${source.section}`;
}

export function issueDedupeKey(issue: ScreeningValidationIssue): string {
  return `${screeningValidationSourceKey(issue.source)}|${issue.message}`;
}

export function mergeScreeningValidationIssues(...groups: ScreeningValidationIssue[][]): ScreeningValidationIssue[] {
  const seen = new Set<string>();
  const merged: ScreeningValidationIssue[] = [];
  for (const group of groups) {
    for (const issue of group) {
      const key = issueDedupeKey(issue);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(issue);
    }
  }
  return merged;
}

export function screeningFieldHasError(issues: ScreeningValidationIssue[], field: string): boolean {
  return issues.some((issue) => issue.source.type === 'field' && issue.source.field === field);
}

export function screeningSectionHasError(
  issues: ScreeningValidationIssue[],
  section: ScreeningValidationSectionId,
): boolean {
  return issues.some((issue) => {
    if (issue.source.type === 'section' && issue.source.section === section) {
      return true;
    }
    if (section === 'matchSettings' && issue.source.type === 'field' && issue.source.field.startsWith('query.')) {
      return true;
    }
    return false;
  });
}

function formFieldPathFromZodPath(path: PropertyKey[]): string | undefined {
  if (path.length === 0) {
    return undefined;
  }
  return path.map(String).join('.');
}

export function isQueryFieldFilled(node: unknown): boolean {
  if (node == null) {
    return false;
  }
  if (!isAstNodeLike(node)) {
    return false;
  }
  if (isUndefinedAstNode(node)) {
    return false;
  }
  if (isStringConcatAstNode(node)) {
    const children = node.children ?? [];
    if (children.length === 0) {
      return false;
    }
    return children.some((child) => isQueryFieldFilled(child));
  }
  return true;
}

function isAstNodeLike(node: unknown): node is AstNode {
  return typeof node === 'object' && node !== null && 'name' in node;
}

export function hasAnyFilledQueryField(query: Record<string, unknown>): boolean {
  return Object.values(query).some((node) => isQueryFieldFilled(node));
}

export function hasRequiredScreeningCriteria(
  entityType: 'Person' | 'Organization' | 'Vehicle' | 'Thing' | undefined,
  query: Record<string, unknown>,
): boolean {
  return match(entityType)
    .with('Organization', () => isQueryFieldFilled(query['name']) || isQueryFieldFilled(query['registrationNumber']))
    .with('Vehicle', () => isQueryFieldFilled(query['name']) || isQueryFieldFilled(query['registrationNumber']))
    .with('Person', () => isQueryFieldFilled(query['name']) || isQueryFieldFilled(query['passportNumber']))
    .with('Thing', () => isQueryFieldFilled(query['name']))
    .otherwise(() => true);
}

export function collectFormValidationIssues<
  T extends {
    name: string;
    entityType?: ScreeningEntityType;
    query: Record<string, unknown>;
  },
>(values: T, schema: z.ZodType<T>, t: TFunction): ScreeningValidationIssue[] {
  const issues: ScreeningValidationIssue[] = [];
  const parseResult = schema.safeParse(values);

  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      if (issue.path[0] === 'name') {
        issues.push({
          message: t('scenarios:edit_screening.name_required'),
          source: { type: 'field', field: 'name' },
        });
      } else {
        const field = formFieldPathFromZodPath(issue.path);
        if (field) {
          issues.push({
            message: issue.message,
            source: { type: 'field', field },
          });
        } else if (issue.message) {
          issues.push({
            message: issue.message,
            source: { type: 'section', section: 'matchSettings' },
          });
        }
      }
    }
  }

  if (!hasRequiredScreeningCriteria(values.entityType, values.query)) {
    issues.push({
      message: `${t('scenarios:sanction.match_settings.title')}: ${t('scenarios:edit_sanction.required_fields_error')}`,
      source: { type: 'section', section: 'matchSettings' },
    });
  }

  return issues;
}

/** @deprecated Prefer {@link collectFormValidationIssues} for highlight support. */
export function collectFormValidationMessages<
  T extends {
    name: string;
    entityType?: ScreeningEntityType;
    query: Record<string, unknown>;
  },
>(values: T, schema: z.ZodType<T>, t: TFunction): string[] {
  return collectFormValidationIssues(values, schema, t).map((issue) => issue.message);
}
