import type { SVGProps } from 'react';
const Edit = (props: SVGProps<SVGSVGElement>) => (
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
        d="M5 21c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 0 1 3 19V5c0-.55.196-1.02.587-1.413A1.926 1.926 0 0 1 5 3h8.925l-2 2H5v14h14v-6.95l2-2V19c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0 1 19 21H5ZM16.175 3.575l1.425 1.4-6.6 6.6V13h1.4l6.625-6.625 1.425 1.4L13.25 15H9v-4.25l7.175-7.175Zm4.275 4.2-4.275-4.2 2.5-2.5c.4-.4.88-.6 1.438-.6.558 0 1.029.2 1.412.6l1.4 1.425c.383.383.575.85.575 1.4 0 .55-.192 1.017-.575 1.4L20.45 7.775Z"
      />
    </g>
  </svg>
);
export default Edit;
