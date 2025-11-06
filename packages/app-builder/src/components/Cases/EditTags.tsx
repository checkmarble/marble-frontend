import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { editTagsPayloadSchema, useEditTagsMutation } from '@app-builder/queries/cases/edit-tags';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useForm, useStore } from '@tanstack/react-form';
import { type Tag } from 'marble-api';
import { pick, toggle } from 'radash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isDeepEqual } from 'remeda';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type SimpleTag = Pick<Tag, 'color' | 'id' | 'name'>;

const TagPreview = ({ name }: { name: string }) => (
  <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
  </div>
);

export const EditCaseTags = ({ id, tagIds }: { id: string; tagIds: string[] }) => {
  const editTagsMutation = useEditTagsMutation();
  const revalidate = useLoaderRevalidator();
  const { orgTags } = useOrganizationTags();
  const { t } = useTranslation(casesI18n);

  const formattedTags = useMemo(
    () =>
      orgTags.reduce(
        (acc, curr) => {
          acc[curr.id] = pick(curr, ['color', 'id', 'name']);
          return acc;
        },
        {} as Record<string, SimpleTag>,
      ),
    [orgTags],
  );

  const form = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value).then((res) => {
        revalidate();
      });
    },
    defaultValues: {
      caseId: id,
      tagIds,
    },
    validators: {
      onSubmit: editTagsPayloadSchema,
    },
  });

  const ids = useStore(form.store, (state) => state.values.tagIds);

  return (
    <form.Field
      name="tagIds"
      validators={{
        onBlur: editTagsPayloadSchema.shape.tagIds,
        onChange: editTagsPayloadSchema.shape.tagIds,
      }}
    >
      {(field) => (
        <div className="flex items-center gap-2">
          <MenuCommand.Menu
            persistOnSelect
            onOpenChange={(open) => {
              if (open === false && form.state.isDirty && !isDeepEqual(form.options.defaultValues, form.state.values)) {
                form.handleSubmit();
              }
            }}
          >
            <MenuCommand.Trigger>
              <Button variant="secondary" size={ids.length ? 'icon' : 'xs'}>
                <Icon icon={ids.length ? 'edit-square' : 'plus'} className="text-grey-50 size-4" />
                {!ids.length ? <span className="text-grey-50 text-xs">{t('common:add')}</span> : null}
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content className="mt-2 min-w-[200px]" side="bottom">
              <MenuCommand.List>
                {orgTags.map(({ id: caseId }) => (
                  <MenuCommand.Item
                    key={caseId}
                    className="cursor-pointer"
                    onSelect={() => {
                      field.handleChange(toggle(field.state.value, caseId));
                    }}
                  >
                    <div className="inline-flex w-full justify-between">
                      <TagPreview key={caseId} name={formattedTags[caseId]!.name} />
                      {ids.includes(caseId) ? <Icon icon="tick" className="text-purple-65 size-6" /> : null}
                    </div>
                  </MenuCommand.Item>
                ))}
                <MenuCommand.Empty>
                  <div className="text-center">{t('cases:case_detail.add_a_tag.empty')}</div>
                </MenuCommand.Empty>
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
          {field.state.value.map((id) => (
            <TagPreview key={id} name={formattedTags[id]!.name} />
          ))}
        </div>
      )}
    </form.Field>
  );
};
