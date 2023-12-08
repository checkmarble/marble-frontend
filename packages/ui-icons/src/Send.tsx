import type { SVGProps } from 'react';
const Send = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="prefix__send">
      <mask
        id="prefix__mask0_9508_83768"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={16}
        height={16}
      >
        <rect
          id="prefix__Bounding box"
          width={16}
          height={16}
          fill="currentColor"
        />
      </mask>
      <g mask="url(#prefix__mask0_9508_83768)">
        <path
          id="prefix__send_2"
          d="M2 13.3332V2.6665L14.6667 7.99984L2 13.3332ZM3.33333 11.3332L11.2333 7.99984L3.33333 4.6665V6.99984L7.33333 7.99984L3.33333 8.99984V11.3332Z"
          fill="white"
        />
      </g>
    </g>
  </svg>
);
export default Send;
