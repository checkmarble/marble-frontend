import type * as React from 'react';

type BaseOptions =
  | {
      ariaAttributes?: true;
      description?: boolean;
    }
  | {
      ariaAttributes: false;
    };
export type ControlOptions = BaseOptions & {
  hidden?: boolean;
};

export function extractControlOptions<T extends ControlOptions>(props: T) {
  if (props.ariaAttributes === false) {
    const { ariaAttributes, hidden, ...rest } = props;
    return {
      options: { ariaAttributes, hidden } satisfies ControlOptions,
      ...rest,
    };
  } else {
    const { ariaAttributes, description, hidden, ...rest } = props;
    return {
      options: { hidden, ariaAttributes, description } satisfies ControlOptions,
      ...rest,
    };
  }
}

export type InputOptions = ControlOptions &
  (
    | {
        type: 'checkbox' | 'radio';
        value?: string;
      }
    | {
        type?: Exclude<
          React.HTMLInputTypeAttribute,
          'button' | 'submit' | 'hidden'
        >;
        value?: never;
      }
  );

export function extractInputOptions<T extends InputOptions>(props: T) {
  const { options, type, ...otherProps } = extractControlOptions(props);
  if (type === 'checkbox' || type === 'radio') {
    const { value, ...rest } = otherProps;
    return {
      options: {
        ...options,
        type: type === 'checkbox' ? 'checkbox' : 'radio',
        ...(value ? { value } : {}),
      } satisfies InputOptions,
      ...rest,
    };
  } else {
    return {
      options: { ...options, type } satisfies InputOptions,
      ...otherProps,
    };
  }
}
