import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';

const FORM_STORAGE_KEY = 'feedback_form_data';
const FORM_ENDPOINT = 'https://formcarry.com/s/ВАШ_ID';

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
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      }
    }
  }, []);

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

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree) {
      setStatus({ type: 'error', message: 'Необходимо согласие с политикой обработки данных' });
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
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ 
          type: 'success', 
          message: 'Сообщение отправлено успешно! Мы свяжемся с вами в ближайшее время.' 
        });
        
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          organization: '',
          message: '',
          agree: false
        });
        localStorage.removeItem(FORM_STORAGE_KEY);
        setTouched({});

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setStatus({ 
        type: 'error', 
        message: 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или свяжитесь с нами другим способом.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldValid = (field) => {
    if (!touched[field]) return true;
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return formData.email === '' || emailRegex.test(formData.email);
    }
    return true;
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h4>Контактная информация</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fullName">
              ФИО *
              {touched.fullName && !formData.fullName && 
                <span className="error-text"> — Обязательное поле</span>
              }
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              className={touched.fullName && !formData.fullName ? 'error' : ''}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email *
              {touched.email && !isFieldValid('email') && 
                <span className="error-text"> — Некорректный email</span>
              }
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={touched.email && !isFieldValid('email') ? 'error' : ''}
              required
              placeholder="ivanov@example.com"
            />
          </div>
        </div>

        <div className="form-row">
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
              placeholder="ООО «Компания»"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Сообщение</h4>
        <div className="form-group">
          <label htmlFor="message">
            Текст обращения *
            {touched.message && !formData.message && 
              <span className="error-text"> — Обязательное поле</span>
            }
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            className={touched.message && !formData.message ? 'error' : ''}
            required
            rows={5}
            placeholder="Опишите ваш вопрос или проект..."
          />
          <div className="char-count">
            {formData.message.length}/2000 символов
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="agree"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            required
            className="checkbox-input"
          />
          <label htmlFor="agree" className="checkbox-label">
            <span className="checkbox-custom"></span>
            <span>
              Я согласен с <a href="/privacy" target="_blank" rel="noopener noreferrer" className="policy-link">
                политикой обработки персональных данных
              </a> *
            </span>
          </label>
        </div>
      </div>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          <div className="status-icon">
            {status.type === 'success' ? '✓' : '!'}
          </div>
          <div className="status-text">{status.message}</div>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Отправка...
            </>
          ) : 'Отправить сообщение'}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;