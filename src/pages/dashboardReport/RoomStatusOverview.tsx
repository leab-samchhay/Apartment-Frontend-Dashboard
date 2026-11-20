// import { FaArrowRight, FaKey } from "react-icons/fa6";
// import { HiCheckCircle, HiInformationCircle } from "react-icons/hi2";
// import { IoTime } from "react-icons/io5";

// interface RoomStatusProps {
//   data?: {
//     totalRoom?: number;
//     avalibaleRoom?: number;
//     occupiedRoom?: number;
//     reserved?: number;
//     TotalRoom?: number;
//     AvalibaleRoom?: number;
//     AvailableRoom?: number;
//     availableRoom?: number;
//     OccupiedRoom?: number;
//     Reserved?: number;
//   };
// }

// export default function RoomStatusOverview({ data }: RoomStatusProps) {
//   const available = Number(
//     data?.avalibaleRoom ??
//     data?.AvalibaleRoom ??
//     data?.availableRoom ??
//     data?.AvailableRoom ??
//     0
//   );
//   const occupied = Number(
//     data?.occupiedRoom ??
//     data?.OccupiedRoom ??
//     0
//   );
//   const reserved = Number(
//     data?.reserved ??
//     data?.Reserved ??
//     0
//   );
//   const rawTotal = Number(
//     data?.totalRoom ??
//     data?.TotalRoom ??
//     0
//   );

//   const sumOfRooms = available + occupied + reserved;
//   const effectiveTotal = rawTotal > 0 ? rawTotal : (sumOfRooms > 0 ? sumOfRooms : 1);

//   const getPercentage = (count: number) => {
//     if (effectiveTotal <= 0) return 0;
//     return Math.min(100, Math.max(0, Math.round(((count || 0) / effectiveTotal) * 100)));
//   };

//   const statuses = [
//     {
//       label: "Available",
//       count: available,
//       percentage: getPercentage(available),
//       icon: <HiCheckCircle className="text-emerald-600 text-base" />,
//       iconBg: "bg-emerald-50",
//       barColor: "bg-emerald-500",
//     },
//     {
//       label: "Occupied",
//       count: occupied,
//       percentage: getPercentage(occupied),
//       icon: <FaKey className="text-blue-600 text-xs" />,
//       iconBg: "bg-blue-50",
//       barColor: "bg-blue-600",
//     },
//     {
//       label: "Reserved",
//       count: reserved,
//       percentage: getPercentage(reserved),
//       icon: <IoTime className="text-amber-700 text-sm" />,
//       iconBg: "bg-amber-50",
//       barColor: "bg-amber-500",
//     },
//   ];

//   return (
//     <div className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-slate-800 tracking-tight">
//             Room Status Overview
//           </h2>
//           <p className="text-xs text-slate-400 mt-1">
//             Real-time room occupancy and housekeeping distribution
//           </p>
//         </div>
//         <button
//           type="button"
//           className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
//         >
//           <span>View All</span>
//           <FaArrowRight className="text-[10px]" />
//         </button>
//       </div>

//       {/* Status Progress Bars */}
//       <div className="mt-8 space-y-6">
//         {statuses.map((item, index) => (
//           <div key={index} className="space-y-2">
//             <div className="flex items-center justify-between text-xs">
//               <div className="flex items-center gap-2">
//                 <div
//                   className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.iconBg}`}
//                 >
//                   {item.icon}
//                 </div>
//                 <span className="font-medium text-slate-700">{item.label}</span>
//               </div>
//               <div className="flex items-baseline gap-1">
//                 <span className="font-bold text-slate-800">
//                   {item.count} Rooms
//                 </span>
//                 <span className="text-slate-400 font-medium">
//                   ({item.percentage}%)
//                 </span>
//               </div>
//             </div>

//             {/* Background track & filled bar with dynamic width */}
//             <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
//               <div
//                 className={`h-full rounded-full transition-all duration-700 ease-out ${item.barColor}`}
//                 style={{
//                   width: `${item.percentage}%`,
//                   minWidth: item.count > 0 ? "6px" : "0px",
//                 }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Footer Info Box */}
//       <div className="mt-8 p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-500">
//         <div className="flex items-center gap-2">
//           <HiInformationCircle className="text-indigo-500 text-base shrink-0" />
//           <span>Rooms are auto-updated when check-in or booking occurs.</span>
//         </div>
//         <span className="font-bold text-slate-800 shrink-0 ml-2">
//           {rawTotal > 0 ? rawTotal : sumOfRooms} Total
//         </span>
//       </div>
//     </div>
//   );
// }
