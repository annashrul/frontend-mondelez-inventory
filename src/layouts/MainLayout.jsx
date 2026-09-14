import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileNavigation from '../components/MobileNavigation';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`min-w-0 flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
