import * as React from 'react';
import { SVGProps } from 'react';
const SmallarrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.03 9.47a.75.75 0 0 0-1.06 1.06l1.06-1.06ZM12 13.5l-.53.53a.75.75 0 0 0 1.06 0L12 13.5Zm4.03-2.97a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm-8.06 0 3.5 3.5 1.06-1.06-3.5-3.5-1.06 1.06Zm4.56 3.5 3.5-3.5-1.06-1.06-3.5 3.5 1.06 1.06Z"
      fill="currentColor"
    />
  </svg>
);
export default SmallarrowDown;
