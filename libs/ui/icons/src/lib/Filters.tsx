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
    <path
      d="M2 6h20v2H2V6zm4 5h12v2H6v-2zm4 5h4v2h-4v-2z"
      fill="currentColor"
    />
  </svg>
);
export default Filters;
