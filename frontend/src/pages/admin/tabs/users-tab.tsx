import { useState, useEffect } from 'react';
import * as adminService from '../../../services/admin.service';

export const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<adminService.UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<adminService.UserRecord | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const usersResponse = await adminService.listUsers(100);
            setUsers(usersResponse.data.users);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSetAdminRole = async (uid: string, isAdmin: boolean) => {
        try {
            await adminService.setAdminRole(uid, isAdmin);
            alert(`Usuario ${isAdmin ? 'promovido a' : 'removido de'} administrador exitosamente`);
            loadUsers();
        } catch (err) {
            console.error('Error setting admin role:', err);
            alert('Error al actualizar el rol de administrador');
        }
    };

    const handleSetUserStatus = async (uid: string, disabled: boolean) => {
        try {
            await adminService.setUserStatus(uid, disabled);
            alert(`Usuario ${disabled ? 'deshabilitado' : 'habilitado'} exitosamente`);
            loadUsers();
        } catch (err) {
            console.error('Error setting user status:', err);
            alert('Error al actualizar el estado del usuario');
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await adminService.deleteUser(uid);
            alert('Usuario eliminado exitosamente');
            loadUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Error al eliminar el usuario');
        }
    };

    const openUserModal = (user: adminService.UserRecord) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setShowUserModal(false);
    };

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="spinner"></div>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <p>{error}</p>
                <button onClick={loadUsers}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="users-tab">
            <div className="section-header">
                <h2>Gestión de Usuarios</h2>
                <button onClick={loadUsers} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Rol</th>
                            <th>Fecha de Creación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.uid} className={user.disabled ? 'disabled-row' : ''}>
                                <td>{user.email || 'Sin email'}</td>
                                <td>{user.displayName || 'Sin nombre'}</td>
                                <td>
                                    <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                                        {user.disabled ? 'Deshabilitado' : 'Activo'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                        {user.isAdmin ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td>
                                    {user.createdAt
                                        ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString('es-ES')
                                        : 'N/A'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => openUserModal(user)}
                                            className="btn-action btn-view"
                                            title="Ver detalles"
                                        >
                                            👁️
                                        </button>

                                        <button
                                            onClick={() => handleSetAdminRole(user.uid, !user.isAdmin)}
                                            className="btn-action btn-admin"
                                            title={user.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                                        >
                                            {user.isAdmin ? '⭐' : '☆'}
                                        </button>

                                        <button
                                            onClick={() => handleSetUserStatus(user.uid, !user.disabled)}
                                            className="btn-action btn-status"
                                            title={user.disabled ? 'Habilitar' : 'Deshabilitar'}
                                        >
                                            {user.disabled ? '✅' : '⛔'}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteUser(user.uid)}
                                            className="btn-action btn-delete"
                                            title="Eliminar usuario"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="modal-overlay" onClick={closeUserModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Usuario</h2>
                            <button onClick={closeUserModal} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="user-detail">
                                <label>UID:</label>
                                <span>{selectedUser.uid}</span>
                            </div>

                            <div className="user-detail">
                                <label>Email:</label>
                                <span>{selectedUser.email || 'Sin email'}</span>
                            </div>

                            <div className="user-detail">
                                <label>Nombre:</label>
                                <span>{selectedUser.displayName || 'Sin nombre'}</span>
                            </div>

                            <div className="user-detail">
                                <label>Estado:</label>
                                <span className={`status-badge ${selectedUser.disabled ? 'disabled' : 'active'}`}>
                                    {selectedUser.disabled ? 'Deshabilitado' : 'Activo'}
                                </span>
                            </div>

                            <div className="user-detail">
                                <label>Rol:</label>
                                <span className={`role-badge ${selectedUser.isAdmin ? 'admin' : 'user'}`}>
                                    {selectedUser.isAdmin ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>

                            <div className="user-detail">
                                <label>Fecha de Creación:</label>
                                <span>
                                    {selectedUser.createdAt
                                        ? new Date(selectedUser.createdAt.toDate()).toLocaleString('es-ES')
                                        : 'N/A'}
                                </span>
                            </div>

                            <div className="user-detail">
                                <label>Última Actualización:</label>
                                <span>
                                    {selectedUser.updatedAt
                                        ? new Date(selectedUser.updatedAt.toDate()).toLocaleString('es-ES')
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
