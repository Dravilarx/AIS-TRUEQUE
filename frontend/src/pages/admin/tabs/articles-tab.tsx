import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Article } from '../../../types';

export const ArticlesTab: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            setLoading(true);
            setError(null);

            const articlesRef = collection(db, 'articles');
            const articlesQuery = query(articlesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(articlesQuery);

            const loadedArticles: Article[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Article[];

            setArticles(loadedArticles);
        } catch (err) {
            console.error('Error loading articles:', err);
            setError('Error al cargar los artículos');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'articles', articleId));
            alert('Artículo eliminado exitosamente');
            loadArticles();
        } catch (err) {
            console.error('Error deleting article:', err);
            alert('Error al eliminar el artículo');
        }
    };

    const handleToggleActive = async (article: Article) => {
        try {
            const newStatus = article.status === 'available' ? 'sold' : 'available';
            await updateDoc(doc(db, 'articles', article.id!), {
                status: newStatus
            });
            alert(`Artículo marcado como ${newStatus === 'available' ? 'disponible' : 'vendido'}`);
            loadArticles();
        } catch (err) {
            console.error('Error updating article status:', err);
            alert('Error al actualizar el estado del artículo');
        }
    };

    const openModal = (article: Article) => {
        setSelectedArticle(article);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedArticle(null);
        setShowModal(false);
    };

    const filteredArticles = articles.filter(article => {
        if (filter === 'all') return true;
        if (filter === 'active') return article.status === 'available';
        if (filter === 'sold') return article.status === 'sold';
        return true;
    });

    if (loading) {
        return (
            <div className="tab-loading">
                <div className="spinner"></div>
                <p>Cargando artículos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-error">
                <p>{error}</p>
                <button onClick={loadArticles}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="articles-tab">
            <div className="section-header">
                <h2>Gestión de Artículos</h2>
                <div className="header-actions">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({articles.length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Disponibles ({articles.filter(a => a.status === 'available').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
                            onClick={() => setFilter('sold')}
                        >
                            Vendidos ({articles.filter(a => a.status === 'sold').length})
                        </button>
                    </div>
                    <button onClick={loadArticles} className="btn-refresh">
                        🔄 Actualizar
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="articles-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Vendedor</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map(article => (
                            <tr key={article.id}>
                                <td>
                                    {article.images && article.images.length > 0 ? (
                                        <img
                                            src={article.images[0]}
                                            alt={article.title}
                                            className="article-thumbnail"
                                        />
                                    ) : (
                                        <div className="no-image">📦</div>
                                    )}
                                </td>
                                <td>{article.title}</td>
                                <td>
                                    <span className="category-badge">{article.category}</span>
                                </td>
                                <td>${article.price.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${article.status === 'available' ? 'active' : 'sold'}`}>
                                        {article.status === 'available' ? 'Disponible' : 'Vendido'}
                                    </span>
                                </td>
                                <td>{article.sellerName || 'Anónimo'}</td>
                                <td>
                                    {article.createdAt
                                        ? new Date(article.createdAt.toDate()).toLocaleDateString('es-ES')
                                        : 'N/A'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => openModal(article)}
                                            className="btn-action btn-view"
                                            title="Ver detalles"
                                        >
                                            👁️
                                        </button>

                                        <button
                                            onClick={() => handleToggleActive(article)}
                                            className="btn-action btn-status"
                                            title={article.status === 'available' ? 'Marcar como vendido' : 'Marcar como disponible'}
                                        >
                                            {article.status === 'available' ? '✅' : '🔄'}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteArticle(article.id!)}
                                            className="btn-action btn-delete"
                                            title="Eliminar artículo"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredArticles.length === 0 && (
                    <div className="empty-state">
                        <p>📦 No hay artículos {filter !== 'all' && `con estado "${filter}"`}</p>
                    </div>
                )}
            </div>

            {/* Article Details Modal */}
            {showModal && selectedArticle && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Artículo</h2>
                            <button onClick={closeModal} className="btn-close">✕</button>
                        </div>

                        <div className="modal-body">
                            {selectedArticle.images && selectedArticle.images.length > 0 && (
                                <div className="article-images">
                                    {selectedArticle.images.map((img, idx) => (
                                        <img key={idx} src={img} alt={`${selectedArticle.title} ${idx + 1}`} />
                                    ))}
                                </div>
                            )}

                            <div className="article-detail">
                                <label>ID:</label>
                                <span>{selectedArticle.id}</span>
                            </div>

                            <div className="article-detail">
                                <label>Título:</label>
                                <span>{selectedArticle.title}</span>
                            </div>

                            <div className="article-detail">
                                <label>Descripción:</label>
                                <span>{selectedArticle.description}</span>
                            </div>

                            <div className="article-detail">
                                <label>Categoría:</label>
                                <span>{selectedArticle.category}</span>
                            </div>

                            <div className="article-detail">
                                <label>Precio:</label>
                                <span>${selectedArticle.price.toLocaleString()}</span>
                            </div>

                            <div className="article-detail">
                                <label>Condición:</label>
                                <span>{selectedArticle.condition}</span>
                            </div>

                            <div className="article-detail">
                                <label>Estado:</label>
                                <span className={`status-badge ${selectedArticle.status === 'available' ? 'active' : 'sold'}`}>
                                    {selectedArticle.status === 'available' ? 'Disponible' : 'Vendido'}
                                </span>
                            </div>

                            <div className="article-detail">
                                <label>Vendedor:</label>
                                <span>{selectedArticle.sellerName || 'Anónimo'}</span>
                            </div>

                            <div className="article-detail">
                                <label>ID Vendedor:</label>
                                <span>{selectedArticle.sellerId}</span>
                            </div>

                            <div className="article-detail">
                                <label>Fecha de Creación:</label>
                                <span>
                                    {selectedArticle.createdAt
                                        ? new Date(selectedArticle.createdAt.toDate()).toLocaleString('es-ES')
                                        : 'N/A'}
                                </span>
                            </div>

                            {selectedArticle.views !== undefined && (
                                <div className="article-detail">
                                    <label>Vistas:</label>
                                    <span>{selectedArticle.views}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
