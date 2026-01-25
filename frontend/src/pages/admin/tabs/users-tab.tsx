import { useState, useEffect } from 'react';
import { User, Shield, CheckCircle, Ban, Trash2, Eye, RefreshCw, Star } from 'lucide-react';
import * as adminService from '../../../services/admin.service';

const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';

    try {
        // Handle Firestore Timestamp (Admin SDK: _seconds, Client SDK: seconds)
        const seconds = dateInput._seconds || dateInput.seconds;
        if (seconds !== undefined) {
            return new Date(seconds * 1000).toLocaleDateString('es-ES');
        }

        // Handle toDate() function if available
        if (typeof dateInput.toDate === 'function') {
            return dateInput.toDate().toLocaleDateString('es-ES');
        }

        // Handle case where it might be the MCP-like format { __type__: 'Timestamp', value: '...' }
        if (dateInput.value && (dateInput.__type__ === 'Timestamp' || dateInput._type === 'Timestamp')) {
            const date = new Date(dateInput.value);
            if (!isNaN(date.getTime())) return date.toLocaleDateString('es-ES');
        }

        // Handle ISO strings, numbers, or Date objects
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES');
        }

        return 'N/A';
    } catch (e) {
        console.error('Error formatting date:', e, dateInput);
        return 'N/A';
    }
};

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
            loadUsers();
        } catch (err) {
            console.error('Error setting admin role:', err);
            alert('Error al actualizar el rol de administrador');
        }
    };

    const handleSetUserStatus = async (uid: string, disabled: boolean) => {
        try {
            await adminService.setUserStatus(uid, disabled);
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
                <p className="text-destructive mb-4">{error}</p>
                <button onClick={loadUsers} className="btn-refresh">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="users-tab">
            <div className="section-header">
                <h2>Gestión de Usuarios</h2>
                <button onClick={loadUsers} className="btn-refresh">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
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
                            <th>Creación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.uid} className={user.disabled ? 'disabled-row' : ''}>
                                <td className="font-medium">{user.email || 'Sin email'}</td>
                                <td>{user.displayName || 'Sin nombre'}</td>
                                <td>
                                    <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                                        {user.disabled ? <Ban className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                        {user.disabled ? 'Deshabilitado' : 'Activo'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                        {user.isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                        {user.isAdmin ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td>{formatDate(user.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => openUserModal(user)}
                                            className="btn-action"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleSetAdminRole(user.uid, !user.isAdmin)}
                                            className="btn-action"
                                            title={user.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                                        >
                                            {user.isAdmin ? <Star className="w-4 h-4 fill-current text-yellow-500" /> : <Star className="w-4 h-4" />}
                                        </button>

                                        <button
                                            onClick={() => handleSetUserStatus(user.uid, !user.disabled)}
                                            className="btn-action"
                                            title={user.disabled ? 'Habilitar' : 'Deshabilitar'}
                                        >
                                            {user.disabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4 text-red-500" />}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteUser(user.uid)}
                                            className="btn-action btn-delete"
                                            title="Eliminar usuario"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
                                <span>{formatDate(selectedUser.createdAt)}</span>
                            </div>

                            <div className="user-detail">
                                <label>Última Actualización:</label>
                                <span>{formatDate(selectedUser.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
