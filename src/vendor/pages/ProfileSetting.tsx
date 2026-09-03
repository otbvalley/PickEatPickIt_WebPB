import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Edit2,
  Check,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import { VendorNav } from "../component/VendorNav";
import { backendAuthService } from "../../services/backendAuthService";
// //
import { useToast } from "../../context/ToastContext";
import api, { vendorChangePassword } from "../../services/api";

const ProfileSetting = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    category: "Restaurant",
    email: "",
    phone: "",
    fullName: "",
    address: "",
    zip: "",
    city: "",
    state: "",
    deliveryRange: "",
  });

  // ── Fetch vendor from backend ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const user = await backendAuthService.getCurrentUser();
        if (!user) {
          window.location.href = "/vendor-login";
          return;
        }

        const vId = user.vendor_id || user.id;
        setVendorId(vId);

        // GET /vendors/{vendor_id}
        const res = await api.get(`/vendors/${vId}`);
        const d = res.data;

        setProfileImage(d.logo_url || "");
        setIsOpen(d.opening_time ? true : false);

        setFormData({
          restaurantName: d.business_name || "",
          category: d.business_category || d.profession || "Restaurant",
          email: d.business_email || d.email || "",
          phone: d.business_phone || d.phone || "",
          fullName:
            d.full_name || `${d.firstname || ""} ${d.lastname || ""}`.trim(),
          address: d.business_address || "",
          zip: "",
          city: d.lga || "",
          state: d.state || "",
          deliveryRange:
            d.day_from && d.day_to ? `${d.day_from} – ${d.day_to}` : "Not Set",
        });
      } catch (e) {
        console.error("ProfileSetting load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Inline field editing ────────────────────────────────────────────────────
  const handleEdit = (field: string, val: string) => {
    setEditingField(field);
    setTempValue(val);
  };
  const handleSave = (field: string) => {
    setFormData((p) => ({ ...p, [field]: tempValue }));
    setEditingField(null);
  };
  const handleCancel = () => {
    setEditingField(null);
    setTempValue("");
  };

  // ── Photo upload — Supabase storage ─────────────────────────────────────────
  // ── Photo upload — FastAPI backend ──────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendorId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File must be under 5MB", "File Too Large");
      return;
    }

    setIsPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `/vendors/upload-asset?vendor_id=${vendorId}&asset_type=store_logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const url = (res.data as { url?: string })?.url;
      if (!url) throw new Error("No URL returned from upload");

      setProfileImage(url);
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  // ── Save all changes ─────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!vendorId) return;
    setIsSaving(true);
    try {
      await api.patch(`/vendors/${vendorId}`, {
        business_name: formData.restaurantName,
        full_name: formData.fullName,
        business_email: formData.email,
        business_phone: formData.phone,
        business_address: formData.address,
        state: formData.state,
        lga: formData.city,
      });
      toast.success("Profile saved successfully!");
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const resetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.warning("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await vendorChangePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      resetPasswordForm();
    } catch (err) {
      console.error("Change password error:", err);
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Editable field component ────────────────────────────────────────────────
  const EditableField = ({
    label,
    field,
    value,
    type = "text",
  }: {
    label: string;
    field: string;
    value: string;
    type?: string;
  }) => (
    <div className="mb-5">
      <label className="text-xs text-gray-500 mb-2 block font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        {editingField === field ? (
          <>
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <button
              onClick={() => handleSave(field)}
              className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-semibold border border-gray-100 min-h-[48px] flex items-center">
              {value || (
                <span className="text-gray-300 font-normal">Not set</span>
              )}
            </div>
            <button
              onClick={() => handleEdit(field, value)}
              className="px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-xs font-medium"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-32">
      <VendorNav />

      {/* Header */}
      <div className="bg-white text-gray-900 px-6 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Profile Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Restaurant Status
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isOpen ? "Currently open for orders" : "Currently closed"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isOpen ? "bg-emerald-600" : "bg-gray-300"}`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${isOpen ? "left-9" : "left-1"}`}
            />
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-sm relative"
              >
                {isPhotoLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Name preview */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">
                {formData.restaurantName || "Restaurant Name"}
              </h2>
              <p className="text-emerald-600 font-medium text-sm">
                {formData.category}
              </p>
              <p className="text-gray-400 text-sm mt-1">{formData.email}</p>
              <p className="text-gray-500 text-sm font-medium">
                {formData.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">
            Personal Information
          </h3>
          <EditableField
            label="Full Name"
            field="fullName"
            value={formData.fullName}
          />
          <EditableField
            label="Business Name"
            field="restaurantName"
            value={formData.restaurantName}
          />
          <EditableField
            label="Email"
            field="email"
            value={formData.email}
            type="email"
          />
          <EditableField
            label="Phone"
            field="phone"
            value={formData.phone}
            type="tel"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Address
          </h3>

          {editingField === "address" ? (
            <div className="mb-4">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSave("address")}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleEdit("address", formData.address)}
              className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-700 mb-4 min-h-[48px]"
            >
              {formData.address || (
                <span className="text-gray-300">Click to add address</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Zip", key: "zip" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block font-medium">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={formData[f.key as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delivery range */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Delivery Range
              </h3>
              <p className="text-sm text-gray-400">{formData.deliveryRange}</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden h-56 bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126182.48419177555!2d7.314454!3d9.073676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0a5e32c9a903%3A0x9c9b57a5e7c0f5d6!2sAbuja%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1234567890"
            />
          </div>
        </div>
        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Security
          </h3>
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Change Password
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => {
            setShowChangePassword(false);
            resetPasswordForm();
          }}
        >
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  resetPasswordForm();
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
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-5 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
