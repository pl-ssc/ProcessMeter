import React from 'react';
import { Skeleton as UiSkeleton } from './ui/skeleton.jsx';

export function SkeletonText({ width = '100%', height = '1em', className = '' }) {
  return <UiSkeleton className={className} style={{ width, height }} />;
}

export function SkeletonBlock({ width = '100%', height = '100%', className = '' }) {
  return <UiSkeleton className={className} style={{ width, height }} />;
}

export function AppSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <UiSkeleton className="h-12 w-64 rounded-2xl" />
          <div className="flex gap-3">
            <UiSkeleton className="h-10 w-24 rounded-full" />
            <UiSkeleton className="h-10 w-10 rounded-full" />
            <UiSkeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
      <div className="border-b px-6 py-4">
        <div className="grid gap-3 md:grid-cols-3">
          <UiSkeleton className="h-20 rounded-2xl" />
          <UiSkeleton className="h-20 rounded-2xl" />
          <UiSkeleton className="h-20 rounded-2xl" />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] gap-4 p-6">
        <UiSkeleton className="rounded-3xl" />
        <UiSkeleton className="rounded-3xl" />
      </div>
    </div>
  );
}
