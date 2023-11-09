import type { SVGProps } from 'react';
const Category = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <mask
      id="prefix__a"
      width={20}
      height={20}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="currentColor" d="M0 0h20v20H0z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fill="currentColor"
        d="M5.417 9.167 10 1.667l4.583 7.5H5.417Zm9.166 9.166c-1.041 0-1.927-.364-2.656-1.093-.73-.73-1.094-1.615-1.094-2.657 0-1.041.365-1.927 1.094-2.656.73-.73 1.615-1.094 2.656-1.094 1.042 0 1.927.365 2.657 1.094.729.73 1.093 1.615 1.093 2.656 0 1.042-.364 1.927-1.093 2.657-.73.729-1.615 1.093-2.657 1.093ZM2.5 17.917V11.25h6.667v6.667H2.5Zm12.083-1.25c.584 0 1.077-.202 1.48-.605.402-.402.604-.895.604-1.479 0-.583-.202-1.076-.605-1.479a2.012 2.012 0 0 0-1.479-.604c-.583 0-1.076.201-1.479.604a2.011 2.011 0 0 0-.604 1.48c0 .583.201 1.076.604 1.479.403.402.896.604 1.48.604ZM4.167 16.25H7.5v-3.333H4.167v3.333ZM8.375 7.5h3.25L10 4.875 8.375 7.5Z"
      />
    </g>
  </svg>
);
export default Category;
