import { useState, useEffect, useMemo, useRef } from "react";
import { Home, BookOpen, User, Lightbulb, Rocket, MessageSquarePlus, Bell, Plus, RefreshCw, ChevronRight, ArrowLeft, Loader, Brain, Users, Briefcase, Dumbbell, DollarSign, Copy, Check, MoreVertical, GitCompare, Settings as SettingsIcon } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc } from "firebase/firestore";

export type ReminderFilterType = "schedule" | "recurring";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReminders } from "@/hooks/useFirebaseReminders";
import NotificationPopup from "@/components/NotificationPopup";
import Reminders from "./Reminders";
import Feedback from "./Feedback";
import Settings from "./Settings";
import { parseReminderTime } from "@/lib/reminderScheduler";
import { getInsightCategories, InsightCategory, InsightQuestion } from "@/lib/mirror-insight-questions";
import { getCategoryQuestionsLive, getInsightCategoriesLive } from "@/firebase/insights-kb";
import { generateRAGInsight, type RAGPresentationResult } from "@/firebase/insight-ai-service";
import {
  parseReflectionInsight,
  insightHeroLine,
  pickStartHereTry,
} from "@/lib/parse-reflection-insight";
import {
  buildInsightCompareModel,
  canCompareReport,
  resolveComparePair,
} from "@/lib/insight-report-compare";
import { getCategoryQuestions } from "@/lib/mirror-insight-questions";
import InsightReportCompareView from "@/components/InsightReportCompareView";
import { db } from "@/firebase/config";

const REFLECTION_TRUST_LINE =
  "These ideas come from matching what you wrote with patterns in our library—they’re starting points, not diagnoses. Use what fits and leave the rest.";
const REFLECTION_FEED_OPEN_KEY = "reflectionFeedOpen";

const hashToDocId = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return `rep_${hash.toString(16).padStart(8, "0")}`;
};

interface InsightReportEntry {
  id: string;
  categoryId: string;
  categoryTitle: string;
  reportTitle?: string;
  answers: Record<string, string>;
  formattedInsight: string;
  matchedPrinciples: RAGPresentationResult["matchedPrinciples"];
  generatedKey: string;
  createdAt?: Timestamp;
}

const sanitizeMatchedPrinciples = (
  principles: RAGPresentationResult["matchedPrinciples"] | undefined
) => {
  return (principles || []).map((principle) => ({
    id: principle.id,
    bookTitle: principle.bookTitle,
    author: principle.author,
    principleTitle: principle.principleTitle,
    description: principle.description,
    ...(typeof principle.whyContext === "string" ? { whyContext: principle.whyContext } : {}),
    ...(Array.isArray(principle.userAnchors) ? { userAnchors: principle.userAnchors } : {}),
    ...(typeof principle.coreQuote === "string" ? { coreQuote: principle.coreQuote } : {}),
    simpleExplanation: principle.simpleExplanation,
    microAction: principle.microAction,
    timeToImplement: principle.timeToImplement,
  }));
};

// Icon mapping helper
const getIconComponent = (iconName: string, sizeClassName = "h-10 w-10") => {
  const iconMap: Record<string, React.ReactNode> = {
    Brain: <Brain className={`${sizeClassName} text-black`} />,
    Users: <Users className={`${sizeClassName} text-black`} />,
    Briefcase: <Briefcase className={`${sizeClassName} text-black`} />,
    User: <User className={`${sizeClassName} text-black`} />,
    Dumbbell: <Dumbbell className={`${sizeClassName} text-black`} />,
    DollarSign: <DollarSign className={`${sizeClassName} text-black`} />,
  };
  return iconMap[iconName] || <div className={sizeClassName} />;
};

const Main = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"feed" | "reminders" | "insight" | "feedback" | "settings">("feed");
  const [reminderTypeFilter, setReminderTypeFilter] = useState<ReminderFilterType>("schedule");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [now, setNow] = useState(new Date());
  const [insightCategories, setInsightCategories] = useState<InsightCategory[]>([]);
  const [feedSectionTab, setFeedSectionTab] = useState<"pops" | "insights">("pops");
  
  // Insight sub-states
  const [insightPage, setInsightPage] = useState<"categories" | "questionnaire" | "reflection">("categories");
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);
  const [questions, setQuestions] = useState<InsightQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  /** Insight MC: none (pick one), preset (sentence option), custom (textarea). */
  const [insightAnswerKind, setInsightAnswerKind] = useState<"none" | "preset" | "custom">("none");
  const [insightSelectedChoiceId, setInsightSelectedChoiceId] = useState<string | null>(null);
  
  // AI Insight Generation (RAG + LLM)
  const [insightGenerating, setInsightGenerating] = useState(false);
  const [insightResult, setInsightResult] = useState<RAGPresentationResult | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [insightReports, setInsightReports] = useState<InsightReportEntry[]>([]);
  /** Feed → Insight Reports: "all" or a `categoryId` present on at least one report. */
  const [insightReportCategoryFilter, setInsightReportCategoryFilter] = useState<"all" | string>("all");
  /** When set, full-screen compare UI (newer report id → pairs with previous in category). */
  const [insightCompareNewerId, setInsightCompareNewerId] = useState<string | null>(null);
  const [openedReportId, setOpenedReportId] = useState<string | null>(null);
  const [isViewingSavedReport, setIsViewingSavedReport] = useState(false);
  const [isReportActionsOpen, setIsReportActionsOpen] = useState(false);
  const [isReflectionFeedOpen, setIsReflectionFeedOpen] = useState<boolean>(() => {
    try {
      const raw = window.localStorage.getItem(REFLECTION_FEED_OPEN_KEY);
      return raw === "true";
    } catch {
      return false;
    }
  });
  
  const reflectionFeedTouchStartYRef = useRef<number | null>(null);
  const isRestoringSavedReportRef = useRef(false);
  const reportActionsRef = useRef<HTMLDivElement | null>(null);

  const {
    reminders,
    popResponses,
    loading: remindersLoading,
    activeNotification,
    dismissNotification,
    addReminder,
    deleteReminder,
  } = useReminders();

  useEffect(() => {
    if (!user?.uid) {
      setInsightReports([]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/insightReports`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportRows: InsightReportEntry[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<InsightReportEntry, "id">),
      }));
      setInsightReports(reportRows);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    try {
      window.localStorage.setItem(REFLECTION_FEED_OPEN_KEY, String(isReflectionFeedOpen));
    } catch {
      // ignore storage errors
    }
  }, [isReflectionFeedOpen]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!reportActionsRef.current) return;
      if (event.target instanceof Node && !reportActionsRef.current.contains(event.target)) {
        setIsReportActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  // Tick every minute to keep "next POP" countdown accurate
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Load insight categories
  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const liveCategories = await getInsightCategoriesLive();
        if (!cancelled) {
          setInsightCategories(liveCategories);
        }
      } catch {
        if (!cancelled) {
          setInsightCategories(getInsightCategories());
        }
      }
    };
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Admins should not use the general app
  useEffect(() => {
    if (role === "admin") {
      navigate("/admin/feedback", { replace: true });
    }
  }, [role, navigate]);

  // Restore insight question UI from saved answers when navigating the questionnaire
  useEffect(() => {
    const q = questions[currentQuestionIndex];
    if (!q || insightPage !== "questionnaire") return;

    const saved = answers[q.id];
    const choices = q.choices;

    if (!choices?.length) {
      setInsightAnswerKind(saved ? "custom" : "none");
      setInsightSelectedChoiceId(null);
      setCurrentAnswer(saved || "");
      return;
    }

    if (!saved) {
      setInsightAnswerKind("none");
      setInsightSelectedChoiceId(null);
      setCurrentAnswer("");
      return;
    }

    const match = choices.find((c) => c.label === saved);
    if (match) {
      setInsightAnswerKind("preset");
      setInsightSelectedChoiceId(match.id);
      setCurrentAnswer(saved);
    } else {
      setInsightAnswerKind("custom");
      setInsightSelectedChoiceId(null);
      setCurrentAnswer(saved);
    }
  }, [currentQuestionIndex, questions, answers, insightPage]);

  // Insight handlers
  const handleSelectCategory = async (category: InsightCategory) => {
    setSelectedCategory(category);
    const qs = await getCategoryQuestionsLive(category.id);
    setQuestions(qs);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer("");
    setInsightAnswerKind("none");
    setInsightSelectedChoiceId(null);
    setOpenedReportId(null);
    setIsViewingSavedReport(false);
    setIsReportActionsOpen(false);
    setInsightPage("questionnaire");
  };

  const handleAnswerSubmit = () => {
    if (currentAnswer.trim().length < (questions[currentQuestionIndex]?.minLength || 5)) {
      return;
    }

    const questionId = questions[currentQuestionIndex]?.id || `q${currentQuestionIndex + 1}`;
    const newAnswers = {
      ...answers,
      [questionId]: currentAnswer.trim(),
    };
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setInsightPage("reflection");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const questionId = questions[currentQuestionIndex]?.id || `q${currentQuestionIndex + 1}`;
      const merged = currentAnswer.trim()
        ? { ...answers, [questionId]: currentAnswer.trim() }
        : answers;

      setAnswers(merged);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const insightCompareModel = useMemo(() => {
    if (!insightCompareNewerId) return null;
    const newer = insightReports.find((r) => r.id === insightCompareNewerId);
    if (!newer) return null;
    const qs = getCategoryQuestions(newer.categoryId);
    const labels = Object.fromEntries(qs.map((q) => [q.id, q.question]));
    const order = qs.map((q) => q.id);
    return buildInsightCompareModel(insightReports, insightCompareNewerId, labels, order);
  }, [insightCompareNewerId, insightReports]);

  const reflectionComparePair = useMemo(() => {
    if (!openedReportId) return null;
    return resolveComparePair(insightReports, openedReportId);
  }, [openedReportId, insightReports]);

  const openInsightCompare = (newerReportId: string) => {
    if (!canCompareReport(insightReports, newerReportId)) return;
    setInsightCompareNewerId(newerReportId);
    setIsReportActionsOpen(false);
  };

  const closeInsightCompare = () => {
    setInsightCompareNewerId(null);
  };

  const handleBackToCategories = () => {
    setInsightCompareNewerId(null);
    setInsightPage("categories");
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer("");
    setInsightAnswerKind("none");
    setInsightSelectedChoiceId(null);
    setInsightGenerating(false);
    setInsightResult(null);
    setInsightError(null);
    setCopiedToClipboard(false);
    setOpenedReportId(null);
    setIsViewingSavedReport(false);
    setIsReportActionsOpen(false);
  };

  const insightParsed = useMemo(
    () => parseReflectionInsight(insightResult?.formattedInsight ?? ""),
    [insightResult?.formattedInsight]
  );

  const insightDisplayCards = useMemo(
    () => insightParsed.cards.slice(0, 3),
    [insightParsed.cards]
  );

  const insightHero = useMemo(
    () => insightHeroLine(insightParsed.thread),
    [insightParsed.thread]
  );

  const insightStartHere = useMemo(
    () => pickStartHereTry(insightDisplayCards),
    [insightDisplayCards]
  );

  const sortedAnswerEntries = useMemo(() => {
    return Object.entries(answers).sort(
      (a, b) =>
        Number(a[0].replace(/\D+/g, "") || 0) - Number(b[0].replace(/\D+/g, "") || 0)
    );
  }, [answers]);

  /** All Mirror insight categories for the filter strip, plus any legacy report ids not in the catalog. */
  const insightReportCategoryChips = useMemo(() => {
    const rows: { id: string; title: string }[] = [];
    const seen = new Set<string>();
    for (const c of insightCategories) {
      rows.push({ id: c.id, title: c.title });
      seen.add(c.id);
    }
    for (const r of insightReports) {
      if (!r.categoryId || seen.has(r.categoryId)) continue;
      seen.add(r.categoryId);
      rows.push({ id: r.categoryId, title: r.categoryTitle ?? r.categoryId });
    }
    return rows;
  }, [insightCategories, insightReports]);

  const filteredInsightReportsForFeed = useMemo(() => {
    if (insightReportCategoryFilter === "all") return insightReports;
    return insightReports.filter((r) => r.categoryId === insightReportCategoryFilter);
  }, [insightReports, insightReportCategoryFilter]);

  const handleCopyReflection = () => {
    if (!selectedCategory || Object.keys(answers).length === 0) return;

    let textToCopy = `Your Reflection — ${selectedCategory.title}\n`;
    textToCopy += `${"=".repeat(44)}\n\n`;

    textToCopy += "YOUR ANSWERS\n";
    sortedAnswerEntries.forEach(([key, value]) => {
      const n = key.replace(/\D+/g, "") || key;
      textToCopy += `\nQ${n}: ${value}\n`;
    });

    textToCopy += `\n${"=".repeat(44)}\n\n`;

    if (insightResult?.formattedInsight && !insightError) {
      const p = parseReflectionInsight(insightResult.formattedInsight);
      if (p.thread.trim()) {
        textToCopy += "WHAT WE'RE SEEING\n\n";
        textToCopy += `${p.thread.trim()}\n\n`;
      }
      if (p.cards.length > 0) {
        textToCopy += `${"=".repeat(44)}\n\nIDEAS THAT FIT\n`;
        p.cards.forEach((c, i) => {
          textToCopy += `\n${i + 1}. ${c.title}\n`;
          textToCopy += `Fit: ${c.fitLabel === "strong" ? "Strong" : "Helpful angle"}\n`;
          if (c.connection) textToCopy += `\n${c.connection}\n`;
          if (c.whyThisMatters) textToCopy += `\nWhy this matters: ${c.whyThisMatters}\n`;
          if (c.tryThisWeek) textToCopy += `\nTry this week: ${c.tryThisWeek}\n`;
        });
      }
      if (!p.thread.trim() && p.cards.length === 0) {
        textToCopy += "REFLECTION\n\n";
        textToCopy += insightResult.formattedInsight.trim() + "\n";
      }
      textToCopy += `\n${"=".repeat(44)}\n`;
      textToCopy += `\n${REFLECTION_TRUST_LINE}\n`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  // Generate RAG + LLM insights when reaching reflection page
  useEffect(() => {
    if (insightPage === "reflection" && selectedCategory && Object.keys(answers).length > 0 && !insightResult && !insightGenerating) {
      const generateInsights = async () => {
        setInsightGenerating(true);
        setInsightError(null);
        const result = await generateRAGInsight(selectedCategory.id, answers);
        setInsightResult(result);
        setInsightGenerating(false);
        
        if (result.error) {
          setInsightError(result.error);
        }
      };
      
      generateInsights();
    }
  }, [insightPage, selectedCategory, answers, insightResult, insightGenerating]);

  useEffect(() => {
    if (
      !user?.uid ||
      !selectedCategory ||
      !insightResult ||
      !insightResult.formattedInsight ||
      insightGenerating ||
      insightPage !== "reflection" ||
      isRestoringSavedReportRef.current
    ) {
      return;
    }

    const answersKey = JSON.stringify(
      Object.entries(answers).sort((a, b) => a[0].localeCompare(b[0]))
    );
    if (!answersKey || answersKey === "[]") {
      return;
    }

    const generatedKey = `${selectedCategory.id}::${answersKey}::${insightResult.formattedInsight}`;
    const reportId = hashToDocId(generatedKey);

    const saveReport = async () => {
      try {
        await setDoc(doc(db, `users/${user.uid}/insightReports`, reportId), {
          categoryId: selectedCategory.id,
          categoryTitle: selectedCategory.title,
          answers,
          formattedInsight: insightResult.formattedInsight,
          matchedPrinciples: sanitizeMatchedPrinciples(insightResult.matchedPrinciples),
          generatedKey,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setOpenedReportId(reportId);
      } catch (error) {
        console.error("Error saving insight report:", error);
      }
    };

    void saveReport();
  }, [
    answers,
    insightGenerating,
    insightPage,
    insightResult,
    selectedCategory,
    user?.uid,
  ]);

  // --- Dashboard derived data ---
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const todayDay = now.getDay(); // 0=Sun … 6=Sat
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todayScheduled = useMemo(() => {
    return reminders
      .filter((r) => {
        if (r.type !== "schedule") return false;
        const mode = r.repeatMode ?? "once";
        if (mode === "daily") return true;
        if (mode === "weekly") {
          return !r.days || r.days.length === 0 || r.days.includes(todayDay);
        }
        // once — show if it's scheduled for today
        return r.days?.includes(todayDay) ?? false;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [reminders, todayDay]);

  const recurringCount = useMemo(
    () => reminders.filter((r) => r.type === "recurring").length,
    [reminders]
  );

  const nextPOP = useMemo(() => {
    return todayScheduled.find((r) => {
      const parsed = parseReminderTime(r.time);
      if (!parsed) return false;
      return parsed.hours * 60 + parsed.minutes > nowMinutes;
    }) ?? null;
  }, [todayScheduled, nowMinutes]);

  const formatTime12 = (time24: string) => {
    const parsed = parseReminderTime(time24);
    if (!parsed) return time24;
    const ampm = parsed.hours >= 12 ? "PM" : "AM";
    const h12 = parsed.hours % 12 || 12;
    return `${h12}:${parsed.minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const minutesUntil = (time24: string) => {
    const parsed = parseReminderTime(time24);
    if (!parsed) return 0;
    return parsed.hours * 60 + parsed.minutes - nowMinutes;
  };

  const formatCountdown = (mins: number) => {
    if (mins < 60) return `in ${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formatEntryTime = (value: unknown) => {
    if (!value || typeof value !== "object" || !("toDate" in value)) return "Just now";
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleOpenSavedReport = (report: InsightReportEntry) => {
    const category =
      insightCategories.find((c) => c.id === report.categoryId) ||
      getInsightCategories().find((c) => c.id === report.categoryId) ||
      null;

    if (!category) {
      return;
    }

    isRestoringSavedReportRef.current = true;
    setActiveTab("insight");
    setSelectedCategory(category);
    setAnswers(report.answers || {});
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setInsightAnswerKind("none");
    setInsightSelectedChoiceId(null);
    setInsightGenerating(false);
    setInsightError(null);
    setCopiedToClipboard(false);
    setInsightResult({
      categoryId: report.categoryId,
      userAnswers: report.answers || {},
      matchedPrinciples: report.matchedPrinciples || [],
      formattedInsight: report.formattedInsight || "",
    });
    setOpenedReportId(report.id);
    setIsViewingSavedReport(true);
    setIsReportActionsOpen(false);
    setInsightPage("reflection");

    window.setTimeout(() => {
      isRestoringSavedReportRef.current = false;
    }, 0);
  };

  const handleRenameOpenedReport = async () => {
    if (!user?.uid || !openedReportId) return;
    const current = insightReports.find((r) => r.id === openedReportId);
    const currentTitle = current?.reportTitle || current?.categoryTitle || selectedCategory?.title || "Report";
    const nextTitle = window.prompt("Rename report", currentTitle);
    if (!nextTitle || !nextTitle.trim()) return;

    try {
      await updateDoc(doc(db, `users/${user.uid}/insightReports`, openedReportId), {
        reportTitle: nextTitle.trim(),
        updatedAt: Timestamp.now(),
      });
      setIsReportActionsOpen(false);
    } catch (error) {
      console.error("Error renaming report:", error);
    }
  };

  const handleDeleteOpenedReport = async () => {
    if (!user?.uid || !openedReportId) return;
    const ok = window.confirm("Delete this saved report?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/insightReports`, openedReportId));
      setIsReportActionsOpen(false);
      handleBackToCategories();
      setActiveTab("feed");
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleSaveAsFromCurrent = async () => {
    if (!user?.uid || !selectedCategory || !insightResult?.formattedInsight) return;
    const titleInput = window.prompt("Save as report title", `${selectedCategory.title} copy`);
    if (!titleInput || !titleInput.trim()) return;

    try {
      const newDoc = await addDoc(collection(db, `users/${user.uid}/insightReports`), {
        categoryId: selectedCategory.id,
        categoryTitle: selectedCategory.title,
        reportTitle: titleInput.trim(),
        answers,
        formattedInsight: insightResult.formattedInsight,
        matchedPrinciples: sanitizeMatchedPrinciples(insightResult.matchedPrinciples),
        generatedKey: `${selectedCategory.id}::manual::${Date.now()}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setOpenedReportId(newDoc.id);
      setIsViewingSavedReport(true);
      setIsReportActionsOpen(false);
    } catch (error) {
      console.error("Error saving report as new copy:", error);
    }
  };

  const shouldAllowParentScroll = (element: HTMLDivElement, deltaY: number) => {
    const atTop = element.scrollTop <= 0;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

    if (deltaY < 0 && atTop) {
      return true;
    }

    if (deltaY > 0 && atBottom) {
      return true;
    }

    return false;
  };

  const handleReflectionFeedWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!shouldAllowParentScroll(event.currentTarget, event.deltaY)) {
      event.stopPropagation();
    }
  };

  const handleReflectionFeedTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    reflectionFeedTouchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleReflectionFeedTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (reflectionFeedTouchStartYRef.current === null) {
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (typeof currentY !== "number") {
      return;
    }

    const deltaY = reflectionFeedTouchStartYRef.current - currentY;
    if (!shouldAllowParentScroll(event.currentTarget, deltaY)) {
      event.stopPropagation();
    }
  };

  const handleReflectionFeedTouchEnd = () => {
    reflectionFeedTouchStartYRef.current = null;
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-200 flex flex-col pb-safe-content">
      {activeNotification && (
        <NotificationPopup
          message={activeNotification.message}
          popContent={activeNotification.popContent}
          onDismiss={dismissNotification}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 bg-yellow-300/95 backdrop-blur-sm border-b border-black/15 z-40 pt-safe">
        <div className="px-5 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-black text-black">
            {activeTab === "feed" && "Feed"}
            {activeTab === "reminders" && "Self POPs"}
            {activeTab === "insight" && "Insight"}
            {activeTab === "feedback" && "Feedback"}
            {activeTab === "settings" && "Settings"}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-yellow-200 border border-yellow-300 hover:bg-yellow-300 transition-all duration-200"
            >
              <User className="h-6 w-6 text-black" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop to close menu on click anywhere */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white border border-black/15 rounded-2xl shadow-xl z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {/* User Info Header */}
                  <div className="px-5 py-4 border-b border-black/10 bg-yellow-50">
                    <p className="font-black text-black text-base">{user?.displayName || "User"}</p>
                    <p className="text-xs font-semibold text-black/70 mt-1">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 font-black text-black hover:bg-yellow-100 border-b border-black/10 transition-all duration-200"
                  >
                    Theme & Settings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("feedback");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 font-black text-black hover:bg-yellow-100 border-b border-black/10 transition-all duration-200"
                  >
                    Give Feedback
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 font-black text-red-600 hover:bg-red-100 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto mb-4 pb-safe">
        <div className="px-5 py-6">
          {/* TAB 1: FEED */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {/* Greeting */}
              <div className="rounded-2xl bg-black text-yellow-300 p-5 shadow-[0_12px_24px_-16px_rgba(0,0,0,0.9)] ring-1 ring-yellow-300/30">
                <p className="text-xl font-black leading-tight">
                  {greeting}, {user?.displayName || "there"} 👋
                </p>
                <p className="text-sm font-semibold text-yellow-300/70 mt-1">
                  Here's your Self POP schedule for today
                </p>
              </div>

              {/* Feed Section Tabs */}
              <div className="bg-yellow-100 border border-black/15 rounded-2xl p-1.5 flex gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setFeedSectionTab("pops")}
                  className={`flex-1 h-11 rounded-xl font-black text-sm transition-colors ${
                    feedSectionTab === "pops"
                      ? "bg-black text-yellow-300"
                      : "bg-white text-black hover:bg-yellow-50"
                  }`}
                >
                  POPs
                </button>
                <button
                  type="button"
                  onClick={() => setFeedSectionTab("insights")}
                  className={`flex-1 h-11 rounded-xl font-black text-sm transition-colors ${
                    feedSectionTab === "insights"
                      ? "bg-black text-yellow-300"
                      : "bg-white text-black hover:bg-yellow-50"
                  }`}
                >
                  Insight Reports
                </button>
              </div>

              {feedSectionTab === "pops" && (
                <>
                  {!remindersLoading && (
                    <div className="bg-yellow-100 border border-black/15 rounded-2xl p-5 shadow-sm">
                      <p className="text-xs font-black text-black/50 uppercase tracking-widest mb-2">Get Started</p>
                      {reminders.length === 0 ? (
                        <>
                          <p className="text-xl font-black text-black">No Self POPs yet</p>
                          <p className="text-sm font-semibold text-black/60 mt-1">
                            Set up your first reminder to start receiving daily reflections.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-black text-black">Your Self POPs are active</p>
                          <p className="text-sm font-semibold text-black/60 mt-1">
                            Nice progress. Keep showing up for your reflections and adjust your schedule any time.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Today's Schedule */}
                  {todayScheduled.length > 0 && (
                    <div className="bg-yellow-100 border border-black/15 rounded-2xl p-5 shadow-sm">
                      <p className="text-xs font-black text-black/50 uppercase tracking-widest mb-4">Today's Schedule</p>
                      <div className="space-y-3">
                        {todayScheduled.map((r) => {
                          const parsed = parseReminderTime(r.time);
                          const isPast = parsed
                            ? parsed.hours * 60 + parsed.minutes <= nowMinutes
                            : false;
                          const isNext = r.id === nextPOP?.id;
                          return (
                            <div
                              key={r.id}
                              className={`flex items-center gap-3 py-2 border-b-2 border-black/10 last:border-b-0 ${
                                isPast ? "opacity-40" : ""
                              }`}
                            >
                              <div
                                className={`h-3 w-3 shrink-0 border-2 border-black ${
                                  isNext ? "bg-yellow-400" : isPast ? "bg-black" : "bg-white"
                                }`}
                              />
                              <span className="text-base font-black text-black w-20 shrink-0">
                                {formatTime12(r.time)}
                              </span>
                              <span className="text-sm font-semibold text-black flex-1 truncate">
                                {r.name || r.message}
                              </span>
                              {isNext && (
                                <span className="text-xs font-black text-black bg-yellow-300 border-2 border-black px-2 py-0.5 shrink-0">
                                  NEXT
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setReminderTypeFilter("schedule");
                        setActiveTab("reminders");
                      }}
                      className="bg-yellow-100 rounded-2xl border border-black/15 p-4 flex flex-col gap-1 text-left hover:bg-yellow-200 transition-colors duration-200 shadow-sm"
                    >
                      <Bell className="h-5 w-5 text-black mb-1" />
                      <p className="text-3xl font-black text-black leading-none">
                        {reminders.filter((r) => r.type === "schedule").length}
                      </p>
                      <p className="text-xs font-black text-black/60 uppercase tracking-wide">Scheduled</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReminderTypeFilter("recurring");
                        setActiveTab("reminders");
                      }}
                      className="bg-yellow-100 rounded-2xl border border-black/15 p-4 flex flex-col gap-1 text-left hover:bg-yellow-200 transition-colors duration-200 shadow-sm"
                    >
                      <RefreshCw className="h-5 w-5 text-black mb-1" />
                      <p className="text-3xl font-black text-black leading-none">{recurringCount}</p>
                      <p className="text-xs font-black text-black/60 uppercase tracking-wide">Recurring</p>
                    </button>
                  </div>
                  {/* Quick add shortcut */}
                  <button
                    onClick={() => setActiveTab("reminders")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black text-yellow-300 font-black text-base py-4 px-5 border border-black hover:bg-yellow-300 hover:text-black transition-all duration-200 shadow-[0_10px_24px_-16px_rgba(0,0,0,1)]"
                  >
                    <Plus className="h-5 w-5" />
                    Add New Self POP
                  </button>

                  {/* Reflection Feed */}
                  <details
                    className="group bg-yellow-100 border border-black/15 rounded-2xl p-5 shadow-sm"
                    open={isReflectionFeedOpen}
                    onToggle={(event) =>
                      setIsReflectionFeedOpen((event.currentTarget as HTMLDetailsElement).open)
                    }
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-2 select-none [&::-webkit-details-marker]:hidden">
                      <p className="text-xs font-black text-black/50 uppercase tracking-widest">Reflection Feed</p>
                      <ChevronRight className="h-5 w-5 text-black transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-4">
                      {popResponses.length === 0 ? (
                        <div>
                          <p className="text-xl font-black text-black">No reflections yet</p>
                          <p className="text-sm font-semibold text-black/60 mt-1">
                            Answer a POP and it will appear here. Skipped ones will show as Not answered.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="max-h-[32rem] overflow-y-auto overscroll-y-auto pr-1 space-y-3"
                          onWheel={handleReflectionFeedWheel}
                          onTouchStart={handleReflectionFeedTouchStart}
                          onTouchMove={handleReflectionFeedTouchMove}
                          onTouchEnd={handleReflectionFeedTouchEnd}
                          onTouchCancel={handleReflectionFeedTouchEnd}
                        >
                          {popResponses.map((entry) => (
                            <div key={entry.id} className="border border-black/15 rounded-xl p-3 bg-yellow-100">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-sm font-black text-black flex-1">{entry.question}</p>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-black/15 shrink-0 ${entry.status === "answered" ? "bg-yellow-300 text-black" : "bg-white text-black/70"}`}>
                                  {entry.status === "answered" ? "Answered" : "Not answered"}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-black/75">{entry.answer}</p>
                              <p className="text-[11px] font-bold text-black/50 mt-2">{formatEntryTime(entry.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </>
              )}

              {feedSectionTab === "insights" && (
                <div className="bg-yellow-100 border border-black/15 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-black text-black/50 uppercase tracking-widest mb-4">Insight Reports</p>
                  {insightReports.length === 0 ? (
                    <div>
                      <p className="text-xl font-black text-black">No reports yet</p>
                      <p className="text-sm font-semibold text-black/60 mt-1">
                        Generate an Insight report and it will appear here for quick re-open.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label
                          htmlFor="insight-report-category-filter"
                          className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-black/60"
                        >
                          Category
                        </label>
                        <select
                          id="insight-report-category-filter"
                          value={insightReportCategoryFilter}
                          onChange={(event) =>
                            setInsightReportCategoryFilter(event.target.value as "all" | string)
                          }
                          className="w-full rounded-xl border border-black/20 bg-yellow-50 px-3 py-2.5 text-sm font-black text-black focus:outline-none focus:border-black/35"
                        >
                          <option value="all">All</option>
                          {insightReportCategoryChips.map(({ id, title }) => (
                            <option key={id} value={id}>
                              {title}
                            </option>
                          ))}
                        </select>
                      </div>
                      {filteredInsightReportsForFeed.length === 0 ? (
                        <div>
                          <p className="text-lg font-black text-black">No reports in this category</p>
                          <p className="text-sm font-semibold text-black/60 mt-1">
                            Choose another category from the dropdown or switch to All.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
                          {filteredInsightReportsForFeed.map((report) => {
                            const showCompare = canCompareReport(insightReports, report.id);
                            return (
                              <div
                                key={report.id}
                                className="rounded-2xl border border-black/15 bg-yellow-100/90 overflow-hidden shadow-sm"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOpenSavedReport(report)}
                                  className="w-full text-left p-3.5 hover:bg-yellow-200 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-black text-black">{report.categoryTitle}</p>
                                      {report.reportTitle && (
                                        <p className="text-xs font-black text-black/75 mt-0.5">
                                          {report.reportTitle}
                                        </p>
                                      )}
                                      <p className="text-xs font-semibold text-black/70 mt-1.5 line-clamp-2">
                                        {report.formattedInsight}
                                      </p>
                                    </div>
                                    <ArrowLeft className="h-4 w-4 text-black rotate-180 shrink-0 mt-0.5" />
                                  </div>
                                  <p className="text-[11px] font-bold text-black/55 mt-2.5">
                                    {formatEntryTime(report.createdAt)}
                                  </p>
                                </button>
                                {showCompare && (
                                  <button
                                    type="button"
                                    onClick={() => openInsightCompare(report.id)}
                                    className="w-full flex items-center justify-center gap-2 border-t border-black/20 px-3 py-2.5 bg-white/70 text-xs font-black text-black hover:bg-yellow-200 transition-colors"
                                  >
                                    <GitCompare className="h-3.5 w-3.5" />
                                    Compare to previous
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REMINDERS */}
          {activeTab === "reminders" && (
            <Reminders
              reminders={reminders}
              addReminder={addReminder}
              deleteReminder={deleteReminder}
              loading={remindersLoading}
              reminderTypeFilter={reminderTypeFilter}
              onReminderTypeFilterChange={setReminderTypeFilter}
            />
          )}

          {/* TAB 3: INSIGHT */}
          {activeTab === "insight" && insightPage === "categories" && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="rounded-2xl border border-black bg-black px-5 py-5 text-yellow-300 shadow-[0_12px_24px_-16px_rgba(0,0,0,1)] ring-1 ring-yellow-300/25">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-300/60">
                  Mirror insight
                </p>
                <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">
                  Choose a focus area
                </h2>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-yellow-300/85">
                  Pick one path for today. Same gentle questions—your answers surface the pattern.
                </p>
              </div>

              {/* Categories — square tiles only (2-column grid) */}
              <div className="grid grid-cols-2 gap-3">
                {insightCategories.map((category, index) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-black/15 bg-yellow-50 p-3 text-center shadow-sm transition-all hover:bg-yellow-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="absolute right-2 top-2 tabular-nums text-[10px] font-black text-black/35">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/20 ${category.color}`}
                    >
                      {getIconComponent(category.icon, "h-6 w-6")}
                    </div>
                    <h3 className="line-clamp-3 px-0.5 text-[11px] font-black leading-tight text-black sm:text-xs">
                      {category.title}
                    </h3>
                    <p className="line-clamp-2 px-0.5 text-[10px] font-semibold leading-snug text-black/65 sm:text-[11px]">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-black/15 bg-yellow-100 p-4 shadow-sm">
                <p className="text-xs font-bold leading-relaxed text-black">
                  <span className="mr-1">How it works:</span>
                  Tap a category, answer the prompts in order. We match what you wrote to ideas from our library—nothing is a diagnosis; use what helps.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: INSIGHT - QUESTIONNAIRE */}
          {activeTab === "insight" && insightPage === "questionnaire" && selectedCategory && questions[currentQuestionIndex] && (
            <div className="flex flex-col h-full gap-0 [font-family:'Outfit',sans-serif]">
              {/* Header - Fixed */}
              <div className="space-y-1.5 flex-shrink-0">
                <button
                  onClick={handleBackToCategories}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-black hover:bg-yellow-200/70 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>

                {/* Category Indicator */}
                <div className="px-3 py-2.5 bg-yellow-100 rounded-2xl border border-black/15 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/20 bg-white">
                      {getIconComponent(selectedCategory.icon)}
                    </div>
                    <h2 className="text-[15px] font-black text-black leading-tight line-clamp-1">
                      {selectedCategory.title}
                    </h2>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-black/80">Q{currentQuestionIndex + 1}/{questions.length}</span>
                    <span className="text-xs font-black text-black/80">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question + options - Scrollable */}
              <div className="flex-1 overflow-y-auto pt-1 pb-4 space-y-3 min-h-0">
                <h3 className="text-2xl font-bold text-black leading-tight">
                  {questions[currentQuestionIndex].question}
                </h3>

                {questions[currentQuestionIndex].choices &&
                  questions[currentQuestionIndex].choices!.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-black text-black/60 uppercase tracking-wider">
                        Tap the one that fits best — or write your own below.
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {questions[currentQuestionIndex].choices!.map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => {
                              setInsightAnswerKind("preset");
                              setInsightSelectedChoiceId(choice.id);
                              setCurrentAnswer(choice.label);
                            }}
                            className={`text-left w-full px-3 py-3 rounded-2xl border text-sm font-medium leading-snug transition-colors ${
                              insightSelectedChoiceId === choice.id && insightAnswerKind === "preset"
                                ? "border-black bg-black text-yellow-300"
                                : "border-black/20 bg-yellow-50 text-black hover:bg-yellow-200"
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setInsightAnswerKind("custom");
                            setInsightSelectedChoiceId(null);
                            setCurrentAnswer("");
                          }}
                          className={`text-left w-full px-3 py-3 rounded-2xl border border-dashed text-sm font-semibold transition-colors ${
                            insightAnswerKind === "custom"
                              ? "border-black bg-yellow-200 text-black"
                              : "border-black/30 bg-yellow-50 text-black hover:bg-yellow-200"
                          }`}
                        >
                          Something else — I'll write my own answer
                        </button>
                      </div>
                    </div>
                  )}
              </div>

              {/* Answer Input & Buttons - Fixed */}
              <div className="space-y-3 flex-shrink-0">
                {(!questions[currentQuestionIndex].choices?.length ||
                  insightAnswerKind === "custom") && (
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => {
                      setInsightAnswerKind("custom");
                      setInsightSelectedChoiceId(null);
                      setCurrentAnswer(e.target.value);
                    }}
                    placeholder={questions[currentQuestionIndex].placeholder || "Your answer..."}
                    className="w-full px-4 py-3 rounded-2xl border border-black/20 focus:outline-none focus:border-black/35 resize-none text-base font-semibold placeholder:text-black/40 bg-yellow-50 text-black"
                    rows={questions[currentQuestionIndex].choices?.length ? 4 : 4}
                  />
                )}

                {questions[currentQuestionIndex].choices &&
                  questions[currentQuestionIndex].choices!.length > 0 &&
                  insightAnswerKind === "preset" && (
                    <p className="text-xs font-bold text-black/70 px-1">
                      Using your selected answer ({currentAnswer.trim().length} characters). Pick “write my own” to change it.
                    </p>
                  )}

                {/* Character Count */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      currentAnswer.trim().length >= (questions[currentQuestionIndex]?.minLength || 5) ? "text-black" : "text-black/60"
                    }`}
                  >
                    {currentAnswer.trim().length} / {questions[currentQuestionIndex]?.minLength || 5} chars
                  </span>
                </div>

                {/* Button Group */}
                <div className="flex gap-3">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-base transition-all duration-200 ${
                      currentQuestionIndex > 0
                        ? "bg-yellow-50 border border-black/20 text-black hover:bg-black hover:text-yellow-300 hover:border-black"
                        : "bg-black/10 border border-black/20 text-black/40 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Next/Submit Button */}
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={currentAnswer.trim().length < (questions[currentQuestionIndex]?.minLength || 5)}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-base transition-all duration-200 ${
                      currentAnswer.trim().length >= (questions[currentQuestionIndex]?.minLength || 5)
                        ? "bg-black text-yellow-300 hover:bg-black/90 active:bg-black cursor-pointer shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
                        : "bg-black/30 text-black/40 cursor-not-allowed"
                    }`}
                  >
                    {currentQuestionIndex === questions.length - 1 ? "See Your Reflection" : "Next Question"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSIGHT - REFLECTION */}
          {activeTab === "insight" && insightPage === "reflection" && selectedCategory && (
            <div className="flex flex-col h-full gap-0">
              {/* Header - Fixed */}
              <div className="space-y-3 flex-shrink-0 pb-4 border-b-4 border-black">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-black font-bold hover:text-black/70 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </button>

                  <div className="relative" ref={reportActionsRef}>
                    <button
                      onClick={() => setIsReportActionsOpen((prev) => !prev)}
                      className="flex items-center justify-center h-11 w-11 rounded-lg border-2 border-black bg-white hover:bg-yellow-100 transition-colors active:bg-yellow-200 text-black"
                      title="Report actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {isReportActionsOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-30">
                        {isViewingSavedReport ? (
                          <>
                            <button
                              onClick={handleRenameOpenedReport}
                              className="w-full text-left px-3 py-2 text-sm font-black text-black hover:bg-yellow-100 border-b-2 border-black"
                            >
                              Rename
                            </button>
                            <button
                              onClick={handleDeleteOpenedReport}
                              className="w-full text-left px-3 py-2 text-sm font-black text-red-600 hover:bg-red-50"
                            >
                              Delete report
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSaveAsFromCurrent}
                              className="w-full text-left px-3 py-2 text-sm font-black text-black hover:bg-yellow-100 border-b-2 border-black"
                            >
                              Save as
                            </button>
                            <button
                              onClick={() => {
                                handleCopyReflection();
                                setIsReportActionsOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm font-black text-black hover:bg-yellow-100 flex items-center gap-2"
                            >
                              {copiedToClipboard ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              {copiedToClipboard ? "Copied" : "Copy"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div>{getIconComponent(selectedCategory.icon)}</div>
                    <div>
                      <h1 className="text-xl font-black text-black leading-tight">Your Reflection</h1>
                      <p className="text-sm font-bold text-black/70">{selectedCategory.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {/* Your answers — collapsed by default */}
                <details className="bg-white rounded-lg border-4 border-black group">
                  <summary className="cursor-pointer list-none px-4 py-3 font-black text-sm text-black flex items-center justify-between gap-2 select-none [&::-webkit-details-marker]:hidden">
                    <span>
                      Your answers
                      <span className="font-bold text-black/55"> ({sortedAnswerEntries.length})</span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
                  </summary>
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t-2 border-black/10">
                    {sortedAnswerEntries.map(([key, value]) => {
                      const n = key.replace(/\D+/g, "") || key;
                      return (
                        <div key={key} className="border-l-4 border-black pl-3">
                          <p className="text-xs font-bold text-black/55 mb-1">Q{n}</p>
                          <p className="text-sm font-semibold text-black leading-relaxed">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </details>

                {/* AI Insights Section */}
                {insightGenerating && (
                  <div className="bg-yellow-50 rounded-lg border-4 border-black p-4 flex items-center justify-center min-h-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <Loader className="h-6 w-6 text-black animate-spin" />
                      <p className="text-sm font-bold text-black">Analyzing your patterns...</p>
                    </div>
                  </div>
                )}

                {insightError && !insightGenerating && (
                  <div className="bg-white rounded-lg border-4 border-black p-4">
                    <p className="text-xs font-bold text-black/70 mb-2">Unable to generate insights:</p>
                    <p className="text-sm text-black">{insightError}</p>
                  </div>
                )}

                {insightResult && !insightGenerating && !insightError && insightResult.formattedInsight && (
                  <div className="space-y-4">
                    {!insightParsed.usedFallback && (insightParsed.thread.trim() || insightDisplayCards.length > 0) && (
                      <>
                        {(insightHero || insightStartHere) && (
                          <div className="bg-yellow-100 rounded-lg border-4 border-black p-4 space-y-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            {insightHero && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                                  In one line
                                </p>
                                <p className="text-base font-black text-black leading-snug">{insightHero}</p>
                              </div>
                            )}
                            {insightStartHere && (
                              <div className="space-y-1 border-t-2 border-black/20 pt-3">
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                                  Start here
                                </p>
                                <p className="text-sm font-semibold text-black leading-relaxed">
                                  {insightStartHere}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {insightParsed.thread.trim() && (
                          <section className="bg-white rounded-lg border-4 border-black p-4 space-y-2">
                            <h2 className="text-sm font-black text-black uppercase tracking-wide">
                              What we&apos;re seeing
                            </h2>
                            <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                              {insightParsed.thread.trim()}
                            </p>
                          </section>
                        )}

                        {insightDisplayCards.length > 0 && (
                          <section className="space-y-3">
                            <h2 className="text-sm font-black text-black uppercase tracking-wide px-1">
                              Ideas that fit
                            </h2>
                            <div className="space-y-3">
                              {insightDisplayCards.map((card, idx) => (
                                <div
                                  key={`${card.title}-${idx}`}
                                  className="bg-white rounded-lg border-4 border-black p-4 space-y-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                                    <h3 className="text-base font-black text-black leading-snug pr-2 flex-1 min-w-0">
                                      {card.title}
                                    </h3>
                                    <span
                                      className={`shrink-0 text-[11px] font-black uppercase px-2 py-1 rounded border-2 border-black ${
                                        card.fitLabel === "strong"
                                          ? "bg-black text-yellow-300"
                                          : "bg-yellow-100 text-black"
                                      }`}
                                    >
                                      {card.fitLabel === "strong" ? "Strong fit" : "Helpful angle"}
                                    </span>
                                  </div>
                                  {card.connection.trim() && (
                                    <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                                      {card.connection}
                                    </p>
                                  )}
                                  {card.whyThisMatters.trim() && (
                                    <div className="bg-blue-50 rounded-lg border-2 border-black p-3 space-y-1">
                                      <p className="text-[11px] font-black text-black/70 uppercase">Why this matters</p>
                                      <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                                        {card.whyThisMatters}
                                      </p>
                                    </div>
                                  )}
                                  {card.tryThisWeek.trim() && (
                                    <div className="bg-yellow-50 rounded-lg border-2 border-black p-3 space-y-1">
                                      <p className="text-[11px] font-black text-black/70 uppercase">Try this week</p>
                                      <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                                        {card.tryThisWeek}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {insightParsed.usedFallback && (
                      <div className="bg-white rounded-lg border-4 border-black p-4 space-y-2">
                        <h2 className="text-sm font-black text-black uppercase tracking-wide">Reflection</h2>
                        <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap">
                          {insightResult.formattedInsight}
                        </p>
                      </div>
                    )}

                    {reflectionComparePair && (
                      <button
                        type="button"
                        onClick={() => openInsightCompare(reflectionComparePair.newer.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-4 border-black bg-black text-yellow-300 px-4 py-3 text-sm font-black hover:bg-black/90 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,0.25)]"
                      >
                        <GitCompare className="h-4 w-4" />
                        See what changed vs {formatEntryTime(reflectionComparePair.older.createdAt)}
                      </button>
                    )}

                    <p className="text-[11px] font-semibold text-black/60 leading-relaxed px-1 border-t-2 border-black/15 pt-4">
                      {REFLECTION_TRUST_LINE}
                    </p>
                  </div>
                )}
              </div>

              {/* Reflection Prompt - Fixed */}
              <div className="space-y-3 flex-shrink-0 pt-4 border-t-4 border-black">
                <div className="bg-white border-4 border-black rounded-lg p-4">
                  <h2 className="text-sm font-black text-black mb-3">
                    ✨ WHAT DO YOU NOTICE?
                  </h2>
                  <textarea
                    placeholder="Write freely. What patterns do you see? What's surprising?"
                    className="w-full px-3 py-2 rounded border-4 border-black focus:outline-none resize-none text-sm font-semibold placeholder:text-black/40 bg-yellow-50"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleBackToCategories}
                  className="w-full px-4 py-3 rounded-lg border-4 border-black bg-black text-yellow-300 font-black hover:bg-black/90 transition-colors active:bg-black"
                >
                  Back to Categories
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FEEDBACK */}
          {activeTab === "feedback" && (
            <Feedback embedded onBack={() => setActiveTab("feed")} />
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <Settings embedded onBack={() => setActiveTab("feed")} />
          )}
        </div>
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-yellow-300/95 backdrop-blur-sm border-t border-black/15 z-40 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {(
            [
              { id: "feed", label: "Feed", icon: Home },
              { id: "reminders", label: "Self", icon: BookOpen },
              { id: "insight", label: "Insight", icon: Lightbulb },
              { id: "feedback", label: "Feedback", icon: MessageSquarePlus },
              { id: "settings", label: "Settings", icon: SettingsIcon },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-1 items-center justify-center px-1 py-1 transition-colors duration-200"
              >
                <span
                  className={`flex w-full max-w-[88px] flex-col items-center justify-center rounded-2xl border px-2 py-2 transition-all duration-200 ${
                    isActive
                      ? "border-black bg-black text-yellow-300 shadow-[0_8px_20px_-16px_rgba(0,0,0,1)]"
                      : "border-transparent bg-yellow-200 text-black hover:bg-yellow-300"
                  }`}
                >
                  <Icon className={`mb-1 h-5 w-5 ${isActive ? "text-yellow-300" : "text-black"}`} />
                  <span className={`text-xs font-black ${isActive ? "text-yellow-300" : "text-black"}`}>
                    {tab.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {insightCompareModel && (
        <InsightReportCompareView
          model={insightCompareModel}
          formatDate={formatEntryTime}
          onClose={closeInsightCompare}
        />
      )}
    </div>
  );
};

export default Main;
