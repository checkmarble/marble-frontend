import { Toaster as HotToaster, ToastBar, toast } from 'react-hot-toast';
import { Icon } from 'ui-icons';

const LoaderIcon = (
  <div
    aria-hidden
    className="border-grey-border border-r-grey-placeholder box-border size-4 shrink-0 animate-spin rounded-full border-2 border-solid"
  />
);

const SuccessIcon = <Icon aria-hidden icon="tick" className="text-green-primary size-5 shrink-0" />;

const ErrorIcon = <Icon aria-hidden icon="error" className="text-red-primary size-5 shrink-0" />;

// react-hot-toast writes its own inline background, so the token has to be applied inline
// too. `.dark` lives on <html>, so the custom properties still resolve per theme.
const toastStyle = {
  background: 'var(--color-surface-card)',
  color: 'var(--color-grey-primary)',
};

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        className: 'bg-surface-card text-grey-primary text-s',
        style: toastStyle,
        loading: { icon: LoaderIcon },
        success: { icon: SuccessIcon },
        error: { icon: ErrorIcon },
      }}
    >
      {(currentToast) => (
        <ToastBar toast={currentToast} style={toastStyle}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {currentToast.type !== 'loading' ? (
                <button
                  type="button"
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
    </HotToaster>
  );
}
