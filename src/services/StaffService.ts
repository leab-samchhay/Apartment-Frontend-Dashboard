import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { StaffReq } from "../model/StaffReq";
import type { StaffRes } from "../model/StaffRes";

const END_POINT = "/Staff";

const buildFormData = (data: StaffReq): FormData => {
    const formData = new FormData();
    if (data.positionId && data.positionId > 0) {
        formData.append("positionId", data.positionId.toString());
    }
    formData.append("name", data.name || "");
    formData.append("nameKh", data.nameKh || "");
    formData.append("sex", data.sex || "");
    if (data.dob && data.dob.trim() !== "") {
        formData.append("dob", data.dob);
    }
    formData.append("phone", data.phone || "");
    formData.append("address", data.address || "");
    formData.append("email", data.email || "");
    formData.append("identityNo", data.identityNo || "");
    formData.append("status", (data.status ?? 1).toString());
    if (data.photo) {
        formData.append("photo", data.photo);
    }

    const storedRole = sessionStorage.getItem("role") || "Admin";
    const cleanedRole = storedRole.replace(/["[\]]/g, "") || "Admin";
    formData.append("createBy", data.createBy || cleanedRole);
    formData.append("createAt", data.createAt || new Date().toISOString());

    return formData;
};

export const StaffService = {
    getStaffByPage: async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<PagedResponse<StaffRes>>> => {
        return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
    },

    getAllStaff: async (): Promise<ApiResponse<StaffRes[]>> => {
        return await apiClient.get(`${END_POINT}/get-All`);
    },

    getStaffById: async (id: number): Promise<ApiResponse<StaffRes>> => {
        return await apiClient.get(`${END_POINT}/${id}`);
    },

    createStaff: async (data: StaffReq): Promise<ApiResponse<StaffRes>> => {
        const formData = buildFormData(data);
        return await apiClient.post(`${END_POINT}`, formData);
    },

    updateStaff: async (id: number, data: StaffReq): Promise<ApiResponse<StaffRes>> => {
        const formData = buildFormData(data);
        return await apiClient.put(`${END_POINT}/${id}`, formData);
    },

    saveStaff: async (staffId: number, data: StaffReq): Promise<ApiResponse<StaffRes>> => {
        if (staffId === 0) {
            return await StaffService.createStaff(data);
        }
        return await StaffService.updateStaff(staffId, data);
    },

    deleteStaff: async (id: number): Promise<ApiResponse<StaffRes>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    }
};
