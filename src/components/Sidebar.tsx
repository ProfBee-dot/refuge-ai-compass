import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useUser } from "@/hooks/useUserContext";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  requiredRoles?: string[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  menuItems: MenuItem[];
}

export const Sidebar = ({ activeTab, setActiveTab, menuItems }: SidebarProps) => {
  const { user } = useUser();

  // Show all menu items - no role filtering
  const filteredMenuItems = menuItems;

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white/80 backdrop-blur-sm border-r border-blue-100 p-4 animate-slide-in-left">
      {user && (
        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 animate-fade-in">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-blue-600 capitalize">{user.role}</p>
            {user.verified && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      )}
      
      <nav className="space-y-2">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdmin = item.id === 'admin';
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-left group hover:scale-105 animate-fade-in",
                isActive
                  ? isAdmin 
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-200"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="font-medium">{item.label}</span>
              {isAdmin && (
                <div className="ml-auto w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
