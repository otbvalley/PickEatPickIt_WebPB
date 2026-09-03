import { useState } from "react";
import {
  Bike,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { motion } from "framer-motion";

export default function RiderLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.loginRider(email, password);
      if (result.success) {
        // result.token and result.user are already stored in localStorage by authService.loginRider
        setTimeout(() => {
          window.location.href = "/rider-dashboard";
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login component error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    }
    finally { setIsLoading(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) handleLogin();
  };

  return (
    <div className="min-h-screen relative bg-gray-50 font-inter">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* LOGO & BRAND */}
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 mb-6 rounded-full bg-orange-50 flex items-center justify-center"
            >
              <Bike className="w-8 h-8 text-orange-500" />
            </motion.div>
            <div className="inline-block px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-xs font-medium mb-4">
              Rider Portal
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Rider Login
            </h1>
            <p className="text-sm text-gray-500">
              Enter your details to start your shift
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="rider@fleet.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password?type=rider" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                    Recover?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-orange-500 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-orange-600 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Login Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <Link to="/" className="block">
                <button className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
              </Link>
            </div>
          </div>

          {/* REGISTER LINK */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <p className="text-gray-500 text-sm">
              Request Fleet Access?{" "}
              <Link to="/rider-registration">
                <span className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer font-medium border-b border-orange-200">
                  Submit Application
                </span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
