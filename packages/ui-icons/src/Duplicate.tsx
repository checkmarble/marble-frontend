import type { SVGProps } from 'react';
const Duplicate = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19 15V5H7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2v-2z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5 19h10V9H5v10zm10 2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10z"
      clipRule="evenodd"
    />
  </svg>
);
export default Duplicate;
