import type { SVGProps } from 'react';
const Scenarios = (props: SVGProps<SVGSVGElement>) => (
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
      d="M2 5v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V3h-3.917l1.819 4H17.14l-1.846-4H13.09l1.846 4H12.14l-1.846-4H8.09l1.846 4h-2.84L4.943 3H4a2 2 0 0 0-2 2zm5.097 4H20v10H4V5.466l1.336 2.482A2 2 0 0 0 7.097 9z"
      clipRule="evenodd"
    />
  </svg>
);
export default Scenarios;
