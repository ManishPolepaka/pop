import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Loader } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user);

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden">
      {/* Main Content */}
      <section className="relative z-10 py-8 px-5">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-6 w-6 text-black animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white border-4 border-black p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-20 w-20 bg-yellow-300 border-4 border-black mb-4">
                  <span className="text-5xl">👤</span>
                </div>
                <h1 className="text-3xl font-black text-black">
                  {profile?.displayName || "User"}
                </h1>
                <p className="text-lg text-black/70 font-semibold">
                  @{profile?.username || "username"}
                </p>
              </div>

              {/* User Info */}
              <div className="space-y-4 border-t-4 border-black pt-6">
                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase">Email</p>
                  <p className="text-lg font-bold text-black">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase">Account Status</p>
                  <p className="text-lg font-bold text-green-600">✅ Active</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase">Member Since</p>
                  <p className="text-lg font-bold text-black">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-4 border-black p-6 text-center">
                <p className="text-4xl font-black text-black mb-2">42</p>
                <p className="text-sm font-bold text-black/70">POPs Completed</p>
              </div>
              <div className="bg-white border-4 border-black p-6 text-center">
                <p className="text-4xl font-black text-black mb-2">8</p>
                <p className="text-sm font-bold text-black/70">Friends</p>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white border-4 border-black p-6">
              <h2 className="text-2xl font-black text-black mb-3">About Pop</h2>
              <p className="text-black/80">
                Pop helps you break your phone addiction by delivering meaningful questions at scheduled times.
                Connect with friends and share profound conversations instead of mindless scrolling.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
