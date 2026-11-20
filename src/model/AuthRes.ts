export interface AuthRes {
    user: {
        id: number;
        username: string;
        email: string;
        fullName?: string;
    };
    token: string;
    roles: {
        id: number;
        name: string;
    }[];
}