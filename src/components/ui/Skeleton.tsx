"use client";
import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton = ({ className = '', width, height, borderRadius }: SkeletonProps) => {
  return (
    <div
      className={`bg-gray-100 ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--r)',
      }}
    />
  );
};
