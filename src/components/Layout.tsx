import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center py-0 md:py-8 bg-gradient-to-br from-[#e2eae7] to-[#c9d6d1]">
      <div
        className="relative w-full md:w-[440px] md:max-w-[440px] md:h-[880px] md:rounded-[38px] md:border-[10px] md:border-black md:shadow-2xl bg-[#e6f4ef] overflow-hidden flex flex-col"
        style={{ height: "100vh" }}
      >
        {children}
      </div>
    </div>
  );
}

export function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const dot = (active: boolean, filled: boolean) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition ${
      active ? "bg-[#148c78] text-white" : "bg-white text-gray-400 border border-gray-200"
    } ${filled ? "shadow-md" : ""}`;

  return (
    <div className="flex items-center px-6 py-3 bg-[#e6f4ef]">
      <div className={dot(step >= 1, step === 1)}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <div className="flex-1 dashed-line h-[2px]" />
      <div className={dot(step >= 2, step === 2)}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
          <path d="M3 4h2l2.5 12h11L21 8H6" />
        </svg>
      </div>
      <div className="flex-1 dashed-line h-[2px]" />
      <div className={dot(step >= 3, step === 3)}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </div>
    </div>
  );
}
