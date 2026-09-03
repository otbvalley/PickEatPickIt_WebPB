import React, { useState, useRef } from "react";
import { backendAuthService } from "../../services/backendAuthService";
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, CheckCircle2, ShieldCheck, ChevronRight } from "lucide-react";
import logo from "../../assets/Logo SVG 1.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../component/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  user_id?: string;
}

const SignupShell = ({ children, step, totalSteps }: { children: React.ReactNode, step: number, totalSteps: number }) => (
  <div className="min-h-screen relative bg-gray-50 font-inter">
    {/* Progress Bar */}
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-[100]">
      <motion.div
        className="h-full bg-emerald-600"
        initial={{ width: "0%" }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: "circOut" }}
      />
    </div>

    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:p-12">
      {children}
    </div>
  </div>
);

// Step 1: Credentials
const EmailInputScreen = ({ onContinue, toast }: { onContinue: (email: string, password: string, user_id: string) => void, toast: ReturnType<typeof useToast> }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return toast.error("Enter a valid email");
    if (password.length < 8) return toast.error("Password too short");

    setIsLoading(true);
    try {
      // Register with FastAPI backend - this automatically sends OTP
      const response = await backendAuthService.customerRegister({ email, password });
      toast.success("Verification Signal Sent");
      onContinue(email, password, response.data?.id || "");
    } catch (err) {
      toast.error((err as Error).message || "Failed to initiate signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-lg">
      <div className="text-center mb-10">
        <motion.img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">User <span className="text-emerald-600">Sign Up</span></h1>
        <p className="text-sm text-gray-500">Step 1: Your Details</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isLoading ? "Starting Process..." : <>Create Account <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
        </motion.button>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Login Here</Link>
        </p>
      </div>
    </motion.div>
  );
};

// Step 2: Verification
const EmailOTPScreen = ({ email, onContinue, onBack, toast }: { email: string, onContinue: () => void, onBack: () => void, toast: ReturnType<typeof useToast> }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return toast.error("Incomplete code");
    setIsLoading(true);
    try {
      // Verify OTP with FastAPI backend
      await backendAuthService.verifyOTP(email, otpCode);
      toast.success("OTP Verified");
      onContinue();
    } catch (e) { toast.error((e as Error).message || "Verification failed"); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-10">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify <span className="text-emerald-600">Email</span></h1>
        <p className="text-sm text-gray-500">Authentication code sent to <span className="text-gray-900 font-medium">{email}</span></p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-8 text-center">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { if (el) inputRefs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(-1);
                const newOtp = [...otp];
                newOtp[i] = val;
                setOtp(newOtp);
                if (val && i < 5) inputRefs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              className="w-12 h-16 bg-white border border-gray-200 rounded-xl text-2xl font-semibold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </motion.button>

        <button
          onClick={async () => {
            try {
              await backendAuthService.sendOTP(email);
              toast.success("New code sent to your email");
            } catch (e) {
              toast.error((e as Error).message || "Failed to resend");
            }
          }}
          className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors w-full mt-4"
        >
          Didn't receive code? <span className="underline">Resend Code</span>
        </button>
      </div>
    </motion.div>
  );
};

// Step 3: Profile
const CompleteProfileScreen = ({ onContinue, toast }: { onContinue: (data: UserData) => void, toast: ReturnType<typeof useToast> }) => {
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [ph, setPh] = useState("");

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile <span className="text-emerald-600">Details</span></h1>
        <p className="text-sm text-gray-500">Step 3: Your Information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">First Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
               placeholder="First Name"
               value={fName} onChange={e => setFName(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Last Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
               placeholder="Last Name"
               value={lName} onChange={e => setLName(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">+234</span>
            <input
               placeholder="80XXXXXXXX"
               value={ph} onChange={e => setPh(e.target.value.replace(/\D/g, "").slice(0, 10))}
               className="w-full pl-24 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm tracking-wide"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 pt-6">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!fName || !lName || ph.length < 10) return toast.error("Incomplete parameters");
              onContinue({ firstName: fName, lastName: lName, phone: `+234${ph}` });
            }}
            className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            Save and Continue <ShieldCheck className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Step 4: Address
const AddressInputScreen = ({ onComplete, toast }: { onComplete: (addr: string) => void, toast: ReturnType<typeof useToast> }) => {
  const [addr, setAddr] = useState("");
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Delivery <span className="text-emerald-600">Address</span></h1>
        <p className="text-sm text-gray-500">Step 4: Your Location</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Delivery Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Full physical address..."
              value={addr} onChange={e => setAddr(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[150px] resize-none text-sm leading-relaxed"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (addr.length < 10) return toast.error("Address too short (min 10 chars)");
            onComplete(addr);
          }}
          className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group"
        >
          Finish Registration <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<UserData>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFinalComplete = async (addr: string) => {
    setIsFinalizing(true);
    try {
      // Use FastAPI backend to update profile
      // First, we need to login to get the token
      if (!userData.email || !userData.password) {
        throw new Error("Missing credentials. Please restart registration.");
      }

      // Login to get JWT token
      const loginResponse = await backendAuthService.customerLogin(userData.email, userData.password);

      if (!loginResponse.success) {
        throw new Error("Failed to authenticate. Please try logging in.");
      }

      // Update profile with collected data
      await backendAuthService.updateProfile({
        firstname: userData.firstName,
        lastname: userData.lastName,
        phone: userData.phone,
        address: addr,
      });

      toast.success("System Integration Complete!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      toast.error((e as Error).message || "Integration error");
      setIsFinalizing(false);
    }
  };

  return (
    <SignupShell step={step} totalSteps={4}>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      <AnimatePresence mode="wait">
        {step === 1 && <EmailInputScreen key="s1" toast={toast} onContinue={(e, p, user_id) => { setEmail(e); setUserData(prev => ({ ...prev, email: e, password: p, user_id })); setStep(2); }} />}
        {step === 2 && <EmailOTPScreen key="s2" email={email} onContinue={() => setStep(3)} onBack={() => setStep(1)} toast={toast} />}
        {step === 3 && <CompleteProfileScreen key="s3" onContinue={(d) => { setUserData(prev => ({ ...prev, ...d })); setStep(4); }} toast={toast} />}
        {step === 4 && !isFinalizing && <AddressInputScreen key="s4" onComplete={handleFinalComplete} toast={toast} />}
        {isFinalizing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 animate-pulse">Creating Account...</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </SignupShell>
  );
};

export default Signup;
