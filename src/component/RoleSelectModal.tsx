import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, User, Store, Bike, ArrowRight } from "lucide-react";

type Role = {
  id: string;
  label: string;
  tagline: string;
  icon: React.ElementType;
  path: string;
  accent: string;
};

// Routes match the ones already registered for each role in AppRoutes.tsx
const ROLES: Role[] = [
  {
    id: "customer",
    label: "Customer",
    tagline: "Order food from your favourite restaurants.",
    icon: User,
    path: "/user-home",
    accent: "#2ECC71",
  },
  {
    id: "vendor",
    label: "Vendor",
    tagline: "List your restaurant and reach more customers.",
    icon: Store,
    path: "/vendor-login",
    accent: "#FBBF24",
  },
  {
    id: "rider",
    label: "Rider",
    tagline: "Deliver orders and earn on your schedule.",
    icon: Bike,
    path: "/onboarding",
    accent: "#60A5FA",
  },
];

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-emerald-500 text-xs font-medium tracking-wide mb-2">
              Get started
            </p>
            <h2 className="text-white text-2xl font-semibold mb-1">
              How will you use PickEAT PickIT?
            </h2>
            <p className="text-white/40 text-sm mb-8">
              Choose a role to continue — you can always switch later.
            </p>

            <div className="space-y-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSelect(role.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-colors text-left group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: role.accent + "1A",
                      border: `1px solid ${role.accent}40`,
                    }}
                  >
                    <role.icon
                      className="w-5 h-5"
                      style={{ color: role.accent }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">
                      {role.label}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
                      {role.tagline}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleSelectModal;
