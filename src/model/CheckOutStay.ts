export interface CheckOutStay {
    stayId: number;
    bookingNo: string;
    guestId: number;
    guestName: string;
    guestNameKh?: string;
    phone?: string;
    email?: string;
    roomId: number;
    roomNumber: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    pricePerNight: number;
    additionalCharges: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    paymentStatus: string;
    stayStatus: string;
}
