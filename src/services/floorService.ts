

import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { Floor } from "../model/Floor";

const END_POINT = "/Floors";

export const FloorService = {
    getFloor: async (
        page: number,
        pageSize: number
    ): Promise<ApiResponse<PagedResponse<Floor>>> => {
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`
        );
    },

    postFloor: async (data: Floor): Promise<ApiResponse<Floor>> => {
        return await apiClient.post(`${END_POINT}`, data);
    },

    putFloor: async (data: Floor): Promise<ApiResponse<Floor>> => {
        return await apiClient.put(`${END_POINT}?id=${data.id}`, data);
    },

    deleteFloor: async (id: number): Promise<ApiResponse<Floor>> => {
        return await apiClient.delete(`${END_POINT}?id=${id}`);
    }
};