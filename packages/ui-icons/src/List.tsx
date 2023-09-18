import type { SVGProps } from 'react';
const List = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <mask
      id="prefix__a"
      width={24}
      height={24}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="currentColor" d="M0 0h24v24H0z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fill="currentColor"
        d="M7 9V7h14v2H7Zm0 4v-2h14v2H7Zm0 4v-2h14v2H7ZM4 9a.968.968 0 0 1-.712-.287A.968.968 0 0 1 3 8c0-.283.096-.52.288-.713A.968.968 0 0 1 4 7c.283 0 .52.096.713.287.191.192.287.43.287.713s-.096.52-.287.713A.968.968 0 0 1 4 9Zm0 4a.967.967 0 0 1-.712-.287A.968.968 0 0 1 3 12c0-.283.096-.52.288-.713A.967.967 0 0 1 4 11c.283 0 .52.096.713.287.191.192.287.43.287.713s-.096.52-.287.713A.967.967 0 0 1 4 13Zm0 4a.967.967 0 0 1-.712-.288A.968.968 0 0 1 3 16c0-.283.096-.52.288-.713A.967.967 0 0 1 4 15c.283 0 .52.096.713.287.191.192.287.43.287.713s-.096.52-.287.712A.967.967 0 0 1 4 17Z"
      />
    </g>
  </svg>
);
export default List;
