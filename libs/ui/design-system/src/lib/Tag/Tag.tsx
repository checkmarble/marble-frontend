import clsx from 'clsx';

export const tagColors = ['purple', 'green', 'red'] as const;

/* eslint-disable-next-line */
export interface TagProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  color?: typeof tagColors[number];
}

export function Tag({ color = 'purple', className, ...props }: TagProps) {
  return (
    <div
      className={clsx(
        'text-text-xs-medium inline-flex items-center rounded-full px-2',
        {
          'bg-purple-10 text-purple-100': color === 'purple',
          'bg-green-10 text-green-100': color === 'green',
          'bg-red-10 text-red-100': color === 'red',
        },
        className
      )}
      {...props}
    />
  );
}

export default Tag;
