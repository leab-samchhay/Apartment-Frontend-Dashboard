import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { User } from "../model/User";

const END_POINT = "/User";
export const UserService = {
    getUser: async (
        page: number,
        pageSize: number,
    ): Promise<ApiResponse<PagedResponse<User>>> => {
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`,
        );
    },

    postUser: async (data: User): Promise<ApiResponse<User>> => {
        return await apiClient.post(`${END_POINT}/register`, data);
    },

    putUser: async (data: User): Promise<ApiResponse<User>> => {
        return await apiClient.put(`${END_POINT}/${data.id}`, data);
    },

    deleteUser: async (id: number): Promise<ApiResponse<User>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    },
};
