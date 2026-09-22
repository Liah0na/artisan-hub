"use client";

import { useState } from "react";

type LegalAccordionProps = {
  number: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function LegalAccordion({
  number,
  title,
  children,
  defaultOpen = false,
}: LegalAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="group border-b border-gray-200">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-200"
      >
        {/* Section title */}
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`shrink-0 text-sm font-semibold tracking-wide transition-colors duration-200 ${isOpen
                ? "text-[#0055cc]"
                : "text-gray-400 group-hover:text-[#0055cc]"
              }`}
          >
            {number}
          </span>

          <h2
            className={`text-lg font-semibold transition-colors duration-200 ${isOpen
                ? "text-gray-900"
                : "text-gray-800 group-hover:text-[#0055cc]"
              }`}
          >
            {title}
          </h2>
        </div>

        {/* Plus / Minus */}
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xl font-light transition-all duration-200 ${isOpen
              ? "border-[#0055cc] bg-[#0055cc] text-white"
              : "border-gray-300 bg-white text-gray-500 group-hover:border-[#0055cc] group-hover:text-[#0055cc]"
            }`}
        >
          <span className="relative -top-px">
            {isOpen ? "−" : "+"}
          </span>
        </span>
      </button>

      {/* Content */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <div className="pb-7 pl-0 pr-12 text-[15px] leading-7 text-gray-600 md:pl-11">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
