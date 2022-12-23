import * as React from 'react';
import { SVGProps } from 'react';
const Decision = (props: SVGProps<SVGSVGElement>) => (
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
      d="M3 12a9 9 0 0 0 9 9 8.966 8.966 0 0 0 6.364-2.636A8.966 8.966 0 0 0 21 12a9 9 0 0 0-9-9 8.966 8.966 0 0 0-6.364 2.636A8.966 8.966 0 0 0 3 12zm16.778 7.778A10.966 10.966 0 0 0 23 12c0-6.075-4.925-11-11-11a10.966 10.966 0 0 0-7.778 3.222A10.966 10.966 0 0 0 1 12c0 6.075 4.925 11 11 11 3.038 0 5.788-1.231 7.778-3.222z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m10.461 10.564-3.844 6.407c-.16.268.144.572.412.412l6.407-3.844a.3.3 0 0 0 .103-.103l3.844-6.407c.16-.268-.144-.572-.412-.412l-6.407 3.844a.3.3 0 0 0-.103.103zm2.246 2.143a1 1 0 1 0-1.414-1.414 1 1 0 0 0 1.414 1.414z"
      fill="currentColor"
    />
  </svg>
);
export default Decision;
