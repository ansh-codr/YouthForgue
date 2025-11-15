import React from 'react';
// Simple mock for next/image in tests
// eslint-disable-next-line @next/next/no-img-element
const NextImage: React.FC<{ src: string; alt: string; [key: string]: any }> = ({ src, alt, ...props }) => (
  <img src={typeof src === 'string' ? src : ''} alt={alt} {...props} />
);
export default NextImage;
