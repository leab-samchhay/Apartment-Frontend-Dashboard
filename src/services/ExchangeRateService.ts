import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { ExchangeRate, ExchangeRateReq } from "../model/ExchangeRate";

const END_POINT = "/ExchangeRate";

export const ExchangeRateService = {
    // GET (Paged): /api/ExchangeRate?page=1&pageSize=10
    getExchangeRates: async (page?: number, pageSize?: number): Promise<ApiResponse<PagedResponse<ExchangeRate>>> => {
        return await apiClient.get(`${END_POINT}?page=${page}&pageSize=${pageSize}`);
    },

    // GET (All): /api/ExchangeRate/get-all
    getAllExchangeRates: async (): Promise<ApiResponse<ExchangeRate[]>> => {
        return await apiClient.get(`${END_POINT}/get-all`);
    },

    // GET by ID: /api/ExchangeRate/get-byid/{id}
    getExchangeRateById: async (id: number): Promise<ApiResponse<ExchangeRate>> => {
        return await apiClient.get(`${END_POINT}/get-byid/${id}`);
    },

    // INSERT (POST): /api/ExchangeRate
    postExchangeRate: async (data: ExchangeRateReq): Promise<ApiResponse<ExchangeRate>> => {
        return await apiClient.post(`${END_POINT}`, data);
    },

    // UPDATE (PUT): /api/ExchangeRate/{id}
    putExchangeRate: async (id: number, data: ExchangeRateReq): Promise<ApiResponse<ExchangeRate>> => {
        return await apiClient.put(`${END_POINT}/${id}`, data);
    },

    // Save helper (dispatches to POST or PUT)
    saveExchangeRate: async (id: number, data: ExchangeRateReq): Promise<ApiResponse<ExchangeRate>> => {
        if (id === 0) {
            return await ExchangeRateService.postExchangeRate(data);
        }
        return await ExchangeRateService.putExchangeRate(id, data);
    },

    // DELETE: /api/ExchangeRate/{id}
    deleteExchangeRate: async (id: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.delete(`${END_POINT}/${id}`);
    }
};
