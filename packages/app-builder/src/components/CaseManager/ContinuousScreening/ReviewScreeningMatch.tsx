import { Callout } from '@app-builder/components';
import { RadioItem } from '@app-builder/components/Screenings/StatusRadioGroup';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { ContinuousScreeningMatch } from '@app-builder/models/continuous-screening';
import { useReviewContinuousScreeningMatchMutation } from '@app-builder/queries/continuous-screening/review-match';
import { ReviewScreeningMatchPayload } from '@app-builder/queries/screening/review-screening-match';
import { reviewMatchPayloadSchema } from '@app-builder/schemas/continuous-screenings';
import { handleSubmit } from '@app-builder/utils/form';
import { RadioGroup, RadioProvider } from '@ariakit/react';
import { useForm, useStore } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ReviewScreeningMatchProps = {
  screeningMatch: ContinuousScreeningMatch;
  automaticallyConfirmScreening?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ReviewScreeningMatch = ({
  screeningMatch,
  automaticallyConfirmScreening = false,
  open,
  onOpenChange,
}: ReviewScreeningMatchProps) => {
  const { t } = useTranslation(['common', 'screenings']);
  const reviewScreeningMatchMutation = useReviewContinuousScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: 'confirmed_hit',
      comment: '',
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation
        .mutateAsync(value)
        .then(() => {
          onOpenChange(false);
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
    validators: {
      onSubmit: reviewMatchPayloadSchema,
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
              <RadioProvider>
                <RadioGroup className="flex flex-col gap-sm">
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
                {currentStatus === 'confirmed_hit' && automaticallyConfirmScreening ? (
                  <Callout>{t('screenings:review_modal.callout_confirmed_hit')}</Callout>
                ) : null}
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
};
