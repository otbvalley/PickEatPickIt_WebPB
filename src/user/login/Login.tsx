import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { APIError } from "../../services/authService";
import { backendAuthService } from "../../services/backendAuthService";
import { useToast, ToastContainer } from "../../component/Toast";
import { motion } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Use FastAPI backend with JWT authentication
      const response = await backendAuthService.customerLogin(email, password);
      toast.success(response.message || "Login successful!");

      // Token and user data are already stored by customerLogin method
      // Navigate to dashboard
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1000);
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

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
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={logo}
                alt="Logo"
                className="w-20 h-20 mb-6"
              />
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                PickEAT <span className="text-emerald-600">PickIT</span>
              </h1>
              <p className="text-sm text-gray-500">
                User Login
              </p>
            </div>

            {/* LOGIN CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
              <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-sm">Enter your email and password to login</p>
              </div>

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
                      placeholder="identity@pickeat.com"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password?type=user" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                      Forgot?
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
                      className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
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
                  className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Login Now
                      <ShieldCheck className="w-5 h-5" />
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
                <Link to="/signup">
                  <span className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer font-medium border-b border-emerald-200">
                    Sign Up Now
                  </span>
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
