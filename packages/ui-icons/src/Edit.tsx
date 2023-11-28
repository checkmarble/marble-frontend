import type { SVGProps } from 'react';
const Edit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <mask
      id="prefix__mask0_6130_61189"
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
    <g mask="url(#prefix__mask0_6130_61189)">
      <path
        d="M5 21C4.45 21 3.97917 20.8041 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V4.99998C3 4.44998 3.19583 3.97914 3.5875 3.58748C3.97917 3.19581 4.45 2.99998 5 2.99998H13.925L11.925 4.99998H5V19H19V12.05L21 10.05V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8041 19.55 21 19 21H5ZM16.175 3.57498L17.6 4.97498L11 11.575V13H12.4L19.025 6.37498L20.45 7.77498L13.25 15H9V10.75L16.175 3.57498ZM20.45 7.77498L16.175 3.57498L18.675 1.07498C19.075 0.674976 19.5542 0.474976 20.1125 0.474976C20.6708 0.474976 21.1417 0.674976 21.525 1.07498L22.925 2.49998C23.3083 2.88331 23.5 3.34998 23.5 3.89998C23.5 4.44998 23.3083 4.91664 22.925 5.29998L20.45 7.77498Z"
        fill="currentColor"
      />
    </g>
  </svg>
);
export default Edit;
