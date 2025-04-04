import { Callout } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand, Modal } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  suspicion: z.enum(['none', 'requested', 'reported']),
  caseId: z.string(),
});

type EditSuspicionForm = z.infer<typeof schema>;

const getSuspicionIconAndText = (suspicion: EditSuspicionForm['suspicion']) => (
  <span className="inline-flex w-full items-center gap-2">
    <Icon
      icon={match<EditSuspicionForm['suspicion'], IconName>(suspicion)
        .with('none', () => 'empty-flag')
        .with('requested', () => 'half-flag')
        .with('reported', () => 'full-flag')
        .exhaustive()}
      className={cn('size-5', {
        'text-grey-50': suspicion === 'none',
        'text-yellow-50': suspicion === 'requested',
        'text-red-47': suspicion === 'reported',
      })}
    />
    <span className="text-s font-medium">
      {match(suspicion)
        .with('none', () => 'None')
        .with('requested', () => 'Request a Suspicious Activity Report')
        .with('reported', () => 'Suspicious Activity report submitted')
        .exhaustive()}
    </span>
  </span>
);

export const EditCaseSuspicion = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);

  const form = useForm({
    defaultValues: { caseId: id, suspicion: 'none' } as EditSuspicionForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => console.log('Should upload those files', files),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/*': ['.csv', '.txt'],
    },
    multiple: false,
    maxSize: 1024 * 1024 * 5, // 5MB
  });

  return (
    <form.Field name="suspicion">
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {getSuspicionIconAndText(field.state.value)}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button className="w-fit p-0.5" variant="secondary" size="icon">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content className="mt-2 min-w-[400px]">
                <MenuCommand.List>
                  {(['none', 'requested', 'reported'] as const).map((suspicion) => (
                    <MenuCommand.Item
                      key={suspicion}
                      className="cursor-pointer"
                      onSelect={() => {
                        if (suspicion === 'none' || suspicion === 'requested') {
                          field.handleChange(suspicion);
                          form.handleSubmit();
                        } else {
                          setOpenReportModal(true);
                        }
                      }}
                    >
                      <span className="inline-flex w-full justify-between">
                        {getSuspicionIconAndText(suspicion)}
                        {suspicion === field.state.value ? (
                          <Icon icon="tick" className="text-purple-65 size-6" />
                        ) : null}
                      </span>
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          <Modal.Root open={openReportModal} onOpenChange={setOpenReportModal}>
            <Modal.Content>
              <Modal.Title>Suspicious activity report submitted</Modal.Title>
              <div className="flex flex-col gap-8 p-8">
                <Callout>Please add the suspicious transaction report document below.</Callout>
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-6',
                    isDragActive ? 'bg-purple-96 border-purple-82 opacity-90' : 'border-grey-50',
                  )}
                >
                  <input {...getInputProps()} />
                  <p className="text-r flex flex-col gap-6 text-center">
                    <span className="text-grey-00">Drop your suspicious activity report here.</span>
                    <span className="text-grey-50 inline-flex flex-col">
                      <span>The following extensions are supported:</span>
                      <span>jpg, png, pdf, zip, doc, docx, xls, xIsx</span>
                    </span>
                  </p>
                  <span className="text-grey-50 text-r">or</span>
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    Pick a file
                  </Button>
                </div>
                <form className="flex w-full flex-row gap-2" onSubmit={handleSubmit(form)}>
                  <Button
                    variant="secondary"
                    type="button"
                    className="flex-1 first-letter:capitalize"
                    onClick={() => {
                      field.handleChange('reported');
                      setOpenReportModal(false);
                    }}
                  >
                    I&apos;ll add it later
                  </Button>

                  <Button type="submit" className="flex-1 first-letter:capitalize">
                    Add a file
                  </Button>
                </form>
              </div>
            </Modal.Content>
          </Modal.Root>
        </div>
      )}
    </form.Field>
  );
};
