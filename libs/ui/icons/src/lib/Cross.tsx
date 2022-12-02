import * as React from 'react';
import { SVGProps } from 'react';
const Cross = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.086 7.914l-8.172 8.172M16.086 16.086L7.914 7.914"
      stroke="#080525"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default Cross;
