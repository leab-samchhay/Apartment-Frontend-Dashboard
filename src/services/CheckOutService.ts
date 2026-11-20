import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { CheckOutStay } from "../model/CheckOutStay";

const END_POINT = "/CheckOut";

export const CheckOutService = {
    // Search active/all stays by query (RoomNo, Guest Name, BookingNo, Phone)
    search: async (query: string): Promise<ApiResponse<CheckOutStay[]>> => {
        return await apiClient.get(`${END_POINT}/search?query=${encodeURIComponent(query)}`);
    },

    // Get active/checked-in stays
    getActiveStays: async (): Promise<ApiResponse<CheckOutStay[]>> => {
        return await apiClient.get(`${END_POINT}/active`);
    },

    // Get stay by booking id
    getById: async (id: number): Promise<ApiResponse<CheckOutStay>> => {
        return await apiClient.get(`${END_POINT}/${id}`);
    },

    // Confirm check-out (sets room status to Available and booking status to CheckOut)
    confirmCheckOut: async (bookingId: number): Promise<ApiResponse<any>> => {
        return await apiClient.post(`${END_POINT}/confirm/${bookingId}`);
    },
};
