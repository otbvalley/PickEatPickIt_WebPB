import { useState, useEffect } from "react";
// ggggggggggg
import {
  User,
  Clock,
  Wallet,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../component/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  secs: string;
  description: string;
}

interface UserProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);

  const menuItems: MenuItem[] = [
    {
      icon: <User className="w-6 h-6" />,
      label: "Profile Settings",
      description: "Manage your personal information",
      secs: "/profile-edit",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Booking History",
      description: "View your past and active orders",
      secs: "/booking",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      label: "Wallet & Payments",
      description: "Manage your funds and cards",
      secs: "/wallet",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      label: "Notifications",
      description: "Control your alerts and messages",
      secs: "/notification",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      label: "Security",
      description: "Passwords and two-factor auth",
      secs: "/device",
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      label: "Help & Support",
      description: "Get assistance and read FAQs",
      secs: "/support",
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await authService.getCurrentUserProfile();
        // After
        setUserProfile(profile as UserProfile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fullName =
    `${userProfile.firstname || ""} ${userProfile.lastname || ""}`.trim();
  const initials =
    (userProfile.firstname?.[0] || "U") + (userProfile.lastname?.[0] || "S");

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 font-inter">
      <Navbar />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-6 py-12 space-y-8"
          >
            <div className="h-64 w-full bg-gray-50 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 w-full bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-12 pb-32"
          >
            {/* Profile Header */}
            <div className="relative mb-10">
              <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative inline-block mb-8"
                >
                  <div className="w-32 h-32 rounded-2xl bg-emerald-600 flex items-center justify-center">
                    <span className="text-4xl font-semibold text-white">
                      {initials}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {fullName || "Cinematic User"}
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                  {userProfile.email || "premium@pickitpickeat.com"}
                </p>

                <div className="flex items-center justify-center gap-6">
                  <div className="px-4 py-1.5 bg-emerald-50 rounded-full text-emerald-700 font-medium text-xs">
                    Verified Global Member
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={item.secs} className="block group">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors h-full flex items-center gap-6 relative overflow-hidden">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 leading-none mb-1">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-500 leading-tight">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="absolute right-6 w-5 h-5 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Logout Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <button
                onClick={handleLogout}
                className="group relative px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm overflow-hidden hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Log Out <LogOut className="w-4 h-4" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
