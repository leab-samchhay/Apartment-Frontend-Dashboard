import apiClient from "../apis/apiClient";
import type { ApiResponse } from "../apis/apiResponse";
import type { DashboardReport } from "../model/DashboardReport";

const END_POINT = "/DashboardReport"
export const DashboardReportService = {
  getReportAll: async (
    year?: number,
    month?: number
  ): Promise<ApiResponse<DashboardReport>> => {
    return await apiClient.get(
      `${END_POINT}?year=${year ?? ""}&month=${month ?? ""}`
    );
  },
};