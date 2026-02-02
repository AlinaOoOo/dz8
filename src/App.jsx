import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  
  const openForm = () => {
    setShowForm(true);
    window.history.pushState({ form: true }, '', '?form=open');
  };
  
  const closeForm = () => {
    setShowForm(false);
    if (window.location.search.includes('form=open')) {
      window.history.back();
    }
  };
  
  useEffect(() => {
    const handlePopState = () => setShowForm(false);
    window.addEventListener('popstate', handlePopState);
    
    if (window.location.search.includes('form=open')) {
      setShowForm(true);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  return (
    <div className="container">
      <button className="open-button" onClick={openForm}>
        Открыть форму
      </button>
      
      {showForm && <FeedbackPopup onClose={closeForm} />}
    </div>
  );
}

function FeedbackPopup({ onClose }) {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('feedbackData');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      agree: false
    };
  });
  
  const [status, setStatus] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const saveToStorage = () => {
    localStorage.setItem('feedbackData', JSON.stringify(formData));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree) {
      setStatus('Требуется согласие');
      return;
    }
    
    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus('Отправлено');
        setFormData({
          name: '', email: '', phone: '', company: '', message: '', agree: false
        });
        localStorage.removeItem('feedbackData');
        setTimeout(onClose, 1500);
      } else {
        setStatus('Ошибка');
      }
    } catch {
      setStatus('Ошибка сети');
    }
  };
  
  useEffect(() => {
    const timer = setInterval(saveToStorage, 1000);
    return () => clearInterval(timer);
  }, [formData]);
  
  return (
    <div className="overlay" onClick={onClose}>
      <div className="form-popup" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <h3>Обратная связь</h3>
          
          <input
            type="text"
            name="name"
            placeholder="ФИО *"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="tel"
            name="phone"
            placeholder="Телефон"
            value={formData.phone}
            onChange={handleChange}
          />
          
          <input
            type="text"
            name="company"
            placeholder="Организация"
            value={formData.company}
            onChange={handleChange}
          />
          
          <textarea
            name="message"
            placeholder="Сообщение *"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
          />
          
          <label className="checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />
            Согласен с политикой *
          </label>
          
          {status && <div className="status">{status}</div>}
          
          <div className="buttons">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Отправить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;