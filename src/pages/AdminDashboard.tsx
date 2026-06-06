import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

import OrdersManager from '../components/admin/OrdersManager';
import ProductsManager from '../components/admin/ProductsManager';
import HomeSettingsManager from '../components/admin/HomeSettingsManager';
import PagesSettingsManager from '../components/admin/PagesSettingsManager';
import TestimonialsManager from '../components/admin/TestimonialsManager';
import OverviewManager from '../components/admin/OverviewManager';
import BlogManager from '../components/admin/BlogManager';
import SiteSettingsManager from '../components/admin/SiteSettingsManager';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'overview'|'orders'|'products'|'blog'|'home'|'pages'|'testimonials'|'settings'>('overview');

  if (authLoading) return <div className="py-20 text-center">লোড হচ্ছে...</div>;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ' },
    { id: 'orders', label: 'অর্ডার' },
    { id: 'products', label: 'প্রোডাক্ট' },
    { id: 'blog', label: 'ব্লগ ম্যানাজমেন্ট' },
    { id: 'home', label: 'হোমপেজ সেটিং' },
    { id: 'pages', label: 'পেইজ সেটিং' },
    { id: 'testimonials', label: 'রিভিউ' },
    { id: 'settings', label: 'সাইট সেটিং ও SEO' }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shadow-sm z-10 sticky top-0 shrink-0 h-auto md:h-screen">
         <div className="px-4 py-4 mb-4 font-black text-2xl border-b border-gray-100 hidden md:block">
           <span className="text-brand">Admin</span>Panel
         </div>
         <div className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 hide-scrollbar">
           {tabs.map(t => (
             <button
               key={t.id}
               onClick={() => setTab(t.id as any)}
               className={`text-left px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${
                 tab === t.id 
                   ? 'bg-brand text-white' 
                   : 'text-gray-600 hover:bg-brand/5 hover:text-brand'
               }`}
             >
               {t.label}
             </button>
           ))}
         </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
         {tab === 'overview' && <OverviewManager />}
         {tab === 'orders' && <OrdersManager />}
         {tab === 'products' && <ProductsManager />}
         {tab === 'blog' && <BlogManager />}
         {tab === 'home' && <HomeSettingsManager />}
         {tab === 'pages' && <PagesSettingsManager />}
         {tab === 'testimonials' && <TestimonialsManager />}
         {tab === 'settings' && <SiteSettingsManager />}
      </div>
    </div>
  );
}
