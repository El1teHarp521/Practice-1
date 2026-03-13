import React, { useEffect, useState } from "react";
import { api } from "./api";
import ProductModal from "./components/ProductModal";
import Auth from "./components/Auth";
import "./App.scss"; 

function App() {
  const [user, setUser] = useState(null); 
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (localStorage.getItem("accessToken")) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) { console.error("Ошибка загрузки товаров"); }
  };

  const handleCreate = () => { setEditingProduct(null); setModalOpen(true); };
  const handleEdit = (product) => { setEditingProduct(product); setModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить этот товар?")) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (e) { alert("Ошибка удаления. Вы не авторизованы."); }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, formData);
      else await api.createProduct(formData);
      setModalOpen(false);
      loadProducts();
    } catch (error) { alert("Ошибка при сохранении"); }
  };

  const formatPrice = (price) => price.toLocaleString('ru-RU');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>МАГАЗИН</h1>
        <div className="user-panel">
            {user ? (
                <>
                    <span>Привет, {user.first_name}!</span>
                    <button className="btn btn--outline" onClick={handleLogout}>Выйти</button>
                    <button className="btn btn--create" onClick={handleCreate}>+ Добавить товар</button>
                </>
            ) : (
                /* Если НЕ вошел - показываем кнопку Вход */
                <button className="btn btn--create" onClick={() => setIsAuthOpen(true)}>Вход / Регистрация</button>
            )}
        </div>
      </header>

      <div className="products-grid">
        {products.map((p, index) => (
          <div key={p.id} className="product-card" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="product-card__image-box">
                <span className="product-card__badge">{p.category}</span>
                <img src={p.image} alt={p.title} className="product-card__img" />
            </div>

            <div className="product-card__info">
                <h3 className="product-card__title" title={p.title}>{p.title}</h3>
                <p className="product-card__desc" title={p.description}>{p.description}</p>
                
                <div className="product-card__stock">Остаток: <b>{p.stock} шт.</b></div>
                
                <div className="product-card__bottom">
                    <div className="product-card__price">{formatPrice(p.price)} ₽</div>
                    
                    {/* Кнопки Изменить/Удалить показываем ТОЛЬКО авторизованным */}
                    {user && (
                        <div className="product-card__actions">
                            <button className="icon-btn icon-btn--edit" onClick={() => handleEdit(p)}>Изменить</button>
                            <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(p.id)}>Удалить</button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Всплывающее окно редактирования/создания товара */}
      <ProductModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingProduct} />
      
      {/* Всплывающее окно Авторизации  */}
      {isAuthOpen && (
          <Auth 
            onClose={() => setIsAuthOpen(false)} 
            onLoginSuccess={() => { setIsAuthOpen(false); checkAuth(); }} 
          />
      )}

    </div>
  );
}

export default App;