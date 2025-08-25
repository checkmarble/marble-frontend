import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export const textarea = cva(
  'text-s text-grey-00 placeholder:text-grey-80 disabled:bg-grey-95 rounded-sm p-2 font-medium outline-hidden border focus:border-purple-65 row-start-1 row-end-2 col-start-1 col-end-2',
  {
    variants: {
      borderColor: {
        'greyfigma-90': 'border-grey-90',
        'redfigma-87': 'border-red-87',
        'redfigma-47': 'border-red-47',
      },
    },
    defaultVariants: {
      borderColor: 'greyfigma-90',
    },
  },
);

export interface TextAreaProps
  extends React.ComponentPropsWithoutRef<'textarea'>,
    VariantProps<typeof textarea> {}

/**
 * A textarea that automatically resize to fit its content.
 *
 * This is using CSS trick thanks to an invisible div
 * that will have the same content as the textarea.
 *
 * Discussion to allow this in native HTML/CSS is here: https://github.com/w3c/csswg-drafts/issues/7542
 * Adapted from this nice article: https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, borderColor, ...props },
  ref,
) {
  // Used to trigger a rerender
  const [_, setValue] = useState(props?.value?.toString() || '');

  const sharedClassNames = textarea({ borderColor, className });

  const internalRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => internalRef.current!);

  return (
    <div className={clsx('grid', className)}>
      <div
        className={clsx('invisible whitespace-pre-wrap', sharedClassNames)}
      >{`${internalRef.current?.value} `}</div>
      <textarea
        ref={internalRef}
        placeholder="Write a note"
        className={clsx('resize-none overflow-hidden', sharedClassNames)}
        onChangeCapture={(e) => {
          setValue(e.currentTarget.value);
        }}
        {...props}
      />
    </div>
  );
});
