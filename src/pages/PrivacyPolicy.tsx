import React from "react";
import { ArrowLeft, Shield, Lock, Eye, FileText, MapPin, Trash2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-green-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <button 
          onClick={() => navigate("/")} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-green-500 transition-all mb-16"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
          Back to Base
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-20 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <Shield className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                      Privacy <span className="text-green-500">Policy</span>
                    </h1>
                  </div>
                </div>
                <p className="text-gray-400 font-medium max-w-xl text-lg leading-relaxed">
                  How we handle your data across the PickEat PickIT platform.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/50">Version 1.0</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  Last Updated: May 9, 2026
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-24 pb-32">
            {/* 1. Introduction */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">01</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                1. Introduction
              </h2>
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                <p className="text-gray-400 leading-relaxed mb-6">
                  Welcome to PickEat PickIT. This Privacy Policy applies to all applications under the PickEat PickIT platform, including:
                </p>
                <ul className="grid md:grid-cols-3 gap-4 mb-8">
                  {['Customer App', 'Vendor App', 'Rider App'].map((item) => (
                    <li key={item} className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-bold text-gray-300 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 leading-relaxed">
                  PickEat PickIT ("we", "us", or "our") is operated by PickEat PickIT Technologies. We are committed to protecting your personal information and your right to privacy.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-8">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Email Support</span>
                    <a href="mailto:privacy@pickeatpickit.com" className="text-green-500 hover:text-green-400 font-bold transition-colors">privacy@pickeatpickit.com</a>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Office Location</span>
                    <span className="text-gray-300 font-bold">Lagos, Nigeria</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Data Collected */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">02</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                2. Data Collected by User Role
              </h2>
              
              <div className="grid gap-6">
                {[
                  {
                    role: "Customer Users",
                    icon: <Eye className="w-5 h-5" />,
                    items: [
                      "Personal Identification: Full name, email address, phone number",
                      "Location Data: Delivery address, GPS coordinates (when placing orders)",
                      "Payment Information: Payment card details, billing address, transaction history",
                      "Order Data: Order history, preferences, special instructions, reviews and ratings",
                      "Device Information: Device type, operating system, unique device identifiers",
                      "Communication Data: Chat messages with vendors and riders, support inquiries"
                    ]
                  },
                  {
                    role: "Vendor Users",
                    icon: <FileText className="w-5 h-5" />,
                    items: [
                      "Business Information: Business name, registration number, address, contact details",
                      "Personal Identification: Owner's name, email address, phone number, government-issued ID",
                      "Financial Information: Bank account details, payout information, earnings history",
                      "Menu Data: Menu items, prices, images, descriptions, availability status",
                      "Operational Data: Order history, sales data, customer reviews, availability schedules",
                      "Identity Verification: Proof of business registration, tax documents"
                    ]
                  },
                  {
                    role: "Rider Users",
                    icon: <MapPin className="w-5 h-5" />,
                    items: [
                      "Personal Identification: Full name, email address, phone number, government-issued ID",
                      "Location Data: REAL-TIME GPS LOCATION (continuously tracked during active delivery sessions)",
                      "Identity Verification: Driver's license, vehicle registration, proof of insurance, background check",
                      "Financial Information: Bank account details, payout information, earnings history",
                      "Operational Data: Delivery history, ratings, availability status"
                    ]
                  }
                ].map((group) => (group.role === "Rider Users" ? (
                  <div key={group.role} className="bg-green-500/5 border border-green-500/20 p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500">
                        {group.icon}
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{group.role}</h3>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-4">
                      {group.items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div key={group.role} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
                        {group.icon}
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{group.role}</h3>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-4">
                      {group.items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )))}
              </div>
            </section>

            {/* 3. How Data is Used */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">03</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                3. How Data is Used
              </h2>
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    "Order Fulfillment: Processing and delivering orders",
                    "Payment Processing: Charging and processing payouts",
                    "Customer Support: Responding to inquiries and disputes",
                    "Safety and Security: Verifying identities and fraud prevention",
                    "Service Improvement: Analyzing usage and enhancing experience",
                    "Communication: Sending updates and promotional offers",
                    "Legal Compliance: Meeting regulatory requirements"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-[10px] font-black text-green-500">
                        {i + 1}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Third-Party Services */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">04</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                4. Third-Party Services & SDKs
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Paystack", use: "Payment Processing", link: "https://paystack.com/privacy" },
                  { name: "Google Maps", use: "Mapping & Navigation", link: "https://policies.google.com/privacy" },
                  { name: "Supabase", use: "Backend & Auth", link: "https://supabase.com/privacy" },
                  { name: "Cloudinary", use: "Cloud Storage", link: "https://cloudinary.com/privacy" },
                  { name: "Expo", use: "Notifications", link: "https://expo.io/privacy" }
                ].map((service) => (
                  <div key={service.name} className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-green-500/30 transition-all">
                    <h4 className="text-white font-bold mb-1">{service.name}</h4>
                    <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest font-black">{service.use}</p>
                    <a 
                      href={service.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-green-500 hover:text-green-400 transition-colors"
                    >
                      Privacy Policy <ArrowLeft className="w-3 h-3 rotate-180" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Location Data - Critical Section */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">05</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                5. Location Data
              </h2>
              <div className="space-y-6">
                <div className="bg-green-500/5 border border-green-500/20 p-8 rounded-3xl border-l-4 border-l-green-500">
                  <div className="flex items-center gap-4 mb-4 text-green-500">
                    <Bell className="w-6 h-6 animate-pulse" />
                    <h3 className="text-xl font-bold uppercase">Rider Critical Update</h3>
                  </div>
                  <p className="text-gray-300 font-bold mb-4">
                    IMPORTANT: We collect REAL-TIME PRECISE LOCATION DATA continuously during active delivery sessions.
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This is used for matching requests, real-time tracking for customers, safety, and calculating earnings. 
                    We comply with Google's April 2026 Location Permissions policy requirements by providing clear disclosure.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold uppercase mb-4 text-white">Customer Users</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      We collect location data ONLY when you place an order or set a delivery address. Used solely for delivery connection and fee calculation.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold uppercase mb-4 text-white">Vendor Users</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Location data is used to display your business to nearby customers. Location is not continuously tracked.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Data Retention */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-green-500/10 font-black text-6xl select-none hidden xl:block">06</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-green-500/50"></span>
                6. Retention & Deletion
              </h2>
              <div className="grid md:grid-cols-2 gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                <div>
                  <h3 className="text-lg font-bold uppercase mb-6 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-green-500" />
                    Retention Periods
                  </h3>
                  <div className="space-y-4">
                    {[
                      { t: "Account Data", d: "Active + 180 days after deletion" },
                      { t: "Transaction Data", d: "7 years (Tax & Legal)" },
                      { t: "Rider Location", d: "30 days (Real-time); 1 year (Historical)" },
                      { t: "Chat Messages", d: "1 year (Dispute resolution)" }
                    ].map((row) => (
                      <div key={row.t} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{row.t}</span>
                        <span className="text-gray-300 font-medium">{row.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase mb-6 flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    Data Deletion
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    You have the right to delete your account and personal data at any time.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] font-black uppercase text-gray-500 mb-1">In-App</span>
                      <p className="text-sm font-bold">Profile &gt; Settings &gt; Delete Account</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] font-black uppercase text-gray-500 mb-1">Email</span>
                      <p className="text-sm font-bold">Subject: Account Deletion Request</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Sections Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* 7. User Rights */}
              <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-green-500"></span>
                  7. User Rights (NDPA)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {['Access', 'Correction', 'Deletion', 'Restriction', 'Portability', 'Objection'].map((right) => (
                    <div key={right} className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                      {right}
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-gray-400 leading-relaxed">
                  Under the Nigerian Data Protection Act (NDPA), you have these fundamental rights regarding your data.
                </p>
              </section>

              {/* 8. Security */}
              <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-green-500"></span>
                  8. Security
                </h2>
                <ul className="space-y-3">
                  {['TLS 1.3 Encryption', 'Role-based Access', 'Multi-factor Auth', 'Regular Audits', 'Staff Training'].map((item) => (
                    <li key={item} className="text-sm text-gray-400 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Footer Contact */}
            <section className="bg-green-500/10 border border-green-500/20 p-12 rounded-[40px] text-center">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Questions?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Our privacy team is available to help with any data-related inquiries or requests.
              </p>
              <a 
                href="mailto:privacy@pickeatpickit.com" 
                className="inline-block bg-green-500 text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-green-400 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
              >
                Contact Privacy Team
              </a>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                Response Time: Within 48 Hours
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

