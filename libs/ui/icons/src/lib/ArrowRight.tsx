import * as React from 'react';
import { SVGProps } from 'react';
const ArrowRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10.207 6.293a1 1 0 00-1.414 1.414l1.414-1.414zM14.5 12l.707.707a1 1 0 000-1.414L14.5 12zm-5.707 4.293a1 1 0 101.414 1.414l-1.414-1.414zm0-8.586l5 5 1.414-1.414-5-5-1.414 1.414zm5 3.586l-5 5 1.414 1.414 5-5-1.414-1.414z"
      fill="currentColor"
    />
  </svg>
);
export default ArrowRight;
