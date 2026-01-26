import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Ban, Shield, Package, Briefcase, LayoutDashboard, ArrowLeft } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import { UsersTab } from './tabs/users-tab';
import { ArticlesTab } from './tabs/articles-tab';
import { ServicesTab } from './tabs/services-tab';
import './admin-panel.css';

type TabType = 'users' | 'articles' | 'services';

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    disabledUsers: number;
    adminUsers: number;
}

export const AdminPanel: React.FC = () => {
    const { isAdmin } = useAdmin();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Load stats
    useEffect(() => {
        if (isAdmin) {
            loadStats();
        }
    }, [isAdmin]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsResponse = await adminService.getUserStats();
            setStats(statsResponse.data);
        } catch (err) {
            console.error('Error loading stats:', err);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-panel">
                <div className="admin-header">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        <h1>Panel de Administración</h1>
                    </div>
                </div>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando datos del sistema...</p>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="admin-panel">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadStats} className="btn-refresh">Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    <h1>Panel de Administración</h1>
                </div>
                <button onClick={() => navigate('/')} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users-icon"><Users className="w-6 h-6" /></div>
                        <div className="stat-content">
                            <h3>Total de Usuarios</h3>
                            <p className="stat-number">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active-icon"><CheckCircle className="w-6 h-6" /></div>
                        <div className="stat-content">
                            <h3>Usuarios Activos</h3>
                            <p className="stat-number">{stats.activeUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon disabled-icon"><Ban className="w-6 h-6" /></div>
                        <div className="stat-content">
                            <h3>Usuarios Deshabilitados</h3>
                            <p className="stat-number">{stats.disabledUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon admin-icon"><Shield className="w-6 h-6" /></div>
                        <div className="stat-content">
                            <h3>Administradores</h3>
                            <p className="stat-number">{stats.adminUsers}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="tabs-container">
                <div className="tabs-header">
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users className="w-4 h-4" />
                        <span className="tab-label">Usuarios</span>
                    </button>

                    <button
                        className={`tab-button ${activeTab === 'articles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('articles')}
                    >
                        <Package className="w-4 h-4" />
                        <span className="tab-label">Artículos</span>
                    </button>

                    <button
                        className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <Briefcase className="w-4 h-4" />
                        <span className="tab-label">Servicios</span>
                    </button>
                </div>

                <div className="tabs-content">
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'articles' && <ArticlesTab />}
                    {activeTab === 'services' && <ServicesTab />}
                </div>
            </div>
        </div>
    );
};
