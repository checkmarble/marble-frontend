import type React from 'react';

interface CodeProps {
  children?: React.ReactNode;
}

const Code: React.FC<CodeProps> = ({ children }) => (
  <span className="bg-grey-90 rounded-md px-[.2em] py-[.1em]">{children}</span>
);

export default Code;
