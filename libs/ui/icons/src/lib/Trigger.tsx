import * as React from 'react';
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
      d="M12 20a8 8 0 100-16 8 8 0 000 16zm0 2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
      fill="#080525"
    />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" fill="#080525" />
  </svg>
);
export default Trigger;
