import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';

const FORM_STORAGE_KEY = 'feedback_form_data';
const FORM_ENDPOINT = 'https://formcarry.com/s/NA424nm6eB8'; // Замените на реальный URL

const FeedbackForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    message: '',
    agree: false
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка данных из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree) {
      setStatus({ type: 'error', message: 'Необходимо согласие с политикой' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: 'Сообщение отправлено успешно!' 
        });
        
        // Очищаем форму и localStorage
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          organization: '',
          message: '',
          agree: false
        });
        localStorage.removeItem(FORM_STORAGE_KEY);
        
        // Автоматически закрываем через 2 секунды
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Ошибка отправки. Попробуйте еще раз.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h2>Обратная связь</h2>
      
      <div className="form-group">
        <label htmlFor="fullName">ФИО *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="Иванов Иван Иванович"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="example@mail.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Телефон</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      <div className="form-group">
        <label htmlFor="organization">Организация</label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleChange}
          placeholder="Название компании"
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Сообщение *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="4"
          placeholder="Ваше сообщение..."
        />
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="agree"
          name="agree"
          checked={formData.agree}
          onChange={handleChange}
          required
        />
        <label htmlFor="agree">
          Согласен с политикой обработки персональных данных *
        </label>
      </div>

      {status.message && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;