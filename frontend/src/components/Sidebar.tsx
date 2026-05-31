import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, ClipboardList, Users, Settings, Briefcase, ShoppingCart } from 'lucide-react';

const menuItems = [
  { name: 'Αρχική', path: '/', icon: LayoutDashboard },
  { name: 'Εργασίες', path: '/tasks', icon: Briefcase },
  { name: 'Προϊόντα', path: '/products', icon: Package },
  { name: 'Τοποθεσίες', path: '/locations', icon: MapPin },
  { name: 'Απογραφή', path: '/inventory', icon: ClipboardList },
  { name: 'ERP', path: '/erp', icon: ShoppingCart },
  //{ name: 'Χρήστες', path: '/users', icon: Users },
  //{ name: 'Ρυθμίσεις', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">NEO-WMS</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.4 Enterprise Edition
      </div>
    </div>
  );
};