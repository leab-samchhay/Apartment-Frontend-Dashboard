import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { RoomType } from "../model/RoomType";


const END_POINT = "/RoomType";
export const RoomTypeService = {
    getRoomType: async(
        page: number,
        pageSize: number,
    ):Promise<ApiResponse<PagedResponse<RoomType>>> =>{
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`,
        );
    },

    postRoomType: async(data: RoomType): Promise<ApiResponse<RoomType>> =>{
        return await apiClient.post(`${END_POINT}`,data);
    },

    putRoomType: async(data: RoomType): Promise<ApiResponse<RoomType>> =>{
        return await apiClient.put(`${END_POINT}/${data.id}`,data);
    },

    deleteRoomType: async(id: number): Promise<ApiResponse<RoomType>> =>{
        return await apiClient.delete(`${END_POINT}/${id}`);
    },
}