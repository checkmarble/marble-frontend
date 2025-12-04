import { Spinner } from '../Spinner';

export const GraphSpinnerOverlay = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
      <Spinner className="size-6" />
    </div>
  );
};
