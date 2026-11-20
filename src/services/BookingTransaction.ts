import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { BookingItem } from "../model/BookingItem";
import type { GuestInfo } from "../model/BookingTransaction";

const END_POINT = "/BookingWithGuestTransaction/booking-with-guest";

export const bookingTransactionService = {
  postBookingTransaction: async (
    guest: GuestInfo,
    bookings: BookingItem[]
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();

    // Guest Information
    formData.append("Name", guest.Name || "");
    if (guest.NameKh) formData.append("NameKh", guest.NameKh);
    if (guest.Sex) formData.append("Sex", guest.Sex);
    if (guest.Dob) formData.append("Dob", guest.Dob);
    if (guest.Phone) formData.append("Phone", guest.Phone);
    if (guest.Email) formData.append("Email", guest.Email);
    if (guest.Address) formData.append("Address", guest.Address);
    if (guest.Passport) formData.append("Passport", guest.Passport);
    if (guest.Nationality) formData.append("Nationality", guest.Nationality);
    if (guest.SSN) formData.append("SSN", guest.SSN);
    if (guest.Status) formData.append("Status", guest.Status);
    if (guest.ImagePath instanceof File) {
      formData.append("ImagePath", guest.ImagePath);
    }

    // Bookings Array
    bookings.forEach((b, index) => {
      formData.append(`Bookings[${index}].BookingNo`, b.BookingNo || "");
      formData.append(`Bookings[${index}].BookingDate`, b.BookingDate || "");
      formData.append(`Bookings[${index}].UserId`, (b.UserId || 0).toString());
      formData.append(`Bookings[${index}].RoomId`, (b.RoomId || 0).toString());
      if (b.ExchangeId) {
        formData.append(`Bookings[${index}].ExchangeId`, b.ExchangeId.toString());
      }
      formData.append(`Bookings[${index}].Total`, (b.Total || 0).toString());
      formData.append(`Bookings[${index}].PayDollar`, (b.PayDollar || 0).toString());
      formData.append(`Bookings[${index}].PayRiel`, (b.PayRiel || 0).toString());
      if (b.UpdateBy) {
        formData.append(`Bookings[${index}].UpdateBy`, b.UpdateBy.toString());
      }
      if (b.UpdateDate) {
        formData.append(`Bookings[${index}].UpdateDate`, b.UpdateDate);
      }
      formData.append(`Bookings[${index}].CheckInDate`, b.CheckInDate || "");
      formData.append(`Bookings[${index}].ExpireDate`, b.ExpireDate || "");
      formData.append(`Bookings[${index}].Status`, b.Status || "Booked");
      if (b.Note) {
        formData.append(`Bookings[${index}].Note`, b.Note);
      }
    });

    // Also send JSON string of bookings for robust deserialization
    formData.append("BookingsJson", JSON.stringify(bookings));

    // Fallback flat fields for the first booking
    if (bookings.length > 0) {
      const first = bookings[0];
      formData.append("BookingNo", first.BookingNo || "");
      formData.append("BookingDate", first.BookingDate || "");
      formData.append("UserId", (first.UserId || 0).toString());
      formData.append("RoomId", (first.RoomId || 0).toString());
      if (first.ExchangeId) formData.append("ExchangeId", first.ExchangeId.toString());
      formData.append("Total", (first.Total || 0).toString());
      formData.append("PayDollar", (first.PayDollar || 0).toString());
      formData.append("PayRiel", (first.PayRiel || 0).toString());
      formData.append("CheckInDate", first.CheckInDate || "");
      formData.append("ExpireDate", first.ExpireDate || "");
      formData.append("Status", first.Status || "Booked");
      if (first.Note) formData.append("Note", first.Note);
    }

    return await apiClient.post(`${END_POINT}`, formData);
  },
};
