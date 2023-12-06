import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export const textarea = cva(
  'text-s text-grey-100 placeholder:text-grey-25 disabled:bg-grey-05 rounded p-2 font-medium outline-none border focus:border-purple-100 row-start-1 row-end-2 col-start-1 col-end-2',
  {
    variants: {
      borderColor: {
        'grey-10': 'border-grey-10',
        'red-25': 'border-red-25',
        'red-100': 'border-red-100',
      },
    },
    defaultVariants: {
      borderColor: 'grey-10',
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
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ className, borderColor, ...props }, ref) {
    // Used to trigger a rerender
    const [_, setValue] = useState(props?.value?.toString() || '');

    const sharedClassNames = textarea({ borderColor, className });

    const internalRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    return (
      <div className="grid">
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
  },
);
