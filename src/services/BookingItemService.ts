import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { BookingItem } from "../model/BookingItem";


const END_POINT = "/Booking";
export const BookingItemService = {
    getAll : async(page : number, pageSize : number) : Promise<ApiResponse<PagedResponse<BookingItem>>> =>{
        return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
    },

    postBooking : async(data : BookingItem) : Promise<ApiResponse<BookingItem>> =>{
        return await apiClient.post(`${END_POINT}`, data);
    },

    // Backend route: PUT /Booking/{id}
    putBooking : async(data : BookingItem) : Promise<ApiResponse<BookingItem>> =>{
        return await apiClient.put(`${END_POINT}/${data.id}`, data);
    },

    // Backend route: DELETE /Booking/{id}
    deleteBooking : async(id : number) : Promise<ApiResponse<BookingItem>> =>{
        return await apiClient.delete(`${END_POINT}/${id}`);
    }
    

}
