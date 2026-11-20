import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { DashboardReport } from "../../model/DashboardReport";
import { DashboardReportService } from "../../services/DashboardReportService";
import {
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiArrowDown,
  FiArrowRight,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import {
  LuTrendingUp,
  LuTrendingDown,
  LuCalendar,
  LuHandCoins,
} from "react-icons/lu";
import { FaKey, FaArrowRight as FaArrowRightSolid } from "react-icons/fa6";
import { FaWallet } from "react-icons/fa";
import { HiCheckCircle, HiInformationCircle } from "react-icons/hi2";
import { IoTime, IoReceiptOutline, IoWarningOutline } from "react-icons/io5";

const getTodayDateStr = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  selectedMonth: 10,
  selectedYear: 2026,
  monthlyIncome: 0,
  profite: 0,
  profitStatus: "",
  todayRevenueDollar: 0,
  todayRevenueRiel: 0,
};

export default function Financial() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardReport>(emptyDashboard);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async (dateStr: string) => {
        setIsLoading(true);
        try {
        const [yearStr, monthStr] = dateStr.split("-");
        const res = await DashboardReportService.getReportAll(
            parseInt(yearStr, 10),
            parseInt(monthStr, 10),
        );
        const report = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        if (report && typeof report === "object") {
            setData(report);
        }
        } catch (err) {
        console.error("Failed to fetch financial report:", err);
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate, fetchData]);

    const changeMonth = (offset: number) => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        const date = new Date(y, m - 1 + offset, d || 1);
        const newY = date.getFullYear();
        const newM = String(date.getMonth() + 1).padStart(2, "0");
        const newD = String(date.getDate()).padStart(2, "0");
        setSelectedDate(`${newY}-${newM}-${newD}`);
    };

    const handleThisMonth = () => {
        setSelectedDate(getTodayDateStr());
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${month}/${day}/${year}`;
    };

    const getMonthName = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    };

    const formatUSD = (val: number) => {
        const isNegative = (val || 0) < 0;
        const formatted = Math.abs(val || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        });
        return isNegative ? `-$${formatted}` : `$${formatted}`;
    };

    const formatKHR = (val: number) => {
        return `៛${Number(val || 0).toLocaleString("en-US")}`;
    };

    // ── Robust Calculations for Room Status (supports all backend naming conventions) ──
    const available = Number(
        (data as any).avalibaleRoom ??
        (data as any).AvalibaleRoom ??
        (data as any).availableRoom ??
        (data as any).AvailableRoom ??
        0,
    );
    const occupied = Number(
        (data as any).occupiedRoom ?? (data as any).OccupiedRoom ?? 0,
    );
    const reserved = Number(
        (data as any).reserved ?? (data as any).Reserved ?? 0,
    );
    const rawTotal = Number(
        (data as any).totalRoom ?? (data as any).TotalRoom ?? 0,
    );

    // Dynamic Effective Total: uses rawTotal if valid, or sum of current room categories
    const sumOfRooms = available + occupied + reserved;
    const effectiveTotal =
        rawTotal > 0 ? rawTotal : sumOfRooms > 0 ? sumOfRooms : 1;

    // Percentage calculation: returns 0 - 100% proportionally according to the room count
    const getPct = (count: number) => {
        if (effectiveTotal <= 0) return 0;
        return Math.min(
        100,
        Math.max(0, Math.round(((count || 0) / effectiveTotal) * 100)),
        );
    };

    // Profit / Loss status calculations
    const profitVal = Number((data as any).profite ?? (data as any).Profite ?? 0);
    const profitStatusText = String(
        (data as any).profitStatus ?? (data as any).ProfitStatus ?? "",
    );
    const isLoss = profitVal < 0 || profitStatusText.toLowerCase().includes("loss");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
            {/* ── LEFT CARD: Room Status Overview ─────────────────────────────── */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        <span className="text-xl">Room Status Overview</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Real-time room occupancy and housekeeping distribution
                    </p>
                    </div>
                    <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fetchData(selectedDate)}
                        title="Refresh room status"
                        disabled={isLoading}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <FiRefreshCw
                        className={`text-xs ${isLoading ? "animate-spin text-indigo-600" : ""}`}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/room")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:gap-2 transition-all cursor-pointer py-1 px-2.5 rounded-lg hover:bg-indigo-50"
                    >
                        <span>View All</span>
                        <FaArrowRightSolid className="text-[10px]" />
                    </button>
                    </div>
                </div>

                {/* Progress Items with Dynamic Color Bars */}
                <div className="mt-8 space-y-6">
                    {/* Available */}
                    <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 block">
                            Available
                            </span>
                            <span className="text-[11px] text-slate-400">
                            Ready for check-in
                            </span>
                        </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">
                            {available} Rooms
                        </span>
                        <span className="text-slate-400 text-xs font-medium">
                            ({getPct(available)}%)
                        </span>
                        </div>
                    </div>
                    {/* Progress bar: width rises according to available count */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${getPct(available)}%`,
                            minWidth: available > 0 ? "6px" : "0px",
                        }}
                        />
                    </div>
                    </div>

                    {/* Occupied */}
                    <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                            <FaKey />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 block">
                            Occupied
                            </span>
                            <span className="text-[11px] text-slate-400">
                            Currently in-house
                            </span>
                        </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">
                            {occupied} Rooms
                        </span>
                        <span className="text-slate-400 text-xs font-medium">
                            ({getPct(occupied)}%)
                        </span>
                        </div>
                    </div>
                    {/* Progress bar: width rises according to occupied count */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${getPct(occupied)}%`,
                            minWidth: occupied > 0 ? "6px" : "0px",
                        }}
                        />
                    </div>
                    </div>

                    {/* Reserved */}
                    <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                            <IoTime />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 block">
                            Reserved
                            </span>
                            <span className="text-[11px] text-slate-400">
                            Upcoming arrivals
                            </span>
                        </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">
                            {reserved} Rooms
                        </span>
                        <span className="text-slate-400 text-xs font-medium">
                            ({getPct(reserved)}%)
                        </span>
                        </div>
                    </div>
                    {/* Progress bar: width rises according to reserved count */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${getPct(reserved)}%`,
                            minWidth: reserved > 0 ? "6px" : "0px",
                        }}
                        />
                    </div>
                    </div>
                </div>
                </div>

                {/* Bottom Banner */}
                <div className="mt-8 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <HiInformationCircle className="text-indigo-600 text-base shrink-0" />
                    <span>Rooms auto-update upon booking or check-in.</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0 ml-2">
                    {rawTotal > 0 ? rawTotal : effectiveTotal} Total Rooms
                </span>
                </div>
            </div>

            {/* ── RIGHT CARD: Financial Overview ────────────────────────────── */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                <div>
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                    <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="text-xl">Financial Overview</span>
                        {isLoading && (
                        <FiLoader className="text-indigo-600 text-base animate-spin" />
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Report for{" "}
                        <span className="text-indigo-600 font-semibold">
                        {getMonthName(selectedDate)}
                        </span>
                    </p>
                    </div>

                    {/* Date Navigator Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        disabled={isLoading}
                        title="Previous Month"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                        <FiChevronLeft className="text-sm" />
                    </button>

                    {/* Date Input Button */}
                    <div
                        onClick={() =>
                        dateInputRef.current?.showPicker?.() ||
                        dateInputRef.current?.focus()
                        }
                        className="relative flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
                        title="Click to select custom date"
                    >
                        <LuCalendar className="text-indigo-600 text-sm shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 select-none">
                        {formatDisplayDate(selectedDate)}
                        </span>

                        <input
                        ref={dateInputRef}
                        type="date"
                        value={selectedDate}
                        onChange={(e) =>
                            e.target.value && setSelectedDate(e.target.value)
                        }
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        disabled={isLoading}
                        title="Next Month"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                        <FiChevronRight className="text-sm" />
                    </button>

                    <button
                        type="button"
                        onClick={handleThisMonth}
                        disabled={isLoading}
                        className="ml-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        This Month
                    </button>
                    </div>
                </div>

                {/* 4 Financial Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Card 1: Today Revenue */}
                    <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
                    <div>
                        <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-emerald-800">
                            Today Revenue
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shadow-2xs">
                            <FiDollarSign />
                        </div>
                        </div>
                        <div className="mt-3 text-2xl font-extrabold text-slate-800 tracking-tight">
                        {formatUSD(
                            Number(
                            (data as any).todayRevenueDollar ??
                                (data as any).TodayRevenueDollar ??
                                0,
                            ),
                        )}
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-xs font-semibold text-emerald-700">
                        <div className="flex items-center gap-1.5">
                        <LuTrendingUp className="text-sm stroke-[2.5]" />
                        <span>Daily Sales</span>
                        </div>
                        {Number(
                        (data as any).todayRevenueRiel ??
                            (data as any).TodayRevenueRiel ??
                            0,
                        ) > 0 && (
                        <span className="font-bold text-emerald-800 text-[11px]">
                            {formatKHR(
                            Number(
                                (data as any).todayRevenueRiel ??
                                (data as any).TodayRevenueRiel,
                            ),
                            )}
                        </span>
                        )}
                    </div>
                    </div>

                    {/* Card 2: Monthly Income */}
                    <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/40 border border-blue-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
                    <div>
                        <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-blue-800">
                            Monthly Income
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs shadow-2xs">
                            <FaWallet />
                        </div>
                        </div>
                        <div className="mt-3 text-2xl font-extrabold text-slate-800 tracking-tight">
                        {formatUSD(
                            Number(
                            (data as any).monthlyIncome ??
                                (data as any).MonthlyIncome ??
                                0,
                            ),
                        )}
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-blue-200/50 flex items-center justify-between text-xs font-semibold text-blue-700">
                        <div className="flex items-center gap-1.5">
                        <LuHandCoins className="text-sm" />
                        <span>Total Inflow</span>
                        </div>
                        <span className="font-medium text-blue-600 text-[11px]">
                        Bookings
                        </span>
                    </div>
                    </div>

                    {/* Card 3: Monthly Expenses */}
                    <div className="bg-gradient-to-br from-rose-50/80 to-rose-100/40 border border-rose-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200">
                    <div>
                        <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-rose-800">
                            Monthly Expenses
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs shadow-2xs">
                            <IoReceiptOutline />
                        </div>
                        </div>
                        <div className="mt-3 text-2xl font-extrabold text-slate-800 tracking-tight">
                        {formatUSD(
                            Number(
                            (data as any).totalExpent ??
                                (data as any).TotalExpent ??
                                0,
                            ),
                        )}
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-rose-200/50 flex items-center justify-between text-xs font-semibold text-rose-700">
                        <div className="flex items-center gap-1">
                        <LuTrendingDown className="text-sm stroke-[2.5]" />
                        <span>Total Spent</span>
                        </div>
                        <span className="font-medium text-rose-600 text-[11px]">
                        Operations
                        </span>
                    </div>
                    </div>

                    {/* Card 4: Monthly Profit / Loss (Dynamic Theme) */}
                    <div
                    className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200 ${
                        isLoss
                        ? "bg-gradient-to-br from-amber-50/70 to-rose-100/50 border-rose-200/80"
                        : "bg-gradient-to-br from-teal-50/70 to-emerald-100/50 border-emerald-200/80"
                    }`}
                    >
                    <div>
                        <div className="flex items-start justify-between">
                        <span
                            className={`text-xs font-semibold ${
                            isLoss ? "text-rose-800" : "text-emerald-800"
                            }`}
                        >
                            Monthly Profit
                        </span>
                        <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-2xs ${
                            isLoss
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                            {isLoss ? <IoWarningOutline /> : <LuTrendingUp />}
                        </div>
                        </div>
                        <div
                        className={`mt-3 text-2xl font-extrabold tracking-tight ${
                            isLoss ? "text-rose-800" : "text-emerald-800"
                        }`}
                        >
                        {formatUSD(profitVal)}
                        </div>
                    </div>
                    <div
                        className={`mt-4 pt-2 border-t flex items-center justify-between text-xs font-semibold ${
                        isLoss ? "border-rose-200/60" : "border-emerald-200/60"
                        }`}
                    >
                        <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            isLoss
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                        >
                        {isLoss ? (
                            <FiArrowDown className="text-xs stroke-[3]" />
                        ) : (
                            <LuTrendingUp className="text-xs stroke-[2.5]" />
                        )}
                        <span>
                            {profitStatusText || (isLoss ? "Deficit" : "Profitable")}
                        </span>
                        </div>
                        <span className="font-medium text-slate-500 text-[11px]">
                        Net Margin
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Currency: USD ($) &amp; KHR (៛)</span>
                <button
                    type="button"
                    onClick={() => navigate("/salary")}
                    className="flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                >
                    <span>Staff Salaries</span>
                    <FiArrowRight className="text-xs" />
                </button>
                </div>
            </div>
        </div>
    );
}
