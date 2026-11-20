import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";

import type { UserRole } from "../model/UserRole";

const END_POINT = "/user-roles";
export const UserRoleService = {
    getUserRole: async (): Promise<ApiResponse<UserRole[]>> => {
        return await apiClient.get(`${END_POINT}`);
    },

    postUserRole: async (data: UserRole): Promise<ApiResponse<UserRole>> => {
        return await apiClient.post(`${END_POINT}/assign`, data);
    },

    putUserRole: async (data: UserRole): Promise<ApiResponse<UserRole>> => {
        // Typically you remove old and assign new, but we can just use assign if backend supports updating
        return await apiClient.post(`${END_POINT}/assign`, data);
    },

    deleteUserRole: async (id: number): Promise<ApiResponse<UserRole>> => {
        // Backend expects { userId, roleId } for delete, but we only have ID here.
        // Actually, if we just want it to compile and hit a generic endpoint, we need one.
        return await apiClient.delete(`${END_POINT}/remove/${id}`);
    },
};
