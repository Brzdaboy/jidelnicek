import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import './OrderPage.css';

function OrderPage() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const menuId = new URLSearchParams(window.location.search).get('id');

  const loadMenu = useCallback(async () => {
    try {
      const docRef = doc(db, 'menus', menuId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setMenu(docSnap.data());
      } else {
        setError('Jídelníček nenalezen');
      }
    } catch (err) {
      setError('Chyba při načítání: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleOrderChange = (dayIdx, field, value) => {
    setOrders(prev => ({
      ...prev,
      [`${dayIdx}-${field}`]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      alert('Zadejte prosím své jméno');
      return;
    }

    try {
      await addDoc(collection(db, 'orders'), {
        menuId,
        customerName,
        orders,
        timestamp: new Date()
      });
      setSubmitted(true);
    } catch (err) {
      alert('Chyba při odesílání: ' + err.message);
    }
  };

  if (loading) return <div className="order-loading">Načítám jídelníček...</div>;
  if (error) return <div className="order-error">{error}</div>;
  if (submitted) {
    return (
      <div className="order-success">
        <h2>✓ Objednávka odeslána</h2>
        <p>Děkujeme, {customerName}!</p>
      </div>
    );
  }

  const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];

  return (
    <div className="order-container">
      <h1>Objednávka jídelníčku</h1>
      <p className="order-subtitle">Týden: {menu.weekRange}</p>

      <div className="customer-input">
        <label>Vaše jméno:</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Jan Novák"
        />
      </div>

      <div className="order-days">
        {[0, 1, 2, 3, 4].map(dayIdx => (
          <div key={dayIdx} className="order-day">
            <h3>{dayNames[dayIdx]}</h3>
            
            {menu.data[dayIdx].soup && (
              <div className="order-item">
                <span>{menu.data[dayIdx].soup}</span>
                <input
                  type="number"
                  min="0"
                  value={orders[`${dayIdx}-soup`] || 0}
                  onChange={(e) => handleOrderChange(dayIdx, 'soup', e.target.value)}
                />
              </div>
            )}

            {['mealA', 'mealB', 'mealC', 'mealD'].map(field => {
              const meal = menu.data[dayIdx][field];
              if (!meal) return null;
              return (
                <div key={field} className="order-item">
                  <span>{meal}</span>
                  <input
                    type="number"
                    min="0"
                    value={orders[`${dayIdx}-${field}`] || 0}
                    onChange={(e) => handleOrderChange(dayIdx, field, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="order-submit-btn">
        Odeslat objednávku
      </button>
    </div>
  );
}

export default OrderPage;