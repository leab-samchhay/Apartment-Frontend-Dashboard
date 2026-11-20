import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { ExchangeRate, ExchangeRateReq } from "../model/ExchangeRate";
import type { PagedResponse } from "../apis/pageResponse";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { toast } from "react-toastify";
import { Modal, Button, Form} from "react-bootstrap";

const formatDdMmmYyyy = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    const dd = String(d.getDate()).padStart(2, "0");
    const mmm = d.toLocaleString("en-US", { month: "short" });
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
};

export const ExchangeRatePage = () => {
    const empty: ExchangeRateReq = {
        dateT: new Date().toISOString().split("T")[0],
        rate: 0,
        status: "Active"
    };

    const [rateId, setRateId] = useState<number>(0);
    const [formData, setFormData] = useState<ExchangeRateReq>(empty);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<ExchangeRate>>();

    // 1. GET DATA (Paged)
    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true);
            const res = await ExchangeRateService.getExchangeRates(page, pageSize);
            if (res && res.data) {
                setPagination(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch exchange rates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, 10);
    }, []);

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize || 10);
    };

    // 2. TRIGGER UPDATE (EDIT)
    const handleEdit = (record: ExchangeRate) => {
        setRateId(record.id);
        setFormData({
            dateT: record.dateT ? record.dateT.split("T")[0] : "",
            rate: record.rate ?? 0,
            status: record.status || "Active"
        });
        setOpenModal(true);
    };

    // 3. SUBMIT INSERT / UPDATE
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.rate === undefined || formData.rate === null || Number(formData.rate) <= 0) {
            toast.error("Exchange Rate must be greater than zero");
            return;
        }

        setLoading(true);

        try {
            // Build request payload matching Swagger: { dateT, rate, status }
            const payload: ExchangeRateReq = {
                dateT: formData.dateT ? new Date(formData.dateT).toISOString() : new Date().toISOString(),
                rate: Number(formData.rate),
                status: formData.status || "Active"
            };

            const response = await ExchangeRateService.saveExchangeRate(rateId, payload);
            toast.success(response.message || (rateId > 0 ? "Exchange rate updated successfully" : "Exchange rate created successfully"));
            setOpenModal(false);
            setFormData(empty);
            setRateId(0);
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
        if (window.confirm("Are you sure you want to delete this exchange rate record?")) {
            try {
                const res = await ExchangeRateService.deleteExchangeRate(id);
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
            [name]: name === "rate" ? (value === "" ? 0 : Number(value)) : value
        });
    };

    const handleAdd = () => {
        setRateId(0);
        setFormData({
            ...empty,
            dateT: new Date().toISOString().split("T")[0]
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setRateId(0);
        setFormData(empty);
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Exchange Rates</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal for INSERT & UPDATE */}
            <Modal
                show={openModal}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {rateId > 0 ? `Edit Exchange Rate (ID: ${rateId})` : "Add New Exchange Rate"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frmExchangeRate">
                        {rateId > 0 && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted font-weight-bold">Rate ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={rateId}
                                    readOnly
                                    disabled
                                    className="bg-light"
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Effective Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="dateT"
                                value={formData.dateT}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Exchange Rate</Form.Label>
                            <Form.Control
                                type="number"
                                step="any"
                                min="0.0001"
                                name="rate"
                                value={formData.rate}
                                placeholder="Enter rate (e.g. 4100)"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>
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
                        form="frmExchangeRate"
                        className="btn-modern px-4"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : rateId > 0 ? "Update Rate" : "Save Changes"}
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
                                <th>Effective Date</th>
                                <th>Exchange Rate</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-muted">
                                        No exchange rate records found.
                                    </td>
                                </tr>
                            ) : (
                                pagination.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="fw-semibold text-secondary">{index + 1}</td>
                                        <td className="fw-bold text-dark">
                                            {formatDdMmmYyyy(item.dateT)}
                                        </td>
                                        <td>
                                            <span className="badge-role-purple font-weight-bold" style={{ fontSize: "0.95rem" }}>
                                                {Number(item.rate).toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 4
                                                })}
                                            </span>
                                        </td>
                                        <td>
                                            {item.status?.toLowerCase() === "active" ? (
                                                <span className="badge-status-green">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-3 py-1">
                                                    {item.status || "Inactive"}
                                                </span>
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
                                ))
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

export default ExchangeRatePage;
