import type { BookingItem } from "../model/BookingItem";
import { useEffect, useState } from "react";
import { BookingItemService } from "../services/BookingItemService";
import type { PagedResponse } from "../apis/pageResponse";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import type { GuestRes } from "../model/GuestRes";
import type { Room } from "../model/Room";
import type { ExchangeRate } from "../model/ExchangeRate";
import type { User } from "../model/User";
import { GuestService } from "../services/GuestService";
import { RoomService } from "../services/RoomService";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { UserService } from "../services/UserService";

const today = new Date().toISOString().split("T")[0];

// Format ISO date → DD/MM/YYYY
const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// Format ISO date → YYYY-MM-DD for HTML <input type="date">
const formatDateForInput = (dateVal?: string | Date | null): string => {
    if (!dateVal) return today;
    if (dateVal instanceof Date) return dateVal.toISOString().split("T")[0];
    const s = String(dateVal);
    return s.includes("T") ? s.split("T")[0] : s.slice(0, 10);
};

// Format ISO date → DD-MMM-YYYY (e.g., 28-Oct-2026)
const formatDdMmmYyyy = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-US", { month: "short" });
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
};

// Generate unique booking number (e.g. BK-2610-8432)
const generateBookingNo = (): string => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BK-${timestamp}-${random}`;
};

const emptyBooking: BookingItem = {
    bookingNo: "",
    bookingDate: today,
    guestId: 0,
    userId: 0,
    roomId: 0,
    exchangeId: null,
    total: 0,
    payDollar: 0,
    payRiel: 0,
    updateBy: null,
    updateDate: null,
    checkInDate: today,
    expireDate: today,
    status: "Booked",
    note: "",
};

const getStatusBadgeClass = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case "active":
        case "checkedin":
        case "checkin":
            return "badge-status-green";
        case "booked":
            return "badge-status-blue";
        case "pending":
            return "badge-status-orange";
        case "cancelled":
        case "expired":
        case "checkout":
        case "checkedout":
            return "badge-status-red";
        default:
            return "badge-status-blue";
    }
};

const Booking = () => {
    const [formData, setFormData] = useState<BookingItem>(emptyBooking);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<BookingItem>>();
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    // Dropdown data
    const [guests, setGuests] = useState<GuestRes[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            const res = await BookingItemService.getAll(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error("fetchData error:", error);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [gRes, rRes, eRes, uRes] = await Promise.all([
                GuestService.getGuestByPage(1, 1000),
                RoomService.getRoomAll(1, 1000),
                ExchangeRateService.getAllExchangeRates(),
                UserService.getUser(1, 1000),
            ]);

            // Guest: paged response → data.data
            const gData = gRes.data?.data ?? gRes.data ?? [];
            setGuests(Array.isArray(gData) ? gData : []);

            // Room: API may return array directly (res.data) OR paged (res.data.data)
            const rRaw = rRes as any;
            if (Array.isArray(rRaw?.data?.data)) {
                setRooms(rRaw.data.data);
            } else if (Array.isArray(rRaw?.data)) {
                setRooms(rRaw.data);
            } else if (Array.isArray(rRaw)) {
                setRooms(rRaw);
            } else {
                setRooms([]);
            }

            // ExchangeRate: returns array directly
            const eRaw = eRes as any;
            if (Array.isArray(eRaw?.data)) {
                setExchangeRates(eRaw.data);
            } else if (Array.isArray(eRaw)) {
                setExchangeRates(eRaw);
            } else {
                setExchangeRates([]);
            }

            // Users / Staff
            const uRaw = uRes as any;
            if (Array.isArray(uRaw?.data?.data)) {
                setUsers(uRaw.data.data);
            } else if (Array.isArray(uRaw?.data)) {
                setUsers(uRaw.data);
            } else if (Array.isArray(uRaw)) {
                setUsers(uRaw);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("fetchDropdowns error:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchDropdowns();
    }, []);

    const handleAdd = () => {
        const sessionUsername = sessionStorage.getItem("username");
        const matchedUser = sessionUsername ? users.find((u) => u.username === sessionUsername) : null;
        const defaultUserId = matchedUser?.id || (users.length > 0 ? users[0].id : 0);

        setFormData({
            ...emptyBooking,
            bookingNo: generateBookingNo(),
            bookingDate: today,
            checkInDate: today,
            expireDate: today,
            userId: defaultUserId,
            status: "Booked",
        });
        setOpenModal(true);
    };

    const handleEdit = (record: BookingItem) => {
        setFormData({
            ...record,
            bookingDate: formatDateForInput(record.bookingDate || (record as any).BookingDate),
            checkInDate: formatDateForInput(record.checkInDate || (record as any).CheckInDate),
            expireDate: formatDateForInput(record.expireDate || (record as any).ExpireDate),
            guestId: Number(record.guestId ?? (record as any).GuestId) || 0,
            roomId: Number(record.roomId ?? (record as any).RoomId) || 0,
            userId: Number(record.userId ?? (record as any).UserId) || 0,
            exchangeId: record.exchangeId && Number(record.exchangeId) > 0 ? Number(record.exchangeId) : null,
            total: Number(record.total ?? (record as any).Total) || 0,
            payDollar: Number(record.payDollar ?? (record as any).PayDollar) || 0,
            payRiel: Number(record.payRiel ?? (record as any).PayRiel) || 0,
            status: record.status || (record as any).Status || "Booked",
            note: record.note || (record as any).Note || "",
        });
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await BookingItemService.deleteBooking(id);
                setOpenModal(false);
                await fetchData(pagination?.pageNumber, pagination?.pageSize);
                toast.success(res.message || "Booking deleted successfully!");
            } catch (error) {
                console.error(error);
                toast.error(typeof error === "string" ? error : "Failed to delete booking.");
            }
            setFormData(emptyBooking);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 1. Frontend validations for required backend fields
        if (!formData.bookingNo || formData.bookingNo.trim() === "") {
            toast.warning("Please enter or generate a Booking Number.");
            return;
        }
        if (!formData.guestId || Number(formData.guestId) <= 0) {
            toast.warning("Please select a Guest.");
            return;
        }
        if (!formData.roomId || Number(formData.roomId) <= 0) {
            toast.warning("Please select a Room.");
            return;
        }
        if (!formData.userId || Number(formData.userId) <= 0) {
            toast.warning("Please select a Staff / User handling this booking.");
            return;
        }

        const payload: BookingItem = {
            ...formData,
            bookingNo: formData.bookingNo.trim(),
            guestId: Number(formData.guestId),
            roomId: Number(formData.roomId),
            userId: Number(formData.userId),
            exchangeId: formData.exchangeId && Number(formData.exchangeId) > 0 ? Number(formData.exchangeId) : null,
            total: Number(formData.total) || 0,
            payDollar: Number(formData.payDollar) || 0,
            payRiel: Number(formData.payRiel) || 0,
            status: formData.status || "Booked",
            note: formData.note || "",
        };

        setLoadingSubmit(true);
        try {
            if (formData.id && formData.id > 0) {
                await BookingItemService.putBooking(payload);
                toast.success("Updated booking successfully!");
            } else {
                await BookingItemService.postBooking(payload);
                toast.success("Created new booking successfully!");
            }
            setOpenModal(false);
            await fetchData(pagination?.pageNumber, pagination?.pageSize);
            setFormData(emptyBooking);
        } catch (error) {
            console.error("Booking save error:", error);
            toast.error(typeof error === "string" ? error : "Failed to save booking. Please check required fields.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]:
                    name === "guestId" || name === "roomId" || name === "userId" || type === "number"
                        ? (value === "" ? 0 : Number(value))
                        : name === "exchangeId"
                        ? (value === "" || Number(value) <= 0 ? null : Number(value))
                        : value,
            };

            // Auto-fill price from Room if Total is 0
            if (name === "roomId") {
                const selectedRoom = rooms.find((r) => r.id === Number(value));
                if (selectedRoom && selectedRoom.price && (!prev.total || Number(prev.total) === 0)) {
                    const price = Number(selectedRoom.price);
                    updated.total = price;
                    updated.payDollar = price;
                    const exId = updated.exchangeId ? Number(updated.exchangeId) : null;
                    if (exId) {
                        const foundEx = exchangeRates.find((ex) => ex.id === exId);
                        if (foundEx) {
                            updated.payRiel = Math.round(price * Number(foundEx.rate));
                        }
                    }
                }
            }

            // Auto-calculate Pay Riel if Pay Dollar or Exchange Rate changes
            if (name === "payDollar" || name === "exchangeId") {
                const exId = name === "exchangeId" ? Number(value) : Number(prev.exchangeId);
                const dollar = name === "payDollar" ? Number(value) : Number(prev.payDollar);
                const foundEx = exchangeRates.find((ex) => ex.id === exId);
                if (foundEx && dollar) {
                    updated.payRiel = Math.round(dollar * Number(foundEx.rate));
                }
            }

            return updated;
        });
    };

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Bookings</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            <Modal
                show={openModal}
                onHide={() => !loadingSubmit && setOpenModal(false)}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {formData.id && formData.id > 0 ? "Edit Booking" : "Add Booking"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frm">
                        <div className="row">
                            {/* Booking No */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small text-muted font-weight-bold mb-0">
                                            Booking No <span className="text-danger">*</span>
                                        </Form.Label>
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm text-decoration-none p-0 text-primary"
                                            style={{ fontSize: "11px" }}
                                            onClick={() => setFormData((prev) => ({ ...prev, bookingNo: generateBookingNo() }))}
                                            title="Click to generate random booking reference"
                                        >
                                            <i className="fas fa-magic me-1"></i>Auto Generate
                                        </button>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        name="bookingNo"
                                        value={formData.bookingNo}
                                        placeholder="Enter booking number"
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Booking Date */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Booking Date <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="bookingDate"
                                        value={formData.bookingDate}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Guest */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Guest <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="guestId"
                                        value={formData.guestId ?? 0}
                                        required
                                        onChange={handleChange}
                                    >
                                        <option value={0}>-- Select Guest --</option>
                                        {guests.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name} {g.nameKh ? `(${g.nameKh})` : ""} {g.phone ? `- ${g.phone}` : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            {/* Room */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Room <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="roomId"
                                        value={formData.roomId ?? 0}
                                        required
                                        onChange={handleChange}
                                    >
                                        <option value={0}>-- Select Room --</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                Room {r.room_no} {r.price ? `($${r.price})` : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            {/* Staff / Handled By (UserId) */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Handled By (Staff) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="userId"
                                        value={formData.userId ?? 0}
                                        required
                                        onChange={handleChange}
                                    >
                                        <option value={0}>-- Select Staff / User --</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.username} {u.email ? `(${u.email})` : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            {/* Exchange Rate */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Exchange Rate</Form.Label>
                                    <Form.Select
                                        name="exchangeId"
                                        value={formData.exchangeId && Number(formData.exchangeId) > 0 ? Number(formData.exchangeId) : ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Select Exchange Rate (Optional) --</option>
                                        {exchangeRates.map((ex) => (
                                            <option key={ex.id} value={ex.id}>
                                                {ex.rate} {ex.dateT ? `(${formatDdMmmYyyy(ex.dateT)})` : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            {/* Total */}
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Total ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        name="total"
                                        value={formData.total}
                                        min={0}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Pay Dollar */}
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Pay Dollar ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        name="payDollar"
                                        value={formData.payDollar}
                                        min={0}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Pay Riel */}
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Pay Riel (៛)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="payRiel"
                                        value={formData.payRiel}
                                        min={0}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Check-In Date */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Check-In Date <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkInDate"
                                        value={formData.checkInDate}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Expire Date */}
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Expire Date <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="expireDate"
                                        value={formData.expireDate}
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            {/* Status */}
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">
                                        Status <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        required
                                        onChange={handleChange}
                                    >
                                        <option value="Booked">Booked</option>
                                        <option value="CheckIn">CheckIn</option>
                                        <option value="CheckedIn">CheckedIn</option>
                                        <option value="CheckOut">CheckOut</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            {/* Note */}
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Note</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="note"
                                        value={formData.note ?? ""}
                                        placeholder="Enter note (optional)"
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0">
                    <Button
                        variant="light"
                        disabled={loadingSubmit}
                        onClick={() => setOpenModal(false)}
                        className="border px-4"
                        style={{ borderRadius: "10px" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="frm"
                        disabled={loadingSubmit}
                        className="btn-modern px-4"
                    >
                        {loadingSubmit ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Table */}
            {pagination && pagination.data && (
                <div className="table-responsive">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "50px" }}>No</th>
                                <th>Booking No</th>
                                <th>Booking Date</th>
                                <th>Guest</th>
                                <th>Room</th>
                                <th>Staff</th>
                                <th>Check-In</th>
                                <th>Expire</th>
                                <th>Total ($)</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-4 text-muted">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                pagination.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="fw-semibold text-secondary">{index + 1}</td>
                                        <td className="fw-bold text-dark">{item.bookingNo || (item as any).BookingNo}</td>
                                        <td className="text-secondary">{formatDate(item.bookingDate || (item as any).BookingDate)}</td>
                                        <td className="text-secondary">
                                            {guests.find((g) => g.id === (item.guestId ?? (item as any).GuestId))?.name ?? (item.guestId ?? (item as any).GuestId ?? "-")}
                                        </td>
                                        <td className="text-secondary">
                                            {rooms.find((r) => r.id === (item.roomId ?? (item as any).RoomId))?.room_no
                                                ? `Room ${rooms.find((r) => r.id === (item.roomId ?? (item as any).RoomId))?.room_no}`
                                                : (item.roomId ?? (item as any).RoomId ?? "-")}
                                        </td>
                                        <td className="text-secondary">
                                            {users.find((u) => u.id === (item.userId ?? (item as any).UserId))?.username ?? (item.userId ?? (item as any).UserId ?? "-")}
                                        </td>
                                        <td className="text-secondary">{formatDate(item.checkInDate || (item as any).CheckInDate)}</td>
                                        <td className="text-secondary">{formatDate(item.expireDate || (item as any).ExpireDate)}</td>
                                        <td className="text-secondary font-weight-bold">
                                            ${Number(item.total ?? (item as any).Total ?? 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(item.status || (item as any).Status)}>
                                                {item.status || (item as any).Status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="action-buttons-group justify-content-center">
                                                <button
                                                    type="button"
                                                    className="btn-circle-edit"
                                                    title="Edit"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-circle-delete"
                                                    title="Delete"
                                                    onClick={() => handleDelete(item.id!)}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="pagination-image-style">
                        <div
                            className={`nav-arrow ${pagination.pageNumber === 1 ? "disabled" : ""}`}
                            onClick={() => pagination.pageNumber > 1 && handlePageChange(1)}
                            title="First Page"
                        >
                            &laquo;
                        </div>
                        <div
                            className={`nav-arrow ${pagination.pageNumber === 1 ? "disabled" : ""}`}
                            onClick={() => pagination.pageNumber > 1 && handlePageChange(pagination.pageNumber - 1)}
                            title="Previous Page"
                        >
                            &lsaquo;
                        </div>
                        <div className="page-number-pill">
                            {pagination.pageNumber} / {pagination.totalPages || 1}
                        </div>
                        <div
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? "disabled" : ""}`}
                            onClick={() => pagination.pageNumber < pagination.totalPages && handlePageChange(pagination.pageNumber + 1)}
                            title="Next Page"
                        >
                            &rsaquo;
                        </div>
                        <div
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? "disabled" : ""}`}
                            onClick={() => pagination.pageNumber < pagination.totalPages && handlePageChange(pagination.totalPages)}
                            title="Last Page"
                        >
                            &raquo;
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
