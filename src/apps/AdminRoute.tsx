import { Navigate, Outlet } from "react-router-dom";

export const AdminRoute = () => {
    const roleStr = sessionStorage.getItem("role");
    const isAdmin = roleStr ? roleStr.includes("Admin") : false;

    if (!isAdmin) {
        return <Navigate to="/" />;
    }
    return <Outlet />;
};
