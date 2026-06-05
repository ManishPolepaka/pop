import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Tag, MessageSquare, User, Clock, LogOut } from "lucide-react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

const TAG_LABELS: Record<string, string> = {
  insights: "🔭 Insights & Analysis",
  reminders: "⏰ Better Reminders",
  social: "👥 Social Features",
  ai_coaching: "🤖 AI Coaching",
  habit_tracking: "📈 Habit Tracking",
  progress_reports: "📊 Progress Reports",
  notifications: "🔔 Smarter Notifications",
  other: "✨ Something Else",
};

interface FeedbackEntry {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  message: string;
  tags: string[];
  createdAt: Timestamp | null;
}

// --- Tag counts helper ---
const buildTagCounts = (entries: FeedbackEntry[]) => {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    for (const t of e.tags) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
};

const formatDate = (ts: Timestamp | null) => {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- Admin Dashboard ---
const AdminFeedback = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: FeedbackEntry[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FeedbackEntry, "id">),
      }));
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tagCounts = buildTagCounts(entries);

  const filtered = entries.filter((e) => {
    const matchesTag = filterTag ? e.tags.includes(filterTag) : true;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.displayName.toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q) ||
      e.message.toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-yellow-300 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-yellow-300 border-b-4 border-black z-40 pt-safe">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black leading-none">
              Feedback Admin
            </h1>
            <p className="text-xs font-bold text-black/60 mt-0.5">
              {user?.email} · {entries.length} response{entries.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center justify-center h-10 w-10 bg-white border-2 border-black hover:bg-yellow-100 transition-all duration-200 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 text-black ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-10 w-10 bg-white border-2 border-black hover:bg-red-100 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 space-y-5 max-w-2xl mx-auto w-full">
        {/* Tag summary bar */}
        {Object.keys(tagCounts).length > 0 && (
          <div className="bg-white border-4 border-black p-4 space-y-3">
            <p className="text-xs font-black text-black uppercase tracking-wide">
              Top Requested Features
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setFilterTag(filterTag === tag ? null : tag)
                    }
                    className={`flex items-center gap-1 px-3 py-1 border-2 border-black text-xs font-black transition-all duration-200 ${
                      filterTag === tag
                        ? "bg-black text-yellow-300"
                        : "bg-yellow-100 text-black hover:bg-yellow-200"
                    }`}
                  >
                    {TAG_LABELS[tag] ?? tag}
                    <span className="ml-1 bg-white text-black rounded-full px-1.5 py-0.5 text-xs border border-black">
                      {count}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or message..."
          className="w-full bg-white border-4 border-black p-3 text-black font-semibold text-sm placeholder:text-black/40 focus:outline-none"
        />

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-black animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border-4 border-black p-8 text-center">
            <p className="text-lg font-black text-black">No feedback yet</p>
            <p className="text-sm font-semibold text-black/60 mt-1">
              {filterTag || search
                ? "No results match your filter."
                : "Feedback from users will appear here."}
            </p>
          </div>
        )}

        {/* Entries */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((entry) => (
              <div key={entry.id} className="bg-white border-4 border-black p-5 space-y-3">
                {/* User info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-black text-sm leading-none">
                        {entry.displayName || "Anonymous"}
                      </p>
                      {entry.email && (
                        <p className="text-xs text-black/50 font-semibold mt-0.5">
                          {entry.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-black/50 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">{formatDate(entry.createdAt)}</span>
                  </div>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black bg-yellow-100 text-black text-xs font-bold"
                      >
                        <Tag className="h-3 w-3" />
                        {TAG_LABELS[t] ?? t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message */}
                {entry.message && (
                  <div className="border-t-2 border-black/20 pt-3 flex gap-2">
                    <MessageSquare className="h-4 w-4 text-black/50 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-black leading-snug whitespace-pre-wrap">
                      {entry.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminFeedback;
