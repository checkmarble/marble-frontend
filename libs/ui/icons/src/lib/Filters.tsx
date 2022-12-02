import * as React from 'react';
import { SVGProps } from 'react';
const Filters = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2 6h20v2H2V6zM6 11h12v2H6v-2zM10 16h4v2h-4v-2z" fill="#080525" />
  </svg>
);
export default Filters;
