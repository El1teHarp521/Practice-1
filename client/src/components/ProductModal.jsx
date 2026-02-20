import React, { useState, useEffect } from "react";

export default function ProductModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        name: "", category: "", description: "", price: "", stock: "", image: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: "", category: "", description: "", price: "", stock: "", image: "" });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={{marginTop: 0, borderBottom: "1px solid #333", paddingBottom: "15px"}}>
                    {initialData ? "Редактировать товар" : "Новый товар"}
                </h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Название</label>
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={styles.input}/>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Категория</label>
                        <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.input}/>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Описание</label>
                        <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input}/>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Ссылка на картинку (URL)</label>
                        <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." style={styles.input}/>
                    </div>
                    <div style={{display: "flex", gap: "15px"}}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Цена (₽)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={styles.input}/>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>На складе</label>
                            <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required style={styles.input}/>
                        </div>
                    </div>
                    
                    <div style={styles.buttons}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Отмена</button>
                        <button type="submit" style={styles.submitBtn}>Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    overlay: { 
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
        background: "rgba(0,0,0,0.8)", 
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000
    },
    modal: { 
        background: "#0b0f19", 
        padding: "30px", 
        width: "400px",
        borderRadius: "12px",
        border: "1px solid #333",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        color: "#fff"
    },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px", width: "100%" },
    label: { fontSize: "12px", color: "#888" },
    input: { 
        padding: "10px", 
        background: "#111", 
        color: "#fff",
        border: "1px solid #333", 
        borderRadius: "6px",
        outline: "none",
        fontSize: "14px",
        fontFamily: "inherit"
    },
    buttons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" },
    cancelBtn: { 
        padding: "8px 16px", 
        background: "transparent", 
        color: "#888",
        border: "none", 
        cursor: "pointer"
    },
    submitBtn: { 
        padding: "8px 20px", 
        background: "#fff", 
        color: "#000", 
        border: "none", 
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
    }
};