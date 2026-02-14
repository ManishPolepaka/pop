import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import diagnosticsData from "../../public/insight-diagnostics.json";
import { saveDiagnosticAnswers } from "@/firebase/diagnostics";

interface Category {
  id: number;
  title: string;
  icon: string;
  description: string;
  tone: string;
  role: string;
  color: string;
  questions: Array<{
    id: number;
    text: string;
  }>;
}

const Insight = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCategories(diagnosticsData.categories);
    setIsLoading(false);
  }, []);

  // Count non-empty answers
  const countFilledAnswers = (answersArray: string[]) => {
    return answersArray.filter((answer) => answer.trim().length > 0).length;
  };

  const filledAnswersCount = countFilledAnswers(answers);
  const minAnswersRequired = 7;
  const canComplete = filledAnswersCount >= minAnswersRequired;

  const handleCompleteDiagnostic = async () => {
    if (!user || !selectedCategory) return;

    setIsSaving(true);
    try {
      const docId = await saveDiagnosticAnswers(
        user.uid,
        selectedCategory.id,
        selectedCategory.title,
        answers
      );

      // Navigate to results page with diagnostic data
      navigate("/insight-results", {
        state: {
          categoryId: selectedCategory.id,
          categoryTitle: selectedCategory.title,
          questions: selectedCategory.questions.map((q) => q.text),
          answers,
          docId,
        },
      });
    } catch (error) {
      console.error("Error saving diagnostic:", error);
      alert("Error saving diagnostic. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-6 w-6 text-black animate-spin" />
      </div>
    );
  }

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-3 space-y-1">
          <h2 className="text-3xl font-black text-black tracking-tight">
            Discover Your Insights
          </h2>
          <p className="text-black/70 font-semibold text-sm">
            Choose an area to explore and understand yourself better
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setCurrentAnswer("");
              }}
              className="w-full bg-white border-4 border-black p-5 text-left hover:bg-black hover:text-white transition-all min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-black text-black leading-tight flex-1">
                    {category.title}
                  </h3>
                  <span className="text-2xl flex-shrink-0">{category.icon}</span>
                </div>
                <p className="text-xs text-black/70">{category.description}</p>
              </div>
            </button>
          ))}
        </div>


      </div>
    );
  }

  // Question View
  const currentQuestion = selectedCategory.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedCategory.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === selectedCategory.questions.length - 1;

  const handleNextQuestion = () => {
    // Save current answer at current question index
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Check if user has answered at least 7 questions
      const filledCount = updatedAnswers.filter((answer) => answer.trim().length > 0).length;
      if (filledCount < minAnswersRequired) {
        // Don't proceed - alert user
        alert(`Please answer at least ${minAnswersRequired} questions for meaningful insights. You've answered ${filledCount} so far.`);
        setCurrentAnswer("");
        return;
      }

      // Clean up answers array for submission (ensure dense array)
      const finalAnswers = [];
      for (let i = 0; i < selectedCategory!.questions.length; i++) {
        finalAnswers.push(updatedAnswers[i] || "");
      }
      // Temporarily store and call handler
      const tempAnswers = answers;
      setAnswers(finalAnswers);
      
      // Use a callback to ensure state is updated before submitting
      setTimeout(() => {
        handleCompleteDiagnostic();
      }, 0);
    } else {
      // Load answer from next question if it exists
      const nextAnswer = updatedAnswers[currentQuestionIndex + 1] || "";
      setCurrentAnswer(nextAnswer);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer at current question index
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = currentAnswer;
      
      // Get the previous answer
      const previousAnswer = updatedAnswers[currentQuestionIndex - 1] || "";
      
      setAnswers(updatedAnswers);
      setCurrentAnswer(previousAnswer);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    // Save empty answer at current question index
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = "";
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Clean up answers array for submission (ensure dense array)
      const finalAnswers = [];
      for (let i = 0; i < selectedCategory.questions.length; i++) {
        finalAnswers.push(updatedAnswers[i] || "");
      }
      // Temporarily store and call handler
      const tempAnswers = answers;
      setAnswers(finalAnswers);
      
      // Use a callback to ensure state is updated before submitting
      setTimeout(() => {
        handleCompleteDiagnostic();
      }, 0);
    } else {
      // Load answer from next question if it exists
      const nextAnswer = updatedAnswers[currentQuestionIndex + 1] || "";
      setCurrentAnswer(nextAnswer);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-4 border-black p-4">
        <div>
          <p className="text-sm font-black text-black mb-1 tracking-wide">
            {selectedCategory.icon} {selectedCategory.title}
          </p>
          <p className="text-xs font-semibold text-black/60">
            Question {currentQuestionIndex + 1} of {selectedCategory.questions.length}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setCurrentAnswer("");
          }}
          className="font-black text-lg text-black hover:bg-black hover:text-white px-4 py-2 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white border-3 border-black h-4 overflow-hidden">
        <div
          className="bg-yellow-400 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Answer Completion Status */}
      <p className="font-bold text-black text-sm">
        Answered: {filledAnswersCount}/{selectedCategory.questions.length} {filledAnswersCount >= minAnswersRequired ? "✓" : "(Need " + (minAnswersRequired - filledAnswersCount) + " more)"}
      </p>

      {/* Question Card */}
      <div className="bg-white border-4 border-black p-8 space-y-6">
        <div className="border-b-4 border-black pb-4">
          <h2 className="text-2xl font-black text-black leading-tight tracking-tight">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white border-4 border-black p-4">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Your answer (optional)"
              className="w-full bg-white border-0 text-black placeholder-black/50 font-medium focus:outline-none resize-none min-h-24 text-base"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSaving}
          className="px-6 py-3 bg-white border-3 border-black text-black font-black text-base hover:bg-black hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          BACK
        </button>
        <button
          onClick={handleSkip}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-white border-3 border-black text-black font-black text-base hover:bg-black hover:text-white transition-all disabled:opacity-50"
        >
          SKIP
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={isSaving || (isLastQuestion && !canComplete)}
          className="flex-1 px-6 py-3 bg-black border-3 border-black text-white font-black text-base hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              WAIT
            </>
          ) : isLastQuestion ? (
            "COMPLETE"
          ) : (
            "NEXT"
          )}
        </button>
      </div>

      {/* Completion Status Message */}
      {isLastQuestion && (
        <p className="border-3 border-black p-4 font-bold text-black text-sm">
          {canComplete ? (
            <>Answered {filledAnswersCount}/10. READY.</>  
          ) : (
            <>NEED {minAnswersRequired - filledAnswersCount} MORE ANSWERS.</>
          )}
        </p>
      )}
    </div>
  );
};

export default Insight;
