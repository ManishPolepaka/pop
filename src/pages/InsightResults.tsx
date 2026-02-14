import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader, ArrowRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { extractPatterns, buildClaudePrompt, parseClaudeResponse, formatAsAIInsight } from "@/lib/insightAnalysis";import { generateInsightWithFallback } from "@/lib/openaiService";import { saveDiagnosticWithInsights, getAllDiagnostics } from "@/firebase/diagnostics";
import { addToTimeline } from "@/firebase/insightTimeline";
import { analyzeInsightRelationships } from "@/firebase/insightRelationships";
import diagnosticsData from "../../public/insight-diagnostics.json";

interface InsightLocation {
  categoryId: number;
  categoryTitle: string;
  questions: string[];
  answers: string[];
  docId: string;
}

interface AIInsight {
  heard: string;
  commonSenseReframe: string;
  blindSpot: string;
  pattern: string;
  meaning: string;
  help: string;
}

const InsightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as InsightLocation | undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticDocId, setDiagnosticDocId] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !user) {
      setError("Missing diagnostic data");
      setIsLoading(false);
      return;
    }

    const analyzeAndSaveAnswers = async () => {
      try {
        // Extract patterns from answers
        const patterns = extractPatterns(state.categoryId, state.answers);

        // Generate insight using OpenAI (with fallback)
        const insightResult = await generateInsightWithFallback({
          categoryId: state.categoryId,
          categoryTitle: state.categoryTitle,
          questions: state.questions,
          answers: state.answers,
          keywords: patterns.keywords,
          themes: patterns.themes,
          sentiment: patterns.sentiment,
          intensity: patterns.intensity,
        });

        const aiInsight = {
          heard: insightResult.heard,
          commonSenseReframe: insightResult.commonSenseReframe,
          blindSpot: insightResult.blindSpot,
          pattern: insightResult.pattern,
          meaning: insightResult.meaning,
          help: insightResult.help,
        };

        // Save diagnostic with full schema
        const docId = await saveDiagnosticWithInsights(
          user.uid,
          state.categoryId,
          state.categoryTitle,
          state.answers,
          patterns,
          aiInsight
        );

        // Add to timeline
        await addToTimeline(user.uid, state.categoryId, state.categoryTitle, patterns, docId);

        // Analyze relationships with existing diagnostics
        const allDiagnostics = await getAllDiagnostics(user.uid);
        if (allDiagnostics.length > 1) {
          // Only analyze if there are multiple diagnostics
          const allDiagsWithId = [
            ...allDiagnostics,
            {
              id: docId,
              categoryId: state.categoryId,
              categoryTitle: state.categoryTitle,
              answers: state.answers,
              patterns,
              aiInsight,
            },
          ];
          await analyzeInsightRelationships(user.uid, allDiagsWithId);
        }

        setDiagnosticDocId(docId);
        setInsights(aiInsight);
        setIsLoading(false);
      } catch (err) {
        console.error("Error analyzing insight:", err);
        setError("Error generating insights. Please try again.");
        setIsLoading(false);
      }
    };

    analyzeAndSaveAnswers();
  }, [state, user]);

  if (!state || !user) {
    return (
      <div className="min-h-screen bg-yellow-300 flex flex-col pb-20 p-5">
        <div className="text-center py-12">
          <p className="text-black/70">Missing diagnostic data. Please start over.</p>
          <button
            onClick={() => navigate("/main")}
            className="mt-4 px-6 py-2 bg-yellow-400 border-2 border-black text-black font-bold rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-300 flex flex-col pb-20 p-5">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader className="h-8 w-8 text-black animate-spin" />
          <p className="text-black font-bold">Generating your insights...</p>
          <p className="text-black/60 text-sm">This usually takes a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-300 flex flex-col pb-20 p-5">
        <div className="text-center py-12 space-y-4">
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={() => navigate("/main")}
            className="px-6 py-2 bg-yellow-400 border-2 border-black text-black font-bold rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col pb-20">
      <div className="space-y-6 p-5 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div>
          <p className="text-sm font-bold text-black/70 mb-2">Your Insight</p>
          <h1 className="text-3xl font-black text-black">{state.categoryTitle}</h1>
        </div>

      {/* Insights Sections */}
      {insights && (
        <div className="space-y-4">
          {/* What I Heard */}
          {insights.heard && (
            <div className="bg-blue-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                � What I Heard
              </h2>
              <p className="text-black leading-relaxed">{insights.heard}</p>
            </div>
          )}

          {/* Common Sense Reframe */}
          {insights.commonSenseReframe && (
            <div className="bg-cyan-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                🧠 Common Sense Reframe
              </h2>
              <p className="text-black leading-relaxed">{insights.commonSenseReframe}</p>
            </div>
          )}

          {/* The Blind Spot */}
          {insights.blindSpot && (
            <div className="bg-red-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                ⚠️ The Blind Spot
              </h2>
              <p className="text-black leading-relaxed">{insights.blindSpot}</p>
            </div>
          )}

          {/* The Pattern */}
          {insights.pattern && (
            <div className="bg-yellow-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                🔄 The Pattern
              </h2>
              <p className="text-black leading-relaxed">{insights.pattern}</p>
            </div>
          )}

          {/* What This Means */}
          {insights.meaning && (
            <div className="bg-purple-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                💡 What This Means
              </h2>
              <p className="text-black leading-relaxed">{insights.meaning}</p>
            </div>
          )}

          {/* What Might Help */}
          {insights.help && (
            <div className="bg-green-100 border-4 border-black p-6">
              <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
                🎯 What Might Help
              </h2>
              <p className="text-black leading-relaxed">{insights.help}</p>
            </div>
          )}
        </div>
      )}

      {/* Meta Info */}
      <div className="bg-white border-2 border-black p-4">
        <p className="text-xs text-black/60 text-center">
          ✨ These insights are generated to help you understand yourself better.
          <br />
          They're not prescriptive—just observations to reflect on.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/main")}
          className="flex-1 px-6 py-3 bg-gray-100 border-2 border-black text-black font-bold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Explore Another
        </button>
      </div>

      {/* Demo Notice */}
      <div className="bg-green-100 border-2 border-green-800 p-4">
        <p className="text-xs text-green-900 font-bold">
          ✅ Live! Using OpenAI GPT-4o Mini for real AI insights.
          <br />
          💰 Cost: ~$0.002 per insight | 🚀 Diagnostics saved to Firestore
        </p>
      </div>
      </div>
    </div>
  );
};

export default InsightResults;
