import React, { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import type { BookingItem } from "../model/BookingItem";
import type { GuestInfo } from "../model/BookingTransaction";
import { bookingTransactionService } from "../services/BookingTransaction";
import { toast } from "react-toastify";
import { UserService } from "../services/UserService";
import { RoomService } from "../services/RoomService";
import { ExchangeRateService } from "../services/ExchangeRateService";
import type { User } from "../model/User";
import type { Room } from "../model/Room";
import type { ExchangeRate } from "../model/ExchangeRate";
import { useNavigate } from "react-router-dom";

const BookingTransaction = () => {
  const emptyGuest: GuestInfo = {
    Name: "",
    NameKh: "",
    Sex: "",
    Dob: new Date().toISOString().split("T")[0],
    Phone: "",
    Email: "",
    Address: "",
    Passport: "",
    Nationality: "",
    SSN: "",
    ImagePath: null,
    Status: "Active",
  };

  const formatDdMmmYyyy = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-US", { month: "short" });
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
  };

  const createEmptyBooking = (index: number = 0): BookingItem => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return {
      BookingNo: `BK-${Date.now().toString().slice(-4)}${randomSuffix + index}`,
      BookingDate: today,
      UserId: 0,
      RoomId: 0,
      ExchangeId: null,
      Total: 0,
      PayDollar: 0,
      PayRiel: 0,
      UpdateBy: null,
      UpdateDate: null,
      CheckInDate: today,
      ExpireDate: tomorrow,
      Status: "Booked",
      Note: "",
    };
  };

  const [guestData, setGuestData] = useState<GuestInfo>(emptyGuest);
  const [bookings, setBookings] = useState<BookingItem[]>([createEmptyBooking(1)]);
  const [user, setUser] = useState<User[]>([]);
  const [room, setRoom] = useState<Room[]>([]);
  const [exchange, setExchange] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [preImageUrl,setPreImageUrl] = useState<string | null> (null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchExchangeRate();
    fetchRoom();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await UserService.getUser(1, 100000);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).data;
        if (Array.isArray(list)) {
          setUser(list);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRoom = async () => {
    try {
      const res = await RoomService.getRoomAll(1, 1000);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).data;
        if (Array.isArray(list)) {
          setRoom(list);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await ExchangeRateService.getExchangeRates(1, 1000);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).data;
        if (Array.isArray(list)) {
          setExchange(list);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGuestChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGuestData((prev) => ({
      ...prev,
      ImagePath: file,
    }));

    if(file){
      const url = URL.createObjectURL(file);
      setPreImageUrl(url);
    }
    else{
      setPreImageUrl(null);
    }
  };

  const handleBookingChange = (
    index: number,
    field: keyof BookingItem,
    value: any
  ) => {
    setBookings((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      // Helper function សម្រាប់ទាញយក Rate ពី ExchangeId
      const getRate = (exId: number | null) => {
        const found = exchange.find((e) => e.id === Number(exId));
        return found ? Number(found.rate) : 0;
      };

      if (field === "RoomId") {
        const roomIdNum = Number(value);
        current.RoomId = roomIdNum;
        const selectedRoom = room.find((r) => r.id === roomIdNum);
        if (selectedRoom) {
          const price = selectedRoom.price || 0;
          current.Total = price;
          current.PayDollar = price;
          // គណនាប្រាក់រៀលស្វ័យប្រវត្តិនៅពេលជ្រើសរើសបន្ទប់
          const rate = getRate(current.ExchangeId ?? null);
          current.PayRiel = price * rate;
        }
      } else if (field === "ExchangeId") {
        const exId = value === "" ? 0 : Number(value);
        current.ExchangeId = exId;
        // គុណ Exchange Rate ជាមួយនឹង PayDollar
        const rate = getRate(exId);
        current.PayRiel = (Number(current.PayDollar) || 0) * rate;  
      } else if (field === "PayDollar") {
        const dollar = value === "" ? 0 : Number(value);
        current.PayDollar = dollar;
        // គុណ PayDollar ថ្មី ជាមួយ Exchange Rate ដែលបានរើស
        const rate = getRate(current.ExchangeId ?? null);
        current.PayRiel = dollar * rate;
      } else if (
        field === "UserId" ||
        field === "Total" ||
        field === "PayRiel" ||
        field === "UpdateBy"
      ) {
        (current as any)[field] = value === "" ? 0 : Number(value);
      } else {
        (current as any)[field] = value;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleAddBooking = () => {
    setBookings((prev) => [...prev, createEmptyBooking(prev.length + 1)]);
    toast.info("Added a new booking row");
  };

  const handleRemoveBooking = (index: number) => {
    if (bookings.length <= 1) {
      toast.warning("At least one booking is required");
      return;
    }
    setBookings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!guestData.Name.trim()) {
      toast.error("Please enter guest name");
      return;
    }

    if (bookings.length === 0) {
      toast.error("Please add at least one booking");
      return;
    }

    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      if (!b.UserId || b.UserId <= 0) {
        toast.error(`Please select a user for Booking #${i + 1}`);
        return;
      }
      if (!b.RoomId || b.RoomId <= 0) {
        toast.error(`Please select a room for Booking #${i + 1}`);
        return;
      }
    }

    // Check for duplicate rooms in the same transaction
    const roomIds = bookings.map((b) => b.RoomId);
    const hasDuplicateRooms = new Set(roomIds).size !== roomIds.length;
    if (hasDuplicateRooms) {
      toast.error("You cannot select the same room more than once in the same booking!");
      return;
    }

    try {
      setLoading(true);
      await bookingTransactionService.postBookingTransaction(guestData, bookings);
      toast.success(`Booking transaction submitted successfully! (${bookings.length} room(s) booked)`);
      // Reset form
      setGuestData(emptyGuest);
      setBookings([createEmptyBooking(1)]);
      // Refresh room list
      fetchRoom();
      setPreImageUrl(null);
      navigate("/booking")
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="bg-white border border-black/5 rounded-xl shadow-sm px-4 py-4">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Information Guest */}
          <h5 className="font-semibold text-gray-800 text-lg mb-3">
            Information Guest
          </h5>

          <div className="space-y-4">
            {/* Row 1: Name, Name Khmer, Sex, Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Name"
                  className="text-sm font-medium text-gray-700"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="Name"
                  type="text"
                  name="Name"
                  required
                  value={guestData.Name}
                  onChange={handleGuestChange}
                  placeholder="Enter name English"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="NameKh"
                  className="text-sm font-medium text-gray-700"
                >
                  Name Khmer
                </label>
                <input
                  id="NameKh"
                  type="text"
                  name="NameKh"
                  value={guestData.NameKh || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter name Khmer"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Sex"
                  className="text-sm font-medium text-gray-700"
                >
                  Sex
                </label>
                <select
                  id="Sex"
                  name="Sex"
                  value={guestData.Sex || ""}
                  onChange={handleGuestChange}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                >
                  <option value="">Enter Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Dob"
                  className="text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  id="Dob"
                  type="date"
                  name="Dob"
                  value={guestData.Dob}
                  onChange={handleGuestChange}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            {/* Row 2: Phone, Email, Nationality, SSN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="Phone"
                  type="tel"
                  name="Phone"
                  value={guestData.Phone || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="Email"
                  type="email"
                  name="Email"
                  value={guestData.Email || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter email address"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Nationality"
                  className="text-sm font-medium text-gray-700"
                >
                  Nationality
                </label>
                <input
                  id="Nationality"
                  type="text"
                  name="Nationality"
                  value={guestData.Nationality || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter Nationality"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="SSN"
                  className="text-sm font-medium text-gray-700"
                >
                  SSN
                </label>
                <input
                  id="SSN"
                  type="text"
                  name="SSN"
                  value={guestData.SSN || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter SSN"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            {/* Row 3: Image, Passport, Address, Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ImagePath"
                  className="text-sm font-medium text-gray-700"
                >
                  Image
                </label>
                <input
                  id="ImagePath"
                  type="file"
                  accept="image/*"
                  name="ImagePath"
                  onChange={handleGuestFileChange}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />

                {preImageUrl && (
                  <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                    <img
                      src={preImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {/* ប៊ូតុងសម្រាប់លុបរូបចេញវិញ (បើចង់បាន) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreImageUrl(null);
                        setGuestData((prev) => ({ ...prev, ImagePath: null }));
                        const input = document.getElementById("ImagePath") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Passport"
                  className="text-sm font-medium text-gray-700"
                >
                  Passport Number
                </label>
                <input
                  id="Passport"
                  type="text"
                  name="Passport"
                  value={guestData.Passport || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter Passport"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="Address"
                  className="text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  id="Address"
                  type="text"
                  name="Address"
                  value={guestData.Address || ""}
                  onChange={handleGuestChange}
                  placeholder="Enter Address"
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="GuestStatus"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="GuestStatus"
                  name="Status"
                  value={guestData.Status}
                  onChange={handleGuestChange}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                            placeholder:text-gray-400 outline-none transition-all duration-200
                            hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Bookings */}
          <div className="mt-8 mb-4 flex items-center justify-between border-b pb-2">
            <div>
              <h5 className="font-semibold text-gray-800 text-lg">
                Booking ({bookings.length} room{bookings.length > 1 ? "s" : ""})
              </h5>
            </div>
            <button
              type="button"
              onClick={handleAddBooking}
              className="inline-flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Booking
            </button>
          </div>

          {/* Booking Items List */}
          <div className="space-y-4">
            {bookings.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-indigo-100 rounded-lg bg-slate-50/50 relative shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                  <span className="font-medium text-sm text-indigo-700 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    Booking #{index + 1}
                  </span>

                  {bookings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBooking(index)}
                      className="inline-flex items-center gap-1 rounded border border-red-500/30 px-2 py-1 text-xs font-medium text-red-600 duration-200 hover:bg-red-500/10 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Row 1: BookingNo, Booking Date, UserId, Room */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        BookingNo
                      </label>
                      <input
                        type="text"
                        value={item.BookingNo}
                        onChange={(e) =>
                          handleBookingChange(index, "BookingNo", e.target.value)
                        }
                        placeholder="BK-0001"
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Booking Date
                      </label>
                      <input
                        type="date"
                        value={item.BookingDate}
                        onChange={(e) =>
                          handleBookingChange(index, "BookingDate", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        UserId <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.UserId}
                        onChange={(e) =>
                          handleBookingChange(index, "UserId", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      >
                        <option value="0">select user</option>
                        {user.map((u) => (
                          <option value={u.id} key={u.id}>
                            {u.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Room <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.RoomId}
                        onChange={(e) =>
                          handleBookingChange(index, "RoomId", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      >
                        <option value="0">select room</option>
                        {room
                          .filter(
                            (r) =>
                              (String(r.status) === "1" ||
                               Number(r.status) === 1 ||
                               String(r.status).toLowerCase() === "available" ||
                               r.id === item.RoomId) &&
                              !bookings.some((b, bIdx) => bIdx !== index && b.RoomId === r.id)
                          )
                          .map((r) => (
                            <option value={r.id} key={r.id}>
                              {r.room_no} (${r.price})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: ExchangeId, Total, PayDollar, PayRiel */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        ExchangeId
                      </label>
                      <select
                        value={item.ExchangeId || 0}
                        onChange={(e) =>
                          handleBookingChange(index, "ExchangeId", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      >
                        <option value="0">select exchange</option>
                        {exchange.map((ex) => (
                          <option value={ex.id} key={ex.id}>
                            {ex.rate} {ex.dateT ? `(${formatDdMmmYyyy(ex.dateT)})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Total ($)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={item.Total || ""}
                        onChange={(e) =>
                          handleBookingChange(index, "Total", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Pay Dollar ($)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={item.PayDollar || ""}
                        onChange={(e) =>
                          handleBookingChange(index, "PayDollar", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Pay Riel (៛)
                      </label>
                      <input
                        type="number"
                        step="any"
                        readOnly
                        value={item.PayRiel || ""}
                        onChange={(e) =>
                          handleBookingChange(index, "PayRiel", e.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  {/* Row 3: CheckInDate, ExpireDate, Status, Note */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        CheckIn Date
                      </label>
                      <input
                        type="date"
                        value={item.CheckInDate}
                        onChange={(e) =>
                          handleBookingChange(index, "CheckInDate", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        CheckOut Date
                      </label>
                      <input
                        type="date"
                        value={item.ExpireDate}
                        onChange={(e) =>
                          handleBookingChange(index, "ExpireDate", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={item.Status}
                        onChange={(e) =>
                          handleBookingChange(index, "Status", e.target.value)
                        }
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      >
                        <option value="Booked">Booked</option>
                        <option value="CheckIn">CheckIn</option>
                        <option value="CheckedIn">CheckedIn</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Note
                      </label>
                      <input
                        type="text"
                        value={item.Note || ""}
                        onChange={(e) =>
                          handleBookingChange(index, "Note", e.target.value)
                        }
                        placeholder="Enter Note"
                        className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
                                  placeholder:text-gray-400 outline-none transition-all duration-200
                                  hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Button to Add More Bookings and Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto  bg-indigo-600 rounded px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookingTransaction;
