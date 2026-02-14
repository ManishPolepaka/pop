import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader, Users } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface UserProfile {
  displayName: string;
  username: string;
  email: string;
  createdAt?: string;
}

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center">
        <Loader className="h-8 w-8 text-black animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-5">
        <div className="bg-white border-4 border-black p-8 text-center max-w-md">
          <p className="text-2xl font-black text-black mb-4">❌ Error</p>
          <p className="text-black/70 mb-6">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-yellow-400 border-2 border-black text-black font-bold hover:bg-yellow-500 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden pb-20">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-yellow-300 border-b-4 border-black z-40 px-5 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black text-black font-bold hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <section className="relative z-10 py-8 px-5">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl border-4 border-black p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-yellow-300 border-4 border-black mb-4">
                <Users className="h-10 w-10 text-black" />
              </div>
              <h1 className="text-3xl font-black text-black">
                {profile.displayName || "User"}
              </h1>
              <p className="text-lg text-black/70 font-semibold">
                @{profile.username || "username"}
              </p>
            </div>

            {/* User Info */}
            <div className="space-y-4 border-t-4 border-black pt-6">
              <div>
                <p className="text-sm font-semibold text-black/70 uppercase">Email</p>
                <p className="text-lg font-bold text-black">{profile.email}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-black/70 uppercase">Account Status</p>
                <p className="text-lg font-bold text-green-600">✅ Active</p>
              </div>

              {profile.createdAt && (
                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase">Member Since</p>
                  <p className="text-lg font-bold text-black">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border-4 border-black p-6 text-center">
              <p className="text-4xl font-black text-black mb-2">--</p>
              <p className="text-sm font-bold text-black/70">POPs Completed</p>
            </div>
            <div className="bg-white rounded-2xl border-4 border-black p-6 text-center">
              <p className="text-4xl font-black text-black mb-2">--</p>
              <p className="text-sm font-bold text-black/70">Friends</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl border-4 border-black p-6">
            <h2 className="text-2xl font-black text-black mb-3">About Pop</h2>
            <p className="text-black/80">
              Pop helps you break your phone addiction by delivering meaningful questions at scheduled times.
              Connect with friends and share profound conversations instead of mindless scrolling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewProfile;
