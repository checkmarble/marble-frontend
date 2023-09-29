import type { SVGProps } from 'react';
const RestartAlt = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
    {...props}
  >
    <mask
      id="prefix__a"
      width={16}
      height={17}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="currentColor" d="M0 .5h16v16H0z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fill="currentColor"
        d="M7.333 14.467c-1.345-.167-2.459-.753-3.342-1.759-.883-1.005-1.325-2.186-1.325-3.541 0-.734.144-1.436.433-2.109.29-.672.7-1.258 1.234-1.758l.95.95a3.757 3.757 0 0 0-.959 1.317A3.98 3.98 0 0 0 4 9.167c0 .978.311 1.841.934 2.591.622.75 1.422 1.209 2.4 1.375v1.334Zm1.333 0v-1.334a3.978 3.978 0 0 0 2.392-1.383 3.889 3.889 0 0 0 .941-2.583c0-1.111-.389-2.056-1.166-2.834-.778-.777-1.723-1.166-2.834-1.166h-.05l.734.733-.934.933L5.416 4.5l2.333-2.333.934.933-.734.733H8c1.49 0 2.75.517 3.784 1.55 1.033 1.034 1.55 2.295 1.55 3.784 0 1.344-.442 2.52-1.325 3.525-.884 1.005-1.997 1.597-3.342 1.775Z"
      />
    </g>
  </svg>
);
export default RestartAlt;
