import { useDropzone } from 'react-dropzone-esm';
import { MenuCommand } from 'ui-design-system';
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

      onChooseFlow({ type: 'import', data });
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
      <div className="flex gap-v2-sm">
        <div className="h-px flex-1 bg-grey-border" />
        <span>or</span>
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
    </div>
  );
};
