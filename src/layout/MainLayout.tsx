import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

// Grouped navigation structure for cleaner management
const NAV_GROUPS = [
    {
        title: "Overview",
        items: [
            { to: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
            { to: "/bookingTransaction", label: "Bookings", icon: "fas fa-calendar-check" },
            { to: "/checkout", label: "Check Out", icon: "fas fa-calendar-check" },
            { to: "/booking", label: "Bookings Info", icon: "fas fa-calendar-check" },
        ],
    },
    {
        title: "Hotel Management",
        items: [
            { to: "/building", label: "Buildings", icon: "fas fa-building" },
            { to: "/floor", label: "Floors", icon: "fas fa-layer-group" },
            { to: "/roomType", label: "Room Types", icon: "fas fa-bed" },
            { to: "/room", label: "Room", icon: "fas fa-bed" },
            { to: "/guest", label: "Guests", icon: "fas fa-users" },
        ],
    },
    {
        title: "HR & Finance",
        items: [
            { to: "/position", label: "Positions", icon: "fas fa-id-badge" },
            { to: "/staff", label: "Staff", icon: "fas fa-user-tie" },
            { to: "/salary", label: "Salaries", icon: "fas fa-money-bill-wave" },
            { to: "/exchangeRate", label: "Exchange Rates", icon: "fas fa-exchange-alt" },
            { to: "/expentype", label: "ExpentType", icon: "fas fa-tags" },
            { to: "/orhterexpent", label: "Orther Expent", icon: "fas fa-receipt" },
        ],
    },
    {
        title: "System & Security",
        items: [
            { to: "/user", label: "Users", icon: "fas fa-user" },
            { to: "/role", label: "Roles", icon: "fas fa-user-shield" },
            { to: "/userRole", label: "User Roles", icon: "fas fa-users-cog" },
        ],
    },
];

export const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const roleStr = sessionStorage.getItem("role");
    const displayRole = roleStr ? roleStr.replace(/["[\]]/g, "") : "Admin";

    // Automatically close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
    };

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
            {/* ── Mobile Sidebar Backdrop ─────────────────── */}
            {mobileMenuOpen && (
                <div
                className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
                />
            )}

            {/* ── Sidebar (Responsive Drawer on Mobile, Sticky on Desktop) ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } ${isCollapsed ? "lg:w-20" : "w-64"}`}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20 shrink-0">
                        <i className="fas fa-hotel text-lg"></i>
                        </div>
                        {!isCollapsed && (
                        <div className="flex flex-col min-w-0 transition-opacity duration-200">
                            <span className="text-sm font-bold tracking-wide text-white truncate">
                            AdminPanel
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase truncate">
                            Hotel Management
                            </span>
                        </div>
                        )}
                    </div>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Navigation Items (Scrollable) */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {NAV_GROUPS.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {group.title}
                            </div>
                        )}
                        {group.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                style={{ textDecoration: "none" }}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 !no-underline ${
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 !text-white shadow-md shadow-indigo-600/30 font-semibold"
                                        : "!text-slate-300 hover:!text-white hover:bg-slate-800/70"
                                    } ${isCollapsed ? "justify-center" : ""}`
                                }
                                title={isCollapsed ? item.label : undefined}
                            >
                                <i
                                    className={`${item.icon} text-base w-5 text-center transition-transform group-hover:scale-110 shrink-0 !no-underline`}
                                ></i>
                                
                                {!isCollapsed && (
                                    <span style={{ textDecoration: "none" }} className="truncate !no-underline">
                                        {item.label}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer with Collapse & Logout */}
                <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2">
                    {/* Desktop Collapse Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                        <i
                        className={`fas fa-chevron-${isCollapsed ? "right" : "left"} text-xs`}
                        ></i>
                        {!isCollapsed && <span>Collapse Sidebar</span>}
                    </button>

                    {/* Logout Button */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Logout"
                    >
                        <i className="fas fa-sign-out-alt text-base shrink-0"></i>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ────────────────────────── */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                {/* Top Header Navbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs shrink-0">
                    {/* Left: Mobile hamburger & Today's Date */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden cursor-pointer"
                            aria-label="Open sidebar"
                        >
                            <i className="fas fa-bars text-lg"></i>
                        </button>

                        {/* Today Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-semibold text-slate-600 shadow-2xs">
                            <i className="fas fa-calendar-alt text-indigo-600"></i>
                            <span>{currentDate}</span>
                        </div>
                    </div>

                    {/* Right: User Profile & Quick Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 pl-2 py-1 pr-3 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20 shrink-0">
                                <i className="fas fa-user-shield text-xs"></i>
                            </div>
                            <div className="flex flex-col text-left leading-tight pr-1">
                                <span className="text-xs font-bold text-slate-800 capitalize">
                                    {displayRole}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Body */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
