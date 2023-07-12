import type { SVGProps } from 'react';
const Mail = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule="evenodd"
      d="M2 6.364c0-1.005.814-1.819 1.818-1.819h16.364c1.004 0 1.818.814 1.818 1.819v10.909a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 17.273V6.363zm18.182 0H3.818v10.909h16.364V6.363z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m2.441 7.143.936-1.559L12 10.758l8.623-5.174.936 1.56L12 12.877 2.441 7.143z"
      clipRule="evenodd"
    />
  </svg>
);
export default Mail;
