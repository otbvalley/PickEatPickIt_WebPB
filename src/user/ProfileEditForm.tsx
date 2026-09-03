import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Check, Edit3, Save, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../component/Navbar";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import {
  getCountries,
  getStates,
  getCities,
  type Country,
  type LocationState,
  type LocationCity,
} from "../services/api";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  state: string;
}

interface EditState {
  fullName: boolean;
  email: boolean;
  phone: boolean;
}

interface ToastMessage {
  message: string;
  type: "success" | "error";
}
interface ApiProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  city?: string;
  state?: string;
}
const ProfileEditForm: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    state: "",
  });

  const [editMode, setEditMode] = useState<EditState>({
    fullName: false,
    email: false,
    phone: false,
  });

  const [tempValues, setTempValues] = useState<PersonalInfo>(personalInfo);
  const [serviceOption, setServiceOption] = useState<string>("direct");
  const [riderInstructions, setRiderInstructions] = useState<string>("");

  // Location pickers (country drives state options, state drives city options)
  const [selectedCountry, setSelectedCountry] = useState<string>("Nigeria");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<LocationState[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const res = await getCountries();
        setCountries((res.data as Country[]) ?? []);
      } catch (error) {
        console.error("Failed to load countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      return;
    }
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const res = await getStates(selectedCountry);
        setStates((res.data as LocationState[]) ?? []);
      } catch (error) {
        console.error("Failed to load states:", error);
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry || !tempValues.state) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const res = await getCities(selectedCountry, tempValues.state);
        setCities((res.data as LocationCity[]) ?? []);
      } catch (error) {
        console.error("Failed to load cities:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, tempValues.state]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Before
        // After
        const profile =
          (await authService.getCurrentUserProfile()) as ApiProfile;
        if (profile) {
          const fullName =
            `${profile.firstname || ""} ${profile.lastname || ""}`.trim();
          const userInfo: PersonalInfo = {
            fullName: fullName,
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            zip: profile.zip || "",
            city: profile.city || "",
            state: profile.state || "",
          };
          setPersonalInfo(userInfo);
          setTempValues(userInfo);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapRef.current.hasChildNodes()) {
      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "0";
      iframe.style.borderRadius = "2rem";
      iframe.loading = "lazy";
      iframe.src =
        "https://www.openstreetmap.org/export/embed.html?bbox=7.2461%2C8.9806%2C7.2861%2C9.0206&layer=mapnik&marker=9.0006,7.2661";
      mapRef.current.appendChild(iframe);
    }
  }, [loading]);

  const handleUpdate = async (field: keyof EditState) => {
    try {
      setSaving(true);
      const [firstName, lastName] = tempValues.fullName.split(" ");
      let updateData: Record<string, string> = {};

      if (field === "fullName") {
        updateData = { firstname: firstName || "", lastname: lastName || "" };
      } else if (field === "email") {
        updateData = { email: tempValues.email };
      } else if (field === "phone") {
        updateData = { phone: tempValues.phone };
      }

      await authService.updateCurrentUserProfile(updateData);
      setPersonalInfo(tempValues);
      setEditMode({ ...editMode, [field]: false });
      setToastMessage({ message: "Update Successful", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage({ message: "Update Failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 font-inter pb-20">
      <Navbar />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-sm text-white z-[100] font-medium flex items-center gap-3 ${
              toastMessage.type === "success"
                ? "bg-emerald-600"
                : "bg-red-600"
            }`}
          >
            {toastMessage.type === "success" ? (
              <Check className="w-6 h-6" />
            ) : (
              "⚠️"
            )}
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-[80px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">
            Edit Profile
          </h1>
          <div className="w-11" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 w-full bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-12"
            >
              {/* Profile Overview Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                  <h2 className="text-base font-semibold text-gray-900">
                    Identity
                  </h2>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      key: "fullName",
                      label: "Full Name",
                      value: personalInfo.fullName,
                      temp: tempValues.fullName,
                      type: "text",
                    },
                    {
                      key: "email",
                      label: "Email Control",
                      value: personalInfo.email,
                      temp: tempValues.email,
                      type: "email",
                    },
                    {
                      key: "phone",
                      label: "Phone Access",
                      value: personalInfo.phone,
                      temp: tempValues.phone,
                      type: "tel",
                    },
                  ].map((field) => (
                    <motion.div
                      key={field.key}
                      variants={itemVariants}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <label className="text-xs text-gray-500">
                          {field.label}
                        </label>
                        {!editMode[field.key as keyof EditState] ? (
                          <button
                            onClick={() =>
                              setEditMode({ ...editMode, [field.key]: true })
                            }
                            className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdate(field.key as keyof EditState)
                            }
                            disabled={saving}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                          >
                            {saving ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {saving ? "Saving" : "Save"}
                          </button>
                        )}
                      </div>

                      {editMode[field.key as keyof EditState] ? (
                        <input
                          type={field.type}
                          value={field.temp}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [field.key]: e.target.value,
                            })
                          }
                          className="w-full text-lg font-medium bg-transparent text-emerald-600 outline-none border-b-2 border-emerald-600/20 focus:border-emerald-600 transition-colors"
                          autoFocus
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-800 leading-tight">
                          {field.value}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Geographic Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                  <h2 className="text-base font-semibold text-gray-900">
                    Geography
                  </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">
                      Tactical Address
                    </label>
                    <input
                      type="text"
                      value={tempValues.address}
                      onChange={(e) =>
                        setTempValues({
                          ...tempValues,
                          address: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Country</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setTempValues({
                            ...tempValues,
                            state: "",
                            city: "",
                          });
                        }}
                        disabled={loadingCountries}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                      >
                        {countries.length === 0 && (
                          <option value={selectedCountry}>
                            {selectedCountry}
                          </option>
                        )}
                        {countries.map((country) => (
                          <option key={country.id} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">State</label>
                      <select
                        value={tempValues.state}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            state: e.target.value,
                            city: "",
                          })
                        }
                        disabled={loadingStates || states.length === 0}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                      >
                        <option value="">
                          {loadingStates ? "Loading states…" : "Select state"}
                        </option>
                        {states.map((state) => (
                          <option key={state.id} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">City</label>
                      <select
                        value={tempValues.city}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            city: e.target.value,
                          })
                        }
                        disabled={loadingCities || cities.length === 0}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                      >
                        <option value="">
                          {loadingCities ? "Loading cities…" : "Select city"}
                        </option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Zip</label>
                      <input
                        type="text"
                        value={tempValues.zip}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            zip: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="relative h-72 rounded-2xl overflow-hidden border border-gray-100 group">
                    <div ref={mapRef} className="w-full h-full" />
                    <button className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-emerald-600">
                      <Compass className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Operational Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                  <h2 className="text-base font-semibold text-gray-900">
                    Operations
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { id: "direct", label: "Hand it to me Directly" },
                    { id: "available", label: "Hand to who is available" },
                    { id: "door", label: "Tactical drop at my door" },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setServiceOption(opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                        serviceOption === opt.id
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-medium text-sm ${serviceOption === opt.id ? "text-emerald-700" : "text-gray-600"}`}
                      >
                        {opt.label}
                      </span>
                      {serviceOption === opt.id && (
                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">
                    Directives for Operatives
                  </label>
                  <textarea
                    value={riderInstructions}
                    onChange={(e) => setRiderInstructions(e.target.value)}
                    placeholder="Enter deployment notes..."
                    className="w-full h-32 bg-white p-4 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm resize-none"
                  />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileEditForm;
