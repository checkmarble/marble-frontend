import type { SVGProps } from 'react';
const Backtest = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule="evenodd"
      d="M20 4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4zm-2 0v17H6V4h12zm-6-.248a.752.752 0 1 0 0-1.504.752.752 0 0 0 0 1.503z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 2v4H8V2h2.268a2 2 0 0 1 3.464 0H16zm-4 1.752a.752.752 0 1 0 0-1.504.752.752 0 0 0 0 1.503zm4.684 6.977-6.017 5.64-3.351-3.14 1.368-1.46 1.983 1.86 4.65-4.36 1.367 1.46z"
      clipRule="evenodd"
    />
  </svg>
);
export default Backtest;
