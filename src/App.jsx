import React, { useState, useEffect } from 'react';
import './App.css';
import FeedbackForm from './components/FeedbackForm';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
    window.history.pushState({ formOpen: true }, '', '?feedback=open');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    if (window.location.search.includes('feedback=open')) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = () => setIsFormOpen(false);
    window.addEventListener('popstate', handlePopState);
    
    if (window.location.search.includes('feedback=open')) {
      setIsFormOpen(true);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Сайт</h1>
      </header>

      <main className="content">
        <p>Контент страницы.</p>
        <button className="open-btn" onClick={openForm}>
          Обратная связь
        </button>
      </main>

      {isFormOpen && (
        <div className="popup-overlay" onClick={closeForm}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeForm}>×</button>
            <FeedbackForm onClose={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;