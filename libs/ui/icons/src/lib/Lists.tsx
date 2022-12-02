import * as React from 'react';
import { SVGProps } from 'react';
const Lists = (props: SVGProps<SVGSVGElement>) => (
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
      d="M6.5 9h-.52a1 1 0 110-2h.52a1 1 0 010 2zM9 8a1 1 0 011-1h8a1 1 0 110 2h-8a1 1 0 01-1-1zm-4.02 4a1 1 0 011-1h.52a1 1 0 110 2h-.52a1 1 0 01-1-1zM9 12a1 1 0 011-1h8a1 1 0 110 2h-8a1 1 0 01-1-1zm-4.02 4a1 1 0 011-1h.52a1 1 0 110 2h-.52a1 1 0 01-1-1zM9 16a1 1 0 011-1h8a1 1 0 110 2h-8a1 1 0 01-1-1z"
      fill="#080525"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 3H3v18h18V3zM3 1a2 2 0 00-2 2v18a2 2 0 002 2h18a2 2 0 002-2V3a2 2 0 00-2-2H3z"
      fill="#080525"
    />
  </svg>
);
export default Lists;
