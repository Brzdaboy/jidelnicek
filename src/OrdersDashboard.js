import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { X, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import './OrdersDashboard.css';

function OrdersDashboard({ weekKey, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [printMode, setPrintMode] = useState(null); // 'summary', 'single', null

  const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];
  const mealNames = {
    soup: 'Polévka',
    mealA: 'A)',
    mealB: 'B)',
    mealC: 'C)',
    mealD: 'D) Dietní'
  };

  const mealOrder = ['soup', 'mealA', 'mealB', 'mealC', 'mealD'];

  const loadOrders = useCallback(async () => {
    try {
      console.log('🔥 Krok 1: Hledám menu pro weekKey:', weekKey);
      
      // 1. Najdi menu podle weekKey
      const menusQuery = query(
        collection(db, 'menus'),
        where('weekKey', '==', weekKey)
      );
      const menusSnapshot = await getDocs(menusQuery);
      
      console.log('📝 Krok 2: Nalezeno menu:', menusSnapshot.size);
      
      if (menusSnapshot.empty) {
        console.log('❌ Menu pro tento týden nebylo sdíleno');
        setLoading(false);
        return;
      }
      
      // 2. Vezmi ID prvního menu
      const menuId = menusSnapshot.docs[0].id;
      console.log('✅ Krok 3: Menu ID:', menuId);
      
      // 3. Najdi objednávky podle menuId
      const ordersQuery = query(
        collection(db, 'orders'),
        where('menuId', '==', menuId)
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      console.log('📦 Krok 4: Nalezeno objednávek:', querySnapshot.size);
      
      const ordersData = [];
      const summaryData = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Objednávka:', data);
        ordersData.push({ id: doc.id, ...data });

        // Sečti objednávky podle dní a jídel
        Object.keys(data.orders).forEach(key => {
          if (data.orders[key] > 0) {
            if (!summaryData[key]) summaryData[key] = 0;
            summaryData[key] += data.orders[key];
          }
        });
      });

      console.log('✅ Krok 5: Celkem objednávek:', ordersData.length);
      console.log('📝 Summary:', summaryData);

      setOrders(ordersData);
      setSummary(summaryData);
    } catch (err) {
      console.error('❌ CHYBA při načítání objednávek:', err);
    } finally {
      setLoading(false);
    }
  }, [weekKey]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handlePrintSummary = () => {
    setPrintMode('summary');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  const handlePrintSingle = (orderId) => {
    setExpandedOrders({ [orderId]: true });
    setPrintMode('single-' + orderId);
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  const getMealLabel = (key) => {
    const [dayIdx, mealType] = key.split('-');
    return { dayIdx: parseInt(dayIdx), mealType };
  };

  const getOrdersByDay = (orderData) => {
    const byDay = {};
    
    Object.entries(orderData).forEach(([key, count]) => {
      if (count > 0) {
        const { dayIdx, mealType } = getMealLabel(key);
        if (!byDay[dayIdx]) byDay[dayIdx] = {};
        byDay[dayIdx][mealType] = count;
      }
    });
    
    return byDay;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`orders-dashboard ${printMode ? 'print-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="orders-header">
          <h2>Objednávky pro tento týden</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="orders-loading">Načítám objednávky...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>Zatím žádné objednávky pro tento týden.</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Sdílej jídelníček pomocí tlačítka "Sdílet jídelníček"
            </p>
          </div>
        ) : (
          <>
            {/* Celkový přehled */}
            <div className={`orders-summary ${printMode === 'summary' ? 'print-active' : printMode ? 'print-hidden' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Celkový přehled ({orders.length} objednávek)</h3>
                <button onClick={handlePrintSummary} className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  <Printer size={16} />
                  Tisknout přehled
                </button>
              </div>
              <div className="summary-by-day">
                {[0, 1, 2, 3, 4].map(dayIdx => {
                  // Najdi všechny jídla pro tento den
                  const dayMeals = Object.keys(summary)
                    .filter(key => key.startsWith(`${dayIdx}-`))
                    .filter(key => summary[key] > 0)
                    .sort((a, b) => {
                      const mealTypeA = a.split('-')[1];
                      const mealTypeB = b.split('-')[1];
                      return mealOrder.indexOf(mealTypeA) - mealOrder.indexOf(mealTypeB);
                    });
                  
                  if (dayMeals.length === 0) return null;

                  return (
                    <div key={dayIdx} className="summary-day-card">
                      <div className="summary-day-header">{dayNames[dayIdx]}</div>
                      <div className="summary-meals-list">
                        {dayMeals.map(key => {
                          const [, mealType] = key.split('-');
                          return (
                            <div key={key} className="summary-meal-item">
                              <span className="meal-label">{mealNames[mealType]}:</span>
                              <span className="meal-count">{summary[key]} ks</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail objednávek */}
            <div className={`orders-list ${printMode === 'summary' ? 'print-hidden' : ''}`}>
              <h3>Detail objednávek</h3>
              {orders.map(order => {
                const isExpanded = expandedOrders[order.id];
                const ordersByDay = getOrdersByDay(order.orders);
                
                return (
                  <div key={order.id} className={`order-card ${printMode === 'single-' + order.id ? 'print-active' : printMode && printMode.startsWith('single-') ? 'print-hidden' : ''}`}>
                    <div 
                      className="order-card-header"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="order-header-left">
                        <strong>{order.customerName}</strong>
                        <span className="order-date">
                          {order.timestamp && new Date(order.timestamp.seconds * 1000).toLocaleDateString('cs')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="btn btn-outline no-print" 
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintSingle(order.id);
                          }}
                        >
                          <Printer size={14} />
                        </button>
                        <button className="expand-btn">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="order-details">
                        {Object.keys(ordersByDay).sort().map(dayIdx => (
                          <div key={dayIdx} className="order-day-section">
                            <div className="order-day-title">{dayNames[dayIdx]}</div>
                            <div className="order-meals">
                              {Object.entries(ordersByDay[dayIdx])
                                .sort(([mealTypeA], [mealTypeB]) => 
                                  mealOrder.indexOf(mealTypeA) - mealOrder.indexOf(mealTypeB)
                                )
                                .map(([mealType, count]) => (
                                  <div key={mealType} className="order-meal-row">
                                    <span className="order-meal-label">{mealNames[mealType]}</span>
                                    <span className="order-meal-count">{count} ks</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrdersDashboard;