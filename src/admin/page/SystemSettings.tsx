/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Settings,
  Tag,
  Filter as FilterIcon,
  Save,
  X,
} from "lucide-react";
import api from "../../services/api";
import type { SystemSetting, PromoCode, Filter } from "../../services/api";

type TabType = "settings" | "promos" | "filters";

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Data States
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

  // Modal States
  const [showModal, setShowModal] = useState<"setting" | "promo" | "filter" | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, fRes] = await Promise.allSettled([
        api.get("/system/settings"),
        api.get("/system/promo-codes"),
        api.get("/system/filters"),
      ]);

      if (sRes.status === "fulfilled") setSettings(sRes.value.data || []);
      if (pRes.status === "fulfilled") setPromos(pRes.value.data || []);
      if (fRes.status === "fulfilled") setFilters(fRes.value.data || []);
    } catch (err) {
      console.error("Failed to fetch system data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDelete = async (type: TabType, id: string) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    setActionLoading(id);
    try {
      if (type === "settings") await api.delete(`/system/settings/${id}`);
      else if (type === "promos") await api.delete(`/system/promo-codes/${id}`);
      else if (type === "filters") await api.delete(`/system/filters/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = showModal;
    if (!type) return;
    setActionLoading("saving");
    try {
      if (type === "setting") {
        if (editItem.id || editItem.key_exists) await api.put(`/system/settings/${editItem.key}`, editItem);
        else await api.post("/system/settings", editItem);
      } else if (type === "promo") {
        if (editItem.id) await api.put(`/system/promo-codes/${editItem.id}`, editItem);
        else await api.post("/system/promo-codes", editItem);
      } else if (type === "filter") {
        if (editItem.id) await api.put(`/system/filters/${editItem.id}`, editItem);
        else await api.post("/system/filters", editItem);
      }
      setShowModal(null);
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render Helpers ──────────────────────────────────────────────────────────
  const renderHeader = () => (
    <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-white/20 rounded-xl transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-tighter uppercase">System Configuration</h1>
      </div>
      <button
        onClick={() => {
          setEditItem({});
          setShowModal(activeTab === "settings" ? "setting" : activeTab === "promos" ? "promo" : "filter");
        }}
        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
      >
        <Plus size={20} />
        Add New
      </button>
    </div>
  );

  const renderTabs = () => (
    <div className="flex gap-2 p-4 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
      {[
        { id: "settings", label: "General", icon: <Settings size={16} /> },
        { id: "promos", label: "Promo Codes", icon: <Tag size={16} /> },
        { id: "filters", label: "Category Filters", icon: <FilterIcon size={16} /> },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-green-600 text-white shadow-lg"
              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {renderHeader()}
      {renderTabs()}

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid gap-4">
            {settings.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No settings found</p>
            ) : (
              settings.map((s: any) => (
                <div key={s.id || s.key} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center font-black text-green-600 group-hover:rotate-3 transition-transform uppercase">
                      {s.key.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 uppercase tracking-tighter">{s.key}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.description || "No description"}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">Value: {String(s.value)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditItem({ ...s, key_exists: true });
                        setShowModal("setting");
                      }}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-green-600 transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete("settings", s.key)}
                      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Promo Tab */}
        {activeTab === "promos" && (
          <div className="grid gap-4">
            {promos.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No promo codes found</p>
            ) : (
              promos.map((p: any) => (
                <div key={p.id || p.code} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:rotate-3 transition-transform">
                      <Tag size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 uppercase tracking-tighter">{p.code}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `₦${p.discount_value} OFF`}
                      </p>
                      <p className="text-[10px] font-bold text-red-400 mt-1 uppercase">Expires: {new Date(p.expiry_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditItem(p);
                        setShowModal("promo");
                      }}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-green-600 transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete("promos", p.id || p.code)}
                      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Filter Tab */}
        {activeTab === "filters" && (
          <div className="grid gap-4">
            {filters.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No filters found</p>
            ) : (
              filters.map((f: any) => (
                <div key={f.id || f.name} className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 flex items-center justify-between group hover:border-green-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:rotate-3 transition-transform text-xl">
                      {f.icon || <FilterIcon size={24} />}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 uppercase tracking-tighter">{f.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{f.type} • {f.values?.length || 0} values</p>
                      <div className="flex gap-1 mt-1">
                        {f.values?.slice(0, 3).map((v: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[8px] font-bold uppercase">{v}</span>
                        ))}
                        {(f.values?.length || 0) > 3 && <span className="text-[8px] text-gray-300 font-bold">+{(f.values?.length || 0) - 3}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditItem(f);
                        setShowModal("filter");
                      }}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-green-600 transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete("filters", f.id || f.name)}
                      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                {editItem?.id || editItem?.key_exists ? "Edit" : "New"} {showModal}
              </h2>
              <button type="button" onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {showModal === "setting" && (
                <>
                  <input
                    placeholder="Key (e.g. platform_fee)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.key || ""}
                    onChange={(e) => setEditItem({ ...editItem, key: e.target.value })}
                    required
                    disabled={editItem?.key_exists}
                  />
                  <input
                    placeholder="Value"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.value || ""}
                    onChange={(e) => setEditItem({ ...editItem, value: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold h-24 resize-none"
                    value={editItem?.description || ""}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  />
                </>
              )}

              {showModal === "promo" && (
                <>
                  <input
                    placeholder="Promo Code"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.code || ""}
                    onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                      value={editItem?.discount_type || "percentage"}
                      onChange={(e) => setEditItem({ ...editItem, discount_type: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₦)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Value"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                      value={editItem?.discount_value || ""}
                      onChange={(e) => setEditItem({ ...editItem, discount_value: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="date"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.expiry_date ? new Date(editItem.expiry_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditItem({ ...editItem, expiry_date: e.target.value })}
                    required
                  />
                </>
              )}

              {showModal === "filter" && (
                <>
                  <input
                    placeholder="Filter Name (e.g. Cuisine)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.name || ""}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Type (e.g. food_category)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.type || ""}
                    onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Values (comma separated)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.values?.join(", ") || ""}
                    onChange={(e) => setEditItem({ ...editItem, values: e.target.value.split(",").map((v: string) => v.trim()) })}
                    required
                  />
                  <input
                    placeholder="Icon Emoji (e.g. 🍔)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold"
                    value={editItem?.icon || ""}
                    onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })}
                  />
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={actionLoading === "saving"}
              className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {actionLoading === "saving" ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
