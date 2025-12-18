import { importOrganization } from '@bo/data/organization';
import { OrgImportSpec } from '@bo/schemas/org-import';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Checkbox, Panel, PanelSharpFactory, Tabs, tabClassName } from 'ui-design-system';

export const ImportFlow = ({ data }: { data: OrgImportSpec }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const importOrgMutation = useMutation(importOrganization());
  const handleImport = () => {
    importOrgMutation.mutateAsync(data).then(() => {
      panelSharp.actions.close();
    });
  };

  return (
    <>
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-sm">
          <h2 className="text-h2 font-semibold">Organization settings</h2>
          <div className="grid grid-cols-[auto_1fr] gap-x-lg gap-y-xs border border-grey-border rounded-md p-md">
            <span>Name</span>
            <span>{data.org.name}</span>
            <span>Default scenario timezone</span>
            <span>{data.org.default_scenario_timezone}</span>
            <span>Sanctions threshold</span>
            <span>{data.org.sanctions_threshold}</span>
            <span>Sanctions limit</span>
            <span>{data.org.sanctions_limit}</span>
          </div>
        </div>
        <div className="flex flex-col gap-sm">
          <h2 className="text-h2 font-semibold">Admins</h2>
          <div className="grid grid-cols-[1fr_2fr] border border-grey-border rounded-md">
            <div className="grid grid-cols-subgrid col-span-full not-last:border-b border-grey-border">
              <div className="p-md">Name</div>
              <div className="p-md">Email</div>
            </div>
            {data.admins.map((admin) => (
              <div key={admin.email} className="grid grid-cols-subgrid col-span-full border-grey-border">
                <div className="p-md">
                  {admin.first_name} {admin.last_name}
                </div>
                <div className="p-md">{admin.email}</div>
              </div>
            ))}
          </div>
        </div>
        <DataModelRecap data={data} />
        {data.seeds ? <SeedingSection spec={data.seeds} /> : null}
      </div>
      <Panel.Footer>
        <Panel.FooterButton label="Import" onClick={handleImport} />
      </Panel.Footer>
    </>
  );
};

const SeedingSection = ({ spec }: { spec: NonNullable<OrgImportSpec['seeds']> }) => {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">Seeding</h2>
        <label className="flex gap-xs items-center">
          Activate auto seeding <Checkbox size="small" />
        </label>
      </div>
      <div className="border border-blue-58 rounded-md p-md flex flex-col gap-sm">
        <span>Activating the seeding will create:</span>
        <div className="pl-lg">
          {Object.entries(spec.ingestion).map(([table, data]) => (
            <div key={table}>
              {data.count} {table}
            </div>
          ))}
          {spec.decisions
            ? Object.entries(spec.decisions).map(([triggerType, count]) => (
                <div>
                  {count} {triggerType} decisions
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

const DataModelRecap = ({ data }: { data: OrgImportSpec }) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(data.data_model.tables[0]?.name);
  const currentTable = data.data_model.tables.find((table) => table.name === activeTab);

  return (
    <div className="flex flex-col gap-sm">
      <h2 className="text-h2 font-semibold flex items-baseline gap-sm">
        <span>Data model</span>
        <span className="text-default text-grey-placeholder font-normal">({data.data_model.tables.length} tables)</span>
      </h2>
      <Tabs>
        {data.data_model.tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setActiveTab(table.name)}
            className={tabClassName}
            data-status={activeTab === table.name ? 'active' : 'inactive'}
          >
            {table.name}
          </button>
        ))}
      </Tabs>
      {currentTable ? (
        <div className="grid grid-cols-[1fr_1fr_1fr] border border-grey-border rounded-md">
          <div className="grid grid-cols-subgrid col-span-full not-last:border-b border-grey-border">
            <div className="p-md">Name</div>
            <div className="p-md">Description</div>
            <div className="p-md">Type</div>
          </div>
          {Object.entries(currentTable.fields).map(([key, field]) => (
            <div key={key} className="grid grid-cols-subgrid col-span-full">
              <div className="p-md">{key}</div>
              <div className="p-md">{field.description}</div>
              <div className="p-md">{field.data_type}</div>
            </div>
          ))}
          <TableLinks data={data} currentTable={currentTable} />
        </div>
      ) : null}
    </div>
  );
};

type TableLinksProps = {
  data: OrgImportSpec;
  currentTable: OrgImportSpec['data_model']['tables'][number];
};

const TableLinks = ({ data, currentTable }: TableLinksProps) => {
  const linksForTable = data.data_model.links.filter(
    (link) => link.parent_table_name === currentTable.name || link.child_table_name === currentTable.name,
  );

  return (
    <>
      <div className="grid grid-cols-subgrid col-span-full border-y border-grey-border">
        <div className="p-md">Links</div>
      </div>
      {linksForTable.map((link) => (
        <div key={link.id} className="grid grid-cols-subgrid col-span-full">
          <div className="p-md">
            {link.parent_table_name} → {link.child_table_name}
          </div>
        </div>
      ))}
    </>
  );
};
