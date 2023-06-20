import type { SVGProps } from 'react';
const Home = (props: SVGProps<SVGSVGElement>) => (
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
      d="M18 10.828V20h-3v-7H9v7H6v-9.172l6-6 6 6zM12 2l10 10h-2v10h-7v-7h-2v7H4V12H2L12 2z"
      clipRule="evenodd"
    />
  </svg>
);
export default Home;
