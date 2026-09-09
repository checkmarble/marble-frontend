import type { IdLessAstNode } from '@app-builder/models';
import {
  getValueSwitchCellKey,
  isValueSwitchModelComplete,
  parseValueSwitchAstNode,
  type ValueSwitchAstNode,
  type ValueSwitchDimension,
} from '@app-builder/models/astNode/value-switch';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { AstBuilderDataSharpFactory } from './Provider';
import { ValueSwitchValueTag } from './ValueSwitchValueTag';

const MAX_PREVIEW_VALUES = 6;

export function ValueSwitchDescription({ node }: { node: IdLessAstNode<ValueSwitchAstNode> }) {
  const { t } = useTranslation(['scenarios']);
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((state) => state.data);
  // Parsing only reads children and namedChildren; ids are irrelevant to the preview.
  const model = parseValueSwitchAstNode(node as ValueSwitchAstNode);
  if (!model || !isValueSwitchModelComplete(model)) return null;

  const [rowDimension, columnDimension] = model.dimensions;
  if (!rowDimension) return null;

  function dimensionLabel(dimension: ValueSwitchDimension) {
    return dimension.type === 'field'
      ? getDataAccessorDisplayName(dimension.field)
      : t('scenarios:value_switch.customer_risk_level');
  }

  function dimensionField(dimension: ValueSwitchDimension | null | undefined) {
    if (dimension?.type !== 'field') return undefined;
    try {
      return getDataAccessorAstNodeField(dimension.field, {
        dataModel: data.dataModel,
        triggerObjectTable: dataSharp.computed.triggerObjectTable.value,
      });
    } catch {
      // Older formulas can reference removed fields; their stored values still describe the mapping.
      return undefined;
    }
  }

  const rowField = dimensionField(rowDimension);
  const columnField = dimensionField(columnDimension);
  const rows = rowDimension.values.slice(0, MAX_PREVIEW_VALUES);
  const columns = columnDimension?.values.slice(0, MAX_PREVIEW_VALUES) ?? [];
  const omittedRows = rowDimension.values.length - rows.length;
  const omittedColumns = (columnDimension?.values.length ?? 0) - columns.length;
  const headerClassName = 'border-grey-border border-b p-sm text-start font-medium break-words';

  return (
    <div
      className="text-grey-secondary flex max-w-full flex-col gap-sm text-xs font-normal"
      style={{ width: `${columnDimension ? 12 + columns.length * 7 : 24}rem` }}
    >
      <div className="border-grey-border overflow-hidden rounded-md border">
        <table className="w-full table-fixed border-collapse">
          <thead>
            {columnDimension ? (
              <>
                <tr>
                  <th scope="col" rowSpan={2} className={cn(headerClassName, 'w-1/4')}>
                    {dimensionLabel(rowDimension)}
                  </th>
                  <th scope="colgroup" colSpan={columns.length} className={cn(headerClassName, 'text-center')}>
                    {dimensionLabel(columnDimension)}
                  </th>
                </tr>
                <tr>
                  {columns.map((value) => (
                    <th key={value} scope="col" className={headerClassName}>
                      <ValueSwitchValueTag
                        dimension={columnDimension}
                        value={value}
                        field={columnField}
                        className="max-w-full"
                      />
                    </th>
                  ))}
                </tr>
              </>
            ) : (
              <tr>
                <th scope="col" className={headerClassName}>
                  {t('scenarios:value_switch.if_value_is', { variable: dimensionLabel(rowDimension) })}
                </th>
                <th scope="col" className={headerClassName}>
                  {t('scenarios:value_switch.then_score')}
                </th>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.map((rowValue) => (
              <tr key={rowValue}>
                <th scope="row" className="overflow-hidden p-sm text-start font-normal">
                  <ValueSwitchValueTag
                    dimension={rowDimension}
                    value={rowValue}
                    field={rowField}
                    className="max-w-full"
                  />
                </th>
                {columnDimension ? (
                  columns.map((columnValue) => (
                    <td key={columnValue} className="p-sm text-center">
                      <ValueSwitchScore value={model.thresholds[getValueSwitchCellKey([rowValue, columnValue])]!} />
                    </td>
                  ))
                ) : (
                  <td className="p-sm">
                    <ValueSwitchScore value={model.thresholds[getValueSwitchCellKey([rowValue])]!} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {omittedRows > 0 ? <p>{t('scenarios:value_switch.preview_omitted_rows', { count: omittedRows })}</p> : null}
      {omittedColumns > 0 ? (
        <p>{t('scenarios:value_switch.preview_omitted_columns', { count: omittedColumns })}</p>
      ) : null}
      <div className="flex items-center gap-sm">
        <span>{t('scenarios:value_switch.else')}</span>
        <ValueSwitchScore value={model.fallback} />
      </div>
    </div>
  );
}

function ValueSwitchScore({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'font-medium tabular-nums break-all',
        value > 0 ? 'text-red-primary' : value < 0 ? 'text-green-primary' : 'text-grey-primary',
      )}
    >
      {value > 0 ? `+${value}` : String(value)}
    </span>
  );
}
