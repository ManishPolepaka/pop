import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, List, Grid3X3, MessageCircle } from "lucide-react";

interface AIInsight {
  situation: string;
  contradictions: string;
  patterns: string;
  blindSpot: string;
  meaning: string;
  questions: string;
}

interface ReportSection {
  id: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  content: string;
}

interface ReportViewerProps {
  categoryTitle: string;
  insights: AIInsight;
  onComplete?: () => void;
}

export const ReportViewer = ({
  categoryTitle,
  insights,
  onComplete,
}: ReportViewerProps) => {
  // Define sections with styling
  const sections: ReportSection[] = [
    {
      id: "situation",
      title: "The Situation",
      emoji: "📋",
      color: "from-blue-100 to-blue-50",
      bgColor: "bg-blue-100",
      textColor: "text-black",
      borderColor: "border-blue-800",
      content: insights.situation,
    },
    {
      id: "contradictions",
      title: "The Contradictions",
      emoji: "⚡",
      color: "from-cyan-100 to-cyan-50",
      bgColor: "bg-cyan-100",
      textColor: "text-black",
      borderColor: "border-cyan-800",
      content: insights.contradictions,
    },
    {
      id: "patterns",
      title: "The Patterns",
      emoji: "🔍",
      color: "from-orange-100 to-orange-50",
      bgColor: "bg-orange-100",
      textColor: "text-black",
      borderColor: "border-orange-800",
      content: insights.patterns,
    },
    {
      id: "blindspot",
      title: "The Blind Spot",
      emoji: "⚠️",
      color: "from-red-100 to-red-50",
      bgColor: "bg-red-100",
      textColor: "text-black",
      borderColor: "border-red-800",
      content: insights.blindSpot,
    },
    {
      id: "meaning",
      title: "What This Means",
      emoji: "💡",
      color: "from-purple-100 to-purple-50",
      bgColor: "bg-purple-100",
      textColor: "text-black",
      borderColor: "border-purple-800",
      content: insights.meaning,
    },
    {
      id: "questions",
      title: "What To Explore",
      emoji: "❓",
      color: "from-green-100 to-green-50",
      bgColor: "bg-green-100",
      textColor: "text-black",
      borderColor: "border-green-800",
      content: insights.questions,
    },
  ].filter((s) => s.content); // Only show sections with content

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSection = sections[currentIndex];
  const progress = `${currentIndex + 1}/${sections.length}`;

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    if (touchStart !== null && e.changedTouches[0].clientX !== null) {
      const distance = touchStart - e.changedTouches[0].clientX;
      
      // Swipe left = next, Swipe right = previous
      if (Math.abs(distance) > 50) {
        if (distance > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSection = (index: number) => {
    setCurrentIndex(index);
    setShowIndex(false);
  };

  // Auto-close index menu on scroll
  useEffect(() => {
    if (showIndex && containerRef.current) {
      const handleScroll = () => {
        setShowIndex(false);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [showIndex]);

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col overflow-hidden">
      {/* Header with Progress */}
      <div className="bg-white border-b-4 border-black p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-black/60 uppercase tracking-wider">
            Your Insight
          </p>
          <h1 className="text-xl font-black text-black">{categoryTitle}</h1>
        </div>
        
        {/* View Mode Toggle Button (Green Mark Position) */}
        <button
          onClick={() => setViewMode(viewMode === "single" ? "all" : "single")}
          className="ml-4 p-3 bg-green-400 border-2 border-black text-black font-bold rounded hover:bg-green-500 transition-all flex items-center justify-center"
          title={viewMode === "single" ? "View all cards" : "View single card"}
        >
          {viewMode === "single" ? (
            <Grid3X3 className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === "single" ? (
        // Single Card View (Carousel Mode)
        <div
          className="flex-1 flex flex-col justify-center items-center p-5 overflow-hidden"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Container with Animation */}
          <div className="w-full max-w-2xl h-full flex items-center justify-center">
            <div
              key={currentSection.id}
              className={`w-full bg-gradient-to-br ${currentSection.color} border-4 ${currentSection.borderColor} p-8 rounded-2xl shadow-lg 
                animate-in fade-in zoom-in duration-300 
                flex flex-col justify-start max-h-[70vh] overflow-y-auto`}
            >
              {/* Section Header */}
              <div className="mb-6 pb-4 border-b-3 border-black/20">
                <h2 className="text-3xl font-black text-black flex items-center gap-3">
                  <span className="text-4xl">{currentSection.emoji}</span>
                  {currentSection.title}
                </h2>
              </div>

              {/* Section Content */}
              <div className="flex-1">
                <p className="text-black/80 text-lg leading-relaxed whitespace-pre-wrap">
                  {currentSection.content}
                </p>
              </div>

              {/* Visual Footer Accent */}
              <div className="mt-6 pt-4 border-t-2 border-black/10 flex gap-1">
                {sections.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-300 ${
                      idx === currentIndex
                        ? "bg-black w-6"
                        : idx < currentIndex
                        ? "bg-black/40 w-3"
                        : "bg-black/20 w-3"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // All Cards View (Stacked Mode)
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`bg-gradient-to-br ${section.color} border-4 ${section.borderColor} p-6 rounded-2xl shadow-lg`}
              >
                {/* Section Header */}
                <div className="mb-4 pb-3 border-b-3 border-black/20">
                  <h2 className="text-2xl font-black text-black flex items-center gap-2">
                    <span className="text-3xl">{section.emoji}</span>
                    {section.title}
                  </h2>
                  <p className="text-xs font-bold text-black/50 mt-1">{idx + 1}/{sections.length}</p>
                </div>

                {/* Section Content */}
                <p className="text-black/80 text-base leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Controls - Only in Single Card Mode */}
      {viewMode === "single" && (
        <div className="bg-white border-t-4 border-black p-4 flex items-center justify-between gap-3">
          {/* Index Toggle Button */}
          <button
            onClick={() => setShowIndex(!showIndex)}
            className="px-4 py-2 bg-blue-100 border-2 border-black text-black font-bold rounded hover:bg-blue-200 transition-all flex items-center gap-2"
            title="Jump to section"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Jump</span>
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-100 border-2 border-black text-black font-bold rounded hover:bg-gray-200 transition-all disabled:opacity-30 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Progress Display */}
          <div className="text-center text-xs font-bold text-black/60">
            <div>SWIPE OR CLICK</div>
            <div>TO NAVIGATE</div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-black border-2 border-black text-white font-bold rounded hover:bg-white hover:text-black transition-all flex items-center gap-2"
          >
            <span className="hidden sm:inline">
              {currentIndex === sections.length - 1 ? "Finish" : "Next"}
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Index Menu (Floating) */}
      {showIndex && (
        <div className="fixed top-24 left-4 right-4 max-w-xs bg-white border-4 border-black rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            <h3 className="font-black text-black mb-3">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(idx)}
                  className={`w-full text-left px-4 py-3 rounded border-2 font-bold transition-all ${
                    idx === currentIndex
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg mr-2">{section.emoji}</span>
                  {section.title}
                  <span className="float-right text-xs">{idx + 1}/{sections.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swipe Hint (Mobile) - Only in Single Card Mode */}
      {viewMode === "single" && (
        <div className="sm:hidden fixed bottom-20 left-0 right-0 text-center text-xs text-black/50 pointer-events-none">
          ← Swipe to navigate →
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
