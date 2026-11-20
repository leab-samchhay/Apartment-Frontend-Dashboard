import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { StaffReq } from "../model/StaffReq";
import type { StaffRes } from "../model/StaffRes";
import type { Position } from "../model/Position";
import type { PagedResponse } from "../apis/pageResponse";
import { StaffService } from "../services/StaffService";
import { PositionService } from "../services/PositionService";
import { toast } from "react-toastify";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export const StaffPage = () => {
    const empty: StaffReq = {
        positionId: 0,
        name: "",
        nameKh: "",
        sex: "",
        dob: "",
        phone: "",
        address: "",
        email: "",
        identityNo: "",
        photo: null,
        status: 1
    };

    const [staffId, setStaffId] = useState<number>(0);
    const [formData, setFormData] = useState<StaffReq>(empty);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<StaffRes>>();
    const [positions, setPositions] = useState<Position[]>([]);

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true);
            const res = await StaffService.getStaffByPage(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchPositions = async () => {
        try {
            const res = await PositionService.getPosition(1, 10000);
            if (res.data?.data) {
                setPositions(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData(1, 10);
        fetchPositions();
    }, []);

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        setFormData({ ...formData, photo: file });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.positionId || formData.positionId === 0) {
            toast.error("Please select a Position");
            return;
        }

        if (staffId === 0 && !formData.photo) {
            toast.error("Please upload a photo for the new staff member");
            return;
        }

        setLoading(true);

        try {
            const response = await StaffService.saveStaff(staffId, formData);
            toast.success(response.message || "Saved staff successfully");
            setOpenModal(false);
            setFormData(empty);
            setPreviewImage(null);
            setStaffId(0);
            await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        } catch (error) {
            toast.error(`${error}`);
        }
        setLoading(false);
    };

    const handleEdit = (record: StaffRes) => {
        setStaffId(record.id);
        setFormData({
            positionId: record.positionId ?? 0,
            name: record.name ?? "",
            nameKh: record.nameKh ?? "",
            sex: record.sex ?? "",
            dob: record.dob ? record.dob.split("T")[0] : "",
            phone: record.phone ?? "",
            address: record.address ?? "",
            email: record.email ?? "",
            identityNo: record.identityNo ?? "",
            photo: null,
            status: record.status ?? 1
        });
        setPreviewImage(record.photo ? `http://localhost:5216/${record.photo.replace(/\\/g, "/")}` : null);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this staff record?")) {
            try {
                const res = await StaffService.deleteStaff(id);
                setOpenModal(false);
                await fetchData(pagination?.pageNumber, pagination?.pageSize);
                toast.success(res.message || "Deleted successfully");
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
            setFormData(empty);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "positionId" || name === "status" ? Number(value) : value
        });
    };

    const handleAdd = () => {
        setOpenModal(true);
        setFormData(empty);
        setPreviewImage(null);
        setStaffId(0);
    };

    const getPositionName = (posId?: number) => {
        if (!posId) return "-";
        const found = positions.find((p) => p.id === posId);
        return found ? found.positionName : `Position #${posId}`;
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Staff</h3>
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
                onHide={() => setOpenModal(false)}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {staffId > 0 ? "Edit Staff" : "Add New Staff"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frm">
                        <Row>
                            {/* Left Column for Inputs */}
                            <Col md={8}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Name English</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                placeholder="Enter English Name"
                                                required
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Name Khmer</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nameKh"
                                                value={formData.nameKh}
                                                placeholder="Enter Khmer Name"
                                                required
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Position</Form.Label>
                                            <Form.Select
                                                name="positionId"
                                                value={formData.positionId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value={0}>-- Select Position --</option>
                                                {positions.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.positionName} ({p.positionNameKh})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Sex</Form.Label>
                                            <Form.Select name="sex" value={formData.sex} onChange={handleChange} required>
                                                <option value="">Select Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Date of Birth</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Phone Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                placeholder="Enter phone number"
                                                required
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                placeholder="Enter email address"
                                                required
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">National ID / Identity No</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="identityNo"
                                                value={formData.identityNo}
                                                placeholder="Enter Identity No"
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Status</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                placeholder="Enter address"
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>

                            {/* Right Column for Image */}
                            <Col md={4} className="d-flex flex-column align-items-center justify-content-start pt-2">
                                <div
                                    className="border rounded mb-3 d-flex align-items-center justify-content-center shadow-sm"
                                    style={{
                                        width: "160px",
                                        height: "160px",
                                        overflow: "hidden",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <i className="fas fa-user text-secondary" style={{ fontSize: "100px" }}></i>
                                    )}
                                </div>
                                <Form.Group className="text-center d-flex flex-column align-items-center">
                                    <Form.Label htmlFor="staff-image-upload" className="btn btn-outline-success btn-sm mb-1 px-3">
                                        Upload Staff Photo
                                    </Form.Label>
                                    <Form.Control
                                        id="staff-image-upload"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleImageChange}
                                        className="d-none"
                                    />
                                    {formData.photo && (
                                        <div
                                            className="small text-muted text-truncate mt-1"
                                            style={{ maxWidth: "160px" }}
                                            title={formData.photo.name}
                                        >
                                            {formData.photo.name}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 justify-content-end">
                    <Button variant="light" onClick={() => setOpenModal(false)} className="border px-4" style={{ borderRadius: "10px" }}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" form="frm" className="btn-modern px-4" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
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
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="fw-semibold text-secondary">{index + 1}</td>
                                    <td>
                                        <div className="table-user-avatar" style={{ width: "36px", height: "36px" }}>
                                            {item.photo ? (
                                                <img
                                                    src={`http://localhost:5216/${item.photo.replace(/\\/g, "/")}`}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                item.name ? item.name.charAt(0).toUpperCase() : "S"
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column" style={{ lineHeight: 1.25 }}>
                                            <span className="fw-bold text-dark">{item.name}</span>
                                            <span className="text-secondary small">{item.nameKh}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge-role-purple">
                                            {getPositionName(item.positionId)}
                                        </span>
                                    </td>
                                    <td className="text-secondary">{item.phone || "-"}</td>
                                    <td className="text-secondary">{item.email || "-"}</td>
                                    <td>
                                        {item.status === 1 ? (
                                            <span className="badge-status-green">Active</span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-3 py-1">Inactive</span>
                                        )}
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
                            ))}
                        </tbody>
                    </table>

                    {/* Bottom-Right Pagination */}
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

export default StaffPage;
