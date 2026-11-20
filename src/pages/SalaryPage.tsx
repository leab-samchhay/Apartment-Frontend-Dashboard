import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Salary } from "../model/Salary";
import type { StaffRes } from "../model/StaffRes";
import type { PagedResponse } from "../apis/pageResponse";
import { SalaryService } from "../services/SalaryService";
import { StaffService } from "../services/StaffService";
import { toast } from "react-toastify";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export const SalaryPage = () => {
    const empty: Salary = {
        id: 0,
        staffId: 0,
        date: new Date().toISOString().split("T")[0],
        salary: 0,
        note: "",
        createdate: new Date().toISOString(),
        createby: ""
    };

    const [salaryId, setSalaryId] = useState<number>(0);
    const [formData, setFormData] = useState<Salary>(empty);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<Salary>>();
    const [staffList, setStaffList] = useState<StaffRes[]>([]);

    // 1. GET DATA (follows response: { success, statusCode, message, data: { pageNumber, pageSize, totalRecords, totalPages, data: [...] } })
    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true);
            const res = await SalaryService.getSalary(page, pageSize);
            if (res && res.data) {
                setPagination(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch salary data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load Staff for dropdown and avatar/name display
    const fetchStaffList = async () => {
        try {
            const res = await StaffService.getStaffByPage(1, 10000);
            if (res.data?.data) {
                setStaffList(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch staff list:", error);
        }
    };

    useEffect(() => {
        fetchData(1, 10);
        fetchStaffList();
    }, []);

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize || 10);
    };

    // 2. TRIGGER UPDATE (EDIT) - Reads each field directly from the response item:
    // { id: 2, staffId: 1, date: "2026-10-23T06:03:43.128", salary: 0, note: "string", createdate: "...", createby: "..." }
    const handleEdit = (record: Salary) => {
        setSalaryId(record.id);
        setFormData({
            id: record.id,
            staffId: record.staffId,
            date: record.date ? record.date.split("T")[0] : "",
            salary: record.salary ?? 0,
            note: record.note ?? "",
            createdate: record.createdate,
            createby: record.createby
        });
        setOpenModal(true);
    };

    // 3. SUBMIT INSERT / UPDATE
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.staffId || formData.staffId === 0) {
            toast.error("Please select a Staff member");
            return;
        }

        if (formData.salary === undefined || formData.salary === null || Number(formData.salary) < 0) {
            toast.error("Please enter a valid salary amount");
            return;
        }

        setLoading(true);

        try {
            const storedRole = sessionStorage.getItem("role") || "Admin";
            const cleanedRole = storedRole.replace(/["[\]]/g, "") || "Admin";

            // Build request payload matching backend SalaryReqDto
            const payload: Salary = {
                id: salaryId,
                staffId: Number(formData.staffId),
                salary: Number(formData.salary),
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
                note: formData.note || "",
                createby: formData.createby || cleanedRole,
                createdate: formData.createdate || new Date().toISOString()
            };

            // Call SalaryService.saveSalary (if salaryId > 0, it calls putSalary(salaryId, payload))
            const response = await SalaryService.saveSalary(salaryId, payload);
            toast.success(response.message || (salaryId > 0 ? "Updated salary successfully" : "Saved salary successfully"));
            setOpenModal(false);
            setFormData(empty);
            setSalaryId(0);
            await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        } catch (error) {
            console.error(error);
            toast.error(`${error}`);
        } finally {
            setLoading(false);
        }
    };

    // 4. DELETE
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this salary record?")) {
            try {
                const res = await SalaryService.deleteSalary(id);
                toast.success(res.message || "Deleted successfully");
                await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "staffId" || name === "salary" ? (value === "" ? 0 : Number(value)) : value
        });
    };

    const handleAdd = () => {
        setSalaryId(0);
        setFormData({
            ...empty,
            date: new Date().toISOString().split("T")[0]
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSalaryId(0);
        setFormData(empty);
    };

    const getStaffMember = (staffId?: number) => {
        if (!staffId) return null;
        return staffList.find((s) => s.id === staffId);
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Salary</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal for INSERT and UPDATE */}
            <Modal
                show={openModal}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {salaryId > 0 ? `Edit Salary (ID: ${salaryId})` : "Add New Salary"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frmSalary">
                        {salaryId > 0 && (
                            <Row className="mb-2">
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small text-muted font-weight-bold">Salary ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={salaryId}
                                            readOnly
                                            disabled
                                            className="bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small text-muted font-weight-bold">Created By</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.createby || "-"}
                                            readOnly
                                            disabled
                                            className="bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Staff Member</Form.Label>
                                    <Form.Select
                                        name="staffId"
                                        value={formData.staffId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value={0}>-- Select Staff --</option>
                                        {staffList.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.nameKh ? `(${s.nameKh})` : ""}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Payment Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Salary Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="salary"
                                        value={formData.salary}
                                        placeholder="Enter salary amount"
                                        required
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Note / Remark</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="note"
                                        value={formData.note || ""}
                                        placeholder="Enter note / remarks"
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 justify-content-end">
                    <Button
                        variant="light"
                        onClick={handleCloseModal}
                        className="border px-4"
                        style={{ borderRadius: "10px" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="frmSalary"
                        className="btn-modern px-4"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : salaryId > 0 ? "Update Salary" : "Save Changes"}
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
                                <th>Staff</th>
                                <th>Payment Date</th>
                                <th>Salary Amount</th>
                                <th>Note</th>
                                <th>Created By</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">
                                        No salary records found.
                                    </td>
                                </tr>
                            ) : (
                                pagination.data.map((item, index) => {
                                    const staffMember = getStaffMember(item.staffId);
                                    return (
                                        <tr key={item.id}>
                                            <td className="fw-semibold text-secondary">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="table-user-avatar" style={{ width: "36px", height: "36px" }}>
                                                        {staffMember?.photo ? (
                                                            <img
                                                                src={`http://localhost:5216/${staffMember.photo.replace(/\\/g, "/")}`}
                                                                alt={staffMember.name || "Staff"}
                                                            />
                                                        ) : (
                                                            staffMember?.name ? staffMember.name.charAt(0).toUpperCase() : "S"
                                                        )}
                                                    </div>
                                                    <div className="d-flex flex-column" style={{ lineHeight: 1.25 }}>
                                                        <span className="fw-bold text-dark">
                                                            {staffMember ? staffMember.name : `Staff #${item.staffId}`}
                                                        </span>
                                                        {staffMember?.nameKh && (
                                                            <span className="text-secondary small">{staffMember.nameKh}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary">
                                                {item.date ? item.date.split("T")[0] : "-"}
                                            </td>
                                            <td>
                                                <span className="badge-role-purple font-weight-bold">
                                                    ${Number(item.salary || 0).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </span>
                                            </td>
                                            <td className="text-secondary">{item.note || "-"}</td>
                                            <td className="text-secondary">{item.createby || "-"}</td>
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
                                    );
                                })
                            )}
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
                            className={`nav-arrow ${pagination.pageNumber === (pagination.totalPages || 1) ? "disabled" : ""}`}
                            onClick={() =>
                                pagination.pageNumber < (pagination.totalPages || 1) &&
                                handlePageChange(pagination.pageNumber + 1)
                            }
                            title="Next Page"
                        >
                            &rsaquo;
                        </div>
                        <div
                            className={`nav-arrow ${pagination.pageNumber === (pagination.totalPages || 1) ? "disabled" : ""}`}
                            onClick={() =>
                                pagination.pageNumber < (pagination.totalPages || 1) &&
                                handlePageChange(pagination.totalPages || 1)
                            }
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

export default SalaryPage;
