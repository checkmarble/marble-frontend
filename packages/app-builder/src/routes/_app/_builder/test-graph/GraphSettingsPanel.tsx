import { Checkbox, type CheckedState, MenuCommand, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  GRAPH_ATTRIBUTE_LABELS,
  GRAPH_ATTRIBUTES,
  type GraphAttribute,
  useCustomerGraph,
} from './CustomerGraphContext';

const EVENT_FILTER_LABELS = {
  all: 'All events',
  none: 'No events',
} as const;

function attributesLabel(attributes: GraphAttribute[]): string {
  if (attributes.length === 0) return 'Attributes: none';
  if (attributes.length === GRAPH_ATTRIBUTES.length) {
    return `Attributes: ${GRAPH_ATTRIBUTES.map((a) => GRAPH_ATTRIBUTE_LABELS[a]).join(', ')}`;
  }
  return `Attributes: ${attributes.map((a) => GRAPH_ATTRIBUTE_LABELS[a]).join(', ')}`;
}

function asBoolean(value: CheckedState): boolean {
  return value === true;
}

export function GraphSettingsPanel() {
  const {
    showPersons,
    setShowPersons,
    showCompanies,
    setShowCompanies,
    eventFilter,
    setEventFilter,
    attributes,
    toggleAttribute,
    showRiskScore,
    setShowRiskScore,
    showTags,
    setShowTags,
    selectedNodeId,
  } = useCustomerGraph();

  return (
    <aside className="border-grey-border bg-grey-white flex w-full shrink-0 flex-col gap-md rounded-lg border p-md lg:w-80">
      <div className="flex flex-wrap items-center gap-md">
        <label htmlFor="filter-persons" className="flex cursor-pointer items-center gap-sm text-sm">
          <Checkbox
            id="filter-persons"
            size="small"
            checked={showPersons}
            onCheckedChange={(v) => setShowPersons(asBoolean(v))}
          />
          Persons
        </label>
        <label htmlFor="filter-companies" className="flex cursor-pointer items-center gap-sm text-sm">
          <Checkbox
            id="filter-companies"
            size="small"
            checked={showCompanies}
            onCheckedChange={(v) => setShowCompanies(asBoolean(v))}
          />
          Companies
        </label>
      </div>

      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="w-full" size="small">
            {EVENT_FILTER_LABELS[eventFilter]}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4}>
          <MenuCommand.List>
            {(Object.keys(EVENT_FILTER_LABELS) as Array<keyof typeof EVENT_FILTER_LABELS>).map((value) => (
              <MenuCommand.Item key={value} value={value} onSelect={() => setEventFilter(value)}>
                {EVENT_FILTER_LABELS[value]}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="w-full" size="small">
            {attributesLabel(attributes)}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth align="start" sideOffset={4}>
          <MenuCommand.List>
            {GRAPH_ATTRIBUTES.map((attribute) => {
              const checked = attributes.includes(attribute);
              return (
                <MenuCommand.Item
                  key={attribute}
                  value={attribute}
                  className="flex items-center gap-sm"
                  onSelect={() => toggleAttribute(attribute)}
                >
                  <label htmlFor={attribute} className="flex cursor-pointer items-center gap-sm text-sm">
                    <Checkbox id={attribute} size="small" checked={checked} />
                    {GRAPH_ATTRIBUTE_LABELS[attribute]}
                  </label>
                </MenuCommand.Item>
              );
            })}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      <div className="border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-md border p-md">
        {selectedNodeId ? (
          <>
            <div className="flex flex-wrap items-center gap-sm">
              <span className="text-purple-primary text-sm font-semibold">{selectedNodeId}</span>
              {showRiskScore ? (
                <span className="border-green-border text-green-primary bg-green-background-light inline-flex items-center gap-xs rounded-full border px-sm py-px text-xs">
                  <span className="bg-green-primary size-1.5 rounded-full" />
                  Risque <strong>faible</strong>
                </span>
              ) : null}
            </div>
            {showTags ? (
              <div className="flex flex-wrap items-center gap-xs">
                <Tag size="small" color="purple">
                  Custom lorem
                </Tag>
                <button
                  type="button"
                  className="border-purple-border text-purple-primary flex size-6 items-center justify-center rounded-full border"
                  aria-label="Add tag"
                >
                  <Icon icon="plus" className="size-3" />
                </button>
              </div>
            ) : null}
            <dl className="flex flex-col gap-xs text-xs">
              <div className="flex items-center justify-between gap-sm">
                <dt className="text-grey-secondary">Account ID</dt>
                <dd className="border-grey-border bg-grey-white rounded-sm border px-sm py-px font-mono">01010101</dd>
              </div>
              <div className="flex items-center justify-between gap-sm">
                <dt className="text-grey-secondary">Company nb</dt>
                <dd className="border-grey-border bg-grey-white rounded-sm border px-sm py-px font-mono">
                  0101010100101
                </dd>
              </div>
              <div className="flex items-center justify-between gap-sm">
                <dt className="text-grey-secondary">Updated at</dt>
                <dd>01-01-2026</dd>
              </div>
            </dl>
            <textarea
              className="border-grey-border bg-grey-white text-grey-primary placeholder:text-grey-placeholder min-h-16 w-full resize-none rounded-md border px-sm py-xs text-xs outline-none"
              placeholder="Write comment..."
            />
          </>
        ) : (
          <p className="text-grey-secondary text-xs">Select a node to see details.</p>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-risk-score" className="text-grey-primary cursor-pointer text-sm">
            Show risk score
          </label>
          <Switch id="show-risk-score" checked={showRiskScore} onCheckedChange={setShowRiskScore} />
        </div>
        <div className="flex items-center justify-between gap-sm">
          <label htmlFor="show-tags" className="text-grey-primary cursor-pointer text-sm">
            Show tags
          </label>
          <Switch id="show-tags" checked={showTags} onCheckedChange={setShowTags} />
        </div>
      </div>
    </aside>
  );
}
