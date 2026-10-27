import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinPathStep } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OptionPicker, type PickerOption } from './OptionPicker';
import {
  getStepStatus,
  listAvailableHops,
  TRACFIN_MAX_PATH_STEPS,
  type TracfinPathHop,
  type TracfinStepStatus,
} from './path-hops';

const hopKey = (hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) =>
  `${hop.direction}|${hop.link}|${hop.table}`;

type PathEditorProps = {
  dataModel: DataModel;
  rootTable: string;
  path: readonly TracfinPathStep[];
  onChooseHop: (index: number, hop: Pick<TracfinPathHop, 'link' | 'direction' | 'table'>) => void;
  onRemoveFrom: (index: number) => void;
};

/**
 * The ordered jumps from the root table to the table the source field belongs to. Each step picks one
 * of the hops the data model offers from the previous table, in words: which link, towards the parent
 * or towards the children, and which table it leads to.
 */
export function PathEditor({ dataModel, rootTable, path, onChooseHop, onRemoveFrom }: PathEditorProps) {
  const { t } = useTranslation(['tracfin']);

  const directionWords = {
    forward: t('tracfin:settings.mapping.path.direction.forward'),
    inverse: t('tracfin:settings.mapping.path.direction.inverse'),
  } as const;

  const toOption = (hop: TracfinPathHop): PickerOption => ({
    value: hopKey(hop),
    label: `${hop.link} → ${hop.table}`,
    hint: hop.indexed
      ? directionWords[hop.direction]
      : `${directionWords[hop.direction]} · ${t('tracfin:settings.mapping.path.not_indexed')}`,
  });

  const statusTag = (status: TracfinStepStatus) => {
    if (status === 'not_indexed') {
      return (
        <Tag size="small" color="orange" title={t('tracfin:settings.mapping.path.not_indexed_help')}>
          <Icon icon="warning" className="size-3" aria-hidden />
          {t('tracfin:settings.mapping.path.not_indexed')}
        </Tag>
      );
    }
    if (status === 'unknown_link') {
      return (
        <Tag size="small" color="red">
          {t('tracfin:settings.mapping.path.unknown_link')}
        </Tag>
      );
    }
    return null;
  };

  const lastTable = path.at(-1)?.table ?? rootTable;
  const nextHops = listAvailableHops(dataModel, lastTable);

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s font-medium">{t('tracfin:settings.mapping.path.title')}</p>
      <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.path.description')}</p>

      <ol className="flex flex-col gap-sm">
        {path.map((step, index) => {
          const fromTable = index === 0 ? rootTable : (path[index - 1]?.table ?? rootTable);
          const hops = listAvailableHops(dataModel, fromTable);
          const options = hops.map(toOption);
          const current = hopKey({ link: step.link ?? '', direction: step.direction ?? 'forward', table: step.table });
          if (!options.some((option) => option.value === current)) {
            options.unshift({ value: current, label: `${step.link ?? '?'} → ${step.table}` });
          }
          const status =
            step.link && step.direction ? getStepStatus(dataModel, fromTable, step) : ('unknown_link' as const);

          return (
            <li key={`${index}-${step.id}`} className="flex flex-wrap items-center gap-xs">
              <span className="text-s text-grey-secondary w-16 shrink-0">
                {t('tracfin:settings.mapping.path.step', { number: index + 1 })}
              </span>
              <OptionPicker
                value={current}
                options={options}
                onChange={(key) => {
                  const hop = hops.find((candidate) => hopKey(candidate) === key);
                  if (hop) onChooseHop(index, hop);
                }}
                ariaLabel={t('tracfin:settings.mapping.path.step_aria', { number: index + 1 })}
                placeholder={t('tracfin:settings.mapping.path.choose_hop')}
                searchPlaceholder={t('tracfin:settings.mapping.path.search_hop')}
                emptyLabel={t('tracfin:settings.mapping.path.no_hop')}
                hasError={status === 'unknown_link'}
                className="min-w-48 flex-1"
              />
              {step.direction ? (
                <Tag size="small" color="grey">
                  {directionWords[step.direction]}
                </Tag>
              ) : null}
              {statusTag(status)}
              <Button
                variant="secondary"
                appearance="link"
                mode="icon"
                aria-label={t('tracfin:settings.mapping.path.remove_step', { number: index + 1 })}
                onClick={() => onRemoveFrom(index)}
              >
                <Icon icon="delete" className="size-4" />
              </Button>
            </li>
          );
        })}
      </ol>

      {path.length >= TRACFIN_MAX_PATH_STEPS ? (
        <p className="text-grey-secondary text-xs">
          {t('tracfin:settings.mapping.path.max_reached', { max: TRACFIN_MAX_PATH_STEPS })}
        </p>
      ) : nextHops.length === 0 ? (
        <p className="text-grey-secondary text-xs">
          {t('tracfin:settings.mapping.path.no_hop_from', { table: lastTable })}
        </p>
      ) : (
        <OptionPicker
          value={undefined}
          options={nextHops.map(toOption)}
          onChange={(key) => {
            const hop = nextHops.find((candidate) => hopKey(candidate) === key);
            if (hop) onChooseHop(path.length, hop);
          }}
          ariaLabel={t('tracfin:settings.mapping.path.add_step_aria', { table: lastTable })}
          placeholder={t('tracfin:settings.mapping.path.add_step', { table: lastTable })}
          searchPlaceholder={t('tracfin:settings.mapping.path.search_hop')}
          emptyLabel={t('tracfin:settings.mapping.path.no_hop')}
          className="max-w-md"
        />
      )}
    </div>
  );
}
