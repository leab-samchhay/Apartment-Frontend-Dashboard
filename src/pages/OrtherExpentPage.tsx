import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { PagedResponse } from "../apis/pageResponse";
import type { OrtherExpens } from "../model/OrtherExpens";
import type { ExpenType } from "../model/ExpenType";
import ExpenTypeService from "../services/ExpenTypeService";
import { toast } from "react-toastify";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import OrtherExpenseService from "../services/OrtherExpentService";

export const OrtherExpensPage = () => {
    const emptyForm: OrtherExpens = {
        id: 0,
        date: new Date().toISOString().split("T")[0],
        expenseTypeId: undefined,
        amount: 0,
        note: "",
        createBy: "",
        image: null
    };

    const [expenseId, setExpenseId] = useState<number>(0);
    const [formData, setFormData] = useState<OrtherExpens>(emptyForm);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<OrtherExpens>>();
    const [expenseTypes, setExpenseTypes] = useState<ExpenType[]>([]);

    const fetchExpenseTypes = async () => {
        try {
            const res = await ExpenTypeService.getExpentType(1, 100);
            if (res.data?.data) {
                setExpenseTypes(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load expense types:", error);
        }
    };

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true);
            const res = await OrtherExpenseService.getOrtherExpenseByPage(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, 10);
        fetchExpenseTypes();
    }, []);

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize || 10);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        setFormData({ ...formData, image: file });
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "expenseTypeId" || name === "amount" 
                ? (value === "" ? undefined : Number(value)) 
                : value,
        });
    };

    const handleAdd = () => {
        setExpenseId(0);
        setFormData({
            ...emptyForm,
            expenseTypeId: expenseTypes.length > 0 ? expenseTypes[0].id : undefined
        });
        setPreviewImage(null);
        setOpenModal(true);
    };

    const handleEdit = (record: OrtherExpens) => {
        setExpenseId(Number(record.id));
        setFormData({
            id: record.id,
            date: record.date ? record.date.split("T")[0] : "",
            expenseTypeId: record.expenseTypeId,
            amount: record.amount || 0,
            note: record.note || "",
            createBy: record.createBy || "",
            image: null,
        });

        if (typeof record.image === "string" && record.image) {
            setPreviewImage(`http://localhost:5216/${record.image.replace(/\\/g, "/")}`);
        } else {
            setPreviewImage(null);
        }

        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this expense record?")) {
            try {
                const res = await OrtherExpenseService.deleteOrtherExpense(Number(id));
                toast.success(res.message || "Deleted successfully");
                const currentPage = pagination?.pageNumber || 1;
                const isLastItemOnPage = (pagination?.data?.length || 0) <= 1 && currentPage > 1;
                const pageToFetch = isLastItemOnPage ? currentPage - 1 : currentPage;
                await fetchData(pageToFetch, pagination?.pageSize || 10);
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.expenseTypeId) {
            toast.warning("Please select an Expense Type");
            return;
        }

        setLoading(true);
        try {
            const response = await OrtherExpenseService.saveOrtherExpense(expenseId, formData);
            toast.success(response.message || "Saved successfully");
            setOpenModal(false);
            setFormData(emptyForm);
            setPreviewImage(null);
            setExpenseId(0);
            await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setLoading(false);
        }
    };

    const getExpenseTypeName = (typeId?: number) => {
        const found = expenseTypes.find((t) => t.id === typeId);
        return found ? found.expensType : `Type #${typeId ?? "-"}`;
    };

    return (
        <div className="manage-card">
            {/* Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Other Expenses</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New Expense</span>
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
                        {expenseId > 0 ? "Edit Expense" : "Add Expense"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frmExpense">
                        <Row>
                            {/* Left Column for Inputs */}
                            <Col md={8}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted font-weight-bold">Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted font-weight-bold">Expense Type</Form.Label>
                                            <Form.Select
                                                name="expenseTypeId"
                                                value={formData.expenseTypeId ?? ""}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Select Expense Type --</option>
                                                {expenseTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.expensType}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted font-weight-bold">Amount ($)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted font-weight-bold">Created By</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="createBy"
                                                value={formData.createBy}
                                                onChange={handleChange}
                                                placeholder="e.g. Admin"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted font-weight-bold">Note / Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        placeholder="Add expense details..."
                                    />
                                </Form.Group>
                            </Col>

                            {/* Right Column for Image */}
                            <Col md={4} className="d-flex flex-column align-items-center justify-content-start pt-2">
                                <div
                                    className="border rounded mb-3 d-flex align-items-center justify-content-center"
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
                                        <i className="fas fa-receipt text-secondary" style={{ fontSize: "60px" }}></i>
                                    )}
                                </div>
                                <Form.Group className="text-center">
                                    <Form.Label htmlFor="image-upload" className="btn btn-outline-primary btn-sm mb-1">
                                        Upload Receipt
                                    </Form.Label>
                                    <Form.Control
                                        id="image-upload"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleImageChange}
                                        className="d-none"
                                    />
                                    {formData.image instanceof File && (
                                        <div className="small text-muted mt-1">{formData.image.name}</div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 justify-content-end">
                    <Button variant="light" onClick={() => setOpenModal(false)} className="border px-4">
                        Close
                    </Button>
                    <Button variant="primary" type="submit" form="frmExpense" className="px-4" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Table */}
            {pagination && pagination.data && (
                <div className="table-responsive">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>No</th>
                                <th>Receipt</th>
                                <th>Date</th>
                                <th>Expense Type</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Created By</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="fw-semibold text-secondary">
                                        {(pagination.pageNumber - 1) * (pagination.pageSize || 10) + (index + 1)}
                                    </td>
                                    <td>
                                        <div className="table-user-avatar" style={{ width: "40px", height: "40px" }}>
                                            {typeof item.image === "string" && item.image ? (
                                                <img
                                                    src={`http://localhost:5216/${item.image.replace(/\\/g, "/")}`}
                                                    alt="Receipt"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <i className="fas fa-file-invoice-dollar text-secondary"></i>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-secondary">
                                        {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="text-dark fw-semibold">
                                        {getExpenseTypeName(item.expenseTypeId)}
                                    </td>
                                    <td className="fw-bold text-success">${Number(item.amount).toFixed(2)}</td>
                                    <td className="text-secondary">{item.note || "-"}</td>
                                    <td className="text-secondary">{item.createBy || "-"}</td>
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
                            onClick={() =>
                                pagination.pageNumber < (pagination.totalPages || 1) &&
                                handlePageChange(pagination.pageNumber + 1)
                            }
                            title="Next Page"
                        >
                            &rsaquo;
                        </div>
                        <div
                            className={`nav-arrow ${pagination.pageNumber === pagination.totalPages ? "disabled" : ""}`}
                            onClick={() =>
                                pagination.pageNumber < (pagination.totalPages || 1) &&
                                handlePageChange(pagination.totalPages)
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

export default OrtherExpensPage;