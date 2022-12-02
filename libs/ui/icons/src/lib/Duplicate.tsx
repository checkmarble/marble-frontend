import * as React from 'react';
import { SVGProps } from 'react';
const Duplicate = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19 15V5H7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2v-2z"
      fill="#080525"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 19h10V9H5v10zm10 2a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10z"
      fill="#080525"
    />
  </svg>
);
export default Duplicate;
