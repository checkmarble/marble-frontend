import type { SVGProps } from 'react';
const String = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="prefix__mask0_7278_5226"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <rect width={24} height={24} fill="currentColor" />
    </mask>
    <g mask="url(#prefix__mask0_7278_5226)">
      <path
        d="M7 20V7H2V4H15V7H10V20H7ZM16 20V12H13V9H22V12H19V20H16Z"
        fill="currentColor"
      />
    </g>
  </svg>
);
export default String;
