import type { SVGProps } from 'react';
const Calendar = (props: SVGProps<SVGSVGElement>) => (
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
      d="M6 3H4a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2V1h-2v2H8V1H6v2zM4 5v2.95h16V5H4zm16 4.95H4V20h16V9.95z"
      fill="currentColor"
    />
  </svg>
);
export default Calendar;
