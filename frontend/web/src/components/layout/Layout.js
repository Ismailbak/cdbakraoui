import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  const isAssistantPage = location.pathname === '/assistant';

  return (
    <div className="layout">
      <Sidebar />
      <Header />
      <main className={`main-content ${isAssistantPage ? 'no-scroll' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
