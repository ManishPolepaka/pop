import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { setPendingPopContent, setPendingPopReminderId } from "@/lib/localNotifications";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Main from "./pages/Main";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UsernameSetup from "./pages/UsernameSetup";
import CategoryComparison from "./pages/CategoryComparison";
import NotFound from "./pages/NotFound";
import Feedback from "./pages/Feedback";
import AdminFeedback from "./pages/AdminFeedback";
import Settings from "./pages/Settings";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const NativeBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listenerPromise = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      const currentPath = location.pathname;

      if (canGoBack || window.history.length > 1) {
        window.history.back();
        return;
      }

      if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/username-setup") {
        navigate("/", { replace: true });
        return;
      }

      if (currentPath !== "/" && currentPath !== "/main") {
        navigate("/main", { replace: true });
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [location.pathname, navigate]);

  return null;
};

const NotificationOpenHandler = () => {
  const navigate = useNavigate();
  const lastHandledNotificationRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listenerPromise = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (event) => {
        const eventKey = `${event.notification?.id ?? "unknown"}:${event.actionId ?? "tap"}`;
        const now = Date.now();
        const lastHandled = lastHandledNotificationRef.current;

        if (lastHandled && lastHandled.key === eventKey && now - lastHandled.at < 1500) {
          return;
        }

        lastHandledNotificationRef.current = { key: eventKey, at: now };

        const rawReminderId = event.notification?.extra?.reminderId;
        const reminderId =
          typeof rawReminderId === "string" ? rawReminderId : null;
        const pendingContent = event.notification?.title === "Pop!"
          ? event.notification.body
          : null;

        setPendingPopReminderId(reminderId);
        setPendingPopContent(pendingContent);
        navigate("/main", { replace: true });
      }
    );

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NativeBackHandler />
            <NotificationOpenHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/username-setup" element={<UsernameSetup />} />
              <Route path="/main" element={<Main />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/category-comparison/:categoryId" element={<CategoryComparison />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route
                path="/admin/feedback"
                element={
                  <AdminRoute>
                    <AdminFeedback />
                  </AdminRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
