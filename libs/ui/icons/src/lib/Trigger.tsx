import { SVGProps } from 'react';
const Trigger = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
      fill="currentColor"
    />
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" fill="currentColor" />
  </svg>
);
export default Trigger;
