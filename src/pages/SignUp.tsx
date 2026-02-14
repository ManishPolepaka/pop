import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signInWithGoogle } from "@/firebase/auth";
import { Mail, Lock, UserPlus, Loader, ArrowLeft, User } from "lucide-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const user = await signUp(email, password, username);
      if (user) {
        // Redirect directly to main since user is now authenticated
        navigate("/main", { replace: true });
      } else {
        setError("Sign up failed - user not created");
        setLoading(false);
      }
    } catch (err) {
      const error = err as Error & { code?: string };
      console.error("Signup error:", error);
      const errorCode = (error as Record<string, unknown>).code as string | undefined;
      setError(
        errorCode === "auth/email-already-in-use"
          ? "Email already in use"
          : errorCode === "auth/weak-password"
            ? "Password is too weak"
            : error.message || "Sign up failed"
      );
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result) {
        // On signup, always go to username setup for Google users
        // (whether new or returning, they should set their username)
        navigate("/username-setup", { replace: true });
      } else {
        setError("Google sign-up failed");
        setLoading(false);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Google sign-up failed");
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
            <p className="text-black/70 text-lg">Create your account</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-4 border-black p-8">
            <h2 className="text-3xl font-black text-black mb-6">Create Account</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-600 text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-black" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-black text-black pl-12 pr-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-300 font-medium"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-black" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-black text-black pl-12 pr-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-300 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Sign Up
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

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </button>

            {/* Sign In Link */}
            <p className="text-center text-black text-sm mt-6 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-black font-black hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
