import React, { useState, useMemo, useEffect } from 'react';
import { Printer, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import LandingPage from './LandingPage';
import './App.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menus');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [attachments, setAttachments] = useState(() => {
    const saved = localStorage.getItem('attachments');
    return saved ? JSON.parse(saved) : {};
  });
  const [tempAttachments, setTempAttachments] = useState([]);
  const [allergens, setAllergens] = useState(() => {
    const saved = localStorage.getItem('allergens');
    return saved ? JSON.parse(saved) : {};
  });
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  const [currentAllergenEdit, setCurrentAllergenEdit] = useState(null);
  const [tempAllergens, setTempAllergens] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('contactInfo');
    return saved ? JSON.parse(saved) : { phone: '', email: '' };
  });
  const [tempContactInfo, setTempContactInfo] = useState({ phone: '', email: '' });

  // Automatické ukládání menus do localStorage
  useEffect(() => {
    localStorage.setItem('menus', JSON.stringify(menus));
  }, [menus]);

  // Automatické ukládání příloh do localStorage
  useEffect(() => {
    localStorage.setItem('attachments', JSON.stringify(attachments));
  }, [attachments]);

  // Automatické ukládání alergenů do localStorage
  useEffect(() => {
    localStorage.setItem('allergens', JSON.stringify(allergens));
  }, [allergens]);

  // Automatické ukládání kontaktních informací do localStorage
  useEffect(() => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
  }, [contactInfo]);

const allergenList = [
  { id: 1, name: "Lepek – pšenice, žitoo, ječmen, oves, špalda, kamut nebo jejich odrůdy" },
  { id: 2, name: "Korýši" },
  { id: 3, name: "Vejce" },
  { id: 4, name: "Ryby" },
  { id: 5, name: "Arašidy – podzemnice olejná" },
  { id: 6, name: "Sója – sójové boby" },
  { id: 7, name: "Mléko" },
  { id: 8, name: "Skořápkové plody – mandle, lískové ořechy, vlašské ořechy, kešu ořechy, pekanové ořechy, para ořechy, pistácie, makadamie" },
  { id: 9, name: "Celer" },
  { id: 10, name: "Hořčice" },
  { id: 11, name: "Sezam – sezamová semena" },
  { id: 12, name: "Oxid siřičitý a siřičitany – E220, E221, E222, E223, E224, E226, E227, E228" },
  { id: 13, name: "Vlčí bob – lupina" },
  { id: 14, name: "Měkkýši" }
];
const monthNames = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

const dayNames = [
  'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'
];


  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.`;
  };

  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + (weekOffset * 7));
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const weekKey = useMemo(() => {
    return weekDates[0].toISOString().split('T')[0];
  }, [weekDates]);

  const currentMenu = useMemo(() => {
    if (!menus[weekKey]) {
      const newMenu = {};
      weekDates.forEach((_, idx) => {
        newMenu[idx] = {
          soup: '',
          mealA: '',
          mealB: '',
          mealC: '',
          mealD: ''
        };
      });
      return newMenu;
    }
    return menus[weekKey];
  }, [menus, weekKey, weekDates]);

  const currentAttachments = useMemo(() => {
    return attachments[weekKey] || [];
  }, [attachments, weekKey]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (loginForm.username === 'demo' && loginForm.password === 'demo123') {
      setIsLoggedIn(true);
      setLoginError('');
      
      if (rememberMe) {
        localStorage.setItem('isLoggedIn', 'true');
      }
    } else {
      setLoginError('Nesprávné přihlašovací údaje');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: '', password: '' });
    localStorage.removeItem('isLoggedIn');
  };

  const handleInputChange = (dayIdx, field, value) => {
    setMenus(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        [dayIdx]: {
          ...(prev[weekKey]?.[dayIdx] || {}),
          [field]: value
        }
      }
    }));

    if (value.length >= 2) {
      const allMeals = [];
      Object.values(menus).forEach(week => {
        Object.values(week).forEach(day => {
          Object.values(day).forEach(meal => {
            if (meal && meal.trim()) {
              allMeals.push(meal.trim());
            }
          });
        });
      });

      if (menus[weekKey]) {
        Object.values(menus[weekKey]).forEach(day => {
          Object.values(day).forEach(meal => {
            if (meal && meal.trim()) {
              allMeals.push(meal.trim());
            }
          });
        });
      }

      const uniqueMeals = [...new Set(allMeals)];
      const filtered = uniqueMeals
        .filter(meal => 
          meal.toLowerCase().includes(value.toLowerCase()) &&
          meal.toLowerCase() !== value.toLowerCase()
        )
        .slice(0, 5);

      setSuggestions(filtered);
      setActiveSuggestionField({ dayIdx, field });
    } else {
      setSuggestions([]);
      setActiveSuggestionField(null);
    }
  };

  const selectSuggestion = (suggestion, dayIdx, field) => {
    setMenus(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        [dayIdx]: {
          ...(prev[weekKey]?.[dayIdx] || {}),
          [field]: suggestion
        }
      }
    }));
    setSuggestions([]);
    setActiveSuggestionField(null);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Chyba při tisku:', error);
      alert('Nepodařilo se otevřít dialogové okno tisku.');
    }
  };

  const handleExportPDF = () => {
    try {
      const originalTitle = document.title;
      document.title = `Jidelnicek-${weekKey}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 100);
    } catch (error) {
      console.error('Chyba pÅ™i exportu PDF:', error);
      alert('Nepodařilo se otevřít dialogové okno tisku.');
    }
  };

  const selectDateFromCalendar = (date) => {
    const today = new Date();
    const selectedMonday = getMonday(date);
    const currentMonday = getMonday(today);
    
    const diffTime = selectedMonday.getTime() - currentMonday.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    
    setWeekOffset(diffWeeks);
    setShowCalendar(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isInCurrentWeek = (date) => {
    if (!date) return false;
    const dateMonday = getMonday(date);
    return weekDates.some(weekDate => 
      weekDate.getDate() === dateMonday.getDate() &&
      weekDate.getMonth() === dateMonday.getMonth() &&
      weekDate.getFullYear() === dateMonday.getFullYear()
    );
  };

  const changeCalendarMonth = (offset) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarMonth(newDate);
  };

  const openAttachmentsModal = () => {
    setTempAttachments(currentAttachments.length > 0 ? [...currentAttachments] : [{ name: '', price: '' }]);
    setShowAttachmentsModal(true);
  };

  const closeAttachmentsModal = () => {
    setShowAttachmentsModal(false);
    setTempAttachments([]);
  };

  const addAttachment = () => {
    setTempAttachments([...tempAttachments, { name: '', price: '' }]);
  };

  const removeAttachment = (index) => {
    setTempAttachments(tempAttachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (index, field, value) => {
    const updated = [...tempAttachments];
    updated[index][field] = value;
    setTempAttachments(updated);
  };

  const saveAttachments = () => {
    const filtered = tempAttachments.filter(att => att.name.trim() !== '');
    setAttachments(prev => ({
      ...prev,
      [weekKey]: filtered
    }));
    closeAttachmentsModal();
  };

  const detectAllergens = (mealName) => {
    if (!mealName) return [];
    const name = mealName.toLowerCase();
    const detected = [];

if (name.match(/chléb|mouka|těsto|knedlík|pizza|špagety|nudle|pšenic|žito|ječmen|oves|buchty|koláč/)) detected.push(1);
if (name.match(/krab|krevet|langusta|humr|rak/)) detected.push(2);
if (name.match(/vejce|vaječn|omeleta|smaženice/)) detected.push(3);
if (name.match(/ryb|losos|kapr|pstruh|treska|tuňák|makrela|sleď/)) detected.push(4);
if (name.match(/arašíd|burák/)) detected.push(5);
if (name.match(/sój/)) detected.push(6);
if (name.match(/mléko|smetana|sýr|jogurt|tvaroh|máslo|zmrzlin|pud[iy]nk/)) detected.push(7);
if (name.match(/ořech|mandle|oříšk/)) detected.push(8);
if (name.match(/celer/)) detected.push(9);
if (name.match(/hořčic/)) detected.push(10);
if (name.match(/sezam/)) detected.push(11);
if (name.match(/lupin/)) detected.push(13);
if (name.match(/šnek|slávk|kalmár|chobotnic|ústřic/)) detected.push(14);

    return [...new Set(detected)];
  };

  const openAllergenModal = (dayIdx, field, mealName) => {
    const key = `${weekKey}-${dayIdx}-${field}`;
    const existing = allergens[key] || [];
    const detected = detectAllergens(mealName);
    const combined = [...new Set([...existing, ...detected])];
    
    setCurrentAllergenEdit({ dayIdx, field, mealName, key });
    setTempAllergens(combined);
    setShowAllergenModal(true);
  };

  const closeAllergenModal = () => {
    setShowAllergenModal(false);
    setCurrentAllergenEdit(null);
    setTempAllergens([]);
  };

  const toggleAllergen = (allergenId) => {
    setTempAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId].sort((a, b) => a - b);
      }
    });
  };

  const saveAllergens = () => {
    if (currentAllergenEdit) {
      setAllergens(prev => ({
        ...prev,
        [currentAllergenEdit.key]: tempAllergens
      }));
    }
    closeAllergenModal();
  };

  const getAllergenNumbers = (dayIdx, field) => {
    const key = `${weekKey}-${dayIdx}-${field}`;
    return allergens[key] || [];
  };

  const openContactModal = () => {
    setTempContactInfo({ ...contactInfo });
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setTempContactInfo({ phone: '', email: '' });
  };

  const saveContactInfo = () => {
    setContactInfo({ ...tempContactInfo });
    closeContactModal();
  };

  

  // UloÅ¾enÃ­ dat do localStorage pÅ™i kaÅ¾dÃ© zmÄ›nÄ›
  useEffect(() => {
    localStorage.setItem('menus', JSON.stringify(menus));
  }, [menus]);

  useEffect(() => {
    localStorage.setItem('attachments', JSON.stringify(attachments));
  }, [attachments]);

  useEffect(() => {
    localStorage.setItem('allergens', JSON.stringify(allergens));
  }, [allergens]);

  useEffect(() => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
  }, [contactInfo]);

  if (showLanding && !isLoggedIn) {
    return <LandingPage onStartApp={() => setShowLanding(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">TÃ½dennÃ­ jÃ­delnÃ­Äek</h1>
            <p className="login-subtitle">PÅ™ihlaste se do aplikace</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">UÅ¾ivatelskÃ© jmÃ©no</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="form-input"
                placeholder="demo"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Heslo</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="remember-me-group">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-me-checkbox"
                />
                <span>Zapamatovat si přihlášení­</span>
              </label>
            </div>

            <button type="submit" className="btn btn-blue login-btn">
              PÅ™ihlÃ¡sit se
            </button>

            <div className="login-demo-info">
              <p className="demo-text">Demo účet:</p>
              <p className="demo-credentials">Uživatel: <strong>demo</strong></p>
              <p className="demo-credentials">Heslo: <strong>demo123</strong></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderMealRow = (idx, field, label, placeholder) => (
    <div className="meal-row print-meal-row">
      <label className="meal-label print-meal-label">{label}</label>
      <div className="input-wrapper">
        <input
          type="text"
          value={currentMenu[idx]?.[field] || ''}
          onChange={(e) => handleInputChange(idx, field, e.target.value)}
          onFocus={() => setFocusedInput({ dayIdx: idx, field })}
          onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
          className="meal-input"
          placeholder={placeholder}
        />
        {activeSuggestionField?.dayIdx === idx && 
         activeSuggestionField?.field === field && 
         suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, sIdx) => (
              <div
                key={sIdx}
                className="suggestion-item"
                onClick={() => selectSuggestion(suggestion, idx, field)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => openAllergenModal(idx, field, currentMenu[idx]?.[field])}
        className="allergen-btn no-print"
        title="Upravit alergeny"
      >
        {getAllergenNumbers(idx, field).length > 0 
          ? getAllergenNumbers(idx, field).join(',') 
          : 'A'}
      </button>
      <span className="allergen-display print-only">
        {getAllergenNumbers(idx, field).length > 0 && `(${getAllergenNumbers(idx, field).join(',')})`}
      </span>
    </div>
  );

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="no-print header-section">
          <div className="header-top">
            <h1>Týdenní jídělníček</h1>
            <div className="button-group">
              <button onClick={handleLogout} className="btn btn-outline">
                Odhlásit se
              </button>
              <button onClick={openContactModal} className="btn btn-outline">
                Kontakt
              </button>
              <button onClick={openAttachmentsModal} className="btn btn-outline">
                <Download size={20} />
                Přílohy
              </button>
              <button onClick={handleExportPDF} className="btn btn-blue">
                <Download size={20} />
                Export PDF
              </button>
              <button onClick={handlePrint} className="btn btn-green">
                <Printer size={20} />
                Tisknout
              </button>
            </div>
          </div>
          
          <div className="week-navigator">
            <button onClick={() => setWeekOffset(prev => prev - 1)} className="nav-btn">
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setShowCalendar(!showCalendar)} 
              className="week-range week-range-clickable"
              title="Klikněte pro otevření kalendáře"
            >
              <Calendar size={18} className="calendar-icon" />
              {formatDate(weekDates[0])} - {formatDate(weekDates[4])}
            </button>
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="nav-btn">
              <ChevronRight size={24} />
            </button>
          </div>

          {showCalendar && (
            <div className="calendar-panel">
              <div className="calendar-header">
                <button onClick={() => changeCalendarMonth(-1)} className="calendar-nav-btn">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="calendar-month">
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </h3>
                <button onClick={() => changeCalendarMonth(1)} className="calendar-nav-btn">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="calendar-grid">
                {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {getDaysInMonth(calendarMonth).map((date, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day ${!date ? 'calendar-day-empty' : ''} 
                                ${date && isToday(date) ? 'calendar-day-today' : ''} 
                                ${date && isInCurrentWeek(date) ? 'calendar-day-selected' : ''}`}
                    onClick={() => date && selectDateFromCalendar(date)}
                  >
                    {date ? date.getDate() : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="menu-card">
          <h2 className="menu-title">JÃDELNÃÄŒEK</h2>
          <p className="menu-subtitle">
            {formatDate(weekDates[0])} - {formatDate(weekDates[4])}
          </p>
          
          {weekDates.map((date, idx) => (
            <div key={idx} className={`day-section print-day-section ${idx !== 4 ? 'day-border' : ''}`}>
              <h3 className="day-title print-day-title">
                {dayNames[idx]} {formatDate(date)}
              </h3>
              
              <div className="meal-list print-meal-list">
                {renderMealRow(idx, 'soup', 'Polévka:', 'Zadejte polévku')}
                {renderMealRow(idx, 'mealA', 'A)', 'Hlavní chod A')}
                {renderMealRow(idx, 'mealB', 'B)', 'Hlavní chod B')}
                {renderMealRow(idx, 'mealC', 'C)', 'Hlavní­ chod C')}
                {renderMealRow(idx, 'mealD', 'D) Dietní­:', 'Dietí­ jídlo')}
              </div>
            </div>
          ))}
        </div>

        {currentAttachments.length > 0 && (
          <div className="attachments-section print-attachments">
            <h3 className="attachments-title">Přílohy</h3>
            <div className="attachments-list">
              {currentAttachments.map((att, idx) => (
                <div key={idx} className="attachment-item">
                  <span className="attachment-name">{att.name}</span>
                  {att.price && <span className="attachment-price">{att.price} KÄ</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {(contactInfo.phone || contactInfo.email) && (
          <div className="contact-section print-contact">
            <h3 className="contact-title">Kontakt</h3>
            <div className="contact-info">
              {contactInfo.phone && (
                <div className="contact-item">
                  <span className="contact-label">Tel:</span>
                  <span className="contact-value">{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{contactInfo.email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAttachmentsModal && (
        <div className="modal-overlay" onClick={closeAttachmentsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Správa příloh</h2>
            
            <div className="attachments-form">
              {tempAttachments.map((att, idx) => (
                <div key={idx} className="attachment-form-row">
                  <input
                    type="text"
                    value={att.name}
                    onChange={(e) => updateAttachment(idx, 'name', e.target.value)}
                    placeholder="Název přílohy"
                    className="attachment-input attachment-name-input"
                  />
                  <input
                    type="text"
                    value={att.price}
                    onChange={(e) => updateAttachment(idx, 'price', e.target.value)}
                    placeholder="Cena"
                    className="attachment-input attachment-price-input"
                  />
                  {tempAttachments.length > 1 && (
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="btn-remove"
                      title="Odebrat"
                    >
                      âœ•
                    </button>
                  )}
                </div>
              ))}
              
              <button onClick={addAttachment} className="btn-add">
                + Přidat další přílohu
              </button>
            </div>

            <div className="modal-actions">
              <button onClick={closeAttachmentsModal} className="btn btn-secondary">
                Zrušit
              </button>
              <button onClick={saveAttachments} className="btn btn-blue">
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">KontaktnÃ­ Ãºdaje</h2>
            
            <div className="contact-form">
              <div className="form-group">
                <label className="form-label">TelefonnÃ­ ÄÃ­slo</label>
                <input
                  type="tel"
                  value={tempContactInfo.phone}
                  onChange={(e) => setTempContactInfo({ ...tempContactInfo, phone: e.target.value })}
                  placeholder="+420 123 456 789"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={tempContactInfo.email}
                  onChange={(e) => setTempContactInfo({ ...tempContactInfo, email: e.target.value })}
                  placeholder="email@example.com"
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeContactModal} className="btn btn-secondary">
                ZruÅ¡it
              </button>
              <button onClick={saveContactInfo} className="btn btn-blue">
                UloÅ¾it
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllergenModal && currentAllergenEdit && (
        <div className="modal-overlay" onClick={closeAllergenModal}>
          <div className="modal-content allergen-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Alergeny pro: {currentAllergenEdit.mealName || 'Nevyplněno'}</h2>
            <p className="allergen-hint">Automaticky detekované alergeny jsou předvybrané. Upravte dle potřeby.</p>
            
            <div className="allergen-list">
              {allergenList.map((allergen) => (
                <label key={allergen.id} className="allergen-item">
                  <input
                    type="checkbox"
                    checked={tempAllergens.includes(allergen.id)}
                    onChange={() => toggleAllergen(allergen.id)}
                    className="allergen-checkbox"
                  />
                  <span className="allergen-number">{allergen.id}</span>
                  <span className="allergen-name">{allergen.name}</span>
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={closeAllergenModal} className="btn btn-secondary">
                Zrušiit
              </button>
              <button onClick={saveAllergens} className="btn btn-blue">
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
