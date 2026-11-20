import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { GuestReq } from "../model/GuestReq";
import type { GuestRes } from "../model/GuestRes";

const END_POINT = "/Guest";

export const GuestService = {
    getGuestByPage: async (page: number, pageSize: number): Promise<ApiResponse<PagedResponse<GuestRes>>> => {
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`,
        );
    },

    createGuest: async (data: GuestReq): Promise<ApiResponse<GuestRes>> => {
        const formData = new FormData();
        formData.append("name", data.name ?? "");
        formData.append("nameKh", data.nameKh ?? "");
        formData.append("sex", data.sex ?? "");
        if (data.dob) {
            formData.append("dob", data.dob);
        }
        formData.append("address", data.address ?? "");
        formData.append("nationality", data.nationality ?? "");
        formData.append("phone", data.phone ?? "");
        formData.append("email", data.email ?? "");
        formData.append("ssn", data.ssn ?? "");
        formData.append("passport", data.passport ?? "");
        formData.append("status", data.status || "Active");
        if (data.image) {
            formData.append("ImagePath", data.image);
        }

        return await apiClient.post(`${END_POINT}`, formData);
    },

    saveGuest: async (guestId: number, data: GuestReq): Promise<ApiResponse<GuestRes>> => {
        const validId = Number(guestId) || 0;
        const formData = new FormData();

        if (validId > 0) {
            formData.append("id", validId.toString());
        }
        formData.append("name", data.name ?? "");
        formData.append("nameKh", data.nameKh ?? "");
        formData.append("sex", data.sex ?? "");
        if (data.dob) {
            formData.append("dob", data.dob);
        }
        formData.append("address", data.address ?? "");
        formData.append("nationality", data.nationality ?? "");
        formData.append("phone", data.phone ?? "");
        formData.append("email", data.email ?? "");
        formData.append("ssn", data.ssn ?? "");
        formData.append("passport", data.passport ?? "");
        formData.append("status", data.status || "Active");
        if (data.image) {
            formData.append("ImagePath", data.image);
        }
        
        if (validId <= 0) {
            return await apiClient.post(`${END_POINT}`, formData);
        }

        return await apiClient.put(`${END_POINT}/${validId}?id=${validId}`, formData);
    },

    deleteGuest: async (id: number): Promise<ApiResponse<GuestRes>> => {
        const validId = Number(id) || 0;
        return await apiClient.delete(`${END_POINT}/${validId}?id=${validId}`);
    }
};
