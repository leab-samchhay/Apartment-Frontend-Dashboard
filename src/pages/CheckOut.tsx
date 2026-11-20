import React, { useState, useEffect } from "react";
import {
    FaSearch,
    FaSignOutAlt,
    FaUser,
    FaBed,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaReceipt,
    FaCheckCircle,
    FaPhoneAlt,
    FaEnvelope,
    FaIdCard,
    FaTimes,
    FaHotel,
    FaClock,
    FaArrowRight,
    FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { CheckOutService } from "../services/CheckOutService";
import type { CheckOutStay } from "../model/CheckOutStay";
import { useNavigate } from "react-router-dom";

const CheckOut = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [guest, setGuest] = useState<CheckOutStay | null>(null);
    const [searchResults, setSearchResults] = useState<CheckOutStay[]>([]);
    const [activeStays, setActiveStays] = useState<CheckOutStay[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [loadingActive, setLoadingActive] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "warning" | "danger">("warning");
    const navigate = useNavigate();

    // Load active checked-in stays on mount
    useEffect(() => {
        fetchActiveStays();
    }, []);

    const fetchActiveStays = async () => {
        try {
            setLoadingActive(true);
            const res = await CheckOutService.getActiveStays();
            const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data;
            if (Array.isArray(list)) {
                setActiveStays(list);
            }
        } catch (err) {
            console.error("Error fetching active stays:", err);
        } finally {
            setLoadingActive(false);
        }
    };

    // Search Guest Stay by RoomNo or Guest Name
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const query = searchQuery.trim();
        if (!query) {
            setMessage("Please enter a Room Number or Guest Name to search.");
            setMessageType("warning");
            return;
        }

        setLoading(true);
        setMessage("");
        setGuest(null);
        setSearchResults([]);

        try {
            const res = await CheckOutService.search(query);
            const list: CheckOutStay[] = Array.isArray(res.data)
                ? res.data
                : (res.data as any)?.data ?? [];

            if (list.length === 0) {
                setMessage(`No guest stay found matching "${query}". Please verify the room number or guest name.`);
                setMessageType("warning");
            } else if (list.length === 1) {
                setGuest(list[0]);
                setSearchResults(list);
                setMessage("");
            } else {
                setSearchResults(list);
                setGuest(list[0]);
                setMessage(`Found ${list.length} matching stays. Showing details for Room ${list[0].roomNumber}.`);
                setMessageType("success");
            }
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                `No active guest stay found for "${query}".`;
            setMessage(errorMsg);
            setMessageType("warning");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStay = (stay: CheckOutStay) => {
        setGuest(stay);
        setMessage("");
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setMessage("");
    };

    // Confirm Check-out Action
    const handleCheckout = async () => {
        if (!guest) return;

        const isAlreadyCheckedOut =
            guest.stayStatus.toLowerCase() === "checkout" ||
            guest.stayStatus.toLowerCase() === "checkedout";

        if (isAlreadyCheckedOut) {
            setMessage("This guest has already checked out.");
            setMessageType("warning");
            toast.warning("This guest has already checked out.");
            return;
        }

        try {
            setCheckingOut(true);
            const res = await CheckOutService.confirmCheckOut(guest.stayId);

            const updatedStay: CheckOutStay = {
                ...guest,
                stayStatus: "CheckOut",
            };
            setGuest(updatedStay);

            setSearchResults((prev) =>
                prev.map((s) => (s.stayId === guest.stayId ? updatedStay : s))
            );
            setActiveStays((prev) => prev.filter((s) => s.stayId !== guest.stayId));

            const successMsg =
                res.message ||
                `Check-out completed successfully! Room ${guest.roomNumber} is now Available.`;

            setMessage(successMsg);
            setMessageType("success");
            toast.success(successMsg);
            navigate("/booking")
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to process check-out. Please try again.";
            setMessage(errorMsg);
            setMessageType("danger");
            toast.error(errorMsg);
        } finally {
            setCheckingOut(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const isCheckedOut =
        guest?.stayStatus?.toLowerCase() === "checkout" ||
        guest?.stayStatus?.toLowerCase() === "checkedout";

    const isPaid = (guest?.balance ?? 0) <= 0;

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12 font-sans text-slate-800">
            {/* ── 1. Hero Header Banner ─────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-indigo-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Room Departure & Settlement</span>
                            <span className="text-white/40">•</span>
                            <span>{activeStays.length} Active Checked-In</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <span>Guest Check-out</span>
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/30 text-indigo-200 font-semibold border border-indigo-400/30">
                                Fast Release
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            Search room stays, review billing invoices, settle payments, and return rooms to available inventory.
                        </p>
                    </div>

                    {/* Quick Stats / Refresh */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={fetchActiveStays}
                            disabled={loadingActive}
                            title="Refresh active stays"
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                            <FaSyncAlt className={`text-xs text-indigo-300 ${loadingActive ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh Stays</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 2. Alert Notification (if any) ─────────────────────────── */}
            {message && (
                <div
                    className={`flex items-start justify-between gap-3 p-4 rounded-2xl border text-sm transition-all shadow-xs ${
                        messageType === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : messageType === "danger"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <FaCheckCircle className="text-base shrink-0" />
                        <span>{message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ── 3. High-End Search & Active Stays Card ──────────────────── */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shadow-xs">
                            <FaSearch />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                                Search Guest Stay
                            </h2>
                            <p className="text-xs text-slate-400">
                                Enter Room Number (e.g. 101, 102), Guest Name, or Booking Reference
                            </p>
                        </div>
                    </div>

                    {guest && (
                        <button
                            type="button"
                            onClick={() => {
                                setGuest(null);
                                setSearchResults([]);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Reset View
                        </button>
                    )}
                </div>

                <form onSubmit={handleSearch} className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <FaHotel className="text-sm" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter Room No (e.g. 101, 301) or Guest Name (e.g. Dara, Sok)..."
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Clear search"
                                >
                                    <FaTimes className="text-xs" />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:from-indigo-700 active:to-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <FaSearch className="text-xs" />
                                    <span>Search Guest</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* ── Active Checked-In Stays Quick-Access ───────────────── */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active Checked-In Stays ({activeStays.length})
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Click any room to open check-out
                        </span>
                    </div>

                    {activeStays.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-1">
                            No guests are currently checked-in.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {activeStays.map((s) => {
                                const isSelected = guest?.stayId === s.stayId;
                                return (
                                    <button
                                        key={s.stayId}
                                        type="button"
                                        onClick={() => handleSelectStay(s)}
                                        className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-md shadow-indigo-500/25 scale-[1.02]"
                                                : "bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200/80 hover:border-indigo-300"
                                        }`}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200/80"
                                            }`}
                                        >
                                            {s.roomNumber}
                                        </div>
                                        <span className="font-semibold">{s.guestName}</span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-slate-200/70 text-slate-600"
                                            }`}
                                        >
                                            {s.roomType}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Multiple search results picker (if searching returns > 1) */}
                {searchResults.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-indigo-100 bg-indigo-50/40 -mx-6 -mb-6 p-4 rounded-b-3xl">
                        <div className="text-xs font-bold text-indigo-900 mb-2">
                            Found {searchResults.length} matching stays — Select the room to check out:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {searchResults.map((s) => (
                                <button
                                    key={s.stayId}
                                    type="button"
                                    onClick={() => handleSelectStay(s)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        guest?.stayId === s.stayId
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-400"
                                    }`}
                                >
                                    <span>Room {s.roomNumber}</span>
                                    <span className="text-[11px] opacity-80">({s.guestName})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── 4. Main Content: Guest Stay Details or Empty State ─────── */}
            {!guest ? (
                /* Empty / Welcome State */
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-inner border border-indigo-100">
                        <FaSignOutAlt />
                    </div>

                    {/* Quick Active Guests Grid */}
                    {activeStays.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 max-w-4xl mx-auto text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
                                Or Quick Select from Currently Checked-In Guests
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {activeStays.map((s) => (
                                    <div
                                        key={s.stayId}
                                        onClick={() => handleSelectStay(s)}
                                        className="group p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex flex-col items-center justify-center font-bold text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="text-[9px] uppercase tracking-tighter opacity-80">ROOM</span>
                                                <span className="leading-tight">{s.roomNumber}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">
                                                    {s.guestName}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {s.roomType} • {formatDate(s.checkIn)}
                                                </div>
                                            </div>
                                        </div>
                                        <FaArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 text-xs" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Active Stay Inspection and Check-out Cards */
                <div className="space-y-6">
                    {/* Status Top Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Booking Reference:
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                                {guest.bookingNo || `BK-STAY-${guest.stayId}`}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">Current Stay Status:</span>
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                    isCheckedOut
                                        ? "bg-slate-100 text-slate-700 border-slate-300"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        isCheckedOut ? "bg-slate-400" : "bg-emerald-500 animate-pulse"
                                    }`}
                                />
                                {isCheckedOut ? "Checked-Out" : guest.stayStatus}
                            </span>
                        </div>
                    </div>

                    {/* 2-Column Grid: Guest & Room Info (Left) + Financial Summary (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* ── Left Column: Guest & Room Cards (2 cols) ───────── */}
                        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                            {/* Guest Details Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base shadow-xs shrink-0">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                            Guest Profile
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Primary guest information and contacts
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            Guest Name
                                        </div>
                                        <div className="text-base font-bold text-slate-800">
                                            {guest.guestName}
                                        </div>
                                        {guest.guestNameKh && (
                                            <div className="text-xs text-indigo-600 font-medium mt-0.5">
                                                {guest.guestNameKh}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                            <FaPhoneAlt className="text-[10px]" /> Phone Number
                                        </div>
                                        <div className="text-sm font-bold text-slate-800">
                                            {guest.phone || "N/A"}
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                            <FaEnvelope className="text-[10px]" /> Email Address
                                        </div>
                                        <div className="text-sm font-semibold text-slate-800 truncate">
                                            {guest.email || "N/A"}
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                            <FaIdCard className="text-[10px]" /> Stay ID Reference
                                        </div>
                                        <div className="text-sm font-mono font-bold text-indigo-600">
                                            ST-{guest.stayId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Room & Dates Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base shadow-xs shrink-0">
                                        <FaBed />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                            Room & Stay Period
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Reserved room specs and scheduled duration
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div className="sm:col-span-1 p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex flex-col justify-between shadow-sm">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100">
                                            Room No
                                        </span>
                                        <div className="text-3xl font-extrabold tracking-tight mt-1">
                                            {guest.roomNumber}
                                        </div>
                                        <span className="text-[11px] font-medium text-indigo-200 mt-2">
                                            {guest.roomType}
                                        </span>
                                    </div>

                                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                <FaCalendarAlt className="text-[10px]" /> Check-In
                                            </span>
                                            <div className="text-sm font-bold text-slate-800 mt-2">
                                                {formatDate(guest.checkIn)}
                                            </div>
                                            <span className="text-[11px] text-slate-400">Scheduled Arrival</span>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                <FaCalendarAlt className="text-[10px]" /> Check-Out
                                            </span>
                                            <div className="text-sm font-bold text-slate-800 mt-2">
                                                {formatDate(guest.checkOut)}
                                            </div>
                                            <span className="text-[11px] text-slate-400">Departure</span>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                <FaClock className="text-[10px]" /> Duration
                                            </span>
                                            <div className="text-sm font-extrabold text-indigo-600 mt-2">
                                                {guest.nights} Night{guest.nights > 1 ? "s" : ""}
                                            </div>
                                            <span className="text-[11px] text-slate-400">
                                                ${Number(guest.pricePerNight).toFixed(2)} / night
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column: Payment & Balance Summary ───────── */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                            <div>
                                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shadow-xs shrink-0">
                                            <FaMoneyBillWave />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                                Payment Summary
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Settlement status & bill breakdown
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                            isPaid
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                    >
                                        {isPaid ? "Fully Paid" : "Balance Due"}
                                    </span>
                                </div>

                                {/* Main Total Block */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm mb-5 space-y-2">
                                    <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                                        Final Total Amount
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                        ${Number(guest.totalAmount || 0).toFixed(2)}
                                    </div>
                                    <div className="text-[11px] text-indigo-200/70 pt-1 border-t border-white/10 flex items-center justify-between">
                                        <span>Stay Length: {guest.nights} Nights</span>
                                        <span>Room {guest.roomNumber}</span>
                                    </div>
                                </div>

                                {/* Financial Details List */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                        <span className="text-slate-500 text-xs font-medium">Paid Amount</span>
                                        <span className="font-bold text-emerald-600">
                                            ${Number(guest.paidAmount || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                        <span className="text-slate-500 text-xs font-medium">Outstanding Balance</span>
                                        <span
                                            className={`font-bold text-base ${
                                                guest.balance > 0 ? "text-rose-600" : "text-emerald-600"
                                            }`}
                                        >
                                            ${Number(guest.balance || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Settlement Status Note */}
                            <div
                                className={`p-4 rounded-2xl text-xs font-medium border ${
                                    isPaid
                                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                                        : "bg-amber-50/70 border-amber-200 text-amber-800"
                                }`}
                            >
                                <div className="flex items-center gap-2 font-bold mb-0.5">
                                    <FaCheckCircle />
                                    <span>{isPaid ? "All Charges Settled" : "Pending Payment Required"}</span>
                                </div>
                                <p className="mb-0 text-[11px] opacity-90">
                                    {isPaid
                                        ? "Guest account balance is clear. Ready to finalize departure."
                                        : `Guest still has a remaining balance of $${Number(guest.balance).toFixed(2)}. Please collect before check-out.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── 5. Detailed Final Invoice Table ───────────────────── */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base shadow-xs shrink-0">
                                <FaReceipt />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                    Itemized Departure Bill
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Detailed breakdown of room rate, nights, and extra charges
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse" style={{ width: "100%", tableLayout: "fixed" }}>
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/80">
                                        <th className="py-3 px-4 font-bold rounded-l-xl" style={{ width: "46%", textAlign: "left" }}>
                                            Description
                                        </th>
                                        <th className="py-3 px-4 font-bold text-center" style={{ width: "18%", textAlign: "center" }}>
                                            Quantity
                                        </th>
                                        <th className="py-3 px-4 font-bold text-right text-end" style={{ width: "18%", textAlign: "right" }}>
                                            Unit Price
                                        </th>
                                        <th className="py-3 px-4 font-bold text-right text-end rounded-r-xl" style={{ width: "18%", textAlign: "right" }}>
                                            Total Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4" style={{ textAlign: "left" }}>
                                            <div className="font-bold text-slate-800">
                                                Room Accommodation — {guest.roomNumber}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {guest.roomType} category ({formatDate(guest.checkIn)} → {formatDate(guest.checkOut)})
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center" style={{ textAlign: "center" }}>
                                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                                                {guest.nights} Night{guest.nights > 1 ? "s" : ""}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right text-end font-semibold text-slate-800" style={{ textAlign: "right" }}>
                                            ${Number(guest.pricePerNight || 0).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-4 text-right text-end font-bold text-slate-900" style={{ textAlign: "right" }}>
                                            ${(guest.nights * (guest.pricePerNight || 0)).toFixed(2)}
                                        </td>
                                    </tr>

                                    {guest.additionalCharges > 0 && (
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4" style={{ textAlign: "left" }}>
                                                <div className="font-bold text-slate-800">
                                                    Service / Cleaning Charges
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">Standard hospitality fee</div>
                                            </td>
                                            <td className="py-4 px-4 text-center" style={{ textAlign: "center" }}>
                                                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">1</span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-end font-semibold text-slate-800" style={{ textAlign: "right" }}>
                                                ${Number(guest.additionalCharges).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-end font-bold text-slate-900" style={{ textAlign: "right" }}>
                                                ${Number(guest.additionalCharges).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}

                                    {guest.discount > 0 && (
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4" style={{ textAlign: "left" }}>
                                                <div className="font-bold text-emerald-700">Applied Discount</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Promotion / Voucher</div>
                                            </td>
                                            <td className="py-4 px-4 text-center" style={{ textAlign: "center" }}>
                                                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">1</span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-end font-semibold text-emerald-600" style={{ textAlign: "right" }}>
                                                -${Number(guest.discount).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-end font-bold text-emerald-600" style={{ textAlign: "right" }}>
                                                -${Number(guest.discount).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200">
                                        <td colSpan={3} className="py-3 px-4 text-right text-end font-semibold text-slate-500 text-sm" style={{ textAlign: "right" }}>
                                            Subtotal:
                                        </td>
                                        <td className="py-3 px-4 text-right text-end font-bold text-slate-800 text-sm" style={{ textAlign: "right" }}>
                                            ${Number(guest.totalAmount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="border-t border-slate-100">
                                        <td colSpan={3} className="py-2.5 px-4 text-right text-end font-semibold text-slate-500 text-sm" style={{ textAlign: "right" }}>
                                            Paid to Date:
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-end font-bold text-emerald-600 text-sm" style={{ textAlign: "right" }}>
                                            ${Number(guest.paidAmount || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="border-t border-slate-200 bg-slate-50/70">
                                        <td colSpan={3} className="py-3.5 px-4 text-right text-end font-bold text-slate-800 text-base" style={{ textAlign: "right" }}>
                                            Balance Due:
                                        </td>
                                        <td className={`py-3.5 px-4 text-right text-end font-extrabold text-lg ${guest.balance > 0 ? "text-rose-600" : "text-emerald-600"}`} style={{ textAlign: "right" }}>
                                            ${Number(guest.balance || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* ── 6. Final Action Card: Confirm Check-out ────────────── */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                                        isCheckedOut
                                            ? "bg-slate-100 text-slate-600"
                                            : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                                    }`}
                                >
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                                        {isCheckedOut ? "Check-out Completed" : "Ready to Finalize Check-out?"}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {isCheckedOut
                                            ? `Guest ${guest.guestName} has departed. Room ${guest.roomNumber} has been returned to Available status.`
                                            : `Clicking confirm will set Room ${guest.roomNumber} to Available and update Booking status to CheckOut.`}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={isCheckedOut || checkingOut}
                                className={`px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-md shrink-0 w-full sm:w-auto ${
                                    isCheckedOut
                                        ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95"
                                }`}
                            >
                                {checkingOut ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Releasing Room & Checking Out...</span>
                                    </>
                                ) : isCheckedOut ? (
                                    <>
                                        <FaCheckCircle className="text-sm" />
                                        <span>Check-out Finished</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSignOutAlt className="text-sm" />
                                        <span>Confirm Check-out & Free Room</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOut;
