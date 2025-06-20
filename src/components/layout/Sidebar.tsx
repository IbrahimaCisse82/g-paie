
import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  CreditCard, 
  BarChart3,
  Building2,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Employés', href: '/employees' },
  { icon: Building2, label: 'Conventions', href: '#conventions' },
  { icon: Calculator, label: 'Calcul de Paie', href: '/payroll' },
  { icon: FileText, label: 'Bulletins de paie', href: '/payslips' },
  { icon: BarChart3, label: 'Rapports', href: '/reports' },
  { icon: Settings, label: 'Paramètres', href: '/settings' },
];

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {isOpen && (
            <span className="font-bold text-lg text-gray-900">RH Manager</span>
          )}
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            return (
              <li key={index}>
                {item.href.startsWith('#') ? (
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
