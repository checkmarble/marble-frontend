import { mergeRefs } from '@app-builder/utils/form';
import type React from 'react';
import { type CSSProperties, type InputHTMLAttributes } from 'react';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface AutowidthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  extraWidth?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  onAutosize?: (newWidth: number) => void;
  placeholderIsMinWidth?: boolean;
  value?: string | number;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

const sizerStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  overflow: 'scroll',
  whiteSpace: 'pre',
};

/**
 * Automatically sized input field.
 */
export const AutoWidthInput = forwardRef<HTMLInputElement, AutowidthInputProps>(
  (
    {
      extraWidth = 16,
      wrapperClassName,
      wrapperStyle: wrapperStyleProp,
      onAutosize,
      placeholderIsMinWidth,
      minWidth = 0,
      maxWidth = 800,
      ...props
    },
    forwardedRef,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const sizerRef = useRef<HTMLDivElement>(null);
    const placeholderSizerRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState<string>('');
    const [inputWidth, setInputWidth] = useState(0);

    const usedValue = `${props.value ?? input}`;

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);

      if (props.onChange) props.onChange(e);
    };

    /* Copy styles of the input field to the sizer, ensuring that the width of the input adjusts accordingly */
    useLayoutEffect(() => {
      if (inputRef.current && sizerRef.current) {
        const computedStyle = window.getComputedStyle(inputRef.current);

        sizerRef.current.style.fontSize = computedStyle.fontSize;
        sizerRef.current.style.fontFamily = computedStyle.fontFamily;
        sizerRef.current.style.fontWeight = computedStyle.fontWeight;
        sizerRef.current.style.fontStyle = computedStyle.fontStyle;
        sizerRef.current.style.letterSpacing = computedStyle.letterSpacing;
        sizerRef.current.style.textTransform = computedStyle.textTransform;
      }
    }, []);

    useEffect(() => {
      const sizerWidth = sizerRef.current?.scrollWidth;
      const placeholderWidth = placeholderSizerRef.current?.scrollWidth;

      if (sizerWidth && usedValue.length) {
        /* If the input field has content, update the sizer to match its width  */

        let width = sizerWidth;

        if (
          placeholderIsMinWidth &&
          placeholderWidth &&
          sizerWidth < placeholderWidth &&
          placeholderSizerRef.current
        ) {
          width = placeholderWidth;
        }

        if (width < +minWidth) {
          width = +minWidth;
        }

        if (width > +maxWidth) {
          width = +maxWidth;
        }

        if (width) {
          setInputWidth(width + +extraWidth);
          if (onAutosize) onAutosize(width);
        }
      } else if (props.placeholder && placeholderWidth && placeholderIsMinWidth) {
        /* If no input value exists, check for placeholder value and update the sizer accordingly  */

        setInputWidth(Math.max(+minWidth, placeholderWidth) + +extraWidth);

        if (onAutosize) onAutosize(placeholderWidth);
      } else if (sizerRef.current) {
        /* If no input value or placeholder exists, update the sizer to the width of the "minWidth" + "extraWidth" prop (default is 16) */

        setInputWidth(+minWidth + +extraWidth);
        if (onAutosize) onAutosize(+minWidth);
      }
    }, [
      usedValue,
      props.placeholder,
      extraWidth,
      placeholderIsMinWidth,
      onAutosize,
      setInputWidth,
      minWidth,
      maxWidth,
    ]);

    const wrapperStyle: CSSProperties = {
      ...wrapperStyleProp,
      position: 'relative',
      display: props.style?.display ?? 'inline-block',
    };

    const inputStyle: CSSProperties = {
      boxSizing: 'content-box',
      width: inputWidth,
      ...props.style,
    };

    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        <div style={sizerStyle} ref={sizerRef}>
          {usedValue}
        </div>
        <input
          {...props}
          ref={mergeRefs([inputRef, forwardedRef])}
          value={usedValue}
          style={inputStyle}
          onChange={handleInput}
        />
        {props.placeholder ? (
          <div ref={placeholderSizerRef} style={sizerStyle}>
            {props.placeholder}
          </div>
        ) : null}
      </div>
    );
  },
);

AutoWidthInput.displayName = 'AutoWidthInput';

export default AutoWidthInput;
