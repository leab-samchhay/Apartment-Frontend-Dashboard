import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { PagedResponse } from "../apis/pageResponse";
import type { ExpenType } from "../model/ExpenType";

const END_POINT = "/ExpensType";
const ExpenTypeService = {
    getExpentType: async(
        page: number, 
        pageSize: number,
    ): Promise<ApiResponse<PagedResponse<ExpenType>>> =>{
        return await apiClient.get(
            `${END_POINT}?page=${page}&pageSize=${pageSize}`,
        );
    },

    postExpenType: async(data: ExpenType): Promise<ApiResponse<ExpenType>> =>{
        return await apiClient.post(`${END_POINT}`,data);
    },

    putExpenType: async(data: ExpenType): Promise<ApiResponse<ExpenType>> =>{
        return await apiClient.put(`${END_POINT}?id=${data.id}`,data);
    },

    deleteExpenType: async(id: number): Promise<ApiResponse<ExpenType>> =>{
        return await apiClient.delete(`${END_POINT}?id=${id}`);
    },

}

export default ExpenTypeService