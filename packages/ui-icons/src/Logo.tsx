import type { SVGProps } from 'react';
const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M71.503 0H8.497A8.497 8.497 0 0 0 0 8.497v63.006A8.497 8.497 0 0 0 8.497 80h63.006A8.497 8.497 0 0 0 80 71.503V8.497A8.497 8.497 0 0 0 71.503 0z"
      fill="#5A50FA"
    />
    <path
      d="m65.326 31.214-5.155 13.512V29.907l-8.967-2.24-6.726 21.092V25.983l-8.972-2.24-6.727 27.45v-29.13l-8.966-2.245-6.689 20.179 1.695.01 4.994-15.201v35.376l8.966-2.246 6.727-27.473v25.794l8.972-2.246 6.726-21.097v19.418l8.967-2.24 6.705-18.49-1.55-.388z"
      fill="#fff"
    />
  </svg>
);
export default Logo;
