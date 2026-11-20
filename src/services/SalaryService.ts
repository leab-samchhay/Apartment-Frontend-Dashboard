import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { Salary } from "../model/Salary";

const END_POINT = "/Salary";

export const SalaryService = {
    getSalary: async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<PagedResponse<Salary>>> => {
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}&pagSize=${pageSize}`
        );
    },

    getAllSalary: async (): Promise<ApiResponse<Salary[]>> => {
        return await apiClient.get(`${END_POINT}/get-all`);
    },

    getSalaryById: async (id: number): Promise<ApiResponse<Salary>> => {
        return await apiClient.get(`${END_POINT}/${id}`);
    },

    postSalary: async (data: Salary): Promise<ApiResponse<Salary>> => {
        return await apiClient.post(`${END_POINT}`, data);
    },

    putSalary: async (id: number, data: Salary): Promise<ApiResponse<Salary>> => {
        return await apiClient.put(`${END_POINT}/${id}`, data);
    },

    saveSalary: async (id: number, data: Salary): Promise<ApiResponse<Salary>> => {
        if (id === 0) {
            return await SalaryService.postSalary(data);
        }
        return await SalaryService.putSalary(id, data);
    },

    deleteSalary: async (id: number): Promise<ApiResponse<Salary>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    }
};
