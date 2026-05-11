import React from "react";
import { ArrowLeft, FileText, UserCheck, ShieldAlert, CreditCard, Scale, AlertCircle, Ban, Gavel, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] -left-[10%] w-[30%] h-[30%] bg-green-500/5 blur-[100px] rounded-full" />
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
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                      Terms of <span className="text-gray-500">Service</span>
                    </h1>
                  </div>
                </div>
                <p className="text-gray-400 font-medium max-w-xl text-lg leading-relaxed">
                  The rules and agreements for using the PickEat PickIT platform.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Legal Framework</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  Last Updated: May 9, 2026
                </p>
              </div>
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 text-left">
              <AlertCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-300 leading-relaxed italic">
                <strong className="text-white uppercase tracking-wider block mb-1">Important Notice:</strong>
                Please read these Terms of Service carefully before using the PickEat PickIT platform. By using our services, you agree to be bound by these terms.
              </p>
            </div>
          </header>

          <div className="space-y-24 pb-32">
            {/* 1. Eligibility */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">01</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                1. Eligibility
              </h2>
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                <ul className="grid md:grid-cols-2 gap-4">
                  {[
                    "At least 18 years of age",
                    "Legal capacity to contract",
                    "No previous bans or suspensions",
                    "Valid account representation"
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2. User Roles */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">02</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                2. User Roles & Responsibilities
              </h2>
              <div className="grid gap-8">
                {/* Customers */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    2.1 Customer Users
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {[
                      "Provide accurate account/order info",
                      "Pay all due amounts including fees",
                      "Treat vendors/riders with respect",
                      "Review orders promptly on delivery",
                      "No fraudulent or malicious orders",
                      "Maintain account security",
                      "Lawful platform usage only"
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-gray-500 flex items-start gap-3">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-700 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vendors */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                    2.2 Vendor Users
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      "Maintain all required licenses & permits",
                      "Prepare food per safety regulations",
                      "Accept/Reject orders within 15 mins",
                      "Accurate menu info and pricing",
                      "Safe & clean preparation environment",
                      "No price gouging or deceptive pricing",
                      "Coordinate smoothly with riders"
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-gray-500 flex items-start gap-3">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-gray-700 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Riders */}
                <div className="bg-green-500/5 border border-green-500/10 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    2.3 Rider Users
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      "Valid license, registration & insurance",
                      "Accept requests only if able to finish",
                      "Vehicle in safe operating condition",
                      "Follow all traffic laws & safety rules",
                      "Professional conduct with all parties",
                      "Careful handling of food items",
                      "No tampering or consumption of orders",
                      "No subcontracting to third parties"
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-green-500/50 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Order & Delivery */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">03</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                3. Order & Delivery
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold uppercase mb-4 text-white">Cancellation Policy</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <span className="block text-[10px] font-black uppercase text-green-500 mb-1">Pre-Acceptance</span>
                      <p className="text-sm font-bold">100% Refund</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <span className="block text-[10px] font-black uppercase text-yellow-500 mb-1">Post-Acceptance</span>
                      <p className="text-sm font-bold">50% Refund</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <span className="block text-[10px] font-black uppercase text-red-500 mb-1">Post-Pickup</span>
                      <p className="text-sm font-bold">No Refund</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold uppercase mb-4 text-white">Failed Deliveries</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    If delivery fails due to customer unavailability or incorrect address, no refund will be issued and redelivery fees may apply.
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    If failure is due to vendor/rider error, a full refund will be provided.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Payment Terms */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">04</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                4. Payment & Payouts
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Customers",
                    icon: <CreditCard className="w-5 h-5" />,
                    text: "Full payment at checkout via Cards, Bank Transfer, or Wallet. Prices subject to change."
                  },
                  {
                    title: "Vendors",
                    icon: <Scale className="w-5 h-5" />,
                    text: "Weekly payouts (Mondays). ₦5,000 threshold. 20% commission applies."
                  },
                  {
                    title: "Riders",
                    icon: <Gavel className="w-5 h-5" />,
                    text: "Weekly payouts (Mondays). ₦3,000 threshold. 15% commission applies."
                  }
                ].map((item) => (
                  <div key={item.title} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-gray-400">
                      {item.icon}
                    </div>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Prohibited Conduct */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">05</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                5. Prohibited Conduct
              </h2>
              <div className="bg-red-500/[0.02] border border-red-500/10 p-8 rounded-3xl">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Fraud, deception or misrepresentation",
                    "Harassment or abuse of users/staff",
                    "Bypassing platform security",
                    "Reverse engineering or hacking apps",
                    "Sharing account credentials",
                    "Off-platform cash transactions",
                    "Listing unavailable items",
                    "Carrying unauthorized packages/passengers"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-500 text-sm">
                      <Ban className="w-3.5 h-3.5 text-red-500/50" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Liability */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">07</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                7. Limitation of Liability
              </h2>
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-6">
                <p className="text-sm text-gray-400 leading-relaxed font-bold uppercase tracking-wide">
                  To the fullest extent permitted by law:
                </p>
                <ul className="space-y-4">
                  {[
                    "We are not liable for indirect, incidental, or punitive damages.",
                    "Total aggregate liability shall not exceed payments made in the prior 12 months.",
                    "Vendors are solely responsible for food quality and safety.",
                    "We are not liable for accidents, natural disasters, or third-party failures."
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-gray-500 flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 9. Dispute Resolution */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-white/5 font-black text-6xl select-none hidden xl:block">09</div>
              <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                9. Dispute Resolution
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold uppercase mb-4 text-white">Informal Resolution</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Before formal action, you must contact us at <span className="text-white font-bold underline">disputes@pickeatpickit.com</span> and allow 30 days for resolution.
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold uppercase mb-4 text-white">Governing Law</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    These terms are governed by the laws of the <span className="text-white font-bold">Federal Republic of Nigeria</span>. Disputes are settled in the courts of Lagos State.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Contact */}
            <section className="bg-white/5 border border-white/10 p-12 rounded-[40px] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <HelpCircle className="w-32 h-32" />
              </div>
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Need Legal Help?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                For questions regarding these terms or any legal inquiries, please contact our legal department.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <a 
                  href="mailto:legal@pickeatpickit.com" 
                  className="inline-block bg-white text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                  Contact Legal
                </a>
                <div className="text-left">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Legal Office</span>
                  <p className="text-sm font-bold text-gray-300">Lagos, Nigeria</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

