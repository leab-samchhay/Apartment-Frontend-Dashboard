import type { UserRole } from "../model/UserRole";
import { useEffect, useState } from "react";
import { UserRoleService } from "../services/UserRoleService";

import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function UserRolePage() {
    const emptyUserRole: UserRole = {
        id: 0,
        userId: 0,
        roleId: 0,
    };

    const [formData, setFormData] = useState<UserRole>(emptyUserRole);
    const [openModal, setOpenModal] = useState(false);
    const [dataList, setDataList] = useState<UserRole[]>([]);

    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const res = await UserRoleService.getUserRole();
            setDataList(res.data);
            
            import("../services/UserService").then(async ({ UserService }) => {
                const userRes = await UserService.getUser(1, 100);
                if (userRes) setUsers(userRes.data?.data || []);
            });
            
            import("../services/RoleService").then(async ({ RoleService }) => {
                const roleRes = await RoleService.getRole();
                if (roleRes) setRoles(roleRes.data || []);
            });
            
        } catch (error) {
            console.error(error);
            toast.error("Cannot load data.");
        }
    };

    const handleAdd = () => {
        setFormData(emptyUserRole);
        setOpenModal(true);
    };

    const handlEdit = (record: UserRole) => {
        setFormData(record);
        setOpenModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await UserRoleService.deleteUserRole(id);
                setOpenModal(false);
                await fetchData();
                toast.success(res.message || "Deleted successfully");
            } catch (error) {
                console.error(error);
                toast.error(`${error}`);
            }
            setFormData(emptyUserRole);
        }
    };

    const handlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (formData.id > 0) {
                await UserRoleService.putUserRole(formData);
            } else {
                await UserRoleService.postUserRole(formData);
            }
            setOpenModal(false);
            await fetchData();
            toast.success("Saved data successfully.");
        } catch (err) {
            toast.error(`${err}`);
        }
        setFormData(emptyUserRole);
    };

    useEffect(() => {
        fetchData();
    }, []);

    function handleChange(e: React.ChangeEvent<any>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: parseInt(value) || 0,
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
                    <Modal.Title className="h5 font-weight-bold">UserRole Details</Modal.Title>
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
                            <Form.Label className="small text-muted font-weight-bold">User</Form.Label>
                            <Form.Select
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select User</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted font-weight-bold">Role</Form.Label>
                            <Form.Select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
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
                        <h3 className="manage-banner-title">Manage User Roles</h3>
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
                                    <th>User</th>
                                    <th>Role</th>
                                    <th className="text-center" style={{ width: "120px" }}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataList.map((item, index) => {
                                    const user = users.find(u => u.id === item.userId);
                                    const role = roles.find(r => r.id === item.roleId);
                                    return (
                                        <tr key={item.id}>
                                            <td className="fw-semibold text-secondary">{index + 1}</td>
                                            <td className="fw-bold text-dark">
                                                {user ? `${user.username} (${user.email})` : item.userId}
                                            </td>
                                            <td>
                                                <span className="badge-role-purple">
                                                    {role ? role.name : item.roleId}
                                                </span>
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
