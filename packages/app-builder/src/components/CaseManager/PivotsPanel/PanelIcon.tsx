import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const panelIconSizeVariants = cva([''], {
  variants: {
    size: {
      small: 'w-1.5',
      large: 'w-3',
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

const panelIconColorVariants = cva([''], {
  variants: {
    active: {
      false: 'text-grey-90',
      true: 'text-grey-50',
    },
  },
  defaultVariants: {
    active: false,
  },
});

type PanelIconProps = { onClick: () => void } & VariantProps<typeof panelIconSizeVariants> &
  VariantProps<typeof panelIconColorVariants>;
export function PanelIcon({ size, active, onClick }: PanelIconProps) {
  return (
    <button
      tabIndex={-1}
      onClick={onClick}
      className={clsx('size-6 px-0.5 py-1', panelIconColorVariants({ active }))}
    >
      <div className="relative flex h-full justify-end rounded-sm bg-current">
        <div
          className={clsx(
            'bg-grey-100 absolute inset-y-0.5 right-0.5 rounded-[1px]',
            panelIconSizeVariants({ size }),
          )}
        />
      </div>
    </button>
  );
}
