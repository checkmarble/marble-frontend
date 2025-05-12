import type { ConstantType } from '@app-builder/models';
import { formatDateTime, formatNumber } from '@app-builder/utils/format';
import { dateTimeDataTypeSchema } from '@app-builder/utils/schema/dataTypeSchema';
import type { TFunction } from 'i18next';
import * as R from 'remeda';

export function formatConstant(
  constant: ConstantType,
  context: {
    t: TFunction<['common', 'scenarios'], undefined>;
    language: string;
  },
): string {
  if (R.isNullish(constant)) return 'NULL';

  if (R.isArray(constant)) {
    return `[${constant.map((constant) => formatConstant(constant, context)).join(', ')}]`;
  }

  if (R.isString(constant)) {
    const parsedConstant = dateTimeDataTypeSchema.safeParse(constant);
    if (parsedConstant.success) {
      return formatDateTime(parsedConstant.data, {
        language: context.language,
      });
    }

    return `"${constant.toString()}"`;
  }

  if (R.isNumber(constant)) {
    return formatNumber(constant, {
      language: context.language,
      maximumFractionDigits: 2,
    });
  }

  if (R.isBoolean(constant)) {
    return context.t(`common:${constant}`);
  }

  // Handle other cases when needed
  return JSON.stringify(R.mapValues(constant, (constant) => formatConstant(constant, context)));
}
