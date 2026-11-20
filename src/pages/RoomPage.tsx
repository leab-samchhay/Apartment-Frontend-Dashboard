import type { Floor } from "../model/Floor";
import { useEffect, useState } from "react";
import { FloorService } from "../services/floorService";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import type { Room } from "../model/Room";
import type { RoomType } from "../model/RoomType";
import { RoomService } from "../services/RoomService";
import { RoomTypeService } from "../services/RoomTypeService";
import type { PagedResponse } from "../apis/pageResponse";

const RoomPage = () => {
    const emptyRoom: Room = {
        id: 0,
        room_no: "",
        roomtypeid: 0,
        servicecharge: 0,
        floorid: 0,
        roomkey: "",
        price: 0,
        status: "",
        note: ""
    };

    const [formData, setFormData] = useState<Room>(emptyRoom);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<Room>>();
    const [roomType, setRoomType] = useState<RoomType[]>([]);
    const [floor, setFloor] = useState<Floor[]>([]);

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            const res: any = await RoomService.getRoomAll(page, pageSize);
            
            // Accommodates both standard paged responses and raw array responses
            if (res.data?.data && Array.isArray(res.data.data)) {
                setPagination(res.data);
            } else if (Array.isArray(res.data)) {
                setPagination({
                    data: res.data,
                    pageNumber: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(res.data.length / pageSize) || 1,
                    totalRecords: res.data.length
                });
            } else if (Array.isArray(res)) {
                setPagination({
                    data: res,
                    pageNumber: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(res.length / pageSize) || 1,
                    totalRecords: res.length
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load rooms.");
        }
    };

    const fetchRoomType = async () => {
        try {
            const res: any = await RoomTypeService.getRoomType(1, 1000);
            setRoomType(res.data?.data || res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Room Types.");
        }
    };

    const fetchFloor = async () => {
        try {
            const res: any = await FloorService.getFloor(1, 10000);
            setFloor(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load Floors.");
        }
    };

    useEffect(() => {
        fetchData(1, 10);
        fetchRoomType();
        fetchFloor();
    }, []);

    const handleAdd = () => {
        setFormData(emptyRoom);
        setOpenModal(true);
    };

    const handleEdit = (record: Room) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const res: any = await RoomService.deleteRoom(id);
            const currentPage = pagination?.pageNumber || 1;
            const isLastItemOnPage = (pagination?.data?.length || 0) <= 1 && currentPage > 1;
            const pageToFetch = isLastItemOnPage ? currentPage - 1 : currentPage;
            await fetchData(pageToFetch, pagination?.pageSize || 10);
            toast.success(res?.message ?? "Deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete record.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.roomtypeid) {
            toast.error("Please select a room type.");
            return;
        }

        if (!formData.floorid) {
            toast.error("Please select a floor.");
            return;
        }

        try {
            if (formData.id > 0) {
                await RoomService.putRoom(formData);
            } else {
                await RoomService.postRoom(formData);
            }
            setOpenModal(false);
            await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
            toast.success("Saved data successfully.");
        } catch (err) {
            toast.error(`${err}`);
        } finally {
            setFormData(emptyRoom);
        }
    };

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize || 10);
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "number" ? Number(value) : value,
        });
    }

    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "status" ? value : Number(value),
        });
    }

    const getRoomTypeName = (id: number) =>
        roomType.find((b) => b.id === id)?.roomTypeName ?? id.toString();

    const getFloorNo = (id: number) =>
        floor.find((f) => f.id === id)?.floorNo ?? id.toString();

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Room</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            <Modal show={openModal} onHide={() => setOpenModal(false)} backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {formData.id > 0 ? "Edit Room" : "Add Room"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frm">
                        <div className="grid grid-cols-2 gap-2">
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">ID</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="id" 
                                    value={formData.id} 
                                    readOnly 
                                    disabled 
                                    className="bg-light" 
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Room No</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="room_no"
                                    value={formData.room_no}
                                    placeholder="Enter room_no"
                                    required
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Room Type</Form.Label>
                                <Form.Select
                                    name="roomtypeid"
                                    value={formData.roomtypeid}
                                    required
                                    onChange={handleSelectChange}
                                >
                                    <option value={0}>Select RoomType</option>
                                    {roomType.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.roomTypeName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Floor</Form.Label>
                                <Form.Select
                                    name="floorid"
                                    value={formData.floorid}
                                    required
                                    onChange={handleSelectChange}
                                >
                                    <option value={0}>Select Floor</option>
                                    {floor.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.floorNo}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Service Charge</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="servicecharge"
                                    value={formData.servicecharge}
                                    placeholder="Enter service charge"
                                    required
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Room Key</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="roomkey"
                                    value={formData.roomkey}
                                    placeholder="Enter room key"
                                    required
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    placeholder="Enter price"
                                    required
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    required
                                    onChange={handleSelectChange}
                                >
                                    <option value="">Select status</option>
                                    <option value="1">Available</option>
                                    <option value="Booked">Booked</option>
                                    <option value="0">Booked (0)</option>
                                    <option value="CheckIn">CheckIn</option>
                                    <option value="CheckedIn">CheckedIn</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Note</Form.Label>
                            <Form.Control
                                type="text"
                                name="note"
                                value={formData.note}
                                placeholder="Enter note"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0">
                    <Button 
                        variant="light" 
                        onClick={() => setOpenModal(false)} 
                        className="border px-4" 
                        style={{ borderRadius: '10px' }}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" form="frm" className="btn-modern px-4">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Blue Header List Table */}
            {pagination && pagination.data && (
                <div className="table-responsive">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>No</th>
                                <th>Room No</th>
                                <th>RoomType</th>
                                <th>Service</th>
                                <th>Floor</th>
                                <th>RoomKey</th>
                                <th>Price</th>
                                <th>Note</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.data.length > 0 ? (
                                pagination.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="fw-semibold text-secondary">
                                            {(pagination.pageNumber - 1) * (pagination.pageSize || 10) + (index + 1)}
                                        </td>
                                        <td className="fw-bold text-dark">{item.room_no}</td>
                                        <td className="text-secondary">{getRoomTypeName(item.roomtypeid)}</td>
                                        <td className="text-secondary">{item.servicecharge}</td>
                                        <td className="text-secondary">{getFloorNo(item.floorid)}</td>
                                        <td className="text-secondary">{item.roomkey}</td>
                                        <td className="text-secondary">{item.price}</td>
                                        <td className="text-secondary">{item.note}</td>
                                        <td>
                                            {(() => {
                                                const s = String(item.status ?? "").trim();
                                                const sLower = s.toLowerCase();
                                                if (s === "1" || sLower === "available") {
                                                    return <span className="badge-status-green">Available</span>;
                                                }
                                                if (sLower === "checkin" || sLower === "checkedin") {
                                                    return <span className="badge-status-blue">{s || "CheckIn"}</span>;
                                                }
                                                if (sLower === "pending") {
                                                    return <span className="badge-status-orange">Pending</span>;
                                                }
                                                return <span className="badge-status-red">{s === "0" ? "Booked" : (s || "Booked")}</span>;
                                            })()}
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
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="text-center py-4 text-muted">
                                        No room records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Bottom-Right Pagination */}
                    <div className="pagination-image-style">
                        <div 
                            className={`nav-arrow ${pagination.pageNumber === 1 ? 'disabled' : ''}`}
                            onClick={() => pagination.pageNumber > 1 && handlePageChange(1)}
                            title="First Page"
                        >
                            &laquo;
                        </div>
                        <div 
                            className={`nav-arrow ${pagination.pageNumber === 1 ? 'disabled' : ''}`}
                            onClick={() => pagination.pageNumber > 1 && handlePageChange(pagination.pageNumber - 1)}
                            title="Previous Page"
                        >
                            &lsaquo;
                        </div>
                        <div className="page-number-pill">
                            {pagination.pageNumber} / {pagination.totalPages || 1}
                        </div>
                        <div 
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? 'disabled' : ''}`}
                            onClick={() => pagination.pageNumber < (pagination.totalPages || 1) && handlePageChange(pagination.pageNumber + 1)}
                            title="Next Page"
                        >
                            &rsaquo;
                        </div>
                        <div 
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? 'disabled' : ''}`}
                            onClick={() => pagination.pageNumber < (pagination.totalPages || 1) && handlePageChange(pagination.totalPages)}
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

export default RoomPage;
