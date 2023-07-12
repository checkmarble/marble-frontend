import type { SVGProps } from 'react';
const Cross = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m16.086 7.914-8.172 8.172m8.172 0L7.914 7.914"
    />
  </svg>
);
export default Cross;
