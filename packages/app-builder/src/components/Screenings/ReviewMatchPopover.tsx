import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type ScreeningMatch } from '@app-builder/models/screening';
import {
  type ReviewScreeningMatchPayload,
  reviewScreeningMatchPayloadSchema,
  useReviewScreeningMatchMutation,
} from '@app-builder/queries/screening/review-screening-match';
import { handleSubmit } from '@app-builder/utils/form';
import { RadioGroup, RadioProvider } from '@ariakit/react';
import { useForm, useStore } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { RadioItem } from './StatusRadioGroup';
import { screeningsI18n } from './screenings-i18n';

export function ReviewMatchPopover({
  screeningMatch,
  open,
  onOpenChange,
}: {
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
      whitelist: false,
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          onOpenChange(false);
        }
        revalidate();
      });
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
      <MenuCommand.Content align="end" sideOffset={4} className="w-[320px]">
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

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              appearance="stroked"
              size="small"
              className="w-full justify-center"
              onClick={() => onOpenChange(false)}
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              className="w-full justify-center"
              disabled={!currentStatus || reviewScreeningMatchMutation.isPending}
            >
              {t('common:save')}
            </Button>
          </div>
        </form>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
