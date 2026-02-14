import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Main from "./pages/Main";
import Reminders from "./pages/Reminders";
import Friends from "./pages/Friends";
import FriendPops from "./pages/FriendPops";
import ConversationDetail from "./pages/ConversationDetail";
import InviteFriend from "./pages/InviteFriend";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UsernameSetup from "./pages/UsernameSetup";
import ViewProfile from "./pages/ViewProfile";
import InsightResults from "./pages/InsightResults";
import CategoryComparison from "./pages/CategoryComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/username-setup" element={<UsernameSetup />} />
            <Route path="/main" element={<Main />} />
            <Route path="/category-comparison/:categoryId" element={<CategoryComparison />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friend-pops" element={<FriendPops />} />
            <Route path="/conversation/:friendId" element={<ConversationDetail />} />
            <Route path="/insight-results" element={<InsightResults />} />
            <Route path="/invite-friend" element={<InviteFriend />} />
            <Route path="/profile/:userId" element={<ViewProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
