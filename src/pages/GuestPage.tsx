import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { GuestReq } from "../model/GuestReq";
import type { PagedResponse } from "../apis/pageResponse";
import type { GuestRes } from "../model/GuestRes";
import { GuestService } from "../services/GuestService";
import { toast } from "react-toastify";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export const GuestPage = () => {

    const empty: GuestReq = {
        name: "",
        nameKh: "",
        sex: "",
        dob: "",
        address: "",
        nationality: "",
        phone: "",
        email: "",
        ssn: "",
        passport: "",
        status: "",
        image: null
    };

    const [guestId, setGuestId] = useState<number>(0);
    const [formData, setFormData] = useState<GuestReq>(empty);
    const [prieviewImage, setPriviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<GuestRes>>();

    const getGuestId = (item: any): number => {
        return Number(item?.id ?? item?.Id ?? 0);
    };

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true);
            const res = await GuestService.getGuestByPage(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };
    
    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setPriviewImage(previewUrl);
        setFormData({ ...formData, image: file });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const currentId = Number(guestId) || 0;

        try {
            const response = await GuestService.saveGuest(currentId, formData);
            toast.success(response.message || "Saved successfully");
            setOpenModal(false);
            setFormData(empty);
            setPriviewImage(null);
            setGuestId(0);
            fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : (error?.message || "Failed to save guest"));
        }
        setLoading(false);
    };

    const handleEdit = (record: any) => {
        const id = getGuestId(record);
        setGuestId(id);

        const rawDob = record?.dob ?? record?.Dob;
        const rawNat = record?.nationality ?? record?.Nationality;
        const rawImg = record?.imagePath ?? record?.ImagePath;

        setFormData({
            name: record?.name ?? record?.Name ?? "",
            nameKh: record?.nameKh ?? record?.NameKh ?? "",
            sex: record?.sex ?? record?.Sex ?? "",
            dob: rawDob ? String(rawDob).split('T')[0] : "",
            address: record?.address ?? record?.Address ?? "",
            nationality: (rawNat && rawNat !== "null") ? rawNat : "",
            phone: record?.phone ?? record?.Phone ?? "",
            email: record?.email ?? record?.Email ?? "",
            ssn: record?.ssn ?? record?.SSN ?? "",
            passport: record?.passport ?? record?.Passport ?? "",
            status: record?.status ?? record?.Status ?? "Active",
            image: null,
        });

        setPriviewImage(rawImg ? `http://localhost:5216/${String(rawImg).replace(/\\/g, '/')}` : null);
        setOpenModal(true);
    };

    const handleDelete = async (rawId: any) => {
        const id = Number(rawId?.id ?? rawId?.Id ?? rawId ?? 0);
        if (id <= 0) {
            toast.error("Invalid guest ID");
            return;
        }

        if (window.confirm("Are you sure you want to delete this guest?")) {
            try {
                const res = await GuestService.deleteGuest(id);
                setOpenModal(false);
                await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
                toast.success(res.message || "Deleted successfully");
            } catch (error: any) {
                console.error(error);
                toast.error(typeof error === "string" ? error : (error?.message || "Failed to delete guest"));
            }
            setFormData(empty);
        }
    };

    useEffect(() => {
        fetchData(1, 10);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAdd = () => {
        setOpenModal(true);
        setFormData(empty);
        setPriviewImage(null);
        setGuestId(0);
    };

    return (
        <>
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
                        {guestId > 0 ? "Edit Guest" : "Add Guest"}
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
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Sex</Form.Label>
                                            <Form.Select name="sex" value={formData.sex} onChange={handleChange}>
                                                <option value="">Select Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Date of Birth</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Phone Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Nationality</Form.Label>
                                            <Form.Select name="nationality" value={formData.nationality} onChange={handleChange}>
                                                <option value="">Select Nationality</option>
                                                <option value="Khmer">Khmer</option>
                                                <option value="Foreigner">Foreigner</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">SSN</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="ssn"
                                                value={formData.ssn}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Passport Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="passport"
                                                value={formData.passport}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted">Status</Form.Label>
                                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                                <option value="">Select Status</option>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted">Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Right Column for Image */}
                            <Col md={4} className="d-flex flex-column align-items-center justify-content-start pt-2">
                                <div className="border rounded mb-3 d-flex align-items-center justify-content-center" style={{ width: '160px', height: '160px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                    {prieviewImage ? (
                                        <img src={prieviewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="fas fa-user text-secondary" style={{ fontSize: '100px' }}></i>
                                    )}
                                </div>
                                <Form.Group className="text-center">
                                    <Form.Label htmlFor="image-upload" className="btn btn-outline-success btn-sm mb-1">
                                        Upload Guest Image
                                    </Form.Label>
                                    <Form.Control
                                        id="image-upload"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleImageChange}
                                        className="d-none"
                                    />
                                    {formData.image && <div className="small text-muted">{formData.image.name}</div>}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 justify-content-end">
                    <Button variant="primary" type="submit" form="frm" className="px-4" disabled={loading}>
                        Save
                    </Button>
                    <Button variant="danger" onClick={() => setOpenModal(false)} className="px-4">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {pagination && pagination.data && (
                <div className="manage-card">
                    {/* Top Blue Header Banner */}
                    <div className="manage-banner">
                        <h3 className="manage-banner-title">Manage Guests</h3>
                        <div className="d-flex align-items-center gap-3">
                            <button type="button" className="btn-banner-add" onClick={handleAdd}>
                                <i className="far fa-plus-square"></i>
                                <span>Add New</span>
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="banner-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>No</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Nationality</th>
                                    <th>Status</th>
                                    <th className="text-center" style={{ width: "120px" }}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagination?.data.map((item: any, index: number) => {
                                    const itemId = getGuestId(item);
                                    const itemName = item?.name ?? item?.Name ?? "";
                                    const itemPhone = item?.phone ?? item?.Phone ?? "-";
                                    const itemEmail = item?.email ?? item?.Email ?? "-";
                                    const rawNat = item?.nationality ?? item?.Nationality;
                                    const itemNat = (rawNat && rawNat !== "null") ? rawNat : "-";
                                    const itemStatus = item?.status ?? item?.Status ?? "Active";
                                    const itemImg = item?.imagePath ?? item?.ImagePath;

                                    return (
                                        <tr key={itemId || index}>
                                            <td className="fw-semibold text-secondary">{index + 1}</td>
                                            <td>
                                                <div className="table-user-avatar" style={{ width: '34px', height: '34px' }}>
                                                    {itemImg ? (
                                                        <img
                                                            src={`http://localhost:5216/${String(itemImg).replace(/\\/g, '/')}`}
                                                            alt={itemName}
                                                        />
                                                    ) : (
                                                        itemName ? itemName.charAt(0).toUpperCase() : "G"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="fw-bold text-dark">{itemName}</td>
                                            <td className="text-secondary">{itemPhone}</td>
                                            <td className="text-secondary">{itemEmail}</td>
                                            <td className="text-secondary">{itemNat}</td>
                                            <td>
                                                <span className={itemStatus === "Inactive" ? "badge-status-red" : "badge-status-green"}>
                                                    {itemStatus}
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
                                                        onClick={() => handleDelete(itemId)}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

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
                            onClick={() => pagination.pageNumber < pagination.totalPages && handlePageChange(pagination.pageNumber + 1)}
                            title="Next Page"
                        >
                            &rsaquo;
                        </div>
                        <div 
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? 'disabled' : ''}`}
                            onClick={() => pagination.pageNumber < pagination.totalPages && handlePageChange(pagination.totalPages)}
                            title="Last Page"
                        >
                            &raquo;
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
