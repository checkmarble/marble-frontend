import { SVGProps } from 'react';
const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.207 7.707a1 1 0 0 0-1.414-1.414l1.414 1.414zM9.5 12l-.707-.707a1 1 0 0 0 0 1.414L9.5 12zm4.293 5.707a1 1 0 0 0 1.414-1.414l-1.414 1.414zm0-11.414-5 5 1.414 1.414 5-5-1.414-1.414zm-5 6.414 5 5 1.414-1.414-5-5-1.414 1.414z"
      fill="currentColor"
    />
  </svg>
);
export default ArrowLeft;
