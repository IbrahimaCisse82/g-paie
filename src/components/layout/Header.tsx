
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="hover:bg-blue-50"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            Système RH & Paie
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-blue-50"
          >
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
