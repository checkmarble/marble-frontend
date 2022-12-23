import * as React from 'react';
import { SVGProps } from 'react';
const LogoFavicon = (props: SVGProps<SVGSVGElement>) => (
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
      d="m64.693 31.434-5.026 13.174V30.16l-8.743-2.184-6.558 20.564V26.334l-8.748-2.185-6.558 26.765V22.512l-8.742-2.19-6.522 19.675 1.653.01 4.868-14.82v34.49l8.743-2.19 6.558-26.785v25.149l8.748-2.19 6.558-20.57v18.933l8.743-2.184 6.537-18.027-1.51-.38z"
      fill="#fff"
    />
  </svg>
);
export default LogoFavicon;
