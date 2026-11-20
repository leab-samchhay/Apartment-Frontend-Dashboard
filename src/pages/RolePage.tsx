import type { Role } from "../model/Role";
import { useEffect, useState } from "react";
import { RoleService } from "../services/RoleService";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function RolePage() {
    const emptyRole: Role = {
        id: 0,
        name: "",
        description: "",
        isActive: 1,
    };

    const [formData, setFormData] = useState<Role>(emptyRole);
    const [openModal, setOpenModal] = useState(false);
    const [dataList, setDataList] = useState<Role[]>([]);

    const fetchData = async () => {
        try {
            const res = await RoleService.getRole();
            setDataList(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Cannot load data.");
        }
    };

    const handleAdd = () => {
        setFormData(emptyRole);
        setOpenModal(true);
    };

    const handlEdit = (record: Role) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await RoleService.deleteRole(id);
                setOpenModal(false);
                await fetchData();
                toast.success(res.message || "Deleted successfully");
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
            setFormData(emptyRole);
        }
    };

    const handlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (formData.id > 0) {
                await RoleService.putRole(formData);
            } else {
                await RoleService.postRole(formData);
            }
            setOpenModal(false);
            await fetchData();
            toast.success("Saved data successfully.");
        } catch (err) {
            toast.error(`${err}`);
        }
        setFormData(emptyRole);
    };

    useEffect(() => {
        fetchData();
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'isActive' ? parseInt(value) : value,
        });
    }



    return (
        <>

            {/* Modal */}
            <Modal
                show={openModal}
                onHide={() => setOpenModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="h5 font-weight-bold">Role Details</Modal.Title>
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
                            <Form.Label className="small text-muted font-weight-bold">Role Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                placeholder="Enter role name"
                                required
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description || ""}
                                placeholder="Enter role description"
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Status</Form.Label>
                            <Form.Select
                                name="isActive"
                                value={formData.isActive}
                                onChange={handleChange}
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="light" onClick={() => setOpenModal(false)} className="btn-modern text-secondary border">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" form="frm" className="btn-modern">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {dataList && dataList.length >= 0 && (
                <div className="manage-card">
                    {/* Top Blue Header Banner */}
                    <div className="manage-banner">
                        <h3 className="manage-banner-title">Manage Roles</h3>
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
                                    <th>Role Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th className="text-center" style={{ width: "120px" }}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="fw-semibold text-secondary">{index + 1}</td>
                                        <td>
                                            <span className="badge-role-purple">{item.name}</span>
                                        </td>
                                        <td className="text-secondary">{item.description || "-"}</td>
                                        <td>
                                            {item.isActive === 1 ? (
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
                    </div>
                </div>
            )}
        </>
    );
}
