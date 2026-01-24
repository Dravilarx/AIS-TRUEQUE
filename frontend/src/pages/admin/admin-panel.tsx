import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
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
    const { isAdmin, loading: adminLoading } = useAdmin();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, adminLoading, navigate]);

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

    if (adminLoading || loading) {
        return (
            <div className="admin-panel">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="admin-panel">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadStats}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Panel de Administración</h1>
                <button onClick={() => navigate('/')} className="btn-secondary">
                    Volver al Inicio
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total de Usuarios</h3>
                            <p className="stat-number">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active-icon">✅</div>
                        <div className="stat-content">
                            <h3>Usuarios Activos</h3>
                            <p className="stat-number">{stats.activeUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon disabled-icon">⛔</div>
                        <div className="stat-content">
                            <h3>Usuarios Deshabilitados</h3>
                            <p className="stat-number">{stats.disabledUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon admin-icon">⭐</div>
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
                        <span className="tab-icon">👥</span>
                        <span className="tab-label">Usuarios</span>
                    </button>

                    <button
                        className={`tab-button ${activeTab === 'articles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('articles')}
                    >
                        <span className="tab-icon">📦</span>
                        <span className="tab-label">Artículos</span>
                    </button>

                    <button
                        className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <span className="tab-icon">💼</span>
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
