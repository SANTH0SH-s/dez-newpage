import React from "react";

export function AdminSkeleton() {
  return (
    <div className="space-y-8 animate-pulse font-sans w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-200/60 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-gray-200/60 rounded-xl" />
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden p-6 space-y-6">
        <div className="h-6 w-1/4 bg-gray-200/60 rounded-md" />
        
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="h-12 w-12 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200/60 rounded-md" />
                <div className="h-3 w-1/2 bg-gray-100/60 rounded-md" />
              </div>
              <div className="h-8 w-24 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
