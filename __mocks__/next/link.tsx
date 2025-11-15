import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

const Link = ({ children, ...props }: LinkProps) => {
  return <a {...props}>{children}</a>;
};

export default Link;
