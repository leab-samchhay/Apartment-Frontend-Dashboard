export interface StaffReq {
    positionId: number;
    name: string;
    nameKh: string;
    sex: string;
    dob: string;
    phone: string;
    address: string;
    email: string;
    identityNo: string;
    photo: File | null;
    status: number;
    createBy?: string;
    createAt?: string;
}
