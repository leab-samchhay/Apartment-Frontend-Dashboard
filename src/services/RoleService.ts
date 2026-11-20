import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { Role } from "../model/Role";

const END_POINT = "/roles";
export const RoleService = {
    getRole: async (): Promise<ApiResponse<Role[]>> => {
        return await apiClient.get(`${END_POINT}`);
    },

    postRole: async (data: Role): Promise<ApiResponse<Role>> => {
        return await apiClient.post(`${END_POINT}`, data);
    },

    putRole: async (data: Role): Promise<ApiResponse<Role>> => {
        return await apiClient.put(`${END_POINT}/${data.id}`, data);
    },

    deleteRole: async (id: number): Promise<ApiResponse<Role>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    },
};
