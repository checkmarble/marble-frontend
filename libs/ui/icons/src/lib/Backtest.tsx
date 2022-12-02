import * as React from 'react';
import { SVGProps } from 'react';
const Backtest = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 4a2 2 0 00-2-2H6a2 2 0 00-2 2v17a2 2 0 002 2h12a2 2 0 002-2V4zm-2 0v17H6V4h12zm-6-.248a.752.752 0 100-1.504.752.752 0 000 1.503z"
      fill="#080525"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 2v4H8V2h2.268a2 2 0 013.464 0H16zm-4 1.752a.752.752 0 100-1.504.752.752 0 000 1.503zM16.684 10.729l-6.017 5.64-3.351-3.14 1.368-1.46 1.983 1.86 4.65-4.36 1.367 1.46z"
      fill="#080525"
    />
  </svg>
);
export default Backtest;
