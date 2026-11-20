import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { OrtherExpens } from "../model/OrtherExpens";

const END_POINT = "/OrtherExpens";

const buildFormData = (data: Partial<OrtherExpens>): FormData => {
    const formData = new FormData();

    if (data.date) formData.append("date", data.date);
    if (data.expenseTypeId !== undefined && data.expenseTypeId !== null) {
        formData.append("expenseTypeId", data.expenseTypeId.toString());
    }
    if (data.amount !== undefined && data.amount !== null) {
        formData.append("amount", data.amount.toString());
    }
    if (data.note) formData.append("note", data.note);

    const storedRole = sessionStorage.getItem("role") || "Admin";
    const cleanedRole = storedRole.replace(/["[\]]/g, "") || "Admin";
    formData.append("createBy", data.createBy || cleanedRole);

    // Append image only if a new File was selected
    if (data.image instanceof File) {
        formData.append("Image", data.image);
    }

    return formData;
};

export const OrtherExpenseService = {
    getOrtherExpenseByPage: async (
        page: number = 1,
        pageSize: number = 10
    ): Promise<ApiResponse<PagedResponse<OrtherExpens>>> => {
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`
        );
    },

    getOrtherExpenseById: async (id: number): Promise<ApiResponse<OrtherExpens>> => {
        return await apiClient.get(`${END_POINT}/${id}`);
    },

    createOrtherExpense: async (data: OrtherExpens): Promise<ApiResponse<OrtherExpens>> => {
        const formData = buildFormData(data);
        return await apiClient.post(`${END_POINT}`, formData);
    },

    updateOrtherExpense: async (
        id: number,
        data: OrtherExpens
    ): Promise<ApiResponse<OrtherExpens>> => {
        const formData = buildFormData(data);
        return await apiClient.put(`${END_POINT}?id=${id}`, formData);
    },

    saveOrtherExpense: async (
        id: number,
        data: OrtherExpens
    ): Promise<ApiResponse<OrtherExpens>> => {
        if (!id || id === 0) {
            return await OrtherExpenseService.createOrtherExpense(data);
        }
        return await OrtherExpenseService.updateOrtherExpense(id, data);
    },

    deleteOrtherExpense: async (id: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.delete(`${END_POINT}?id=${id}`);
    },
};

export default OrtherExpenseService;
