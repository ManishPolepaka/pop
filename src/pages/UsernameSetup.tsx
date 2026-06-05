import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader, ArrowLeft } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";

const UsernameSetup = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if no user is logged in - use useEffect to avoid render warning
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleSetUsername = async (e: React.FormEvent) => {
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

    setLoading(true);

    // Create a timeout promise that rejects after 8 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firestore write timeout - check your internet connection and Firebase rules"));
      }, 8000);
    });

    try {
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      
      // Prepare user data - ensure all fields are included
      const userData = {
        uid: user.uid,
        username: username.toLowerCase(), // Store lowercase for consistency
        email: user.email || "",
        displayName: username,
        role: "user",
        status: "online",
        createdAt: new Date(),
      };

      console.log("📝 Saving username to Firestore...");
      console.log("   User ID:", user.uid);
      console.log("   Username:", username.toLowerCase());
      console.log("   Email:", user.email);
      console.log("   Document ref:", `users/${user.uid}`);

      // Race between the Firestore write and timeout
      const writePromise = setDoc(userDocRef, userData);
      await Promise.race([writePromise, timeoutPromise]);
      
      console.log("✅ Username saved successfully in Firestore");

      // Update Firebase Auth displayName
      console.log("🔄 Updating Firebase Auth profile...");
      await updateProfile(user, {
        displayName: username,
      });
      console.log("✅ Firebase Auth profile updated");

      console.log("✅ Navigating to /main");
      navigate("/main", { replace: true });
    } catch (err) {
      const error = err as Error & { code?: string; message?: string };
      console.error("❌ Username setup error:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Full error:", error);
      
      // Provide specific error messages
      if (error.code === "permission-denied") {
        setError("❌ Firestore permissions error. Update your Firebase security rules to allow user profile writes.");
      } else if (error.message?.includes("timeout")) {
        setError("⏱️ Request timed out. Check your Firestore rules and internet connection, then try again.");
      } else if (error.code === "unavailable") {
        setError("📡 Firebase service temporarily unavailable. Please try again.");
      } else {
        setError(error.message || "Failed to set username");
      }
      setLoading(false);
    }
  };

  // Don't render if user is not available
  if (!user) {
    return null;
  }

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
            <h1 className="text-5xl font-black text-black mb-2">Pop</h1>
            <p className="text-black/70 text-lg">Choose your username</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-4 border-black p-8">
            <h2 className="text-3xl font-black text-black mb-4">Create Your Username</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-600 text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSetUsername} className="space-y-5">
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
                    autoFocus
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
                    Setting username...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetup;
