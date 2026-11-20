import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { Room } from "../model/Room";

const END_POINT = "/Room";
export const RoomService = {
    getRoomAll : async(
        page: number,
        pageSize : number,
    ) : Promise<ApiResponse<PagedResponse<Room>>> =>{
        return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
    },

    postRoom : async (data: Room) : Promise<ApiResponse<Room>> => {
        return await apiClient.post(`${END_POINT}`,data);
    },

    putRoom : async (data: Room) : Promise<ApiResponse<Room>> => {
        return await apiClient.put(`${END_POINT}/${data.id}`,data);
    },

    deleteRoom : async (id : number) : Promise <ApiResponse<Room>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    }
}
