import type { SVGProps } from 'react';
const Settings = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9.593 2h4.814l.508 3.115c.572.24 1.107.55 1.595.916l2.947-1.115 2.407 4.168-2.422 1.98a7.512 7.512 0 0 1 0 1.872l2.422 1.98-2.408 4.17-2.942-1.12a7.5 7.5 0 0 1-1.599.919L14.407 22H9.593l-.508-3.115a7.505 7.505 0 0 1-1.595-.916l-2.947 1.115-2.407-4.168 2.422-1.98a7.503 7.503 0 0 1 0-1.872l-2.422-1.98 2.408-4.17 2.942 1.12a7.5 7.5 0 0 1 1.599-.919L9.593 2zm1.7 2-.426 2.611-.58.189a5.5 5.5 0 0 0-1.951 1.12l-.453.403-2.458-.935-.705 1.223 2.026 1.657-.127.596a5.468 5.468 0 0 0 0 2.27l.127.596-2.026 1.657.706 1.224 2.461-.932.453.402c.56.497 1.221.881 1.949 1.118l.58.189.425 2.611h1.414l.426-2.611.58-.189a5.5 5.5 0 0 0 1.952-1.121l.453-.403 2.458.935.706-1.223-2.027-1.657.127-.596a5.467 5.467 0 0 0 0-2.27l-.127-.596 2.027-1.657-.707-1.224-2.461.932-.453-.402a5.5 5.5 0 0 0-1.95-1.117l-.58-.189L12.708 4h-1.414zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"
      clipRule="evenodd"
    />
  </svg>
);
export default Settings;
