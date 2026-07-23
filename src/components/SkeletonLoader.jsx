import React from 'react';

// Single Product Card Skeleton Component
export const ProductCardSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full h-[280px] bg-gray-200" />
      {/* Info Placeholder */}
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1" />
      </div>
    </div>
  );
};

// Grid of Product Card Skeletons
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Product Detail Skeleton Component
export const ProductDetailSkeleton = () => {
  return (
    <div className="pt-24 pb-12 w-full max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8 animate-pulse">
      {/* Left Image Grid Skeleton */}
      <div className="w-full md:w-1/2 grid grid-cols-2 gap-2">
        <div className="h-[280px] bg-gray-200 rounded-sm" />
        <div className="h-[280px] bg-gray-200 rounded-sm" />
        <div className="h-[280px] bg-gray-200 rounded-sm" />
        <div className="h-[280px] bg-gray-200 rounded-sm" />
      </div>
      {/* Right Info Skeleton */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4 mt-4" />
        <div className="h-12 bg-gray-200 rounded w-full mt-6" />
        <div className="h-12 bg-gray-200 rounded w-full mt-2" />
      </div>
    </div>
  );
};

// Category Circle Skeleton Component
export const CategoryCircleSkeleton = () => {
  return (
    <div className="flex gap-4 overflow-hidden py-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
};
