import type { SVGProps } from 'react';
const Logout = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M5 21a1.93 1.93 0 0 1-1.413-.587A1.928 1.928 0 0 1 3 19V5c0-.55.196-1.021.587-1.413A1.928 1.928 0 0 1 5 3h7v2H5v14h7v2H5zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5-5 5z"
    />
  </svg>
);
export default Logout;
