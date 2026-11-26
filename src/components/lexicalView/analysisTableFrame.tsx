import type { ReactNode } from "react";

interface AnalysisTableFrameProps {
  title: string;
  children: ReactNode;
}

export const AnalysisTableFrame = ({
  title,
  children,
}: AnalysisTableFrameProps) => (
  <section aria-label={title} className="mt-2">
    <h2 className="mb-3 text-lg font-semibold text-stone-100">{title}</h2>
    <div className="overflow-x-auto rounded-sm border border-stone-700">
      {children}
    </div>
  </section>
);
