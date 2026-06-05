import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/firebase/auth";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  // Redirect authenticated users — admins go to their dashboard, others to main
  useEffect(() => {
    if (user && !loading) {
      navigate(role === "admin" ? "/admin/feedback" : "/main", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const goToReminders = () => {
    navigate("/reminders");
  };

  const handleSignOut = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen bg-primary relative flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-foreground/5 blur-2xl" />
          <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary-foreground/5 blur-xl" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary-foreground shadow-hero mb-4">
            <Bell className="h-10 w-10 text-primary" />
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-7xl font-black text-primary-foreground leading-tight tracking-tight">
            Diversion
            <br />
            <span className="text-primary-foreground/80">is a Bliss</span>
          </h1>

          {/* Subtext */}
          <p className="text-xl sm:text-2xl text-primary-foreground/70 font-medium max-w-lg mx-auto">
            Take a break. Set a reminder. 
            <br className="hidden sm:block" />
            Come back refreshed.
          </p>

          {/* CTA Button */}
          {user && (
            <button
              onClick={goToReminders}
              className="group inline-flex flex-col items-center gap-2 mt-8 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <span className="text-sm font-semibold uppercase tracking-wider">
                Set Your Reminder
              </span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </button>
          )}
          {!user && !loading && (
            <div className="flex flex-col items-center gap-4 mt-12">
              <button
                onClick={() => navigate("/login")}
                className="w-40 h-12 bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground font-bold rounded-lg hover:bg-primary-foreground/30 transition-all duration-200 border-2 border-primary-foreground/40"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-40 h-12 bg-primary-foreground text-primary font-bold rounded-lg hover:bg-primary-foreground/90 transition-all duration-200"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Index;
