import type { SVGProps } from 'react';
const Analytics = (props: SVGProps<SVGSVGElement>) => (
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
      d="M1 5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5zm20 0H3v14h18V5zM7 8v9H5V8h2zm12 0v9h-2V8h2zm-8 2v7H9v-7h2zm4 4v3h-2v-3h2z"
      fill="currentColor"
    />
  </svg>
);
export default Analytics;
