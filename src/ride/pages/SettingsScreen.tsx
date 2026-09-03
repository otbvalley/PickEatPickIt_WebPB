import { useState } from "react";
import {
  ChevronRight,
  LogOut,
  Trash2,
  Book,
  Lock,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";
import { RiderNav } from "../component/RiderNav";
import { backendAuthService } from "../../services/backendAuthService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  riderResetPassword,
  riderChangePassword,
  deleteRiderAccount,
} from "../../services/api";

export default function SettingsScreen() {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    backendAuthService.logout();
    navigate("/rider-login");
  };

  const resetPasswordFormState = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmitReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await riderResetPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Your password has been reset successfully");
      setShowResetForm(false);
      resetPasswordFormState();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to reset password",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await riderChangePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Your password has been changed successfully");
      setShowChangeForm(false);
      resetPasswordFormState();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to change password",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteRiderAccount();
      toast.success("Your account has been deleted");
      backendAuthService.logout();
      navigate("/rider-login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete account",
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "Riders Handbook",
      icon: <Book className="w-5 h-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: <ChevronRight className="w-5 h-5 text-gray-400" />,
    },
    {
      id: 2,
      title: "Reset PIN",
      icon: <Lock className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: <ChevronRight className="w-5 h-5 text-gray-400" />,
    },
    {
      id: 5,
      title: "Change Password",
      icon: <KeyRound className="w-5 h-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: <ChevronRight className="w-5 h-5 text-gray-400" />,
    },
    {
      id: 3,
      title: "Log Out",
      icon: <LogOut className="w-5 h-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      action: <LogOut className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 4,
      title: "Delete Account",
      icon: <Trash2 className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      action: <Trash2 className="w-5 h-5 text-red-600" />,
      danger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <RiderNav />
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              className={`
                group relative bg-white rounded-2xl shadow-sm border border-gray-200
                hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                transition-all duration-300 ease-out cursor-pointer overflow-hidden
                ${activeItem === item.id ? "ring-2 ring-offset-2" : ""}
                ${item.danger ? "hover:ring-red-300" : "hover:ring-emerald-300"}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideIn 0.5s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${
                  item.danger
                    ? "bg-gradient-to-r from-red-50 to-pink-50"
                    : "bg-gradient-to-r from-emerald-50 to-teal-50"
                }
              `}
              />

              <div
                className="relative flex items-center justify-between p-5"
                onClick={() => {
                  if (item.title === "Log Out") handleLogout();
                  else if (item.title === "Reset PIN") setShowResetForm(true);
                  else if (item.title === "Change Password")
                    setShowChangeForm(true);
                  else if (item.title === "Delete Account")
                    setConfirmDelete(true);
                }}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon container */}
                  <div
                    className={`
                    ${item.bgColor} ${item.color} p-3 rounded-xl
                    group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  `}
                  >
                    {item.icon}
                  </div>

                  {/* Title */}
                  <span
                    className={`
                    text-lg font-semibold
                    ${item.danger ? "text-red-700" : "text-gray-800"}
                    group-hover:translate-x-2 transition-transform duration-300
                  `}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Action icon */}
                <div className="group-hover:translate-x-1 transition-transform duration-300">
                  {item.action}
                </div>
              </div>

              {/* Bottom border accent */}
              <div
                className={`
                h-1 w-0 group-hover:w-full transition-all duration-500
                ${
                  item.danger
                    ? "bg-gradient-to-r from-red-400 to-pink-400"
                    : "bg-gradient-to-r from-emerald-400 to-teal-400"
                }
              `}
              />

              {/* Inline delete confirmation */}
              {item.danger && confirmDelete && (
                <div
                  className="relative bg-white rounded-2xl border border-gray-100 shadow-sm mx-5 mb-5 p-4 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Confirm Delete"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm">
          <p className="text-sm text-gray-600 text-center">
            Need help? Contact our support team anytime
          </p>
        </div>
      </div>

      {/* Reset PIN / Change Password modal */}
      {(showResetForm || showChangeForm) && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => {
            setShowResetForm(false);
            setShowChangeForm(false);
            resetPasswordFormState();
          }}
        >
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">
                {showResetForm ? "Reset PIN" : "Change Password"}
              </h3>
              <button
                onClick={() => {
                  setShowResetForm(false);
                  setShowChangeForm(false);
                  resetPasswordFormState();
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
              </div>
              <button
                onClick={showResetForm ? handleSubmitReset : handleSubmitChange}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : showResetForm ? (
                  "Reset PIN"
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
