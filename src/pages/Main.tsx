import { useState } from "react";
import { Home, MessageCircle, BookOpen, Users, User, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Reminders from "./Reminders";
import Friends from "./Friends";
import FriendPops from "./FriendPops";
import Insight from "./Insight";

const Main = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"feed" | "pops" | "reminders" | "friends" | "insight">("feed");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-yellow-300 border-b-4 border-black z-40">
        <div className="px-5 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-black text-black">
            {activeTab === "feed" && "Feed"}
            {activeTab === "pops" && "POPs"}
            {activeTab === "reminders" && "Self POPs"}
            {activeTab === "friends" && "Friends"}
            {activeTab === "insight" && "Insight"}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center h-12 w-12 bg-yellow-100 border-2 border-black hover:bg-yellow-200 transition-all duration-200"
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
                <div className="absolute right-0 mt-2 w-56 bg-white border-4 border-black z-50" onClick={(e) => e.stopPropagation()}>
                  {/* User Info Header */}
                  <div className="px-5 py-4 border-b-4 border-black bg-yellow-50">
                    <p className="font-black text-black text-base">{user?.displayName || "User"}</p>
                    <p className="text-xs font-semibold text-black/70 mt-1">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 font-black text-black hover:bg-yellow-100 border-b-4 border-black transition-all duration-200"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 font-black text-black hover:bg-yellow-100 border-b-4 border-black transition-all duration-200"
                  >
                    Settings
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
      <main className="flex-1 overflow-y-auto mb-4">
        <div className="px-5 py-6">
          {/* TAB 1: FEED */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-black">Dashboard</h2>
              <div className="bg-white border-4 border-black p-6 space-y-4">
                <p className="text-2xl font-bold text-black">📊 Today's Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-yellow-100 border-2 border-black p-4">
                    <p className="text-3xl font-black text-black">42</p>
                    <p className="text-sm font-semibold text-black/70">POPs Completed</p>
                  </div>
                  <div className="bg-yellow-100 border-2 border-black p-4">
                    <p className="text-3xl font-black text-black">3</p>
                    <p className="text-sm font-semibold text-black/70">Day Streak</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-4 border-black p-6">
                <p className="text-xl font-bold text-black mb-3">⏱️ Time Saved</p>
                <p className="text-5xl font-black text-black">15m 42s</p>
                <p className="text-sm text-black/70 mt-2">from not scrolling</p>
              </div>
            </div>
          )}

          {/* TAB 2: FRIEND POPs */}
          {activeTab === "pops" && (
            <FriendPops />
          )}

          {/* TAB 3: REMINDERS */}
          {activeTab === "reminders" && (
            <Reminders />
          )}

          {/* TAB 4: FRIENDS */}
          {activeTab === "friends" && (
            <Friends />
          )}

          {/* TAB 5: INSIGHT */}
          {activeTab === "insight" && (
            <Insight />
          )}
        </div>
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-yellow-300 border-t-4 border-black z-40">
        <div className="flex items-center justify-around">
          {/* Feed Tab */}
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
              activeTab === "feed"
                ? "bg-yellow-200 border-t-4 border-black"
                : "hover:bg-yellow-200/50"
            }`}
          >
            <Home className="h-6 w-6 text-black mb-1" />
            <span className="text-xs font-bold text-black">Feed</span>
          </button>

          {/* Friend POPs Tab */}
          <button
            onClick={() => setActiveTab("pops")}
            className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
              activeTab === "pops"
                ? "bg-yellow-200 border-t-4 border-black"
                : "hover:bg-yellow-200/50"
            }`}
          >
            <MessageCircle className="h-6 w-6 text-black mb-1" />
            <span className="text-xs font-bold text-black">POPs</span>
          </button>

          {/* Reminders Tab */}
          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
              activeTab === "reminders"
                ? "bg-yellow-200 border-t-4 border-black"
                : "hover:bg-yellow-200/50"
            }`}
          >
            <BookOpen className="h-6 w-6 text-black mb-1" />
            <span className="text-xs font-bold text-black">Self</span>
          </button>

          {/* Friends Tab */}
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
              activeTab === "friends"
                ? "bg-yellow-200 border-t-4 border-black"
                : "hover:bg-yellow-200/50"
            }`}
          >
            <Users className="h-6 w-6 text-black mb-1" />
            <span className="text-xs font-bold text-black">Friends</span>
          </button>

          {/* Insight Tab */}
          <button
            onClick={() => setActiveTab("insight")}
            className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-all duration-200 ${
              activeTab === "insight"
                ? "bg-yellow-200 border-t-4 border-black"
                : "hover:bg-yellow-200/50"
            }`}
          >
            <Lightbulb className="h-6 w-6 text-black mb-1" />
            <span className="text-xs font-bold text-black">Insight</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Main;
