
import React from 'react';
import { User, LogOut, Settings, Shield, Heart, Users, BarChart3, DoorClosed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { NavLink } from 'react-router-dom';

interface UserProfileDropdownProps {
  onManageUsers?: () => void;
  onSettings?: () => void;
}

export const UserProfileDropdown = ({ onManageUsers, onSettings }: UserProfileDropdownProps) => {
  const { user, logout, isAdmin } = useUser();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'volunteer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'donor': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-lg hover:bg-blue-50 animate-fade-in"
        >
          <Avatar className="w-8 h-8 hover:ring-2 hover:ring-blue-300 transition-all duration-300">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.verified && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 animate-scale-in" align="end">
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getRoleColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {user.verified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                )}
              </div>
              {user.organization && (
                <p className="text-xs text-gray-400 mt-1">{user.organization}</p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onSettings} className="hover:bg-blue-50 transition-colors">
          <Settings className="w-4 h-4 mr-3" />
          Profile Settings
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={onManageUsers} className="hover:bg-red-50 transition-colors">
              <Shield className="w-4 h-4 mr-3" />
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-red-50 transition-colors">
              <Users className="w-4 h-4 mr-3" />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-red-50 transition-colors">
              <BarChart3 className="w-4 h-4 mr-3" />
              System Analytics
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem className="hover:bg-blue-50 transition-colors">
          <Heart className="w-4 h-4 mr-3" />
          My Contributions
        </DropdownMenuItem>

        
        <DropdownMenuItem className="hover:bg-blue-50 transition-colors">
          <DoorClosed  className="w-4 h-4 mr-3" />
            <NavLink
              to="/portals"
              style={({ isActive }) => ({display: (isActive ? 'none' : '')})}
            >
            Portals
          </NavLink>
        </DropdownMenuItem>


        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          className="text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
