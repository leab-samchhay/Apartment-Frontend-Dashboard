import type { Floor } from "../model/Floor";
import type { Building } from "../model/Building";
import { useEffect, useState } from "react";
import { FloorService } from "../services/floorService";
import { BuildingService } from "../services/buildingService";
import type { PagedResponse } from "../apis/pageResponse";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function FloorPage() {
    const emptyFloor: Floor = {
        id: 0,
        floorNo: 0,
        buildingId: 0,
    };

    const [formData, setFormData] = useState<Floor>(emptyFloor);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<Floor>>();
    const [buildings, setBuildings] = useState<Building[]>([]);

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            const res = await FloorService.getFloor(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load floors.");
        }
    };

    const fetchBuildings = async () => {
        try {
            const res = await BuildingService.getBuildings(1, 1000);
            setBuildings(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load buildings.");
        }
    };

    useEffect(() => {
        fetchData(1, 10);
        fetchBuildings();
    }, []);

    const handleAdd = () => {
        setFormData(emptyFloor);
        setOpenModal(true);
    };

    const handleEdit = (record: Floor) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const res = await FloorService.deleteFloor(id);
            await fetchData(pagination?.pageNumber, pagination?.pageSize);
            toast.success(res.message ?? "Deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete record.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.buildingId) {
            toast.error("Please select a building.");
            return;
        }

        try {
            if (formData.id > 0) {
                await FloorService.putFloor(formData);
            } else {
                await FloorService.postFloor(formData);
            }
            setOpenModal(false);
            await fetchData(pagination?.pageNumber, pagination?.pageSize);
            toast.success("Save change data successfully.");
        } catch (err) {
            toast.error(`${err}`);
        } finally {
            setFormData(emptyFloor);
        }
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "floorNo" ? Number(value) : value,
        });
    }

    function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: Number(value),
        });
    }

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    const getBuildingName = (buildingId: number) =>
        buildings.find((b) => b.id === buildingId)?.nameEnglish ?? "-";

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Floors</h3>
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
                    <Modal.Title className="h5 font-weight-bold">{formData.id > 0 ? "Edit Floor" : "Add Floor"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frm">
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">ID</Form.Label>
                            <Form.Control type="number" name="id" value={formData.id} readOnly disabled className="bg-light" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Floor No</Form.Label>
                            <Form.Control
                                type="number"
                                name="floorNo"
                                value={formData.floorNo}
                                placeholder="Enter floor number"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Building</Form.Label>
                            <Form.Select
                                name="buildingId"
                                value={formData.buildingId}
                                required
                                onChange={handleSelectChange}
                            >
                                <option value={0}>-- Select Building --</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nameEnglish}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="light" onClick={() => setOpenModal(false)} className="border px-4" style={{ borderRadius: '10px' }}>
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
                                <th>Floor Number</th>
                                <th>Building Name</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="fw-semibold text-secondary">{index + 1}</td>
                                    <td className="fw-bold text-dark">Floor {item.floorNo}</td>
                                    <td className="text-secondary">{getBuildingName(item.buildingId)}</td>
                                    <td>
                                        <span className="badge-status-green">Active</span>
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
        </div>
    );
}
