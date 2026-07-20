import { Callout } from '@app-builder/components/Callout';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { useDismissContinuousScreeningMutation } from '@app-builder/queries/continuous-screening/dismiss';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DismissAlertButton({ screening }: { screening: ContinuousScreening }) {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const dismissMutation = useDismissContinuousScreeningMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const dismissAlert = () => {
    dismissMutation
      .mutateAsync(screening.id)
      .then(() => {
        toast.success(t('continuousScreening:success.dismissed'));
        revalidate();
        setOpen(false);
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        {
          <Button variant="secondary" size="small" disabled={screening.status !== 'in_review'}>
            <Icon icon="snooze-stroke" className="size-4" />
            {t('continuousScreening:review.dismiss_alert')}
          </Button>
        }
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('continuousScreening:review.dismiss_alert')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <div>{t('continuousScreening:review.dismiss_alert_modal.warning_text')}</div>
          {screening.partial ? (
            <Callout color="red">{t('continuousScreening:review.dismiss_alert_modal.partial_search_warning')}</Callout>
          ) : null}
          <div>{t('continuousScreening:review.dismiss_alert_modal.confirmation_text')}</div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('continuousScreening:review.dismiss_alert_modal.confirm_button')}
            onClick={dismissAlert}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
