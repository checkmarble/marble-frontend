import type { SVGProps } from 'react';
const Field = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="prefix__mask0_7278_5222"
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
    <g mask="url(#prefix__mask0_7278_5222)">
      <path
        d="M14 20V18H17C17.2833 18 17.5208 17.9042 17.7125 17.7125C17.9042 17.5208 18 17.2833 18 17V15C18 14.3667 18.1833 13.7917 18.55 13.275C18.9167 12.7583 19.4 12.3917 20 12.175V11.825C19.4 11.6083 18.9167 11.2417 18.55 10.725C18.1833 10.2083 18 9.63333 18 9V7C18 6.71667 17.9042 6.47917 17.7125 6.2875C17.5208 6.09583 17.2833 6 17 6H14V4H17C17.8333 4 18.5417 4.29167 19.125 4.875C19.7083 5.45833 20 6.16667 20 7V9C20 9.28333 20.0958 9.52083 20.2875 9.7125C20.4792 9.90417 20.7167 10 21 10H22V14H21C20.7167 14 20.4792 14.0958 20.2875 14.2875C20.0958 14.4792 20 14.7167 20 15V17C20 17.8333 19.7083 18.5417 19.125 19.125C18.5417 19.7083 17.8333 20 17 20H14ZM7 20C6.16667 20 5.45833 19.7083 4.875 19.125C4.29167 18.5417 4 17.8333 4 17V15C4 14.7167 3.90417 14.4792 3.7125 14.2875C3.52083 14.0958 3.28333 14 3 14H2V10H3C3.28333 10 3.52083 9.90417 3.7125 9.7125C3.90417 9.52083 4 9.28333 4 9V7C4 6.16667 4.29167 5.45833 4.875 4.875C5.45833 4.29167 6.16667 4 7 4H10V6H7C6.71667 6 6.47917 6.09583 6.2875 6.2875C6.09583 6.47917 6 6.71667 6 7V9C6 9.63333 5.81667 10.2083 5.45 10.725C5.08333 11.2417 4.6 11.6083 4 11.825V12.175C4.6 12.3917 5.08333 12.7583 5.45 13.275C5.81667 13.7917 6 14.3667 6 15V17C6 17.2833 6.09583 17.5208 6.2875 17.7125C6.47917 17.9042 6.71667 18 7 18H10V20H7Z"
        fill="currentColor"
      />
    </g>
  </svg>
);
export default Field;
