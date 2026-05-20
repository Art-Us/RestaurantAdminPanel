import React, { useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isLoggedin, loading, hasNewFeedback, setHasNewFeedback, hasNewOrder, setHasNewOrder } = useContext(AppContext);

  useEffect(() => {
    if (!loading && (!isLoggedin || !userData)) {
      navigate('/login');
    }
  }, [loading, isLoggedin, userData]);

  // Сбрасываем уведомления при заходе на соответствующий маршрут
  useEffect(() => {
    if (location.pathname.startsWith('/feedbacks') && hasNewFeedback) {
      setHasNewFeedback(false);
    }
    if (location.pathname.startsWith('/orders') && hasNewOrder) {
      setHasNewOrder(false);
    }
  }, [location.pathname, hasNewFeedback, hasNewOrder]);

  if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">Loading...</div>

  // Функция для добавления классов подсветки
  const getLinkClass = (isActive, hasNotification) => 
    `hover:text-white transition-colors ${isActive ? 'text-white font-bold' : ''} ${hasNotification ? 'text-red-500 font-bold' : ''}`;

  return (
    <aside className="w-48 bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4">
      <h2 className="text-2xl font-semibold text-indigo-300 mb-6">Nawigacja</h2>
      <nav className="flex flex-col gap-4 text-indigo-200">
        {userData?.isAdmin && (
          <>
          <NavLink to="/dishes-edit" className={({ isActive }) => getLinkClass(isActive, false)}>✏️ Edit Dishes</NavLink>
            <NavLink to="/codes" className={({ isActive }) => getLinkClass(isActive, false)}>🎟️ Promo Kody</NavLink>
            <NavLink to="/users" className={({ isActive }) => getLinkClass(isActive, false)}>👥 Użytkownicy</NavLink>
            <NavLink 
              to="/feedbacks" 
              className={({ isActive }) => getLinkClass(isActive, hasNewFeedback)}
            >
              💬 Opinie
            </NavLink>
          </>
        )}
        <NavLink 
          to="/orders" 
          className={({ isActive }) => getLinkClass(isActive, hasNewOrder)}
        >
          📦 Zamówienia
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
