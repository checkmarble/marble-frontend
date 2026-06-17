import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Screening, type ScreeningMatch } from '@app-builder/models/screening';
import {
  type ReviewScreeningMatchPayload,
  reviewScreeningMatchPayloadSchema,
  useReviewScreeningMatchMutation,
} from '@app-builder/queries/screening/review-screening-match';
import { handleSubmit } from '@app-builder/utils/form';
import { RadioGroup, RadioProvider } from '@ariakit/react';
import { useForm, useStore } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Switch, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { RadioItem } from './StatusRadioGroup';
import { screeningsI18n } from './screenings-i18n';

export function ReviewMatchPopover({
  screening,
  screeningMatch,
  open,
  onOpenChange,
}: {
  screening: Screening;
  screeningMatch: ScreeningMatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', ...screeningsI18n]);
  const reviewScreeningMatchMutation = useReviewScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: 'no_hit',
      comment: '',
      whitelist: true,
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      try {
        await reviewScreeningMatchMutation.mutateAsync(value);
        onOpenChange(false);
        revalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
    validators: {
      onSubmit: reviewScreeningMatchPayloadSchema,
    },
  });

  const currentStatus = useStore(form.store, (state) => state.values.status);

  return (
    <MenuCommand.Menu open={open} onOpenChange={onOpenChange} persistOnSelect>
      <MenuCommand.Trigger>
        <Button
          variant="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {t('screenings:start_reviewing')}
          <Icon icon="caret-down" className="size-4" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4} className="w-[420px]">
        <form className="flex flex-col gap-2 p-4" onSubmit={handleSubmit(form)}>
          <span className="text-s font-medium">{t('screenings:review_modal.status_label')}</span>

          <form.Field name="status">
            {(field) => (
              <RadioProvider>
                <RadioGroup className="flex flex-col gap-2">
                  <RadioItem
                    value="confirmed_hit"
                    checked={field.state.value === 'confirmed_hit'}
                    onCheck={() => field.handleChange('confirmed_hit')}
                  >
                    <span className="text-xs">{t('screenings:match.status.confirmed_hit')}</span>
                  </RadioItem>
                  <RadioItem
                    value="no_hit"
                    checked={field.state.value === 'no_hit'}
                    onCheck={() => field.handleChange('no_hit')}
                  >
                    <span className="text-xs">{t('screenings:match.status.no_hit')}</span>
                  </RadioItem>
                </RadioGroup>
              </RadioProvider>
            )}
          </form.Field>

          <form.Field name="comment">
            {(field) => (
              <TextArea
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('screenings:review_modal.comment_label')}
                className="h-[100px]"
              />
            )}
          </form.Field>

          {currentStatus === 'no_hit' && screening.uniqueCounterpartyIdentifier ? (
            <form.Field name="whitelist">
              {(field) => {
                return (
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <Switch name={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />{' '}
                      {t('screenings:review_modal.whitelist_label')}
                    </span>
                    <div className="border-grey-border bg-grey-background-light flex flex-col gap-2 rounded-sm border p-2">
                      <span className="font-semibold">{t('screenings:match.unique_counterparty_identifier')}</span>
                      <span>{screening.uniqueCounterpartyIdentifier}</span>
                    </div>
                  </div>
                );
              }}
            </form.Field>
          ) : null}

          <Modal.Footer>
            <Modal.FooterButton variant="secondary" label={t('common:cancel')} onClick={() => onOpenChange(false)} />
            <Modal.FooterButton
              type="submit"
              label={t('common:save')}
              disabled={!currentStatus || reviewScreeningMatchMutation.isPending}
            />
          </Modal.Footer>
        </form>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
