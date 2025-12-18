import { createEmptyOrganization } from '@bo/data/organization';
import { orgImportSpecSchema } from '@bo/schemas/org-import';
import { createEmptyOrganizationFnInputSchema } from '@bo/server-fns/organization';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone-esm';
import { Button, Input, MenuCommand, PanelSharpFactory } from 'ui-design-system';
import { OrganizationCreationFlow } from './types';

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ChoiceStep = ({ onChooseFlow }: { onChooseFlow: (flow: OrganizationCreationFlow) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }
      const text = await file.text();
      const data = JSON.parse(text);

      const parsedJson = orgImportSpecSchema.safeParse(data);

      if (parsedJson.success) {
        onChooseFlow({ type: 'import', data: parsedJson.data });
      } else {
        console.log(parsedJson.error);
      }
    },
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="flex flex-col gap-v2-md">
      <div
        {...getRootProps()}
        className="p-v2-md border border-dashed border-grey-border rounded-v2-md min-h-50 flex items-center justify-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop your file here</p> : <p>Upload an import file</p>}
      </div>
      <div className="flex gap-v2-sm items-center">
        <div className="h-px flex-1 bg-grey-border" />
        <span>or with a template</span>
        <div className="h-px flex-1 bg-grey-border" />
      </div>
      <div className="flex flex-col gap-v2-sm">
        <h2 className="text-h2">Select a template</h2>
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton></MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="start" sameWidth sideOffset={4}>
            <MenuCommand.List>
              <MenuCommand.Item>Template 1</MenuCommand.Item>
              <MenuCommand.Item>Template 2</MenuCommand.Item>
              <MenuCommand.Item>Template 3</MenuCommand.Item>
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
      <div className="flex gap-v2-sm items-center">
        <div className="h-px flex-1 bg-grey-border" />
        <span>or create an empty organization</span>
        <div className="h-px flex-1 bg-grey-border" />
      </div>
      <EmptyOrgForm />
    </div>
  );
};

const EmptyOrgForm = () => {
  const panelSharp = PanelSharpFactory.useSharp();
  const createEmptyOrganizationMutation = useMutation(createEmptyOrganization());

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: createEmptyOrganizationFnInputSchema,
      onChange: createEmptyOrganizationFnInputSchema,
      onMount: createEmptyOrganizationFnInputSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createEmptyOrganizationMutation.mutateAsync(value);
      panelSharp.actions.close();
    },
  });

  return (
    <form
      className="flex gap-v2-md"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="grow" />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => (
          <Button size="default" type="submit" disabled={!canSubmit || createEmptyOrganizationMutation.isPending}>
            Create empty organization
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
