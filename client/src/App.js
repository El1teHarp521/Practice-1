import React, { useEffect, useState } from "react";
import { api } from "./api";
import ProductModal from "./components/ProductModal";
import "./App.scss"; 

function App() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      alert("Ошибка загрузки данных");
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить этот товар?")) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setModalOpen(false);
      loadProducts();
    } catch (error) {
      alert("Ошибка при сохранении");
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>МАГАЗИН</h1>
        <button className="btn btn--create" onClick={handleCreate}>+ Добавить товар</button>
      </header>

      <div className="products-grid">
        {products.map((p, index) => (
          <div 
            key={p.id} 
            className="product-card"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="product-card__image-box">
                <span className="product-card__badge">{p.category}</span>
                <img src={p.image} alt={p.name} className="product-card__img" />
            </div>

            <div className="product-card__info">
                <h3 className="product-card__title" title={p.name}>{p.name}</h3>
                <p className="product-card__desc" title={p.description}>{p.description}</p>
                
                <div className="product-card__stock">
                  Остаток: <b>{p.stock} шт.</b>
                </div>
                
                <div className="product-card__bottom">
                    <div className="product-card__price">
                        {formatPrice(p.price)} ₽
                    </div>
                    <div className="product-card__actions">
                        <button className="icon-btn icon-btn--edit" onClick={() => handleEdit(p)}>
                          Изменить
                        </button>
                        <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(p.id)}>
                          Удалить
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />
    </div>
  );
}

export default App;