import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { AuthRes } from "../model/AuthRes";
import type { AuthLogin } from "../model/AuthLogin";

const END_POINT = "/User";

export const AuthService = {
    login: async (data: AuthLogin): Promise<ApiResponse<AuthRes>> =>{
        return await apiClient.post(`${END_POINT}/login`,data);
    },
};