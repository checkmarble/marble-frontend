import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Screening, type ScreeningMatch } from '@app-builder/models/screening';
import {
  type ReviewScreeningMatchPayload,
  reviewScreeningMatchPayloadSchema,
  useReviewScreeningMatchMutation,
} from '@app-builder/queries/screening/review-screening-match';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Radio, Switch, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
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
        <form
          id={`match_review_form_${screeningMatch.id}`}
          className="flex flex-col gap-sm p-md"
          onSubmit={handleSubmit(form)}
        >
          <span className="text-s font-medium">{t('screenings:review_modal.status_label')}</span>

          <form.Field name="status">
            {(field) => (
              <Radio.Root
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as 'confirmed_hit' | 'no_hit')}
                className="flex flex-col gap-sm"
              >
                <Radio.Item
                  value="confirmed_hit"
                  className="text-grey-secondary data-[state=checked]:text-purple-primary rounded-sm transition-colors"
                >
                  <span className="text-xs">{t('screenings:match.status.confirmed_hit')}</span>
                </Radio.Item>
                <Radio.Item
                  value="no_hit"
                  className="text-grey-secondary data-[state=checked]:text-purple-primary rounded-sm transition-colors"
                >
                  <span className="text-xs">{t('screenings:match.status.no_hit')}</span>
                </Radio.Item>
              </Radio.Root>
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
                  <div className="flex flex-col gap-sm">
                    <span className="flex items-center gap-sm">
                      <Switch name={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />
                      &nbsp;
                      {t('screenings:review_modal.whitelist_label')}
                    </span>
                    <div className="border-grey-border bg-grey-background-light flex flex-col gap-sm rounded-sm border p-sm">
                      <span className="font-semibold">{t('screenings:match.unique_counterparty_identifier')}</span>
                      <span>{screening.uniqueCounterpartyIdentifier}</span>
                    </div>
                  </div>
                );
              }}
            </form.Field>
          ) : null}
        </form>

        <Modal.Footer>
          <Modal.FooterButton variant="secondary" label={t('common:cancel')} onClick={() => onOpenChange(false)} />
          <Modal.FooterButton
            type="submit"
            form={`match_review_form_${screeningMatch.id}`}
            label={t('common:save')}
            disabled={!currentStatus || reviewScreeningMatchMutation.isPending}
          />
        </Modal.Footer>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
