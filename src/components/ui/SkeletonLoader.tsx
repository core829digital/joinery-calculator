"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
  );
}

export function Window2DSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 w-full">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-36 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <div className="w-full max-w-[450px] h-[500px] flex items-center justify-center">
        <div className="relative w-64 h-80">
          <Skeleton className="absolute inset-0 rounded-lg" />
          <Skeleton className="absolute top-4 left-4 right-4 h-3/4 rounded" />
          <Skeleton className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PriceSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-200">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function ButtonSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-9 w-24 rounded-lg", className)} />;
}

export function PanelSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function ConfiguratorSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <div className="h-10 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center px-4 gap-3">
        <Skeleton className="w-7 h-7 rounded-md bg-slate-700" />
        <Skeleton className="w-48 h-4 bg-slate-700" />
      </div>
      <div className="bg-white border-b border-slate-200 flex items-center justify-between px-2 py-2 gap-2">
        <div className="flex items-center gap-1.5">
          <ButtonSkeleton className="w-20" />
          <ButtonSkeleton className="w-16" />
          <ButtonSkeleton className="w-12" />
          <ButtonSkeleton className="w-16" />
        </div>
        <Skeleton className="w-48 h-8 rounded-lg" />
      </div>
      <div className="flex-1 flex gap-0 overflow-hidden p-2">
        <div className="hidden md:flex w-56 flex-col border-r border-slate-200 bg-white rounded-xl">
          <Skeleton className="h-10 w-full rounded-t-xl" />
          <div className="flex-1 p-2 space-y-1">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 p-2">
          <div className="flex items-center gap-1 mb-2">
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Window2DSkeleton />
          </div>
          <div className="h-10 border-t border-slate-200 bg-white rounded-b-xl flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
