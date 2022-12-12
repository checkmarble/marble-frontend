import * as React from 'react';
import { SVGProps } from 'react';
const Draft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.707 7.293A1 1 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a1 1 0 0 1 .707.293l5 5ZM18 20V9h-5V4H6v16h12ZM15 5.414V7h1.586L15 5.414Z"
      fill="currentColor"
    />
  </svg>
);
export default Draft;
