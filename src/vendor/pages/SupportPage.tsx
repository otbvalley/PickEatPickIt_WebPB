import React, { useState, useEffect } from "react";
import { Mail, MessageCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { VendorNav } from "../component/VendorNav";

const SupportPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNav />
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20">
            <button className="text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div
          className={`mb-8 sm:mb-12 transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">
            Support
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            We're here to help you 24/7
          </p>
        </div>

        {/* Order Issues Card */}
        <div
          className={`mb-8 sm:mb-12 transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Order Issues
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  Report anything wrong with an order
                </p>
              </div>
              <div className="ml-4 sm:ml-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-amber-50 rounded-full flex items-center justify-center">
                  <AlertCircle
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-amber-500"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div
          className={`transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:p-10">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              PickItPickEat Support
            </h2>
            <p className="text-gray-500 mb-8 sm:mb-10 text-sm sm:text-base">
              Chat with PickItPickEat Customer care support
            </p>

            {/* Support Options */}
            <div className="space-y-4 sm:space-y-6">
              {/* Email Support */}
              <div className="group">
                <a
                  href="mailto:Support@PickItPickEat.com"
                  className="flex items-center p-5 sm:p-6 lg:p-7 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-gray-100"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="ml-4 sm:ml-6 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Email PickItPickEat Support
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm sm:text-base">
                      Support@PickItPickEat.com
                    </p>
                  </div>
                  <div className="ml-2 text-emerald-600">
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
                  </div>
                </a>
              </div>

              {/* WhatsApp Support */}
              <div className="group">
                <a
                  href="https://wa.me/2349012345678"
                  className="flex items-center p-5 sm:p-6 lg:p-7 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-gray-100"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="ml-4 sm:ml-6 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Chat PickItPickEat Support on Whatsapp
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm sm:text-base">
                      +234 901 2345 678
                    </p>
                  </div>
                  <div className="ml-2 text-emerald-600">
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
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Help Text */}
        <div
          className={`mt-8 sm:mt-12 text-center transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-gray-400 text-xs sm:text-sm">
            Need immediate assistance? Our team responds within minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
