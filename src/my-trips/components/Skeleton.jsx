import React from "react";

export default function Skeleton() {
  return (
    <div className="shadow-lg relative z-20 rounded-2xl mb-6 -translate-x-1 p-4 max-w-sm w-80 h-96">
      <div className="animate-pulse flex-col space-x-2">
        <div className="rounded-lg bg-slate-600 h-36 w-56 my-0 mx-auto"></div>
        <div className="flex-1 justify-center items-center space-y-7 py-1 mr-1">
          <div></div>
          <div className="flex-col space-y-4">
            <div className="h-2 bg-slate-600 rounded"></div>
            <div className="h-2 bg-slate-600 rounded"></div>
            <div className="h-2 bg-slate-600 rounded"></div>
            <div className="h-2 bg-slate-600 rounded"></div>
          </div>
          <div className="space-y-3 justify-center items-center flex flex-col">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 w-32 mt-4 bg-slate-600 rounded-3xl"></div>
              <div className="h-8 w-32 mt-4 bg-slate-600 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
