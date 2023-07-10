import type { SVGProps } from 'react';
const Collapse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <rect width={2} height={13} x={3.793} y={5} fill="currentColor" rx={1} />
    <rect
      width={2}
      height={9}
      x={13.157}
      y={5.136}
      fill="currentColor"
      rx={1}
      transform="rotate(45 13.157 5.136)"
    />
    <rect
      width={2}
      height={9}
      x={14.571}
      y={16.45}
      fill="currentColor"
      rx={1}
      transform="rotate(135 14.571 16.45)"
    />
    <rect
      width={2}
      height={13}
      x={7.207}
      y={12.5}
      fill="currentColor"
      rx={1}
      transform="rotate(-90 7.207 12.5)"
    />
  </svg>
);
export default Collapse;
