import type { SVGProps } from 'react';
const Play = (props: SVGProps<SVGSVGElement>) => (
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
      d="M18.236 11.175 7.382 4.179C6.738 3.833 6 3.87 6 5.114v13.774c0 1.138.791 1.318 1.382.934l10.854-6.995a1.186 1.186 0 0 0 0-1.652z"
      clipRule="evenodd"
    />
  </svg>
);
export default Play;
