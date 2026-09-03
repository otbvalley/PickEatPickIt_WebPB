import React, { useState, useEffect } from "react";
import { ArrowLeft, Smartphone, Monitor, Clock } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

interface Device {
  id: number;
  name: string;
  lastSeen: string;
  isActive: boolean;
  icon: "smartphone" | "tablet";
}

const DevicesAndSessions: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null);

  const devices: Device[] = [
    {
      id: 1,
      name: "iPhone XS Max",
      lastSeen: "NOW",
      isActive: true,
      icon: "smartphone",
    },
    {
      id: 2,
      name: "Samsung S20",
      lastSeen: "Yesterday, 5:20pm",
      isActive: false,
      icon: "smartphone",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <VendorNav />
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20">
            <button className="text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div
          className={`mb-8 sm:mb-10 transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
            Devices and Sessions
          </h1>
          <p className="text-gray-500 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Manage your active sessions and devices
          </p>
        </div>

        {/* Devices List */}
        <div className="space-y-4 sm:space-y-5">
          {devices.map((device, index) => (
            <div
              key={device.id}
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              onMouseEnter={() => setHoveredDevice(device.id)}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div
                className={`bg-white rounded-2xl shadow-sm transition-shadow overflow-hidden border ${
                  device.isActive ? "border-emerald-100" : "border-gray-100"
                } ${hoveredDevice === device.id ? "shadow-md" : ""}`}
              >
                <div className="p-5 sm:p-6 lg:p-8 flex items-center gap-4 sm:gap-6">
                  {/* Device Icon */}
                  <div className="relative">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                        device.isActive ? "bg-emerald-600" : "bg-gray-400"
                      }`}
                    >
                      <Smartphone
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Status Indicator */}
                    {device.isActive && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Last seen -
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          device.isActive ? "text-emerald-600" : "text-gray-700"
                        }`}
                      >
                        {device.lastSeen}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        device.isActive
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div
          className={`mt-8 sm:mt-12 transform transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-blue-50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-blue-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Security Tip
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  If you see a device you don't recognize, secure your account
                  immediately by changing your password and logging out of all
                  sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div
          className={`mt-8 sm:mt-12 grid grid-cols-2 gap-4 sm:gap-6 transform transition-all duration-700 delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="text-3xl sm:text-4xl font-semibold text-emerald-600 mb-2">
              {devices.filter((d) => d.isActive).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Active Session
              {devices.filter((d) => d.isActive).length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="text-3xl sm:text-4xl font-semibold text-gray-700 mb-2">
              {devices.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Total Device{devices.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesAndSessions;
