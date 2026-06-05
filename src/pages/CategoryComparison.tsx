import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryDiagnostics } from "@/firebase/diagnostics";
import diagnosticsData from "@/data/insight-diagnostics.json";

interface DiagnosticData {
  id: string;
  categoryId: number;
  categoryTitle: string;
  answers: string[];
  patterns?: {
    sentiment: string;
    intensity: string;
    keywords: string[];
    themes: string[];
  };
  aiInsight?: {
    heard: string;
    pattern: string;
    meaning: string;
    help: string;
  };
  completedAt: any;
}

const CategoryComparison = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numCategoryId = categoryId ? parseInt(categoryId, 10) : null;
  const category = numCategoryId
    ? diagnosticsData.categories.find((c) => c.id === numCategoryId)
    : null;

  useEffect(() => {
    if (!user || !numCategoryId) return;

    const loadDiagnostics = async () => {
      try {
        const diags = await getCategoryDiagnostics(user.uid, numCategoryId);
        setDiagnostics(diags as DiagnosticData[]);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading diagnostics:", err);
        setError("Failed to load diagnostics");
        setIsLoading(false);
      }
    };

    loadDiagnostics();
  }, [user, numCategoryId]);

  if (!user || !numCategoryId || !category) {
    return (
      <div className="text-center py-12">
        <p className="text-black/70">Invalid category</p>
        <button onClick={() => navigate("/insights-hub")} className="mt-4 text-yellow-400">
          Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader className="h-8 w-8 text-black animate-spin mb-3" />
        <p className="text-black font-bold">Loading comparisons...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-bold text-center py-12">{error}</div>;
  }

  if (diagnostics.length < 2) {
    return (
      <div className="text-center py-12">
        <p className="text-black/70 mb-4">
          Complete this diagnostic at least twice to see comparison
        </p>
        <button
          onClick={() => navigate("/main")}
          className="px-6 py-2 bg-yellow-400 border-2 border-black text-black font-bold"
        >
          Take Diagnostic Now
        </button>
      </div>
    );
  }

  // Get the first two most recent diagnostics
  const [current, previous] = diagnostics.slice(0, 2);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getChangeIndicator = (oldValue: string, newValue: string) => {
    if (oldValue === newValue) return "🟡";
    if (
      (oldValue === "negative" && newValue === "neutral") ||
      (oldValue === "neutral" && newValue === "positive") ||
      (oldValue === "low" && newValue === "high") ||
      (oldValue === "low" && newValue === "medium") ||
      (oldValue === "medium" && newValue === "high")
    ) {
      return "📈";
    }
    return "📉";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/insights-hub")}
          className="flex items-center gap-2 text-black/70 hover:text-black mb-4 font-bold text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Hub
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-black text-black">{category.title}</h1>
            <p className="text-sm text-black/70">Growth Comparison</p>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Diagnostic */}
        <div className={`border-4 border-black rounded-xl p-6 ${category.color}`}>
          <h2 className="text-lg font-black text-black mb-1">Previous</h2>
          <p className="text-sm text-black/70 mb-6">{formatDate(previous.completedAt)}</p>

          {previous.patterns && (
            <div className="space-y-4">
              <div className="bg-white bg-opacity-70 p-3">
                <p className="text-xs font-bold text-black/70 mb-1">Sentiment</p>
                <p className="text-lg font-black text-black capitalize">
                  {previous.patterns.sentiment}
                </p>
              </div>

              <div className="bg-white bg-opacity-70 p-3">
                <p className="text-xs font-bold text-black/70 mb-1">Intensity</p>
                <p className="text-lg font-black text-black capitalize">
                  {previous.patterns.intensity}
                </p>
              </div>

              {previous.patterns.themes.length > 0 && (
                <div className="bg-white bg-opacity-70 p-3">
                  <p className="text-xs font-bold text-black/70 mb-2">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {previous.patterns.themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs bg-black bg-opacity-10 text-black px-2 py-1 rounded"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {previous.aiInsight && (
            <div className="mt-6 pt-6 border-t-2 border-black/20">
              <div className="bg-white bg-opacity-70 p-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-black/70 mb-1">Key Insight</p>
                  <p className="text-sm text-black line-clamp-3">
                    {previous.aiInsight.pattern}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Diagnostic */}
        <div className={`border-4 border-black rounded-xl p-6 ${category.color}`}>
          <h2 className="text-lg font-black text-black mb-1">Current</h2>
          <p className="text-sm text-black/70 mb-6">{formatDate(current.completedAt)}</p>

          {current.patterns && (
            <div className="space-y-4">
              <div className="bg-white bg-opacity-70 rounded-lg p-3">
                <p className="text-xs font-bold text-black/70 mb-1">Sentiment</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-black capitalize">
                    {current.patterns.sentiment}
                  </p>
                  <span className="text-xl">
                    {previous.patterns &&
                      getChangeIndicator(
                        previous.patterns.sentiment,
                        current.patterns.sentiment
                      )}
                  </span>
                </div>
              </div>

              <div className="bg-white bg-opacity-70 rounded-lg p-3">
                <p className="text-xs font-bold text-black/70 mb-1">Intensity</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-black capitalize">
                    {current.patterns.intensity}
                  </p>
                  <span className="text-xl">
                    {previous.patterns &&
                      getChangeIndicator(
                        previous.patterns.intensity,
                        current.patterns.intensity
                      )}
                  </span>
                </div>
              </div>

              {current.patterns.themes.length > 0 && (
                <div className="bg-white bg-opacity-70 rounded-lg p-3">
                  <p className="text-xs font-bold text-black/70 mb-2">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {current.patterns.themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs bg-black bg-opacity-10 text-black px-2 py-1 rounded"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {current.aiInsight && (
            <div className="mt-6 pt-6 border-t-2 border-black/20">
              <div className="bg-white bg-opacity-70 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-black/70 mb-1">Key Insight</p>
                  <p className="text-sm text-black line-clamp-3">
                    {current.aiInsight.pattern}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Growth Summary */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black rounded-xl p-6">
        <h2 className="text-lg font-black text-black mb-4">📊 Your Growth</h2>
        <div className="space-y-3">
          {previous.patterns && current.patterns && (
            <>
              {previous.patterns.sentiment !== current.patterns.sentiment && (
                <p className="text-sm text-black">
                  ✨ Your emotional perspective has shifted from{" "}
                  <span className="font-bold">{previous.patterns.sentiment}</span> to{" "}
                  <span className="font-bold">{current.patterns.sentiment}</span>
                </p>
              )}
              {previous.patterns.intensity !== current.patterns.intensity && (
                <p className="text-sm text-black">
                  🔍 The intensity of your reflection has{" "}
                  {["low", "medium", "high"].indexOf(current.patterns.intensity) >
                  ["low", "medium", "high"].indexOf(previous.patterns.intensity)
                    ? "deepened"
                    : "lightened"}
                </p>
              )}
              {previous.patterns.themes !== current.patterns.themes && (
                <p className="text-sm text-black">
                  🌱 Your focus areas have evolved, showing growth in new dimensions
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Full Insights */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/insights-hub")}
          className="flex-1 px-6 py-3 bg-gray-100 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-200"
        >
          Back to Hub
        </button>
        <button
          onClick={() => navigate("/main")}
          className="flex-1 px-6 py-3 bg-yellow-400 border-2 border-black text-black font-bold rounded-lg hover:bg-yellow-500 flex items-center justify-center gap-2"
        >
          <span>Retake Now</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* History */}
      {diagnostics.length > 2 && (
        <div className="border-4 border-black rounded-xl p-6">
          <h3 className="font-bold text-black mb-4">📈 Complete History</h3>
          <div className="space-y-2">
            {diagnostics.map((diag, idx) => (
              <div key={diag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-black/70">
                  {idx === 0 ? "Most Recent" : `${idx} ${idx === 1 ? "version ago" : "versions ago"}`}
                </span>
                <span className="text-sm font-bold text-black">
                  {formatDate(diag.completedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryComparison;
