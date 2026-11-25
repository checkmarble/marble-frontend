import { type ToastMessage } from '@app-builder/models/toast-session';
import { getClientEnv } from '@app-builder/utils/environment';
import { useEffect } from 'react';
import { resolveValue, ToastBar, Toaster, toast } from 'react-hot-toast';
import { Icon } from 'ui-icons';

export function MarbleToaster({ toastMessage }: { toastMessage?: ToastMessage }) {
  useEffect(() => {
    if (!toastMessage) return;

    const { type, message } = toastMessage;
    toast[type](getMessage(message));
  }, [toastMessage]);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: 'bg-surface-card text-grey-primary',
        style: {
          background: 'var(--color-surface-card)',
          color: 'var(--color-grey-primary)',
        },
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
      {(currentToast) =>
        // A custom toast draws itself, as react-hot-toast does without a render function.
        currentToast.type === 'custom' ? (
          <>{resolveValue(currentToast.message, currentToast)}</>
        ) : (
          <ToastBar
            toast={currentToast}
            style={{
              background: 'var(--color-surface-card)',
              color: 'var(--color-grey-primary)',
            }}
          >
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {currentToast.type !== 'loading' ? (
                  <button onClick={() => toast.dismiss(currentToast.id)} aria-label="Close" className="shrink-0">
                    <Icon icon="cross" className="size-6 shrink-0" />
                  </button>
                ) : null}
              </>
            )}
          </ToastBar>
        )
      }
    </Toaster>
  );
}

function getMessage(message: string) {
  if (getClientEnv('ENV') !== 'development') {
    return message;
  }

  return (
    <div className="flex flex-col gap-xs">
      <p className="text-s text-grey-primary">{message}</p>
      <p className="text-grey-secondary text-xs">In dev, toast may be displayed twice due to strict mode</p>
    </div>
  );
}

const LoaderIcon = (
  <div
    aria-hidden
    className="border-grey-border border-r-grey-placeholder box-border size-4 shrink-0 animate-spin rounded-full border-2 border-solid"
  />
);

const ErrorIcon = (
  <div
    aria-hidden
    className="animate-circleAnimation bg-red-primary relative size-5 shrink-0 rotate-45 rounded-full delay-100"
  >
    <span
      aria-hidden
      className="animate-secondLineAnimation bg-grey-white absolute bottom-[9px] start-xs h-[2px] w-3 rounded-lg delay-150"
    />
    <span
      aria-hidden
      className="animate-firstLineAnimation bg-grey-white absolute bottom-[9px] start-xs h-[2px] w-3 rounded-lg delay-150"
    />
  </div>
);

const SuccessIcon = (
  <div
    aria-hidden
    className="animate-circleAnimation bg-green-primary relative size-5 shrink-0 rotate-45 rounded-full delay-100"
  >
    <span
      aria-hidden
      className="animate-checkmarkAnimation border-grey-white absolute bottom-[6px] start-[6px] box-border h-[10px] w-[6px] border-b-2 border-r-2 border-solid delay-200"
    />
  </div>
);
