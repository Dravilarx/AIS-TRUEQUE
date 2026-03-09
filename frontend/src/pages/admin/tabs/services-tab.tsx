import { useState, useEffect } from 'react';
import { Briefcase, Trash2, Eye, CheckCircle, RefreshCw, Layers, Star } from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ServiceProvider as Service } from '../../../types';
import { formatDate } from '../../../lib/utils';

export const ServicesTab: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            setError(null);

            const servicesRef = collection(db, 'services');
            const servicesQuery = query(servicesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(servicesQuery);

            const loadedServices: Service[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Service[];

            setServices(loadedServices);
        } catch (err) {
            console.error('Error loading services:', err);
            setError('Error al cargar los servicios');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'services', serviceId));
            loadServices();
        } catch (err) {
            console.error('Error deleting service:', err);
            alert('Error al eliminar el servicio');
        }
    };

    const handleToggleActive = async (service: Service) => {
        try {
            const newStatus = !service.isActive;
            await updateDoc(doc(db, 'services', service.id!), {
                isActive: newStatus
            });
            loadServices();
        } catch (err) {
            console.error('Error updating service status:', err);
            alert('Error al actualizar el estado del servicio');
        }
    };

    const openModal = (service: Service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedService(null);
        setShowModal(false);
    };

    const filteredServices = services.filter(service => {
        if (filter === 'all') return true;
        if (filter === 'active') return service.isActive;
        if (filter === 'completed') return !service.isActive;
        return true;
    });


    if (error) {
        return (
            <div className="tab-error">
                <p className="text-destructive mb-4">{error}</p>
                <button onClick={loadServices} className="btn-refresh"><RefreshCw className="w-4 h-4 mr-2" /> Reintentar</button>
            </div>
        );
    }

    return (
        <div className="services-tab">
            {loading && (
                <div className="tab-loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <div className="section-header">
                <h2>Gestión de Servicios</h2>
                <div className="header-actions">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({services.length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Activos ({services.filter(s => s.isActive).length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completados ({services.filter(s => !s.isActive).length})
                        </button>
                    </div>
                    <button onClick={loadServices} className="btn-refresh">
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="services-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Proveedor</th>
                            <th>Rating</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map(service => (
                            <tr key={service.id}>
                                <td>
                                    {service.images && service.images.length > 0 ? (
                                        <img
                                            src={service.images[0]}
                                            alt={service.businessName}
                                            className="service-thumbnail"
                                        />
                                    ) : (
                                        <div className="no-image"><Briefcase className="w-5 h-5 opacity-40" /></div>
                                    )}
                                </td>
                                <td className="font-medium">{service.businessName}</td>
                                <td>
                                    <span className="category-badge"><Layers className="w-3 h-3 mr-1" /> {service.category}</span>
                                </td>
                                <td className="whitespace-nowrap">${(service as any).price?.toLocaleString() || '0'}</td>
                                <td>
                                    <span className={`status-badge ${service.isActive ? 'active' : 'completed'}`}>
                                        {service.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>{(service as any).providerName || 'Anónimo'}</td>
                                <td>
                                    <div className="rating-display flex items-center">
                                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                                        {service.stats?.averageRating?.toFixed(1) || '0.0'}
                                    </div>
                                </td>
                                <td>{formatDate(service.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => openModal(service)}
                                            className="btn-action"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleToggleActive(service)}
                                            className="btn-action"
                                            title={service.isActive ? 'Marcar como inactivo' : 'Marcar como activo'}
                                        >
                                            {service.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <RefreshCw className="w-4 h-4" />}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteService(service.id!)}
                                            className="btn-action btn-delete"
                                            title="Eliminar servicio"
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
            {filteredServices.length === 0 && (
                <div className="empty-state">
                    <p>💼 No hay servicios {filter !== 'all' && `con estado "${filter}"`}</p>
                </div>
            )}

            {/* Service Details Modal */}
            {showModal && selectedService && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Servicio</h2>
                            <button onClick={closeModal} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            {selectedService.images && selectedService.images.length > 0 && (
                                <div className="service-images">
                                    {selectedService.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`${selectedService.businessName} ${idx + 1}`} />
                                    ))}
                                </div>
                            )}

                            <div className="service-detail">
                                <label>ID:</label>
                                <span>{selectedService.id}</span>
                            </div>

                            <div className="service-detail">
                                <label>Título:</label>
                                <span>{selectedService.businessName}</span>
                            </div>

                            <div className="service-detail">
                                <label>Descripción:</label>
                                <span>{selectedService.description}</span>
                            </div>

                            <div className="service-detail">
                                <label>Categoría:</label>
                                <span>{selectedService.category}</span>
                            </div>

                            <div className="service-detail">
                                <label>Precio:</label>
                                <span>${(selectedService as any).price?.toLocaleString() || '0'}</span>
                            </div>

                            <div className="service-detail">
                                <label>Duración estimada:</label>
                                <span>{(selectedService as any).duration || 'No especificada'}</span>
                            </div>

                            <div className="service-detail">
                                <label>Estado:</label>
                                <span className={`status-badge ${selectedService.isActive ? 'active' : 'completed'}`}>
                                    {selectedService.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="service-detail">
                                <label>Proveedor:</label>
                                <span>{(selectedService as any).providerName || 'Anónimo'}</span>
                            </div>

                            <div className="service-detail">
                                <label>ID Proveedor:</label>
                                <span>{selectedService.userId}</span>
                            </div>

                            <div className="service-detail">
                                <label>Rating Promedio:</label>
                                <span>⭐ {selectedService.stats?.averageRating?.toFixed(2) || 'N/A'}</span>
                            </div>

                            <div className="service-detail">
                                <label>Total de Ratings:</label>
                                <span>{selectedService.stats?.ratingsCount || 0}</span>
                            </div>

                            <div className="service-detail">
                                <label>Fecha de Creación:</label>
                                <span>{formatDate(selectedService.createdAt)}</span>
                            </div>

                            {(selectedService as any).views !== undefined && (
                                <div className="service-detail">
                                    <label>Vistas:</label>
                                    <span>{(selectedService as any).views}</span>
                                </div>
                            )}

                            {(selectedService as any).tags && (selectedService as any).tags.length > 0 && (
                                <div className="service-detail">
                                    <label>Etiquetas:</label>
                                    <div className="tags-container">
                                        {(selectedService as any).tags.map((tag: string, idx: number) => (
                                            <span key={idx} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
