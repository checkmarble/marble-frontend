import { type AstNode, isUndefinedAstNode } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { type TFunction } from 'i18next';

type ScreeningEntityType = 'Person' | 'Organization' | 'Vehicle' | 'Thing';

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

import { match } from 'ts-pattern';
import { type z } from 'zod/v4';

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

export function collectFormValidationMessages<
  T extends {
    name: string;
    entityType?: ScreeningEntityType;
    query: Record<string, unknown>;
  },
>(values: T, schema: z.ZodType<T>, t: TFunction): string[] {
  const messages = new Set<string>();
  const parseResult = schema.safeParse(values);

  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      if (issue.path[0] === 'name') {
        messages.add(t('scenarios:edit_screening.name_required'));
      } else if (issue.message) {
        messages.add(issue.message);
      }
    }
  }

  if (!hasRequiredScreeningCriteria(values.entityType, values.query)) {
    messages.add(
      `${t('scenarios:sanction.match_settings.title')}: ${t('scenarios:edit_sanction.required_fields_error')}`,
    );
  }

  return [...messages];
}
