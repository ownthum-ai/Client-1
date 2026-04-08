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
      className={`skeleton-pulse bg-[var(--border)] opacity-20 ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--r)',
      }}
    />
  );
};
