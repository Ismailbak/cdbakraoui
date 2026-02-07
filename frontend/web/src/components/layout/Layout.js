
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from '../common/Breadcrumb';
import './Layout.css';


function Layout({ children }) {
  const location = useLocation();
  const isAssistantPage = location.pathname === '/assistant';
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div className="layout">
      <Sidebar />
      <Header />
      <main className={`main-content ${isAssistantPage ? 'no-scroll' : ''}`}>
        {!isDashboard && <Breadcrumb />}
        {children}
      </main>
    </div>
  );
}

export default Layout;
