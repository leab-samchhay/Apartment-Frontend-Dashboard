import type { BookingItem } from "./BookingItem";

export interface GuestInfo {
  Name: string;
  NameKh?: string;
  Sex?: string;
  Dob: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  Passport?: string;
  Nationality?: string;
  SSN?: string;
  ImagePath?: File | string | null;
  Status: string;
}

export interface BookingTransactionPayload {
  guest: GuestInfo;
  bookings: BookingItem[];
}

export interface BookingTransaction {
  id?: number;
  Name: string;
  NameKh?: string;
  Sex?: string;
  Dob: Date | string;
  Phone?: string;
  Email?: string;
  Address?: string;
  Passport?: string;
  Nationality?: string;
  SSN?: string;
  ImagePath?: File | string | null;
  Bookings?: BookingItem[];

  // Flat booking fields
  BookingNo?: string;
  BookingDate?: Date | string;
  UserId?: number;
  RoomId?: number;
  ExchangeId?: number | null;
  Total?: number;
  PayDollar?: number;
  PayRiel?: number;
  UpdateBy?: number | null;
  CheckInDate?: Date | string;
  ExpireDate?: Date | string;
  Status?: string | number;
  Note?: string;
}
