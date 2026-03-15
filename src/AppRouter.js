import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import OrderPage from './OrderPage';

function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;