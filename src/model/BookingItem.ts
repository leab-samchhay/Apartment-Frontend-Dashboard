export interface BookingItem {
  id?: number;

  // camelCase (used by Booking.tsx and API)
  bookingNo?: string;
  bookingDate?: string;
  guestId?: number;
  userId?: number;
  roomId?: number;
  exchangeId?: number | null;
  total?: number;
  payDollar?: number;
  payRiel?: number;
  updateBy?: number | null;
  updateDate?: string | null;
  checkInDate?: string;
  expireDate?: string;
  status?: string;
  note?: string;

  // PascalCase (used by BookingTransaction.tsx and BookingTransaction.ts)
  BookingNo?: string;
  BookingDate?: string;
  GuestId?: number;
  UserId?: number;
  RoomId?: number;
  ExchangeId?: number | null;
  Total?: number;
  PayDollar?: number;
  PayRiel?: number;
  UpdateBy?: number | null;
  UpdateDate?: string | null;
  CheckInDate?: string;
  ExpireDate?: string;
  Status?: string;
  Note?: string;
}
