import { Tabs, tabClassName } from '@bo/components/common/Tabs';
import { importOrganization } from '@bo/data/organization';
import { OrgImportSpec } from '@bo/schemas/org-import';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, PanelSharpFactory } from 'ui-design-system';

export const ImportFlow = ({ data }: { data: OrgImportSpec }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const importOrgMutation = useMutation(importOrganization());
  const handleImport = () => {
    importOrgMutation.mutateAsync(data).then(() => {
      panelSharp.actions.close();
    });
  };

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="flex flex-col gap-v2-sm">
        <h2 className="text-h2 font-semibold">Organization settings</h2>
        <div className="grid grid-cols-[auto_1fr] gap-x-v2-lg gap-y-v2-xs border border-grey-border rounded-v2-md p-v2-md">
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
      <div className="flex flex-col gap-v2-sm">
        <h2 className="text-h2 font-semibold">Admins</h2>
        <div className="grid grid-cols-[1fr_2fr] border border-grey-border rounded-v2-md">
          <div className="grid grid-cols-subgrid col-span-full not-last:border-b border-grey-border">
            <div className="p-v2-md">Name</div>
            <div className="p-v2-md">Email</div>
          </div>
          {data.admins.map((admin) => (
            <div key={admin.email} className="grid grid-cols-subgrid col-span-full border-grey-border">
              <div className="p-v2-md">
                {admin.first_name} {admin.last_name}
              </div>
              <div className="p-v2-md">{admin.email}</div>
            </div>
          ))}
        </div>
      </div>
      <DataModelRecap data={data} />
      {data.seeds ? <div>There is seeding information in your import file.</div> : null}
      <div>
        <Button onClick={handleImport}>Import</Button>
      </div>
    </div>
  );
};

const DataModelRecap = ({ data }: { data: OrgImportSpec }) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(data.data_model.tables[0]?.name);
  const currentTable = data.data_model.tables.find((table) => table.name === activeTab);

  return (
    <div className="flex flex-col gap-v2-sm">
      <h2 className="text-h2 font-semibold flex items-baseline gap-v2-sm">
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
        <div className="grid grid-cols-[1fr_1fr_1fr] border border-grey-border rounded-v2-md">
          <div className="grid grid-cols-subgrid col-span-full not-last:border-b border-grey-border">
            <div className="p-v2-md">Name</div>
            <div className="p-v2-md">Description</div>
            <div className="p-v2-md">Type</div>
          </div>
          {Object.entries(currentTable.fields).map(([key, field]) => (
            <div key={key} className="grid grid-cols-subgrid col-span-full">
              <div className="p-v2-md">{key}</div>
              <div className="p-v2-md">{field.description}</div>
              <div className="p-v2-md">{field.data_type}</div>
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
        <div className="p-v2-md">Links</div>
      </div>
      {linksForTable.map((link) => (
        <div key={link.id} className="grid grid-cols-subgrid col-span-full">
          <div className="p-v2-md">
            {link.parent_table_name} → {link.child_table_name}
          </div>
        </div>
      ))}
    </>
  );
};
