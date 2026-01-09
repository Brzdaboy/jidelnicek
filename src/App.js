import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Printer, ChevronLeft, ChevronRight, Calendar, Settings, ChevronDown, Share2, ShoppingCart } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import OrdersDashboard from './OrdersDashboard';
import LandingPage from './LandingPage';
import './App.css';
import './Print.css';
import './PrintGrid.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);
  const calendarRef = useRef(null);
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
  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('contactInfo');
    return saved ? JSON.parse(saved) : { phone: '', email: '' };
  });
  const [tempContactInfo, setTempContactInfo] = useState({ phone: '', email: '' });

  const [pdfLayout, setPdfLayout] = useState(() => {
    const saved = localStorage.getItem('pdfLayout');
    return saved || 'vertical';
  });

  const [showAllergenList, setShowAllergenList] = useState(() => {
    const saved = localStorage.getItem('showAllergenList');
    return saved === 'true';
  });

  const [mealsCount, setMealsCount] = useState(() => {
    const saved = localStorage.getItem('mealsCount');
    return saved ? parseInt(saved) : 4;
  });

  const [activeDays, setActiveDays] = useState(() => {
    const saved = localStorage.getItem('activeDays');
    return saved ? JSON.parse(saved) : [0, 1, 2, 3, 4]; // Po-Pá defaultně
  });

  const [showOrdersDashboard, setShowOrdersDashboard] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState(0);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('columnWidths');
    return saved ? JSON.parse(saved) : { label: 80, weight: 80, meal: 0, allergen: 30 };
  });

  // Nový state pro modální okno nastavení
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('attachments'); // 'attachments', 'contact', 'layout'

  useEffect(() => {
    localStorage.setItem('showAllergenList', showAllergenList);
  }, [showAllergenList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

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

  useEffect(() => {
    localStorage.setItem('pdfLayout', pdfLayout);
  }, [pdfLayout]);

  useEffect(() => {
    localStorage.setItem('mealsCount', mealsCount.toString());
  }, [mealsCount]);

  useEffect(() => {
    localStorage.setItem('activeDays', JSON.stringify(activeDays));
  }, [activeDays]);

  const allergenList = [
    { id: 1, name: "Lepek – pšenice, žito, ječmen, oves, špalda, kamut nebo jejich odrůdy" },
    { id: 2, name: "Korýši" },
    { id: 3, name: "Vejce" },
    { id: 4, name: "Ryby" },
    { id: 5, name: "Arašídy – podzemnice olejná" },
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
    'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'
  ];

  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday.getTime());
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const weekKey = useMemo(() => {
    // Používá ISO datum prvního dne v týdnu jako klíč 
    return weekDates[0].toISOString().split('T')[0];
  }, [weekDates]);

  const currentMenu = useMemo(() => {
    if (!menus[weekKey]) {
      // Vytvoříme výchozí strukturu pro daný týden
      const newMenu = {};
      weekDates.forEach((_, idx) => {
        newMenu[idx] = {
          soup: '',
          mealA: '',
          mealB: '',
          mealC: '',
          mealD: '',
          mealE: '',
          // Přidáváme i pole pro váhy
          soup_weight: '',
          mealA_weight: '',
          mealB_weight: '',
          mealC_weight: '',
          mealD_weight: '',
          mealE_weight: ''
        };
      });
      return newMenu;
    }
    // Zajistíme, že data mají správnou strukturu, i když byla načtena ze starého formátu
    const existingMenu = menus[weekKey];
    weekDates.forEach((_, idx) => {
        if (!existingMenu[idx]) {
             existingMenu[idx] = {
                soup: '', mealA: '', mealB: '', mealC: '', mealD: '', mealE: '',
                soup_weight: '', mealA_weight: '', mealB_weight: '', mealC_weight: '', mealD_weight: '', mealE_weight: ''
             };
        } else {
             // Zajištění existence polí pro váhu
             if (existingMenu[idx].soup_weight === undefined) existingMenu[idx].soup_weight = '';
             if (existingMenu[idx].mealA_weight === undefined) existingMenu[idx].mealA_weight = '';
             if (existingMenu[idx].mealB_weight === undefined) existingMenu[idx].mealB_weight = '';
             if (existingMenu[idx].mealC_weight === undefined) existingMenu[idx].mealC_weight = '';
             if (existingMenu[idx].mealD_weight === undefined) existingMenu[idx].mealD_weight = '';
             if (existingMenu[idx].mealE === undefined) existingMenu[idx].mealE = '';
             if (existingMenu[idx].mealE_weight === undefined) existingMenu[idx].mealE_weight = '';
        }
    });
    return existingMenu;
  }, [menus, weekKey, weekDates]);

  const currentAttachments = useMemo(() => {
  // Pokud aktuální týden má přílohy, vrať je
  if (attachments[weekKey] && attachments[weekKey].length > 0) {
    return attachments[weekKey];
  }
  
  // Jinak najdi nejbližší předchozí týden s přílohami
  const allWeekKeys = Object.keys(attachments).sort();
  for (let i = allWeekKeys.length - 1; i >= 0; i--) {
    if (allWeekKeys[i] < weekKey && attachments[allWeekKeys[i]].length > 0) {
      return attachments[allWeekKeys[i]];
    }
  }
  
  return [];
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
    // Vytvoříme novou hodnotu (string nebo number)
    const newValue = field.includes('_weight') ? (value !== '' ? Number(value) : '') : value;

    setMenus(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        [dayIdx]: {
          ...(prev[weekKey]?.[dayIdx] || {}),
          [field]: newValue
        }
      }
    }));

    // Logika pro našeptávač je relevantní jen pro textová pole (ne pro váhu)
    if (!field.includes('_weight') && typeof newValue === 'string' && newValue.length >= 2) {
      const allMeals = [];
      // Procházíme všechna jídla v celém uloženém menu
      Object.values(menus).forEach(week => {
        Object.values(week).forEach(day => {
          // Přidáme pouze pole pro jídla (soup, mealA, atd.), ne pro váhy
          Object.keys(day).filter(key => !key.includes('_weight')).forEach(key => {
            const meal = day[key];
            if (meal && typeof meal === 'string' && meal.trim()) {
              allMeals.push(meal.trim());
            }
          });
        });
      });

      // Přidáme i jídla z aktuálně editovaného týdne
      if (menus[weekKey]) {
        Object.values(menus[weekKey]).forEach(day => {
          Object.keys(day).filter(key => !key.includes('_weight')).forEach(key => {
            const meal = day[key];
            if (meal && typeof meal === 'string' && meal.trim()) {
              allMeals.push(meal.trim());
            }
          });
        });
      }
      
      // Filtrujeme a odebíráme duplikáty
      const uniqueMeals = [...new Set(allMeals)];
      
      // Filtrujeme podle aktuální hodnoty
      const filtered = uniqueMeals
        .filter(meal => 
          meal.toLowerCase().includes(newValue.toLowerCase()) &&
          meal.toLowerCase() !== newValue.toLowerCase() // Neukazovat přesnou shodu
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
      console.error('Chyba při exportu PDF:', error);
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
    
    // Přidání prázdných polí pro dny před začátkem měsíce (Po-Ne)
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
 // Zkontroluje, zda se datum nachází v aktuálně zobrazeném týdnu
  const targetDateStr = formatDateForComparison(date);
  return weekDates.some(weekDate => formatDateForComparison(weekDate) === targetDateStr);
};

const hasMenuForDate = (date) => {
  if (!date) return false;
  
  const monday = getMonday(date);
  const mondayStr = formatDateForComparison(monday);
  
  if (!menus[mondayStr]) return false;
  
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  const dayIdx = dayOfWeek - 1;
  
  const dayMenu = menus[mondayStr]?.[dayIdx];
  if (!dayMenu) return false;
  
  return !!(dayMenu.soup || dayMenu.mealA || dayMenu.mealB || dayMenu.mealC || dayMenu.mealD);
};

  const changeCalendarMonth = (offset) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarMonth(newDate);
  };

  // Nová funkce pro otevření nastavení
  const openSettingsModal = () => {
    setTempAttachments(currentAttachments.length > 0 ? [...currentAttachments] : [{ name: '', price: '' }]);
    setTempContactInfo({ ...contactInfo });
    setSettingsTab('mealsCount');
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setTempAttachments([]);
    setTempContactInfo({ phone: '', email: '' });
  };

  const addAttachment = () => {
  if (tempAttachments.length < 7) {
    setTempAttachments([...tempAttachments, { name: '', price: '' }]);
  }
};

  const removeAttachment = (index) => {
    setTempAttachments(tempAttachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (index, field, value) => {
    const updated = [...tempAttachments];
    updated[index][field] = value;
    setTempAttachments(updated);
  };

  const saveSettings = () => {
  // Uložit přílohy
  const filtered = tempAttachments.filter(att => att.name.trim() !== '');
  setAttachments(prev => ({
    ...prev,
    [weekKey]: filtered
  }));

  // Uložit kontaktní informace
  setContactInfo({ ...tempContactInfo });

  closeSettingsModal();
};

  const detectAllergens = (mealName) => {
    if (!mealName) return [];
    const name = mealName.toLowerCase();
    const detected = [];

    // Pravidla pro detekci alergenů (s ohledem na CZ diakritiku)
    if (name.match(/chléb|mouka|těsto|knedlík|pizza|špagety|nudle|pšenice|žito|ječmen|oves|špalda|kamut|celozrnné pečivo|toustový chléb|rohlík|houska|bageta|krekry|pizza těsto|langoš|kapsa|hamburger bulka|tortilla|pita|těstoviny|lasagne|špagety|farfalle|kuskus|bulgur|moučná jíška|moučné noky|sekaná s moukou|karbanátky s moukou|palačinky|líance|vdolky|piškoty|sušenky|koláč|perník|buchta/)) detected.push(1);
    if (name.match(/krab|krevet|langusta|humr|rak|krab|humr|krevety|garnáti|langusta|scampi|krabí tyčinky (surimi)|koktejlové krevety|krevety v těstíčku|thajské krevety|krevety na česneku|mořský koktejl|krevetová pasta|krevetový vývar|krevetový olej|gambas|krabí olej|krabí maso|humří maso|humří omáčka|krabí polévka|fumet|černé tygří krevety|bílí garnáti|panko krevety|krevety tempura|krevetové knedlíčky|asijské krevety|grilované krevety|krevetové ravioli/)) detected.push(2);
    if (name.match(/vejce|vaječn|omeleta|smaženice|vejce|vaječný bílek|vaječný žloutek|majonéza|tatarka|holandská omáčka|vaječná těstovina|vajíčko natvrdo|míchaná vejce|volské oko|palačinkové těsto|lívancové těsto|piškoty|vaječný koňak|snadná omeleta|omeleta|smaženice|vaječné sušené|vaječný krém|vaječné pečivo|vaječná mouka|bezé|piškotové těsto|quiche|vaječná poleva|kremrole|vaječná mašlovačka|tiramisu (savoiardi)|noky s vejcem|těsto na koláč|domácí těstoviny/)) detected.push(3);
    if (name.match(/ryb|losos|kapr|pstruh|treska|tuňák|makrela|sleď|losos|tuňák|treska|makrela|pstruh|kapr|sumec|hejk|sardinky|ančovičky|sleď|halibut|mořský vlk|mořský dorad|candát|tilápie|sumec africký|rybí omáčka|rybí vývar|sušené ryby|uzený losos|uzená makrela|karé losos|rybí prsty|rybí nuggety|filet z tresky|rybí karbanátky|ředěné rybí aroma|rybí paštika|grilovaná ryba|pečená ryba|tempura ryba/)) detected.push(4);
    if (name.match(/arašíd|burák|arašídy|arašídové máslo|arašídový olej|arašídová mouka|pražené arašídy|slané arašídy|arašídy v těstíčku|arašídová omáčka|satay|arašídy v pečivu|arašídové tyčinky|protein s arašídy|čoko arašídy|mix ořechů s arašídy|arašídy na křupky|arašídová pasta|asijská arašídová omáčka|čínské arašídy|snacky z arašídů|arašídové sušenky|domácí peanut butter|arašídový krém|arašídový koláč|arašídové polevy|arašídová zmrzlina|arašídy v čokoládě|arašídový fudge|arašídová tortilla|mleté arašídy|arašídy na salátu/)) detected.push(5);
    if (name.match(/sója|sójová omáčka|tamari|tofu|tempeh|edamame|sojové boby|sojová mouka|sojové maso|sojový protein|sojové mléko|sojové jogurty|sojový krém|sojová pasta|miso pasta|miso polévka|sojové nudle|sojové řezance|sojové dezerty|sojová čokoláda|lecitin (E322)|sojová omáčka tmavá|sojová omáčka světlá|sojová poleva|sojový sirup|asijské omáčky|vegan náhražky|vegan klobása|vegan sýr|vegan párky|sojové karbanátky|sojové řízky/)) detected.push(6);
    if (name.match(/mléko|smetana|sýr|jogurt|tvaroh|máslo|mozarela|eidam|zmrzlin|pud[iy]nk|mléko|sýr|mozzarella|eidam|emmental|parmazán|čedar|gouda|ricotta|tvaroh|jogurt|kefír|máslo|smetana|zakysaná smetana|šlehačka|mléčná čokoláda|mléčné kakao|mléčné pečivo|pudink|bešamel|mléčné karamelky|kondenzované mléko|sušené mléko|mléčná zmrzlina|mléčný koktejl|mléčný krém|sýrová omáčka|sýrové noky|sýrové těstoviny|fondue|sýrové pečivo|tavený sýr/)) detected.push(7);
    if (name.match(/ořech|mandle|oříšky|vlašské ořechy|lískové oříšky|mandle|kešu|pistácie|para ořechy|makadamové|pekany|ořechová mouka|ořechové tyčinky|ořechový krém|ořechové máslo|ořechové pečivo|ořechová nádivka|marcipán|ořechové sušenky|ořechová čokoláda|granola s ořechy|mix ořechů|ořechové koláče|ořechové torty|kandované ořechy|pražené ořechy|mleté ořechy|karamelizované ořechy|ořechové těsto|ořechové mléko|ořechové krémy|nutella (lískooříšky)|ořechová pasta/)) detected.push(8);
    if (name.match(/celer|celer kořen|celer nať|celer v omáčkách|celer v polévce|celerová sůl|celerová šťáva|celerová pasta|celerové chipsy|celerové karbanátky|celerová omáčka|celerová marmeláda|celer v salátu|celerové listy|celerová pyré|řapíkatý celer|celerová majonéza|celer v nádivce|celer v pomazánce|celerové hody|celerová kimchi|celerová šťáva fresh|kandovaný celer|kyselý celer|celer z pece|celer slanina|celer pečený|kořenové směsi|celer v marinádě|celer v karbanátkách|mix kořenové zeleniny/)) detected.push(9);
    if (name.match(/hořčice|hořčice|celá hořčičná semena|dijonská hořčice|americká hořčice|plnotučná hořčice|kremžská hořčice|hořčičná pasta|hořčičný dresink|hořčičná omáčka|hořčičné marinády|hořčičný prach|hořčičné semínko|hořčičný olej|hořčičné koření|pickles s hořčicí|uzeniny s hořčicí|zálivka s hořčicí|hořčičná majonéza|tatarka s hořčicí|hořčičné maso|hořčičná kuřecí|hořčičná kotletta|hořčičný guláš|hořčičné noky|hořčičný dip|hořčičné zelí|hořčice v sendviči|hořčice v burgery|hořčičné pečivo/)) detected.push(10);
    if (name.match(/sezam|sezam|sezamová semínka|tahini|sezamová pasta|hummus se sezamem|sezamový olej|sezamová tahina|sezamová tyčinka|sezamové pečivo|sezam na sushi|sezamová omáčka|sezamové krusty|sezamové krekry|sezamový chléb|sladké sesamky|sezamové kuličky|sezamové sušenky|sezamová nougat|sezamová rýže|sezamové karé|sezamová tortilla|sezamová tempura|korejský sesam|sezamová sol|sezam cerny|sezam bily|sezamové pesto|sezamová marina|sezam v granole|sezam v sladkostech|sezam v polévkách/)) detected.push(11);
    // 12 - Oxid siřičitý (těžké detekovat z názvu jídla, ale můžeme zkusit)
    if (name.match(/víno|sušené ovoce|sušené ovoce|rozinky|meruňky sušené|švestky sušené|víno|mošt|bílé víno|červené víno|cidr|konzervované ovoce|konzervovaná zelenina|brambory v balíčku|loupané brambory|prosecco|šumivé víno|balené džusy|sušené byliny|sušené houby|hotové omáčky|uzeniny|balené saláty|balené pelyněk|sulfity v těstovinách|cibulové kroužky|hotové knedlíky|předvařené jídlo|kyselé okurky|nakládané jídlo|marmelády|džemy|kompoty/)) detected.push(12); 
    if (name.match(/lupina|lupinová mouka|lupinový protein|lupinové pečivo|lupinové těstoviny|bezlepkový chléb s lupinou|lupinové sušenky|lupinová tortilla|lupinová kaše|lupinová náhrada masa|vegan řízek z lupiny|lupinový krém|lupinová pasta|lupinová palačinka|lupinové sušené|lupinová čokoláda|lupinové tyčinky|proteinové tyčinky s lupinou|lupinové mlýny|lupinová rýže|lupinové nudle|lupinový spread|lupinové dezerty|lupinové knedlíky|bezlepkové muffiny|bezlepkové pečivo|vegan pečivo|lupinová pizza|lupinové krekry|lupinové sendviče|lupinový koláč/)) detected.push(13);
    if (name.match(/šnek|slávky|kalmáry|chobotnice|ústřice|slávky|mušle|ústřice|chobotnice|sépie|kalamáry|krakatice|škeble|mořské mušle|mušle sv Jakuba|středomořské mušle|asijské mušle|mořské plody|kalamárové kroužky|calamari tempura|grilovaná sépie|sépiové maso|sépiový inkoust|ústřice raw|mořská omáčka|mořská paštika|mořské koktejly|gratinované mušle|mořská rýže|paella s mušlemi|španělské mušle|mořské těstoviny|mušle na bíle víně|mušle na česneku|mořské sushi|mušle pečené/)) detected.push(14);

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

  // Načítání počtu nepřečtených objednávek
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        // Najdi menu podle weekKey
        const menusQuery = query(
          collection(db, 'menus'),
          where('weekKey', '==', weekKey)
        );
        const menusSnapshot = await getDocs(menusQuery);
        
        if (menusSnapshot.empty) {
          setUnreadOrdersCount(0);
          setHasNewOrders(false);
          return;
        }
        
        const menuId = menusSnapshot.docs[0].id;
        
        // Najdi objednávky
        const ordersQuery = query(
          collection(db, 'orders'),
          where('menuId', '==', menuId)
        );
        
        const querySnapshot = await getDocs(ordersQuery);
        
        // Celkový počet objednávek
        const totalCount = querySnapshot.size;
        setUnreadOrdersCount(totalCount);
        
        // Zkontroluj jestli jsou nějaké nové
        const lastRead = localStorage.getItem(`lastRead-${weekKey}`);
        const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
        
        let hasNew = false;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const orderTime = data.timestamp?.seconds * 1000 || 0;
          if (orderTime > lastReadTime) {
            hasNew = true;
          }
        });
        
        setHasNewOrders(hasNew);
      } catch (err) {
        console.error('Chyba při načítání objednávek:', err);
      }
    };

    loadUnreadCount();
    
    // Aktualizuj každých 30 sekund
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [weekKey]);

  // Funkce pro otevření dashboardu a označení jako přečtené
  const openOrdersDashboard = () => {
    setShowOrdersDashboard(true);
    // Ulož aktuální čas jako "poslední přečtení"
    const now = new Date().toISOString();
    localStorage.setItem(`lastRead-${weekKey}`, now);
    // Označ jako přečtené (kolečko zešedne)
    setHasNewOrders(false);
  };

  const shareMenu = async () => {
    try {
      const menuData = {
        weekKey,
        weekRange: `${formatDate(weekDates[0])} - ${formatDate(weekDates[4])}`,
        data: currentMenu,
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, 'menus'), menuData);
      const link = `${window.location.origin}/order?id=${docRef.id}`;
      setShareLink(link);
      setShowShareModal(true);
    } catch (err) {
      alert('Chyba při vytváření odkazu: ' + err.message);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Odkaz zkopírován do schránky!');
  };

  if (showLanding && !isLoggedIn) {
    return <LandingPage onStartApp={() => setShowLanding(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Týdenní jídelníček</h1>
            <p className="login-subtitle">Přihlaste se do aplikace</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Uživatelské jméno</label>
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
                <span>Zapamatovat si přihlášení</span>
              </label>
            </div>

            <button type="submit" className="btn btn-blue login-btn">
              Přihlásit se
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

  const renderMealRow = (dayIdx, field, label, placeholder, unit) => {
    const mealValue = currentMenu[dayIdx]?.[field] || '';
    const isEmpty = !mealValue.trim();
    
    return (
    <div className={`meal-row print-meal-row ${isEmpty ? 'empty-meal' : ''}`}>
      <label className="meal-label print-meal-label">{label}</label>
      <div className="input-wrapper">
        <input
          type="text"
          value={currentMenu[dayIdx]?.[field] || ''}
          onChange={(e) => handleInputChange(dayIdx, field, e.target.value)}
          
          className="meal-input"
          placeholder={placeholder}
        />
        <span className="meal-text-print print-only">{currentMenu[dayIdx]?.[field] || ''}</span>
        {activeSuggestionField?.dayIdx === dayIdx && 
          activeSuggestionField?.field === field && 
          suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, sIdx) => (
              <div
                key={sIdx}
                className="suggestion-item"
                onClick={() => selectSuggestion(suggestion, dayIdx, field)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div 
        className="weight-input-wrapper"
        data-weight={currentMenu[dayIdx]?.[`${field}_weight`] || ''}
        data-unit={unit}
      >
        <input
          type="number"
          // Pro input type="number" je lepší použít String(value) pro správné zobrazení prázdného pole
          value={currentMenu[dayIdx]?.[`${field}_weight`] !== '' ? String(currentMenu[dayIdx]?.[`${field}_weight`]) : ''}
          onChange={(e) => handleInputChange(dayIdx, `${field}_weight`, e.target.value)}
          className="weight-input"
          placeholder="0"
          min="0"
        />
        <span className="weight-unit">{unit}</span>
      </div>
      <button
        onClick={() => openAllergenModal(dayIdx, field, currentMenu[dayIdx]?.[field])}
        className="allergen-btn no-print"
        title="Upravit alergeny"
      >
        {(() => {
          const allergens = getAllergenNumbers(dayIdx, field);
          if (allergens.length === 0) return 'A';
          if (allergens.length <= 2) return allergens.join(',');
          return `${allergens.slice(0, 2).join(',')}...`;
        })()}
      </button>
      <span className="allergen-display print-only">
        {(() => {
          const allergens = getAllergenNumbers(dayIdx, field);
          if (allergens.length === 0) return '';
          if (allergens.length <= 2) return `(${allergens.join(',')})`;
          return `(${allergens.slice(0, 2).join(',')}...)`;
        })()}
      </span>
    </div>
  );
};

  return (
    <div className={`app-container ${pdfLayout === 'grid' ? 'pdf-grid-layout' : ''}`}>
      <div className="content-wrapper">
        <div className="no-print header-section">
          <div className="header-top">
            
            <div className="button-group">
  <button onClick={handlePrint} className="btn btn-green">
    <Printer size={20} />
    Tisknout
  </button>

  <button onClick={shareMenu} className="btn btn-blue">
    <Share2 size={20} />
    Sdílet jídelníček
  </button>

  <button onClick={openOrdersDashboard} className="btn btn-outline orders-btn">
    <ShoppingCart size={20} />
    Objednávky
    {unreadOrdersCount > 0 && (
      <span className={`orders-badge ${hasNewOrders ? 'orders-badge-new' : 'orders-badge-read'}`}>
        {unreadOrdersCount}
      </span>
    )}
  </button>
  
  <div className="account-menu-wrapper" ref={accountMenuRef}>
    <button 
  onClick={() => setShowAccountMenu(!showAccountMenu)} 
  className="btn btn-outline"
>
  Můj účet
  <ChevronDown size={16} />
</button>
    
    {showAccountMenu && (
      <div className="account-dropdown">
        <button 
          onClick={() => {
            setShowAccountMenu(false);
            openSettingsModal();
          }}
          className="dropdown-item"
        >
          <Settings size={16} />
          Nastavení
        </button>
        <button 
          onClick={() => {
            setShowAccountMenu(false);
            handleLogout();
          }}
          className="dropdown-item"
        >
          Odhlásit se
        </button>
      </div>
    )}
  </div>
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
  <div className="calendar-panel" ref={calendarRef}>
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
              ${date && isInCurrentWeek(date) ? 'calendar-day-selected' : ''}
              ${date && hasMenuForDate(date) ? 'calendar-day-has-menu' : ''}`}
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
          <h2 className="menu-title">Týdenní jídelníček</h2>
          
          {weekDates
            .map((date, idx) => ({ date, idx }))
            .filter(({ idx }) => activeDays.includes(idx))
            .map(({ date, idx }, arrayIdx, filteredArray) => {
              const isLastDay = arrayIdx === filteredArray.length - 1;
              
              // Dynamické vytvoření meal fields podle mealsCount
              const mealFields = [];
              const mealLetters = ['A', 'B', 'C', 'D', 'E'];
              for (let i = 0; i < mealsCount; i++) {
                mealFields.push({
                  field: `meal${mealLetters[i]}`,
                  label: `${mealLetters[i]})`,
                  placeholder: `Hlavní chod ${mealLetters[i]}`
                });
              }
              
              return (
                <div key={idx} className={`day-section print-day-section ${!isLastDay ? 'day-border' : ''}`}>
                  <h3 className="day-title print-day-title">
                    {dayNames[idx]} {formatDate(date)}
                  </h3>
                  
                  <div className="meal-list print-meal-list">
                    {renderMealRow(idx, 'soup', 'Polévka:', 'Zadejte polévku', 'ml')}
                    {mealFields.map(({ field, label, placeholder }) => 
                      renderMealRow(idx, field, label, placeholder, 'g')
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {currentAttachments.length > 0 && (
          <div className="attachments-section print-attachments">
            <h3 className="attachments-title">Přílohy</h3>
            <div className="attachments-list">
              {currentAttachments.map((att, idx) => (
                <div key={idx} className="attachment-item">
                  <span className="attachment-name">{att.name}</span>
                  {att.price && <span className="attachment-price">{att.price} g</span>}
                </div>
              ))}
            </div>
          </div>
        )}
{showAllergenList && (
  <div className="allergen-legend print-allergen-legend">
    <div className="allergen-legend-content">
      <strong>Alergeny:</strong> 1. Obiloviny | 2. Korýši | 3. Vejce | 4. Ryby | 5. Podzemnice olejná | 6. Sójové boby | 7. Mléko | 8. Skořápkové plody | 9. Celer | 10. Hořčice | 11. Sezamová semena (sezam) | 12. Oxid siřičitý a siřičitany | 13. Vlčí bob | 14. Měkkýši
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

      {/* Nové modální okno Nastavení */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={closeSettingsModal}>
          <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nastavení</h2>
            
            <div className="settings-tabs">
              <button 
                className={`settings-tab ${settingsTab === 'mealsCount' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('mealsCount')}
              >
                Počet jídel
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'activeDays' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('activeDays')}
              >
                Dny v týdnu
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'attachments' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('attachments')}
              >
                Přílohy
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'contact' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('contact')}
              >
                Kontakt
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'layout' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('layout')}
              >
                Rozložení tisku
              </button>
              <button 
                className={`settings-tab ${settingsTab === 'alergens' ? 'settings-tab-active' : ''}`}
                onClick={() => setSettingsTab('alergens')}
              >
                Alergeny
              </button>
            </div>

            <div className="settings-content">
              {settingsTab === 'mealsCount' && (
                <div className="meals-count-settings">
                  <p className="layout-description">Vyberte počet variant jídel pro jednotlivé dny:</p>
                  <div className="form-group">
                    <label className="form-label">Počet jídel (A, B, C...)</label>
                    <select 
                      value={mealsCount}
                      onChange={(e) => setMealsCount(parseInt(e.target.value))}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="1">1 jídlo (pouze A)</option>
                      <option value="2">2 jídla (A, B)</option>
                      <option value="3">3 jídla (A, B, C)</option>
                      <option value="4">4 jídla (A, B, C, D)</option>
                      <option value="5">5 jídel (A, B, C, D, E)</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                    Polévka je vždy zobrazena jako první položka.
                  </p>
                </div>
              )}

              {settingsTab === 'activeDays' && (
                <div className="active-days-settings">
                  <p className="layout-description">Vyberte, které dny budou v jídelníčku:</p>
                  <div className="days-checkboxes">
                    {dayNames.map((dayName, idx) => (
                      <label key={idx} className="day-checkbox-label">
                        <input
                          type="checkbox"
                          checked={activeDays.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setActiveDays([...activeDays, idx].sort());
                            } else {
                              setActiveDays(activeDays.filter(d => d !== idx));
                            }
                          }}
                          className="day-checkbox"
                        />
                        <span>{dayName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'attachments' && (
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
                        placeholder="Váha (g)"
                        className="attachment-input attachment-price-input"
                      />
                      {tempAttachments.length > 1 && (
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="btn-remove"
                          title="Odebrat"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
  onClick={addAttachment} 
  className="btn-add"
  disabled={tempAttachments.length >= 7}
  style={{ 
    opacity: tempAttachments.length >= 7 ? 0.5 : 1,
    cursor: tempAttachments.length >= 7 ? 'not-allowed' : 'pointer'
  }}
>
  + Přidat další přílohu {tempAttachments.length >= 7 ? '(max. 7)' : ''}
</button>
                </div>
              )}

              {settingsTab === 'contact' && (
                <div className="contact-form">
                  <div className="form-group">
                    <label className="form-label">Telefonní číslo</label>
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
              )}

{settingsTab === 'alergens' && (
                <div style={{ marginTop: '1.5rem' }}>
  <label style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    <input
      type="checkbox"
      checked={showAllergenList}
      onChange={(e) => setShowAllergenList(e.target.checked)}
      style={{
        width: '1.25rem',
        height: '1.25rem',
        cursor: 'pointer',
        accentColor: '#2563eb'
      }}
    />
    <div>
      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
        Zobrazovat seznam alergenů v PDF
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Seznam všech 14 alergenů bude vytištěn v patičce
      </div>
    </div>
  </label>
</div>
              )}

              {settingsTab === 'layout' && (
                <div className="layout-settings">
                  <p className="layout-description">Vyberte rozložení pro tisk PDF:</p>
                  
                  <div className="layout-options">
                    <label className="layout-option">
                      <input
                        type="radio"
                        name="pdfLayout"
                        value="vertical"
                        checked={pdfLayout === 'vertical'}
                        onChange={(e) => setPdfLayout(e.target.value)}
                        className="layout-radio"
                      />
                      <div className="layout-option-content">
                        <span className="layout-option-title">📄 Vertikální</span>
                        <span className="layout-option-desc">Klasické rozložení na výšku</span>
                      </div>
                    </label>

                    <label className="layout-option">
                      <input
                        type="radio"
                        name="pdfLayout"
                        value="grid"
                        checked={pdfLayout === 'grid'}
                        onChange={(e) => setPdfLayout(e.target.value)}
                        className="layout-radio"
                      />
                      <div className="layout-option-content">
                        <span className="layout-option-title">🗜️ Dlaždicový</span>
                        <span className="layout-option-desc">Rozložení do dvou sloupců (na šířku)</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeSettingsModal} className="btn btn-secondary">
                Zrušit
              </button>
              <button onClick={saveSettings} className="btn btn-blue">
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modální okno pro alergeny */}
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
                Zrušit
              </button>
              <button onClick={saveAllergens} className="btn btn-blue">
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pro sdílení */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Sdílet jídelníček</h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Pošlete tento odkaz zákazníkům pro objednávky:
            </p>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              wordBreak: 'break-all',
              fontSize: '0.875rem'
            }}>
              {shareLink}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowShareModal(false)} className="btn btn-secondary">
                Zavřít
              </button>
              <button onClick={copyShareLink} className="btn btn-blue">
                Kopírovat odkaz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard objednávek */}
      {showOrdersDashboard && (
        <OrdersDashboard 
          weekKey={weekKey} 
          onClose={() => setShowOrdersDashboard(false)} 
        />
      )}
    </div>
  );
}

export default App;