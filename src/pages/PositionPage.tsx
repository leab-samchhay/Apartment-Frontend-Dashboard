import React, { useState, useEffect } from "react";
import type { Position } from "../model/Position";
import type { PagedResponse } from "../apis/pageResponse";
import { PositionService } from "../services/PositionService";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

const PositionPage = () => {
    const initialPosition: Position = {
        id: 0,
        positionName: "",
        positionNameKh: "",
        status: 0
    };

    const [formData, setFormData] = useState<Position>(initialPosition);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<Position>>();

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            const res = await PositionService.getPosition(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setFormData(initialPosition);
        setOpenModal(true);
    };

    const handleEdit = (record: Position) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await PositionService.deletePosition(id);
                await fetchData(pagination?.pageNumber, pagination?.pageSize);
                toast.success(res.message);
            } catch (error) {
                console.error(error);
            }
            setFormData(initialPosition);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (Number(formData.id) > 0) {
                await PositionService.putPosition(formData);
            } else {
                await PositionService.postPosition(formData);
            }
            setOpenModal(false);
            await fetchData(pagination?.pageNumber, pagination?.pageSize);
            toast.success("Save change data Successfully");
        } catch (error) {
            toast.error(`${error}`);
        }
        setFormData(initialPosition);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Positions</h3>
                <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn-banner-add" onClick={handleAdd}>
                        <i className="far fa-plus-square"></i>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                show={openModal}
                onHide={() => setOpenModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">
                        {formData.id > 0 ? "Edit Position" : "Add Position"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSubmit} id="frm">
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="id"
                                value={formData.id}
                                readOnly
                                disabled
                                className="bg-light"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Position Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="positionName"
                                value={formData.positionName}
                                placeholder="Enter Position Name"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Name Khmer</Form.Label>
                            <Form.Control
                                type="text"
                                name="positionNameKh"
                                value={formData.positionNameKh}
                                placeholder="Enter Khmer name"
                                required
                                onChange={handleChange}
                            />
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

            {/* Blue Header List Table - Matching User's Screenshot Exactly */}
            {pagination && pagination.data && (
                <div className="table-responsive">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>No</th>
                                <th>Position Name</th>
                                <th>Name Khmer</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="fw-semibold text-secondary">{index + 1}</td>
                                    <td className="fw-bold text-dark">{item.positionName}</td>
                                    <td className="text-secondary">{item.positionNameKh}</td>
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

                    {/* Bottom-Right Pagination Exactly Like Reference Image: « < 1/1 > » */}
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
};

export default PositionPage;
