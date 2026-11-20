import type { RoomType } from "../model/RoomType";
import { useEffect, useState } from "react";
import { RoomTypeService } from "../services/RoomTypeService";
import type { PagedResponse } from "../apis/pageResponse";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function RoomTypePage() {
    const emptyRoomType: RoomType = {
        id: 0,
        roomTypeName: "",
        roomTypeNameKh: "",
    };

    const [formData, setFormData] = useState<RoomType>(emptyRoomType);
    const [openModal, setOpenModal] = useState(false);
    const [pagination, setPagination] = useState<PagedResponse<RoomType>>();

    const fetchData = async (page: number = 1, pageSize: number = 10) => {
        try {
            const res = await RoomTypeService.getRoomType(page, pageSize);
            setPagination(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Cannot load data.");
        }
    };

    const handleAdd = () => {
        setOpenModal(true);
        setFormData(emptyRoomType);
    };

    const handlEdit = (record: RoomType) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await RoomTypeService.deleteRoomType(id);
                setOpenModal(false);
                await fetchData(pagination?.pageNumber, pagination?.pageSize);
                toast.success(res.message);
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
            setFormData(emptyRoomType);
        }
    };

    const handlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (formData.id > 0) {
                await RoomTypeService.putRoomType(formData);
            } else {
                await RoomTypeService.postRoomType(formData);
            }
            setOpenModal(false);
            await fetchData(pagination?.pageNumber, pagination?.pageSize);
            toast.success("Save change data successfully.");
        } catch (err) {
            toast.error(`${err}`);
        }
        setFormData(emptyRoomType);
    };

    useEffect(() => {
        fetchData(1, 10);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    }

    const handlePageChange = async (page: number) => {
        await fetchData(page, pagination?.pageSize);
    };

    return (
        <div className="manage-card">
            {/* Top Blue Header Banner */}
            <div className="manage-banner">
                <h3 className="manage-banner-title">Manage Room Types</h3>
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
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">Room Type Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handlSubmit} id="frm">
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
                            <Form.Label className="small text-muted font-weight-bold">Name RoomType</Form.Label>
                            <Form.Control
                                type="text"
                                name="roomTypeName"
                                value={formData.roomTypeName}
                                placeholder="Enter RoomType name"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Name RoomType Khmer</Form.Label>
                            <Form.Control
                                type="text"
                                name="roomTypeNameKh"
                                value={formData.roomTypeNameKh}
                                placeholder="Enter RoomType Khmer name"
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

            {/* Blue Header List Table */}
            {pagination && pagination.data && (
                <div className="table-responsive">
                    <table className="banner-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>No</th>
                                <th>Room Type Name</th>
                                <th>Name Khmer</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "120px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagination?.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="fw-semibold text-secondary">{index + 1}</td>
                                    <td className="fw-bold text-dark">{item.roomTypeName}</td>
                                    <td className="text-secondary">{item.roomTypeNameKh}</td>
                                    <td>
                                        <span className="badge-status-green">Active</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="action-buttons-group justify-content-center">
                                            <button 
                                                type="button" 
                                                className="btn-circle-edit" 
                                                title="Edit"
                                                onClick={() => handlEdit(item)}
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
