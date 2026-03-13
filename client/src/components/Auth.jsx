import React, { useState } from "react";
import { api } from "../api";

export default function Auth({ onLoginSuccess, onClose }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({ email: "", password: "", first_name: "", last_name: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            if (isLoginMode) {
                await api.login({ email: formData.email, password: formData.password });
                onLoginSuccess(); 
            } else {
                await api.register(formData);
                await api.login({ email: formData.email, password: formData.password });
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Произошла ошибка");
        }
    };

    return (
        <div className="auth-overlay" onMouseDown={onClose}>
            <div className="auth-card" onMouseDown={e => e.stopPropagation()}>
                {/* Кнопка закрытия крестиком */}
                <button className="auth-close" onClick={onClose}>✕</button>

                <h2>{isLoginMode ? "Вход в систему" : "Регистрация"}</h2>
                
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLoginMode && (
                        <>
                            <input placeholder="Имя" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                            <input placeholder="Фамилия" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                        </>
                    )}
                    <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input type="password" placeholder="Пароль" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    
                    <button type="submit" className="btn btn--create">
                        {isLoginMode ? "Войти" : "Зарегистрироваться"}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLoginMode ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                    <span onClick={() => setIsLoginMode(!isLoginMode)}>
                        {isLoginMode ? "Создать" : "Войти"}
                    </span>
                </p>
            </div>
        </div>
    );
}