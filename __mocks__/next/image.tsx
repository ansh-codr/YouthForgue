import React from 'react';
// Simple mock for next/image in tests
// eslint-disable-next-line @next/next/no-img-element
const NextImage: React.FC<{ src: string; alt: string; [key: string]: any }> = ({ src, alt, ...props }) => {
  const { unoptimized, priority, fill, ...rest } = props;
  const resolvedProps = fill ? { ...rest, style: { ...rest.style, objectFit: 'cover', width: '100%', height: '100%' } } : rest;
  return <img src={typeof src === 'string' ? src : ''} alt={alt} {...resolvedProps} />;
};
export default NextImage;
