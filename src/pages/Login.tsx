import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn, signInWithGoogle } from "@/firebase/auth";
import { Mail, Lock, LogIn as LogInIcon, Loader, ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await logIn(email, password);
      navigate("/main", { replace: true });
    } catch (err) {
      const error = err as Error & { code?: string };
      const errorCode = (error as Record<string, unknown>).code as string | undefined;
      setError(
        errorCode === "auth/user-not-found"
          ? "Account not found"
          : errorCode === "auth/wrong-password"
            ? "Incorrect password"
            : error.message || "Login failed"
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result) {
        // If new user (no username yet), go to username setup
        // If returning user (has username), go directly to main
        if (result.isNew) {
          console.log("New Google user detected - going to username setup");
          navigate("/username-setup", { replace: true });
        } else {
          console.log("Returning Google user - going directly to main");
          navigate("/main", { replace: true });
        }
      } else {
        setError("Google sign-in failed");
        setLoading(false);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-black/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center justify-center h-10 w-10 bg-white/20 hover:bg-white/40 transition-all duration-300 group font-bold z-50 border-2 border-black"
      >
        <ArrowLeft className="h-5 w-5 text-black group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-black mb-2">Diverto</h1>
            <p className="text-black/70 text-lg">Manage your reminders efficiently</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-4 border-black p-8">
            <h2 className="text-3xl font-black text-black mb-6">Sign In</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-600 text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-black" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-black text-black pl-12 pr-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-300 font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-black" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-black text-black pl-12 pr-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-300 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-yellow-400 text-black font-bold hover:bg-yellow-500 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-1 bg-black" />
              <span className="text-black font-bold text-sm">OR</span>
              <div className="flex-1 h-1 bg-black" />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 border-2 border-black text-black font-bold rounded-lg hover:bg-white/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M23 12c0-1.1-.9-2-2-2h-2V7h-3v3h-2V7h-3v3H8V7H5v3H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V12z" />
                </svg>
              )}
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-black text-sm mt-6 font-medium">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-black font-black hover:underline transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
