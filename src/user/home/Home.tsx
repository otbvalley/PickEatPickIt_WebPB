// import { Link } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import React from "react";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-gray-900 font-bold text-xl hidden sm:block">
              PickIT PickEAT
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 md:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="mb-6">
              <div className="bg-white border border-gray-100 shadow-sm rounded-full px-5 py-2 inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-gray-600 text-sm font-medium">
                  Available 24/7
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-gray-900 leading-tight mb-4">
                <span className="block text-4xl sm:text-5xl md:text-5xl font-bold mb-2">
                  Taking Orders for
                </span>
                <span className="block text-4xl sm:text-5xl md:text-5xl font-bold text-emerald-600">
                  Fast Deliveries
                </span>
              </h1>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl">
                Your favorite meals delivered hot and fresh to your doorstep
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link
                to="/signup"
                className="flex-1 bg-emerald-600 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="flex-1 bg-white text-gray-700 font-semibold py-3.5 px-8 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Login
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md w-full">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  500+
                </p>
                <p className="text-gray-500 text-sm mt-1">Restaurants</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  10k+
                </p>
                <p className="text-gray-500 text-sm mt-1">Happy Users</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  4.8★
                </p>
                <p className="text-gray-500 text-sm mt-1">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&q=80"
                alt="Food"
                className="w-full h-80 md:h-[28rem] object-cover"
              />
            </div>

            {/* Feature Cards */}
            <div className="absolute -left-4 -bottom-6 hidden sm:block">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-base">
                      Fast Delivery
                    </p>
                    <p className="text-gray-500 text-sm">Under 30 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-6 hidden sm:block">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-base">
                      Track Order
                    </p>
                    <p className="text-gray-500 text-sm">Real-time updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
