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
      d="M3 12a9 9 0 009 9 8.966 8.966 0 006.364-2.636A8.966 8.966 0 0021 12a9 9 0 00-9-9 8.966 8.966 0 00-6.364 2.636A8.966 8.966 0 003 12zm16.778 7.778A10.966 10.966 0 0023 12c0-6.075-4.925-11-11-11a10.966 10.966 0 00-7.778 3.222A10.966 10.966 0 001 12c0 6.075 4.925 11 11 11 3.038 0 5.788-1.231 7.778-3.222z"
      fill="#080525"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.461 10.564l-3.844 6.407c-.16.268.144.572.412.412l6.407-3.844a.3.3 0 00.103-.103l3.844-6.407c.16-.268-.144-.572-.412-.412l-6.407 3.844a.3.3 0 00-.103.103zm2.246 2.143a1 1 0 10-1.414-1.414 1 1 0 001.414 1.414z"
      fill="#080525"
    />
  </svg>
);
export default Decision;
