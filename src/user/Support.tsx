// import React from 'react'

import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { Navbar } from "../component/Navbar";
import { Link } from "react-router-dom";
interface supo {
  icon: React.ReactNode;
  text1: string;
  text2: string;
}

const Support: React.FC = () => {
  const supo: supo[] = [
    {
      icon: <Mail className="w-5 h-5 text-gray-600" />,
      text1: "Email Our Support",
      text2: "Support@pickeatpickit.com",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      text1: "Chat PickItPickEat Support on Whatsapp",
      text2: "+234 901 2345 678",
    },
  ];
  return (
    <>
      {/* container */}
      <div className="min-h-screen bg-gray-50 px-6 py-4">
        <Navbar />
        <div className="px-0 py-4">
          <Link to="/profile"></Link>
          <button className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
        </div>
        <p className="text-base font-semibold text-gray-900 mt-3">
          Support
        </p>
        <p className="text-sm font-medium text-gray-600 mt-8">
          PickEat PickIt Support
        </p>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Chat with PickEat PickIt Customer care support
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {supo.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              {item.icon}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.text1}
                </p>
                <p className="text-sm text-emerald-600">
                  {item.text2}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* container */}
    </>
  );
};
export default Support;
