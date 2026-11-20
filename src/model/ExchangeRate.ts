export interface ExchangeRate {
    id: number;
    dateT: string;
    rate: number;
    status: string;
    isDelete?: boolean;
}

export interface ExchangeRateReq {
    dateT: string;
    rate: number;
    status: string;
}
