import type { SVGProps } from 'react';
const Variable = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12.894 1.33a2 2 0 0 0-1.788 0L3.342 5.212c-1.474.737-1.474 2.84 0 3.578l1.42.71-1.42.711c-1.474.737-1.474 2.84 0 3.578l1.42.71-1.42.71c-1.474.737-1.474 2.84 0 3.578l7.764 3.882a2 2 0 0 0 1.788 0l7.764-3.882c1.474-.737 1.474-2.84 0-3.578l-1.42-.71 1.42-.71c1.474-.737 1.474-2.84 0-3.578l-1.42-.71 1.42-.711c1.474-.737 1.474-2.84 0-3.578L12.894 1.33zm4.107 9.289-4.107 2.053a2 2 0 0 1-1.788 0l-4.107-2.053L4.236 12 12 15.882 19.764 12 17 10.619zM12 3.119l7.764 3.882L12 10.883 4.236 7.001 12 3.12zM4.236 16.998l2.762-1.38 4.108 2.053a2 2 0 0 0 1.788 0l4.108-2.054 2.762 1.381L12 20.88l-7.764-3.882z"
      clipRule="evenodd"
    />
  </svg>
);
export default Variable;
