import React, { useState, useEffect } from "react";
import { Smartphone, ShieldCheck } from "lucide-react";
import { Navbar } from "../../component/Navbar";
import api from "../../services/api";

interface DeviceItem {
  id: string;
  device_name: string;
  last_active: string;
  is_active: boolean;
}

const Device: React.FC = () => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/sessions");
        const data = res.data as DeviceItem[];
        setDevices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 5) return "NOW";
    return date.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-medium text-gray-500">
        Syncing sessions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-base font-semibold text-gray-900 mb-6">
          Devices &amp; Sessions
        </h1>

        <div className="space-y-3">
          {devices.length > 0 ? (
            devices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                      device.is_active ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <Smartphone size={22} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {device.device_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Last active:{" "}
                      <span className="text-gray-700">
                        {formatLastSeen(device.last_active)}
                      </span>
                    </p>
                  </div>

                  {device.is_active && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <ShieldCheck size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm text-gray-500">No session history found.</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-100 flex gap-4 items-center">
          <ShieldCheck size={28} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm">
            Don't recognize a device? Log out of all other sessions in your
            account settings immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Device;
