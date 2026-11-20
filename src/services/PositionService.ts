
import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { Position } from "../model/Position";

const END_POINT = "/Position"
export const PositionService = {

    getPosition : async (page: number, pageSize: number): Promise<ApiResponse<PagedResponse<Position>>> =>{
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`
        );
    },

    postPosition : async(data : Position) : Promise<ApiResponse<Position>> =>{
        return await apiClient.post(`${END_POINT}`,data);
    },

    putPosition : async(data : Position) : Promise<ApiResponse<Position>> => {
        return await apiClient.put(`${END_POINT}?id=${data.id}`,data);
    },

    deletePosition : async(id: number) : Promise<ApiResponse<Position>> => {
        return await apiClient.delete(`${END_POINT}?id=${id}`);
    }

}