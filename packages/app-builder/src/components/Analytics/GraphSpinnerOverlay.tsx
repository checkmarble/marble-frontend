import { Spinner } from '../Spinner';

export const GraphSpinnerOverlay = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-background-light/80 hover:bg-grey-background/80">
      <Spinner className="size-6" />
    </div>
  );
};
