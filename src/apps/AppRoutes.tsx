import { LoginPage } from "../pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtecedRoute } from "./ProtecedRoute";
import { MainLayout } from "../layout/MainLayout";
// import { HomePage } from "../pages/dashboard/HomePage"
import { AboutePage } from "../pages/AboutePage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import BuildingPage from "../pages/BuildingPage";
import FloorPage from "../pages/FloorPage";
import RoomTypePage from "../pages/RoomTypePage";
import { GuestPage } from "../pages/GuestPage";
import { StaffPage } from "../pages/StaffPage";
import SalaryPage from "../pages/SalaryPage";
import ExchangeRatePage from "../pages/ExchangeRatePage";
import UserPage from "../pages/UserPage";
import RolePage from "../pages/RolePage";
import UserRolePage from "../pages/UserRolePage";
import PositionPage from "../pages/PositionPage";
import BookingTransaction from "../pages/BookingTransaction";
import RoomPage from "../pages/RoomPage";
import Booking from "../pages/Booking";
import ExpenTypePage from "../pages/ExpenTypePage";
import OrtherExpensPage from "../pages/OrtherExpentPage";
import HomePage from "../pages/HomePage";
import CheckOut from "../pages/CheckOut";

export const AppRoutes = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Layout Route  */}
          <Route element={<ProtecedRoute />}>
            <Route path="/" element={<MainLayout />}>
              {/* <Route index element={<HomePage/>} ></Route> */}
              <Route index element={<HomePage />}></Route>
              <Route path="/about" element={<AboutePage />}></Route>
              <Route path="/privacy" element={<PrivacyPage />}></Route>
              <Route path="/building" element={<BuildingPage />}></Route>
              <Route path="/floor" element={<FloorPage />}></Route>
              <Route path="/roomType" element={<RoomTypePage />}></Route>
              <Route path="/guest" element={<GuestPage />}></Route>
              <Route path="/staff" element={<StaffPage />}></Route>
              <Route path="/salary" element={<SalaryPage />}></Route>
              <Route path="/checkout" element={<CheckOut/>}></Route>
              <Route
                path="/exchangeRate"
                element={<ExchangeRatePage />}
              ></Route>
              <Route path="/position" element={<PositionPage />}></Route>
              <Route
                path="/bookingTransaction"
                element={<BookingTransaction />}
              ></Route>
              <Route path="/room" element={<RoomPage />}></Route>
              <Route path="/booking" element={<Booking />}></Route>
              <Route path="/expentype" element={<ExpenTypePage />}></Route>
              <Route
                path="/orhterexpent"
                element={<OrtherExpensPage />}
              ></Route>

              <Route path="/user" element={<UserPage />}></Route>
              <Route path="/role" element={<RolePage />}></Route>
              <Route path="/userRole" element={<UserRolePage />}></Route>
            </Route>

            {/* NotFound 404 */}
            <Route path="*" element={<NotFoundPage />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRoutes;
