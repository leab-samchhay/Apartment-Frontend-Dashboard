import { useNavigate } from "react-router-dom";
import InfoRoom from "./dashboardReport/InfoRoom";
import Financial from "./dashboardReport/Financial";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import { FaBed, FaMoneyBillWave, FaCalendarCheck } from "react-icons/fa";

export const HomePage = () => {
  const navigate = useNavigate();

  // User role from session
  const storedRole = sessionStorage.getItem("role") || "Admin";
  const displayRole = storedRole.replace(/["[\]]/g, "") || "Admin";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* ── 1. Hero Welcome Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Property Status</span>
              <span className="text-white/40">•</span>
              <span>{currentDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-white">
                {displayRole}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your rooms, guest check-ins, revenues, and occupancy in real
              time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/bookingTransaction")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>New Booking</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/room")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
            >
              <FaBed className="text-xs text-indigo-300" />
              <span>Manage Rooms</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Real-time Room & Operational Metrics ──────────────────────── */}
      <InfoRoom />

      {/* ── 3. Room Status & Financial Overview ─────────────────────────── */}
      <Financial />

      {/* ── 4. Quick Navigation Shortcuts ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => navigate("/bookingTransaction")}
          className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
              <FaCalendarCheck />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Bookings Management
              </h4>
              <p className="text-xs text-slate-400">
                View and create guest reservations
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate("/room")}
          className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
              <FaBed />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Room Inventory
              </h4>
              <p className="text-xs text-slate-400">
                Configure rooms, pricing and types
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => navigate("/salary")}
          className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
              <FaMoneyBillWave />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                Staff Payroll & Salaries
              </h4>
              <p className="text-xs text-slate-400">
                Track monthly compensations
              </p>
            </div>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
