import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { InsightCompareModel } from "@/lib/insight-report-compare";

type InsightReportCompareViewProps = {
  model: InsightCompareModel;
  formatDate: (value: unknown) => string;
  onClose: () => void;
};

const statusLabel: Record<string, string> = {
  unchanged: "Similar",
  changed: "Different",
  new: "New",
  cleared: "Cleared",
};

const statusClass: Record<string, string> = {
  unchanged: "bg-white text-black/70",
  changed: "bg-yellow-200 text-black",
  new: "bg-black text-yellow-300",
  cleared: "bg-white text-black/50 border-dashed",
};

const InsightReportCompareView = ({ model, formatDate, onClose }: InsightReportCompareViewProps) => {
  const [threadTab, setThreadTab] = useState<"then" | "now">("now");

  const olderLabel = formatDate(model.older.createdAt);
  const newerLabel = formatDate(model.newer.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-yellow-50">
      <header className="shrink-0 border-b-4 border-black bg-yellow-300 px-4 py-3 safe-area-top">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-black text-black mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">Compare</p>
        <h1 className="text-lg font-black text-black leading-tight">{model.newer.categoryTitle}</h1>
        <p className="text-xs font-semibold text-black/70 mt-1">
          {olderLabel} → {newerLabel}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        <section className="bg-white border-4 border-black p-4 space-y-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-sm font-black text-black uppercase tracking-wide">Overall</h2>
          <ul className="space-y-2">
            {model.summary.map((bullet, i) => (
              <li key={i} className="text-sm font-semibold text-black leading-relaxed flex gap-2">
                <span className="text-black font-black shrink-0">•</span>
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border-4 border-black p-4 space-y-3">
          <h2 className="text-sm font-black text-black uppercase tracking-wide">What we&apos;re seeing</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setThreadTab("then")}
              className={`flex-1 text-xs font-black uppercase py-2 border-2 border-black ${
                threadTab === "then" ? "bg-black text-yellow-300" : "bg-white text-black"
              }`}
            >
              Then
            </button>
            <button
              type="button"
              onClick={() => setThreadTab("now")}
              className={`flex-1 text-xs font-black uppercase py-2 border-2 border-black ${
                threadTab === "now" ? "bg-black text-yellow-300" : "bg-white text-black"
              }`}
            >
              Now
            </button>
          </div>
          <p className="text-[11px] font-bold text-black/50">{threadTab === "then" ? olderLabel : newerLabel}</p>
          <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
            {threadTab === "then"
              ? model.olderThread || "No summary saved for this run."
              : model.newerThread || "No summary saved for this run."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-black uppercase tracking-wide px-1">Your answers</h2>
          {model.answerDiffs.map((row) => (
            <div key={row.questionId} className="bg-white border-4 border-black p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-black text-black">
                  Q{row.questionNumber}
                  {row.questionLabel ? (
                    <span className="block font-semibold text-black/60 normal-case mt-0.5 leading-snug">
                      {row.questionLabel}
                    </span>
                  ) : null}
                </p>
                <span
                  className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${statusClass[row.status]}`}
                >
                  {statusLabel[row.status]}
                </span>
              </div>
              {row.thenText && (
                <div className="border-l-4 border-black/30 pl-2">
                  <p className="text-[10px] font-black text-black/50 uppercase">Then</p>
                  <p className="text-sm font-semibold text-black/80">{row.thenText}</p>
                </div>
              )}
              {row.nowText && (
                <div className="border-l-4 border-yellow-500 pl-2">
                  <p className="text-[10px] font-black text-black/50 uppercase">Now</p>
                  <p className="text-sm font-semibold text-black">{row.nowText}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {(model.principleDiff.kept.length > 0 ||
          model.principleDiff.added.length > 0 ||
          model.principleDiff.dropped.length > 0) && (
          <section className="bg-white border-4 border-black p-4 space-y-2">
            <h2 className="text-sm font-black text-black uppercase tracking-wide">Ideas</h2>
            {model.principleDiff.kept.length > 0 && (
              <p className="text-sm font-semibold text-black">
                <span className="font-black">Both times:</span> {model.principleDiff.kept.join(", ")}
              </p>
            )}
            {model.principleDiff.added.length > 0 && (
              <p className="text-sm font-semibold text-black">
                <span className="font-black">New this time:</span> {model.principleDiff.added.join(", ")}
              </p>
            )}
            {model.principleDiff.dropped.length > 0 && (
              <p className="text-sm font-semibold text-black/70">
                <span className="font-black">Not highlighted this time:</span>{" "}
                {model.principleDiff.dropped.join(", ")}
              </p>
            )}
          </section>
        )}

        <p className="text-[11px] font-semibold text-black/55 leading-relaxed px-1">
          This compares your words only—no score, no judgment. Use what fits.
        </p>
      </div>
    </div>
  );
};

export default InsightReportCompareView;
