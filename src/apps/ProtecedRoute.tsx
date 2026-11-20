import { Navigate, Outlet } from "react-router-dom";


export const ProtecedRoute = () => {
    const token = sessionStorage.getItem("token");
    if(!token){
        return <Navigate to="/login" />
    }
    return <Outlet/>
}
