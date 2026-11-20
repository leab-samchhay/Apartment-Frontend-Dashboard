import { useEffect, useState, useCallback } from "react";
import type { DashboardReport } from "../../model/DashboardReport";
import { DashboardReportService } from "../../services/DashboardReportService";
import { FaBuilding, FaKey } from "react-icons/fa";
import { RiHotelBedFill } from "react-icons/ri";
import { PiBedFill } from "react-icons/pi";
import { IoPerson } from "react-icons/io5";
import { FaCalendarCheck } from "react-icons/fa6";
import { TbLogin } from "react-icons/tb";
import { MdPendingActions } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

const emptyDashboard: DashboardReport = {
  totalRoom: 0,
  avalibaleRoom: 0,
  occupiedRoom: 0,
  totalGuest: 0,
  totalBooking: 0,
  todayCheckIn: 0,
  todayCheckOut: 0,
  pendingBooking: 0,
  reserved: 0,
  totalExpent: 0,
  selectedMonth: 0,
  selectedYear: 0,
  monthlyIncome: 0,
  profite: 0,
  profitStatus: "",
  todayRevenueDollar: 0,
  todayRevenueRiel: 0,
};

interface InfoRoomProps {
  onRefresh?: () => void;
}

const InfoRoom = ({ onRefresh }: InfoRoomProps) => {
  const [data, setData] = useState<DashboardReport>(emptyDashboard);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await DashboardReportService.getReportAll();
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      if (payload && typeof payload === "object") {
        setData(payload);
      }
    } catch (err) {
      console.error("Failed to load room report data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
    if (onRefresh) onRefresh();
  };

  // Safe data extraction supporting PascalCase and camelCase
  const totalRoom = Number(
    (data as any).totalRoom ??
    (data as any).TotalRoom ??
    0
  );
  const availableRoom = Number(
    (data as any).avalibaleRoom ??
    (data as any).AvalibaleRoom ??
    (data as any).availableRoom ??
    (data as any).AvailableRoom ??
    0
  );
  const occupiedRoom = Number(
    (data as any).occupiedRoom ??
    (data as any).OccupiedRoom ??
    0
  );
  const reservedRoom = Number(
    (data as any).reserved ??
    (data as any).Reserved ??
    0
  );
  const totalGuest = Number(
    (data as any).totalGuest ??
    (data as any).TotalGuest ??
    0
  );
  const totalBooking = Number(
    (data as any).totalBooking ??
    (data as any).TotalBooking ??
    0
  );
  const todayCheckIn = Number(
    (data as any).todayCheckIn ??
    (data as any).TodayCheckIn ??
    0
  );
  const todayCheckOut = Number(
    (data as any).todayCheckOut ??
    (data as any).TodayCheckOut ??
    0
  );
  const pendingBooking = Number(
    (data as any).pendingBooking ??
    (data as any).PendingBooking ??
    0
  );

  return (
    <div className="space-y-4">
      {/* ── Section Title & Refresh Control ───────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Property Overview</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Live Metrics
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key capacity, occupancy status, and daily guest operations
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh property metrics"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`text-xs ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── 1. Room Status Cards (4 Columns) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rooms */}
        <div className="group bg-gradient-to-br from-indigo-50/60 to-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-2xs group-hover:scale-110 transition-transform">
              <FaBuilding />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {totalRoom}
              </span>
              <span className="text-xs font-semibold text-slate-400">Units</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              Full Capacity
            </span>
          </div>
        </div>

        {/* Card 2: Available Rooms */}
        <div className="group bg-gradient-to-br from-emerald-50/60 to-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
              <PiBedFill />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {availableRoom}
              </span>
              <span className="text-xs font-semibold text-slate-400">Ready</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Free to Book
            </span>
          </div>
        </div>

        {/* Card 3: Occupied Rooms */}
        <div className="group bg-gradient-to-br from-blue-50/60 to-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Occupied Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
              <RiHotelBedFill />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {occupiedRoom}
              </span>
              <span className="text-xs font-semibold text-slate-400">In-house</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Checked-in
            </span>
          </div>
        </div>

        {/* Card 4: Reserved Rooms */}
        <div className="group bg-gradient-to-br from-amber-50/60 to-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reserved Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shadow-2xs group-hover:scale-110 transition-transform">
              <FaKey />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {reservedRoom}
              </span>
              <span className="text-xs font-semibold text-slate-400">Booked</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Pre-booked
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Guest Operations & Booking Stats (4 Columns) ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 5: Total Guests */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
              <IoPerson />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Guests</span>
              <span className="text-xl font-extrabold text-slate-800">{totalGuest}</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            Registered
          </span>
        </div>

        {/* Card 6: Total Bookings */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shadow-2xs group-hover:scale-110 transition-transform">
              <FaCalendarCheck />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Bookings</span>
              <span className="text-xl font-extrabold text-slate-800">{totalBooking}</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
            All Time
          </span>
        </div>

        {/* Card 7: Today Check-In & Check-Out */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-3.5 w-full">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <TbLogin />
            </div>
            <div className="flex items-center justify-between w-full pr-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Today Check-in</span>
                <span className="text-lg font-bold text-emerald-700">+{todayCheckIn}</span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Today Check-out</span>
                <span className="text-lg font-bold text-amber-700">-{todayCheckOut}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 8: Pending Bookings */}
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
              <MdPendingActions />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pending</span>
              <span className="text-xl font-extrabold text-slate-800">{pendingBooking}</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            Action Req.
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoRoom;
