import { useState } from "react";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Key } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { useToast, ToastContainer } from "../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "otp" | "password" | "success";

const THEMES: Record<
  string,
  {
    color: string;
    hex: string;
    iconBg: string;
    iconText: string;
    button: string;
    ring: string;
    text: string;
  }
> = {
  user: {
    color: "emerald",
    hex: "#059669",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "focus:ring-emerald-500 focus:border-emerald-500",
    text: "text-emerald-600",
  },
  rider: {
    color: "orange",
    hex: "#f97316",
    iconBg: "bg-orange-50",
    iconText: "text-orange-500",
    button: "bg-orange-500 hover:bg-orange-600",
    ring: "focus:ring-orange-500 focus:border-orange-500",
    text: "text-orange-500",
  },
  vendor: {
    color: "blue",
    hex: "#2563eb",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
    ring: "focus:ring-blue-500 focus:border-blue-500",
    text: "text-blue-600",
  },
};

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "vendor";
  const navigate = useNavigate();
  const toast = useToast();

  const theme = THEMES[userType] || THEMES.vendor;

  const getLoginPath = () => {
    switch (userType) {
      case "rider": return "/rider-login";
      case "user": return "/login";
      default: return "/vendor-login";
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "rider": return "Rider Recovery";
      case "user": return "Account Recovery";
      default: return "Partner Recovery";
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return toast.error("Enter a valid email");
    setIsLoading(true);
    try {
      const response = await authService.sendPasswordResetOTP(email);
      toast.success(response.message);
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send code");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error("Enter 6-digit code");
    setIsLoading(true);
    try {
      await authService.verifyPasswordResetOTP(email, otp);
      setStep("password");
    } catch (error: any) { toast.error(error.message || "Verification failed"); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords mismatch");
    setIsLoading(true);
    try {
      await authService.resetPasswordWithOTP(password);
      setStep("success");
      setTimeout(() => navigate(getLoginPath()), 3000);
    } catch (error: any) { toast.error(error.message || "Reset failed"); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="min-h-screen relative bg-gray-50 font-inter">
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <motion.div
                  initial={{ width: "33%" }}
                  animate={{ width: step === "email" ? "33%" : step === "otp" ? "66%" : "100%" }}
                  className="h-full transition-all duration-500"
                  style={{ backgroundColor: theme.hex }}
                />
              </div>

              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${theme.iconBg}`}
                >
                  {step === "email" && <Mail className={`w-8 h-8 ${theme.iconText}`} />}
                  {step === "otp" && <Key className={`w-8 h-8 ${theme.iconText}`} />}
                  {step === "password" && <Lock className={`w-8 h-8 ${theme.iconText}`} />}
                  {step === "success" && <CheckCircle className={`w-8 h-8 ${theme.iconText}`} />}
                </motion.div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {step === "success" ? "Password Reset" : getTitle()}
                </h1>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                  {step === "email" && "Step 1 of 3: Confirm your email"}
                  {step === "otp" && "Step 2 of 3: Enter verification code"}
                  {step === "password" && "Step 3 of 3: Set a new password"}
                  {step === "success" && "All done"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === "email" && (
                  <motion.form key="e" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSendOTP} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Account Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          value={email} onChange={e => setEmail(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.ring} transition-all text-sm`}
                          placeholder="name@domain.com"
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-white font-semibold py-3 rounded-xl shadow-sm transition-all ${theme.button}`}
                    >
                      {isLoading ? "Sending..." : "Send Code"}
                    </motion.button>
                    <Link to={getLoginPath()} className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Cancel
                    </Link>
                  </motion.form>
                )}

                {step === "otp" && (
                  <motion.form key="o" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleVerifyOTP} className="space-y-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-6">Verification code sent to <span className="text-gray-900 font-medium">{email}</span></p>
                      <input
                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className={`w-full bg-white border border-gray-200 rounded-lg py-4 text-3xl font-semibold text-center tracking-[0.4em] focus:outline-none focus:ring-2 ${theme.ring} transition-all ${theme.text}`}
                        placeholder="000000" maxLength={6}
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-white font-semibold py-3 rounded-xl shadow-sm transition-all ${theme.button}`}
                      >
                        {isLoading ? "Verifying..." : "Verify Code"}
                      </motion.button>
                      <button type="button" onClick={() => setStep("email")} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Wrong address?</button>
                    </div>
                  </motion.form>
                )}

                {step === "password" && (
                  <motion.form key="p" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.ring} transition-all text-sm`}
                          placeholder="New password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.ring} transition-all text-sm`}
                          placeholder="Confirm new password"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-white font-semibold py-3 rounded-xl shadow-sm transition-all ${theme.button}`}
                    >
                      {isLoading ? "Saving..." : "Reset Password"}
                    </motion.button>
                  </motion.form>
                )}

                {step === "success" && (
                  <motion.div key="s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                    <p className="text-gray-500 text-sm">Your password has been updated. Redirecting you to sign in...</p>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.hex }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              Your connection to PickEAT is secure and encrypted
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
