import * as toastSession from '@app-builder/models/toast-session';
import { getClientEnv } from '@app-builder/utils/environment';
import { useEffect } from 'react';
import { ToastBar, Toaster, toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { headerHeight } from './Page';

export function setToastMessage(
  session: toastSession.ToastSession,
  toastMessage: toastSession.ToastMessage,
) {
  session.flash('toastMessage', toastMessage);
}

export function getToastMessage(session: toastSession.ToastSession) {
  try {
    return toastSession.toastMessageSchema.parse(session.get('toastMessage'));
  } catch (_err) {
    return undefined;
  }
}

export function MarbleToaster({ toastMessage }: { toastMessage?: toastSession.ToastMessage }) {
  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (!toastMessage) return;

    if (toastSession.isNewToastMessage(toastMessage)) {
      const { type, message } = toastMessage;
      toast[type](getMessage(message));
    } else {
      const { type, messageKey } = toastMessage;
      const message = t(messageKey);

      toast[type](getMessage(message));
    }
  }, [t, toastMessage]);

  return (
    <Toaster
      position="top-center"
      containerClassName={headerHeight({ type: 'mt' })}
      toastOptions={{
        loading: {
          icon: LoaderIcon,
        },
        success: {
          icon: SuccessIcon,
        },
        error: {
          icon: ErrorIcon,
        },
      }}
    >
      {(currentToast) => (
        <ToastBar toast={currentToast}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {currentToast.type !== 'loading' ? (
                <button
                  onClick={() => toast.dismiss(currentToast.id)}
                  aria-label="Close"
                  className="shrink-0"
                >
                  <Icon icon="cross" className="size-6 shrink-0" />
                </button>
              ) : null}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}

function getMessage(message: string) {
  if (getClientEnv('ENV') !== 'development') {
    return message;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-s text-grey-00">{message}</p>
      <p className="text-grey-50 text-xs">
        In dev, toast may be displayed twice due to strict mode
      </p>
    </div>
  );
}

const LoaderIcon = (
  <div
    aria-hidden
    className="border-grey-98 border-r-grey-50 box-border size-4 shrink-0 animate-spin rounded-full border-2 border-solid"
  />
);

const ErrorIcon = (
  <div
    aria-hidden
    className="animate-circleAnimation after:animate-firstLineAnimation after:bg-grey-100 before:animate-secondLineAnimation before:bg-grey-100 bg-red-47 relative size-5 shrink-0 rotate-45 rounded-full delay-100 before:absolute before:bottom-[9px] before:left-1 before:h-[2px] before:w-3 before:rounded-lg before:delay-150 after:absolute after:bottom-[9px] after:left-1 after:h-[2px] after:w-3 after:rounded-lg after:delay-150"
  />
);

const SuccessIcon = (
  <div
    aria-hidden
    className="animate-circleAnimation after:animate-checkmarkAnimation after:border-grey-100 bg-green-38 relative size-5 shrink-0 rotate-45 rounded-full delay-100 after:absolute after:bottom-[6px] after:left-[6px] after:box-border after:h-[10px] after:w-[6px] after:border-b-2 after:border-r-2 after:border-solid after:delay-200"
  />
);
